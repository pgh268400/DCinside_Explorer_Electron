import axios, { AxiosResponse } from "axios";
import fetch, { Response } from "node-fetch";

const urls = Array.from({ length: 100 }, (_, i) => `https://www.google.co.uk/`);

async function measureRequestTime(
  library: "axios" | "node-fetch"
): Promise<number> {
  const start = Date.now();

  await Promise.all(
    urls.map(async (url) => {
      if (library === "axios") {
        const response: AxiosResponse = await axios.get(url);
        // console.log(response);
        // 여기에서 response 활용
      } else if (library === "node-fetch") {
        const response: Response = await fetch(url);
        // console.log(response);
        // 여기에서 response 활용
      }
    })
  );

  const end = Date.now();
  return end - start;
}

async function main() {
  const axiosTime: number = await measureRequestTime("axios");
  const fetchTime: number = await measureRequestTime("node-fetch");

  console.log("axios 시간:", axiosTime, "ms");
  console.log("node-fetch 시간:", fetchTime, "ms");
}

main();
