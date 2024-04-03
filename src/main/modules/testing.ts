import axios from "axios";
import bottleneck from "bottleneck";

const limiter = new bottleneck({
  //min_time: 500, // minimum time between requests
  max_concurrent: 1, // maximum concurrent requests
});

function get_url_data(url: string) {
  return axios.get(url);
}

function Promise_all_settled_progress(
  promises: Array<Promise<any>>,
  progress_cb: (arg0: number) => void
) {
  let d = 0;
  progress_cb(0);
  for (const p of promises) {
    p.then(() => {
      d++;
      progress_cb((d * 100) / promises.length);
    }).catch(() => {
      // PASS
    });
  }
  return Promise.allSettled(promises);
}

async function main() {
  const promises = [];

  const throttled_get_url_data = limiter.wrap(get_url_data);

  for (let i = 0; i < 100; i++) {
    promises.push(throttled_get_url_data("https://www.naver.com/"));
  }

  //   const result = await Promise_all_settled_progress(promises, (progress) => {
  //     console.log(progress);
  //   });

  //   시간 측정
  const start = Date.now();
  const result = await Promise.allSettled(promises);
  console.log(result);
  const end = Date.now();
  console.log(end - start, "ms");
}

main();
