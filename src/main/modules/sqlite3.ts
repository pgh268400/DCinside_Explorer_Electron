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
  log_id         INTEGER PRIMARY KEY AUTOINCREMENT,  -- 각 검색 로그의 고유 ID
  is_manual      BOOLEAN    NOT NULL,                -- 수동 저장 여부 (true/false)
  search_type    TEXT       NOT NULL,                -- 검색 타입 (예: 제목+내용, 댓글 등)
  repeat_cnt   INTEGER    NOT NULL,                -- 반복 횟수 (몇 회 반복 검색)
  gallery_id     TEXT       NOT NULL,                -- 대상 갤러리 ID
  keyword        TEXT       NOT NULL,                -- 검색 키워드
  created_at     TEXT       NOT NULL DEFAULT (DATETIME('now')) -- 검색한 날짜 및 시간
);

-- 📰 검색 결과(게시글) 정보 저장 테이블
CREATE TABLE IF NOT EXISTS article (
  gall_num       INTEGER PRIMARY KEY,                -- 게시글 번호 (고유 ID)
  title          TEXT       NOT NULL,                -- 게시글 제목
  writer         TEXT       NOT NULL,                -- 작성자
  reply_count    INTEGER    NOT NULL,                -- 댓글 수
  view_count     INTEGER    NOT NULL,                -- 조회 수
  recommend      INTEGER    NOT NULL,                -- 추천 수
  written_at     TEXT       NOT NULL                 -- 작성일 (문자열 형태)
);

-- 🔗 검색 기록과 게시글의 매핑 테이블
CREATE TABLE IF NOT EXISTS search_result (
  log_id         INTEGER NOT NULL REFERENCES search_history(log_id), -- 어떤 검색 결과인지
  gall_num       INTEGER NOT NULL REFERENCES article(gall_num),      -- 어떤 게시글인지
  seq_no         INTEGER NOT NULL,                                   -- 검색 결과에서의 순서
  PRIMARY KEY (log_id, gall_num)                                     -- 검색별 중복 방지
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
    SELECT h.log_id, h.is_manual, h.search_type, h.repeat_cnt,
           h.gallery_id, h.keyword,
           a.gall_num AS 번호, a.title AS 제목, a.reply_count AS 댓글수,
           a.writer AS 작성자, a.view_count AS 조회수, a.recommend AS 추천,
           a.written_at AS 작성일, r.seq_no
    FROM search_history h
    JOIN search_result r ON h.log_id = r.log_id
    JOIN article a ON r.gall_num = a.gall_num
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
    INSERT INTO search_history(is_manual, search_type, repeat_cnt, gallery_id, keyword)
    VALUES(@is_manual, @search_type, @repeat_cnt, @gallery_id, @keyword)
  `);

  // 2. 게시글 upsert 쿼리 (중복되면 갱신, 없으면 삽입)
  const upsert_article = db.prepare(`
    INSERT OR REPLACE INTO article
      (gall_num, title, writer, reply_count, view_count, recommend, written_at)
    VALUES(@번호, @제목, @작성자, @댓글수, @조회수, @추천, @작성일)
  `);

  // 3. 검색 결과 매핑 쿼리
  const insert_result = db.prepare(`
    INSERT INTO search_result(log_id, gall_num, seq_no)
    VALUES(@log_id, @gall_num, @seq_no)
  `);

  // 전체 작업을 하나의 트랜잭션으로 묶어서 처리 (성능 + 무결성 보장)
  const transaction = db.transaction(() => {
    const info = insert_log.run({ is_manual: isManual, ...meta }); // 로그 저장
    const logId = info.lastInsertRowid as number; // 자동 생성된 ID 추출

    articles.forEach((item, index) => {
      upsert_article.run({ ...item }); // 게시글 저장 (중복 시 업데이트)
      insert_result.run({
        // 검색 결과 매핑 저장
        log_id: logId,
        gall_num: item.번호,
        seq_no: index,
      });
    });
  });

  transaction(); // 트랜잭션 실행
}

// ============================
// 🗑 특정 검색 로그 삭제 함수
// ============================
export function delete_search_log(logId: number) {
  // 검색 결과 → 검색 로그 순서로 삭제 (참조 무결성 오류 방지)
  db.prepare(`DELETE FROM search_result WHERE log_id = ?`).run(logId);
  db.prepare(`DELETE FROM search_history WHERE log_id = ?`).run(logId);
}
