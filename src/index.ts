import { StatusCode } from "./lib/statusCode";
import { INDEX_HTML } from "./lib/html";
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Env {}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    if (!isValidStatusCode(url.pathname)) {
      return new Response(INDEX_HTML, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
      });
    }
    const statusCode = new StatusCode(request);
    await statusCode.sleep();
    return statusCode.response();
  },
};

function isValidStatusCode(status: string) {
  return /^\/([2-5][0-9][0-9])$/.test(status);
}
