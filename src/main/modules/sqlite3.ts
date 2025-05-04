// SQLite3 기반 디시인사이드 검색기록 저장 모듈
import Database from "better-sqlite3";
import path from "path";

// 데이터베이스 연결 (프로그램 실행 시 자동 생성됨)
const db = new Database(path.resolve(__dirname, "../dc_config/article.db"));

// WAL 모드 설정: 동시 읽기/쓰기 가능, 성능 개선
db.pragma("journal_mode = WAL");

// ============================
// 🧩 테이블 생성 (최초 1회)
// ============================
db.exec(`
-- 🔍 검색 기록 저장 테이블
CREATE TABLE IF NOT EXISTS search_history (
  log_id       INTEGER PRIMARY KEY AUTOINCREMENT,  -- 각 검색 로그의 고유 ID
  is_manual    BOOLEAN    NOT NULL,                -- 수동 저장 여부 (true/false)
  search_type  TEXT       NOT NULL,                -- 검색 타입 (예: 제목+내용, 댓글 등)
  repeat_cnt   INTEGER    NOT NULL,                -- 반복 횟수 (몇 회 반복 검색)
  gallery_id   TEXT       NOT NULL,                -- 대상 갤러리 ID
  keyword      TEXT       NOT NULL,                -- 검색 키워드
  created_at   TEXT       NOT NULL DEFAULT (DATETIME('now')) -- 검색한 날짜 및 시간
);

-- 📰 게시글 정보 저장 테이블 (복합 PK)
CREATE TABLE IF NOT EXISTS article (
  gallery_id   TEXT    NOT NULL,                  -- 갤러리 ID
  gall_num     INTEGER NOT NULL,                  -- 갤러리 내 글 번호
  title        TEXT    NOT NULL,                  -- 게시글 제목
  writer       TEXT    NOT NULL,                  -- 작성자
  reply_count  INTEGER NOT NULL,                  -- 댓글 수
  view_count   INTEGER NOT NULL,                  -- 조회 수
  recommend    INTEGER NOT NULL,                  -- 추천 수
  written_at   TEXT    NOT NULL,                  -- 작성일 (문자열 형태)
  PRIMARY KEY (gallery_id, gall_num)              -- 복합 기본키
);

-- 🔗 검색 기록과 게시글의 매핑 테이블
CREATE TABLE IF NOT EXISTS search_result (
  log_id     INTEGER NOT NULL REFERENCES search_history(log_id),               -- 어떤 검색 결과인지
  gallery_id TEXT    NOT NULL,                                                 -- 대상 갤러리 ID
  gall_num   INTEGER NOT NULL,                                                 -- 어떤 게시글인지
  seq_no     INTEGER NOT NULL,                                                 -- 검색 결과에서의 순서
  PRIMARY KEY (log_id, gallery_id, gall_num),                                  -- 검색별 중복 방지
  FOREIGN KEY (gallery_id, gall_num) REFERENCES article(gallery_id, gall_num)  -- 참조 무결성
);

-- 🔄 검색 결과 순서 정렬을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_log_seq
  ON search_result(log_id, seq_no DESC);
`);

// ============================
// 🔍 검색 기록 불러오기 함수
// ============================
export function load_search_logs() {
  const stmt = db.prepare(`
    SELECT
      h.log_id,
      h.is_manual,
      h.search_type,
      h.repeat_cnt,
      h.gallery_id,
      h.keyword,
      a.gall_num   AS 번호,
      a.title      AS 제목,
      a.reply_count AS 댓글수,
      a.writer     AS 작성자,
      a.view_count AS 조회수,
      a.recommend  AS 추천,
      a.written_at AS 작성일,
      r.seq_no
    FROM search_history h
    JOIN search_result r
      ON h.log_id = r.log_id
    JOIN article a
      ON r.gallery_id = a.gallery_id
     AND r.gall_num   = a.gall_num
    ORDER BY h.log_id DESC, r.seq_no ASC
  `);
  return stmt.all();
}

// ============================
// 💾 검색 기록 저장 함수
// ============================
export function save_search_log(isManual: boolean, meta: any, articles: any[]) {
  // 1. 검색 로그 삽입 쿼리
  const insert_log = db.prepare(`
    INSERT INTO search_history
      (is_manual, search_type, repeat_cnt, gallery_id, keyword)
    VALUES
      (@is_manual, @search_type, @repeat_cnt, @gallery_id, @keyword)
  `);

  // 2. 게시글 upsert 쿼리 (중복 시 업데이트)
  const upsert_article = db.prepare(`
    INSERT OR REPLACE INTO article
      (gallery_id, gall_num, title, writer, reply_count, view_count, recommend, written_at)
    VALUES
      (@gallery_id, @번호, @제목, @작성자, @댓글수, @조회수, @추천, @작성일)
  `);

  // 3. 검색 결과 매핑 쿼리 (중복 무시)
  const insert_result = db.prepare(`
    INSERT OR IGNORE INTO search_result
      (log_id, gallery_id, gall_num, seq_no)
    VALUES
      (@log_id, @gallery_id, @gall_num, @seq_no)
  `);

  // 전체 작업을 하나의 트랜잭션으로 묶어서 처리 (성능 + 무결성 보장)
  const transaction = db.transaction((articleList: any[]) => {
    const info = insert_log.run({
      is_manual: isManual,
      search_type: meta.search_type,
      repeat_cnt: meta.repeat_cnt,
      gallery_id: meta.gallery_id,
      keyword: meta.keyword,
    });
    const logId = info.lastInsertRowid as number;
    const galleryId = meta.gallery_id;

    articleList.forEach((item, index) => {
      upsert_article.run({
        gallery_id: galleryId,
        번호: item.번호,
        제목: item.제목,
        작성자: item.작성자,
        댓글수: item.댓글수,
        조회수: item.조회수,
        추천: item.추천,
        작성일: item.작성일,
      });
      insert_result.run({
        log_id: logId,
        gallery_id: galleryId,
        gall_num: item.번호,
        seq_no: index,
      });
    });
  });

  transaction(articles);
}

// ============================
// 🗑 특정 검색 로그 삭제 함수
// ============================
export function delete_search_log(logId: number) {
  // 검색 결과 → 검색 로그 순서로 삭제 (참조 무결성 오류 방지)
  db.prepare(`DELETE FROM search_result WHERE log_id = ?`).run(logId);
  db.prepare(`DELETE FROM search_history WHERE log_id = ?`).run(logId);
}
