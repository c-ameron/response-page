
import { StatusCode } from './lib/classes';

export interface Env {
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {

		const url = new URL(request.url)
		if ( !isValidStatusCode(url.pathname) ) {
			return new Response(html, {
				headers: {
				  'content-type': 'text/html;charset=UTF-8',
				},
			  });
		}
		const statusCode = new StatusCode(request)
		await statusCode.sleep()
		return statusCode.response()

	},
};

function isValidStatusCode(status: string) {
	return /^\/([2-5][0-9][0-9])$/.test(status)
}

const html = `<!DOCTYPE html>
<h1> Response page</h1>`