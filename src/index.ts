import { StatusCode } from "./lib/statusCode";
import { INDEX_HTML } from "./lib/html";
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Env {}

export default {
  async fetch(
    request: Request,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    env: Env,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    if (!isValidStatusPath(url.pathname)) {
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

function isValidStatusPath(status: string) {
  return /^\/status\/([2-5][0-9][0-9])$/.test(status);
}
