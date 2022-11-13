
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
		let statusCode = getStatusCode(url.pathname)


		console.log(getFormat(url))
		console.log(getStatusText(url))
		let status = new StatusCode(statusCode,getStatusText(url))
		//console.log(status.getJson())
		//return new Response(null,{status: 101})
		console.log(getSleep(url))
		await sleep(getSleep(url))

		return new Response(status.getHtml());
	},
};

function isValidStatusCode(status: string) {
	return /^\/([2-5][0-9][0-9])$/.test(status)
}

function getStatusCode(path: string): number {
	return parseInt(path.slice(1))
}

function getFormat(url: URL): string {
	let format =  url.searchParams.get("format")
	if ( format !== "html" && format !== "json" ){
		format = "html"
	}
	return format
}

function getStatusText(url: URL): string | null {
	let statusText =  url.searchParams.get("statustext")
	if ( statusText ){
		statusText = statusText.slice(0,1024)
	}
	return statusText
}

function getSleep(url: URL): number {
	let sleepParameter =  url.searchParams.get("sleep")
	console.log(!Number.isNaN(sleepParameter))
	let sleepDelay = 0
	if ( sleepParameter && !Number.isNaN(sleepParameter)){
		sleepDelay = parseInt(sleepParameter)
	}
	return sleepDelay
}


async function sleep(milliseconds: number) {
    await new Promise(r => setTimeout(r, milliseconds,[]));
}

const html = `<!DOCTYPE html>
<h1> Response page</h1>`