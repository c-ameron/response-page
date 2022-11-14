import test from "ava";
import { Miniflare } from "miniflare";
import { STATUS_CODES } from "../src/lib/codes.js";

const MINIFLARE_HOST = "http://localhost:8787";

// unfortunately due to a bug in the fetch api with testing, we can't create a response with these codes
const UNSUPPORTED_TESTING_CODES = [204, 205, 304];

test.beforeEach((t) => {
  // Create a new Miniflare environment for each test
  const mf = new Miniflare({
    // Autoload configuration from `.env`, `package.json` and `wrangler.toml`
    envPath: true,
    packagePath: true,
    wranglerConfigPath: true,
    modules: true,
    scriptPath: "dist/index.js",
    // We don't want to rebuild our worker for each test, we're already doing
    // it once before we run all tests in package.json, so disable it here.
    // This will override the option in wrangler.toml.
    buildCommand: undefined,
  });
  t.context = { mf };
});

STATUS_CODES.forEach((statusText, statusCode) => {
  test(`return ${statusCode} for ${statusCode}`, async (t) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { mf } = t.context;

    try {
      const res = await mf.dispatchFetch(`${MINIFLARE_HOST}/status/${statusCode}`);
      t.is(await res.status, statusCode);
      t.is(await res.statusText, statusText);
    } catch (e) {
      if (e instanceof TypeError) {
        if (UNSUPPORTED_TESTING_CODES.includes(statusCode)) {
          t.pass(`Passing unsupported code ${statusCode}`);
        }
      }
    }
  });
});

test(`return 200 with custom statustext for html`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/200`);
  url.searchParams.append("statustext", "look at me!");
  const res = await mf.dispatchFetch(url);
  t.is(await res.status, 200);
  t.is(await res.statusText, "look at me!");
  t.is(await res.text(), "200: look at me!");
  t.is(res.headers.get("Content-Type"), 'text/plain');
});

test(`return custom status for html`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/555`);
  const res = await mf.dispatchFetch(url);
  t.is(await res.status, 555);
  t.is(await res.statusText, "");
  t.is(await res.text(), "555: ");
  t.is(res.headers.get("Content-Type"), 'text/plain');
});

test(`return custom status and status text for html`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/444`);
  url.searchParams.append("statustext", "a custom text");
  const res = await mf.dispatchFetch(url);
  t.is(await res.status, 444);
  t.is(await res.statusText, "a custom text");
  t.is(await res.text(), "444: a custom text");
  t.is(res.headers.get("Content-Type"), 'text/plain');
});

test(`return 200 with custom statustext for json query param`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/200`);
  url.searchParams.append("statustext", "look at me!");
  url.searchParams.append("format", "json");
  const res = await mf.dispatchFetch(url);
  t.is(await res.status, 200);
  t.is(await res.statusText, "look at me!");
  t.is(
    await res.text(),
    JSON.stringify({ status: 200, statusText: "look at me!" })
  );
  t.is(res.headers.get("Content-Type"), 'application/json');
});

test(`return custom status for json query param`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/566`);
  url.searchParams.append("format", "json");
  const res = await mf.dispatchFetch(url);
  t.is(await res.status, 566);
  t.is(await res.statusText, "");
  t.is(await res.text(), JSON.stringify({ status: 566, statusText: "" }));
  t.is(res.headers.get("Content-Type"), 'application/json');
});

test(`return custom status and status text for json query param`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/444`);
  url.searchParams.append("statustext", "a json custom text");
  url.searchParams.append("format", "json");
  const res = await mf.dispatchFetch(url);
  t.is(await res.status, 444);
  t.is(await res.statusText, "a json custom text");
  t.is(
    await res.text(),
    JSON.stringify({ status: 444, statusText: "a json custom text" })
  );
  t.is(res.headers.get("Content-Type"), 'application/json');
});

test(`return 200 with json for accept: application/json header`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/200`);
  const headers = new Headers({ Accept: `application/json` });
  const res = await mf.dispatchFetch(url, { headers: headers });
  t.is(await res.status, 200);
  t.is(await res.statusText, "OK");
  t.is(await res.text(), JSON.stringify({ status: 200, statusText: "OK" }));
  t.is(res.headers.get("Content-Type"), 'application/json');
});

test(`302 returns default location`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/302`);
  const res = await mf.dispatchFetch(url);
  t.is(res.headers.get("Location"), `${MINIFLARE_HOST}/status/200`);
});

test(`302 with json returns default location with json`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/302`);
  const headers = new Headers({ Accept: `application/json` });
  const res = await mf.dispatchFetch(url, { headers: headers });
  t.is(res.headers.get("Location"), `${MINIFLARE_HOST}/status/200?format=json`);
});

test(`302 redirect with custom location`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/302`);
  const headers = new Headers({ Location: `https://response.page` });
  const res = await mf.dispatchFetch(url, { headers: headers });
  t.is(res.headers.get("Location"), "https://response.page");
});

test(`non 3xx ignores custom location`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/200`);
  const headers = new Headers({ Location: `https://response.page` });
  const res = await mf.dispatchFetch(url, { headers: headers });
  t.false(res.headers.has("Location"));
});

test(`Returns custom x-response- headers`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/501`);
  const headers = new Headers({
    "X-Response-X-Custom-Header": "custom value",
    "x-response-foo": "bar",
    "Not-Included": "nope",
  });
  const res = await mf.dispatchFetch(url, { headers: headers });
  t.is(res.headers.get("x-custom-header"), "custom value");
  t.is(res.headers.get("foo"), "bar");
  t.false(res.headers.has("not-included"));
});

test(`Response with sleep will sleep for 5 seconds`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/200`);
  url.searchParams.append("sleep", "5000");
  const start = Date.now();
  const res = await mf.dispatchFetch(url);
  const requestTime = Date.now() - start;
  t.is(await res.status, 200);
  t.true(requestTime >= 5000);
});

test(`Response with negative sleep will ignore`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/200`);
  url.searchParams.append("sleep", "-1000");
  const start = Date.now();
  const res = await mf.dispatchFetch(url);
  const requestTime = Date.now() - start;
  t.is(await res.status, 200);
  t.true(requestTime <= 500);
});

test(`Response with non integer sleep value will ignore`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/200`);
  url.searchParams.append("sleep", "abcd");
  const start = Date.now();
  const res = await mf.dispatchFetch(url);
  const requestTime = Date.now() - start;
  t.is(await res.status, 200);
  t.true(requestTime <= 500);
});

test(`Request to root will return index`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}`);
  const res = await mf.dispatchFetch(url);
  //t.regex(await res.text(),/^\<\!DOCTYPE html\>/)
  t.regex(await res.text(), /<h1> Response page<\/h1>/);
});

test(`Request to random path will return index`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/abcd`);
  const res = await mf.dispatchFetch(url);
  //t.regex(await res.text(),/^\<\!DOCTYPE html\>/)
  t.regex(await res.text(), /<h1> Response page<\/h1>/);
});

test(`Request to /status will return index`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status`);
  const res = await mf.dispatchFetch(url);
  //t.regex(await res.text(),/^\<\!DOCTYPE html\>/)
  t.regex(await res.text(), /<h1> Response page<\/h1>/);
});


test(`Request to 1xx will return index`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/100`);
  const res = await mf.dispatchFetch(url);
  //t.regex(await res.text(),/^\<\!DOCTYPE html\>/)
  t.regex(await res.text(), /<h1> Response page<\/h1>/);
});

test(`Request to 6xx will return index`, async (t) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { mf } = t.context;
  const url = new URL(`${MINIFLARE_HOST}/status/600`);
  const res = await mf.dispatchFetch(url);
  //t.regex(await res.text(),/^\<\!DOCTYPE html\>/)
  t.regex(await res.text(), /<h1> Response page<\/h1>/);
});

/*
  for (let i = 200; i < 600; i++) { 
    test(`check response ${i}`, async (t) => {
      console.log(i)
      // Get the Miniflare instance
      // @ts-ignore
      const { mf } = t.context;
      // Dispatch a fetch event to our worker
      const res = await mf.dispatchFetch(`${MINIFLARE_HOST}/status/${i}`);
      // Check the count is "1" as this is the first time we've been to this path
      t.is(await res.status, i);
    });
  }
  */
