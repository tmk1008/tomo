import { serveDir } from "jsr:@std/http/file-server";

let previousWord = "しりとり"; //直前のワード

Deno.serve(async (_req) => {
  const pathname = new URL(_req.url).pathname;
  console.log(`pathname: ${pathname}`);

  if (_req.method === "GET" && pathname === "/shiritori") {
    return new Response(JSON.stringify({ currentWord: previousWord }), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
  

  if (_req.method === "POST" && pathname === "/shiritori") {
    try {
      const requestJson = await _req.json();
      const nextWord = requestJson["nextWord"];

      if (typeof nextWord !== "string" || nextWord.length === 0) {
        return new Response(
          JSON.stringify({
            errorMessage: "無効な単語です",
            errorCode: "10002",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json; charset=utf-8" },
          }
        );
      }

      if (nextWord.slice(-1) === "ん") {
        return new Response(
          JSON.stringify({
            errorMessage: "「ん」で終わったのでゲームオーバーです",
            errorCode: "10003",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json; charset=utf-8" },
          }
        );
      }

      if (previousWord.slice(-1) === nextWord[0]) {
        previousWord = nextWord;
        return new Response(JSON.stringify({ currentWord: previousWord }), {
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      } else {
        return new Response(
          JSON.stringify({
            errorMessage: "前の単語に続いていません",
            errorCode: "10001",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json; charset=utf-8" },
          }
        );
      }
    } catch (_error) {
      return new Response(
        JSON.stringify({
          errorMessage: "予期しないエラーが発生しました",
          errorCode: "50001",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }
  }

  return serveDir(_req, {
    fsRoot: "./public/",
    urlRoot: "",
    enableCors: true,
  });
});