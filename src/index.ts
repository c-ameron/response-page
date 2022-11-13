
import { StatusCode, STATUS_CODES } from './lib/classes';

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


		//console.log(getFormat(request))
		//console.log(getStatusText(url))
		//let status = new StatusCode(statusCode,getStatusText(url))
		//console.log(status.getJson())
		//return new Response(null,{status: 101})
		//console.log(getSleep(url))
		//const sleepDelay = getSleep(url)
		//if (sleepDelay > 0 ) {
		//	await sleep(sleepDelay)
		//}

		//return new Response(status.getHtml());
	},
};

function isValidStatusCode(status: string) {
	return /^\/([2-5][0-9][0-9])$/.test(status)
}

const html = `<!DOCTYPE html>
<h1> Response page</h1>`