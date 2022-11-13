import test from "ava";
import { Miniflare } from "miniflare";
import { STATUS_CODES } from "../src/lib/classes.js" ;

const MINIFLARE_HOST = 'http://localhost:8787'


// unfortunately due to a bug with testing, we can't create a response with these codes
const UNSUPPORTED_TESTING_CODES = [204,205,304]

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

/*
  test("Get valid response", async (t) => {
    const { mf } = t.context;
    console.log(mf)
    const res = await mf.dispatchFetch("http://localhost:8787/");
    console.log(res)
    t.is(await res.text(), "200: OK");
  });
*/
  const fn = () => 'foo';

  test('fn() returns foo', t => {
    t.is(fn(), 'foo');
  });

  test("increments path count for new paths", async (t) => {
    // Get the Miniflare instance
    //@ts-ignore
    const { mf } = t.context;
    // Dispatch a fetch event to our worker
    const res = await mf.dispatchFetch("http://localhost:8787/200");
    // Check the count is "1" as this is the first time we've been to this path
    t.is(await res.text(), "200: OK");
    t.is(await res.status, 200);
  });

/*
  for (let [key, value] of  STATUS_CODES.entries()) {
    test("Test Responses for ")
    console.log(key + " = " + value)
  }
  */

  STATUS_CODES.forEach((statusText,statusCode) => {
    test(`return ${statusCode} for ${statusCode}`, async t => {
      // @ts-ignore
      const { mf } = t.context
      
      try {
        const res = await mf.dispatchFetch(`${MINIFLARE_HOST}/${statusCode}`)
        t.is(await res.status, statusCode)
      } catch (e) {
        if (e instanceof TypeError) {
          if (UNSUPPORTED_TESTING_CODES.includes(statusCode)) {
            t.pass(`Passing unsupported code ${statusCode}`)
          }
        }
      }
      
    })
  })
  
/*
  for (let i = 200; i < 600; i++) { 
    test(`check response ${i}`, async (t) => {
      console.log(i)
      // Get the Miniflare instance
      //@ts-ignore
      const { mf } = t.context;
      // Dispatch a fetch event to our worker
      const res = await mf.dispatchFetch(`${MINIFLARE_HOST}/${i}`);
      // Check the count is "1" as this is the first time we've been to this path
      t.is(await res.status, i);
    });
  }
  */