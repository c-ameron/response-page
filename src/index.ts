import { StatusCode } from "./lib/statusCode";
import { INDEX_HTML } from "./lib/html";
import { getAssetFromKV, serveSinglePageApp } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
const assetManifest = JSON.parse(manifestJSON);

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
      // serve docsify app
      try {
        return await getAssetFromKV(
          {
            request,
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          { mapRequestToAsset: serveSinglePageApp,
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
						ASSET_MANIFEST: assetManifest, }
        );
      } catch (e) {
        let pathname = new URL(request.url).pathname;
        return new Response(`"${pathname}" not found`, {
          status: 404,
          statusText: 'not found',
        });
      }
    }
    const statusCode = new StatusCode(request);
    await statusCode.sleep();
    return statusCode.response();
  },
};

function isValidStatusPath(status: string) {
  return /^\/status\/([2-5][0-9][0-9])$/.test(status);
}
