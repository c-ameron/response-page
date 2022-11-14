import { STATUS_CODES } from "./codes";
export class StatusCode {
  statusCode: number;
  statusText: string;
  format: string;
  sleepDelay: number;
  headers: Headers;

  constructor(request: Request) {
    const url = new URL(request.url);
    this.statusCode = this.#parseStatusCode(url.pathname);
    this.statusText = this.#parseStatusText(url);
    this.format = this.#getFormatParam(request);
    this.sleepDelay = this.#getSleepParam(url);
    this.headers = this.#createHeaders(request);
  }

  async sleep() {
    if (this.sleepDelay > 0) {
      await new Promise((r) => setTimeout(r, this.sleepDelay, []));
    }
  }

  response(): Response {
    const body = this.format === "html" ? this.#getHtml() : this.#getJson();
    const options = {
      status: this.statusCode,
      statusText: this.statusText,
      headers: this.headers,
    };
    return new Response(body, options);
  }

  #getJson() {
    return JSON.stringify({
      status: this.statusCode,
      statusText: this.statusText,
    });
  }

  #getHtml() {
    return `${this.statusCode}: ${this.statusText}`;
  }

  #parseStatusCode(path: string): number {
    return parseInt(path.slice(1));
  }

  #parseStatusText(url: URL): string {
    const statusTextParam = this.#getStatusTextParam(url);
    if (statusTextParam) {
      return statusTextParam;
    } else if (STATUS_CODES.has(this.statusCode)) {
      return STATUS_CODES.get(this.statusCode) ?? "";
    } else {
      return "";
    }
  }

  #getStatusTextParam(url: URL): string | null {
    let statusText = url.searchParams.get("statustext");
    if (statusText) {
      statusText = statusText.slice(0, 1024);
    }
    return statusText;
  }

  #getFormatParam(request: Request): string {
    const acceptHeader = request.headers.get("Accept");
    const url = new URL(request.url);
    const acceptHeaderJson = acceptHeader?.includes("application/json");
    const formatParameter = url.searchParams.get("format");
    if (acceptHeaderJson || formatParameter === "json") {
      return "json";
    }
    return "html";
  }

  #createHeaders(request: Request): Headers {
    const headers = new Headers();
    this.#setLocationHeader(headers, request);
    this.#setContentHeader(headers)
    this.#setResponseHeaders(headers, request);
    return headers;
  }

  #setLocationHeader(headers: Headers, request: Request) {
    const url = new URL(request.url);

    if (this.statusCode >= 300 && this.statusCode <= 399) {
      const location = this.#getLocationHeader(request);
      if (location) {
        headers.set("Location", location);
      } else {
        if (this.format === "json") {
          headers.set(
            "Location",
            `${url.protocol}//${url.host}/200?format=json`
          );
        } else {
          headers.set("Location", `${url.protocol}//${url.host}/200`);
        }
      }
    }
  }

  #setContentHeader(headers: Headers) {
    const contentType = this.format === "html" ? 'text/plain' : 'application/json';
    headers.set('Content-Type',contentType)
  }

  #setResponseHeaders(headers: Headers, request: Request) {
    for (const pair of request.headers.entries()) {
      const RESPONSE_PREFIX = "x-response-";
      if (pair[0].includes(RESPONSE_PREFIX)) {
        const responseHeader = pair[0].replace(RESPONSE_PREFIX, "");
        headers.set(responseHeader, pair[1]);
      }
    }
  }

  #getSleepParam(url: URL): number {
    const sleepParameter = url.searchParams.get("sleep");
    let sleepDelay = 0;
    if (sleepParameter && !Number.isNaN(sleepParameter)) {
      sleepDelay = parseInt(sleepParameter);
      if (sleepDelay < 0) {
        sleepDelay = 0;
      } // I could also set a hard limit here but I'm curious how long it will go in cloudflare
    }
    return sleepDelay;
  }

  #getLocationHeader(request: Request): string | null {
    return request.headers.get("Location");
  }
}
