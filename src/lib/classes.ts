export class StatusCode {
    statusCode: number
    statusText: string
    format: string
    sleepDelay: number
    headers: Headers

    constructor(request: Request) {

        const url = new URL(request.url)
        this.statusCode = parseStatusCode(url.pathname)
        this.statusText = parseStatusText(url)
        this.format = getFormat(request)
        this.sleepDelay = getSleep(url)
        this.headers = createHeaders(request)
    

    }

    #getJson() {
        console.log(`${this.statusCode}: ${this.statusText}`)
        return JSON.stringify({status: this.statusCode, statusText: this.statusText})
    }

    #getHtml() {
        console.log(`${this.statusCode}: ${this.statusText}`)
        return `${this.statusCode}: ${this.statusText}`
    }

    async sleep() {
        if ( this.sleepDelay > 0 ) {
            await new Promise(r => setTimeout(r, this.sleepDelay,[]));
        }
    }

    response(): Response {
        const body = this.format === 'html' ? this.#getHtml() : this.#getJson()
        const options = {
            status: this.statusCode,
            statusText: this.statusText,
            headers: this.headers
        };
        return new Response(body,options)
    }
}


    function parseStatusCode(path: string): number {
        return parseInt(path.slice(1))
    }

    function parseStatusText(url: URL): string {
        const statusTextParam = getStatusText(url)
        const statusCode = parseStatusCode(url.pathname)
        let statusText
        if (statusTextParam) {
            statusText = statusTextParam
        } else if (STATUS_CODES.has(statusCode)) {
            statusText = STATUS_CODES.get(statusCode)!
        } else {
            statusText = ""
        }
        return statusText
    }
    
    function getFormat(request: Request): string {
        const acceptHeader = request.headers.get('Accept')
        console.log(acceptHeader)
        const url = new URL(request.url)
        const acceptHeaderJson = ( acceptHeader && acceptHeader?.includes('application/json'))
        const formatParameter =  url.searchParams.get("format")
        if ( acceptHeaderJson || formatParameter === 'json' ){
            return 'json'
        }
        return 'html'
    }

    function createHeaders(request: Request): Headers {
        const headers = new Headers()
        const url = new URL(request.url)
        const statusCode = parseStatusCode(url.pathname)

        if ( statusCode >= 300 && statusCode <= 399) {
            const location = getLocation(request)
            if (location) {
                headers.set('Location', location)
            } else {
                if (getFormat(request) === 'json') {
                    headers.set('Location', `${url.protocol}//${url.host}/200?format=json`)
                } else {
                    headers.set('Location', `${url.protocol}//${url.host}/200`)
                }
            }
        }

        for ( const pair of request.headers.entries()) {
            const RESPONSE_PREFIX='x-response-'
            if ( pair[0].includes(RESPONSE_PREFIX)) {
                let responseHeader = pair[0].replace(RESPONSE_PREFIX,'')
                headers.set(responseHeader,pair[1])
            }
        }
        return headers
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
        let sleepDelay = 0
        if ( sleepParameter && !Number.isNaN(sleepParameter)){
            sleepDelay = parseInt(sleepParameter)
            if ( sleepDelay < 0 ) {
                sleepDelay = 0
            } // I could also set a hard limit here but I'm curious how long it will go in cloudflare
        }
        console.log(sleepDelay)
        return sleepDelay
    }
    
    function getLocation(request: Request): string | null {
        return request.headers.get('Location')
    }
    
    
    function sleep(milliseconds: number) {
        return new Promise(r => setTimeout(r, milliseconds,[]));
    }

export const STATUS_CODES = new Map<number, string>([
	[200, "OK"],
	[201, "Created"],
	[202, "Accepted"],
	[203, "Non-Authoritative Information"],
	[204, "No Content"],
	[205, "Reset Content"],
	[206, "Partial Content"],
	[207, "Multi-Status"],
	[208, "Already Reported"],
	[226, "IM Used"],
	[301, "Moved Permanently"],
	[302, "Found"],
	[303, "See Other"],
	[304, "Not Modified"],
	[305, "Use Proxy Deprecated"],
	[306, "unused"],
	[307, "Temporary Redirect"],
	[308, "Permanent Redirect"],
	[400, "Bad Request"],
	[401, "Unauthorized"],
	[402, "Payment Required Experimental"],
	[403, "Forbidden"],
	[404, "Not Found"],
	[405, "Method Not Allowed"],
	[406, "Not Acceptable"],
	[407, "Proxy Authentication Required"],
	[408, "Request Timeout"],
	[409, "Conflict"],
	[410, "Gone"],
	[411, "Length Required"],
	[412, "Precondition Failed"],
	[413, "Payload Too Large"],
	[414, "URI Too Long"],
	[415, "Unsupported Media Type"],
	[416, "Range Not Satisfiable"],
	[417, "Expectation Failed"],
	[418, "I'm a teapot"],
	[421, "Misdirected Request"],
	[422, "Unprocessable Entity"],
	[423, "Locked"],
	[424, "Failed Dependency"],
	[425, "Too Early Experimental"],
	[426, "Upgrade Required"],
	[428, "Precondition Required"],
	[429, "Too Many Requests"],
	[431, "Request Header Fields Too Large"],
	[451, "Unavailable For Legal Reasons"],
	[500, "Internal Server Error"],
	[501, "Not Implemented"],
	[502, "Bad Gateway"],
	[503, "Service Unavailable"],
	[504, "Gateway Timeout"],
	[505, "HTTP Version Not Supported"],
	[506, "Variant Also Negotiates"],
	[507, "Insufficient Storage"],
	[508, "Loop Detected"],
	[510, "Not Extended"],
	[511, "Network Authentication Required"]
])