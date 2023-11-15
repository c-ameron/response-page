[response.page](https://response.page) is an easy to use service that returns HTTP response status codes, running on Cloudflare workers.

- You can request any HTTP status codes between 200-599 (see response codes)
- Have a custom status text
- Receive the response as either text or JSON
- Custom headers in the response
- Custom redirect
- Sleep delay
- Responds to `GET`, `HEAD`, `POST`, `PUT`, `PATCH`, `DELETE` and `OPTIONS` methods

You can check out the code at [https://github.com/c-ameron/response-page](https://github.com/c-ameron/response-page/)

# How to use

Request to `https://response.page/status/<status>` and get the HTTP status as a response.

## JSON Response

To receive JSON as a response, either include the `Accept: application/json` header, or the `format=json` query parameter

```bash
$ curl https://response.page/status/200?format=json
{"status":200,"statusText":"OK"}
```

## Custom Status Text

By default, it will use the official (and some unofficial) status codes and text in the table above. If you would like to override this, use the `statustext` query parameter.

```bash
$ curl -G --data-urlencode "statustext=custom status text!" https://response.page/status/200
200: custom status text!
```

## Custom Response Code

You can request any status code between 200 - 599. Simply change the path in `/status/<number>`. By default you will get an empty status text, so feel free to combine it with the custom `statustext` option as well.

```bash
$ curl -G --data-urlencode "statustext=custom error" https://response.page/status/543
543: custom error
```

## Custom Response Headers

Any headers with the prefix `x-response-` will be returned in the response.

```bash
$ curl -H 'x-response-custom-header: foo' -H 'x-response-another-custom-header: bar' https://response.page/status/200 -v

> GET /status/200 HTTP/2
> Host: response.page
> user-agent: curl/7.86.0
> accept: */*
> x-response-custom-header: foo
> x-response-another-custom-header: bar


< HTTP/2 200
< date: Fri, 18 Nov 2022 19:02:24 GMT
< content-type: text/plain
< content-length: 7
< another-custom-header: bar
< custom-header: foo

200: OK
```

## Sleep delay

You can have the response be delayed by using the `sleep` query parameter, with the sleep time in ms. There is no enforced upper limit (yet), however Cloudflare suggest the [limit is around 30s](https://developers.cloudflare.com/workers/platform/limits/#how-long-can-a-subrequest-take)

```bash
$ time curl https://response.page/status/200?sleep=5000
200: OK
real	0m5.143s
```

## Custom Redirect

For any 3xx status requested, by default it will return to `https://response.page/status/200`. However, if you'd like to change this, add the `location: ` header in your request.

```bash
curl -H 'location: https://cameron.ci' https://response.page/status/302 -v

> GET /status/302 HTTP/2
> Host: response.page
> user-agent: curl/7.86.0
> accept: */*
> location: https://cameron.ci

< location: https://cameron.ci

302: Found
```

# Response Codes

By default, this service returns all official HTTP status codes between 200 and 599, and some unofficial codes. You can also create your own custom response status (see Instructions).

| Status Code | Status Text |
| ------ | ------ |
| [200](https://response.page/status/200) | OK |
| [201](https://response.page/status/201) | Created |
| [202](https://response.page/status/202) | Accepted |
| [203](https://response.page/status/203) | Non-Authoritative Information |
| [204](https://response.page/status/204) | No Content |
| [205](https://response.page/status/205) | Reset Content |
| [206](https://response.page/status/206) | Partial Content |
| [207](https://response.page/status/207) | Multi-Status |
| [208](https://response.page/status/208) | Already Reported |
| [226](https://response.page/status/226) | IM Used |
| [301](https://response.page/status/301) | Moved Permanently |
| [302](https://response.page/status/302) | Found |
| [303](https://response.page/status/303) | See Other |
| [304](https://response.page/status/304) | Not Modified |
| [305](https://response.page/status/305) | Use Proxy Deprecated |
| [306](https://response.page/status/306) | unused |
| [307](https://response.page/status/307) | Temporary Redirect |
| [308](https://response.page/status/308) | Permanent Redirect |
| [400](https://response.page/status/400) | Bad Request |
| [401](https://response.page/status/401) | Unauthorized |
| [402](https://response.page/status/402) | Payment Required Experimental |
| [403](https://response.page/status/403) | Forbidden |
| [404](https://response.page/status/404) | Not Found |
| [405](https://response.page/status/405) | Method Not Allowed |
| [406](https://response.page/status/406) | Not Acceptable |
| [407](https://response.page/status/407) | Proxy Authentication Required |
| [408](https://response.page/status/408) | Request Timeout |
| [409](https://response.page/status/409) | Conflict |
| [410](https://response.page/status/410) | Gone |
| [411](https://response.page/status/411) | Length Required |
| [412](https://response.page/status/412) | Precondition Failed |
| [413](https://response.page/status/413) | Payload Too Large |
| [414](https://response.page/status/414) | URI Too Long |
| [415](https://response.page/status/415) | Unsupported Media Type |
| [416](https://response.page/status/416) | Range Not Satisfiable |
| [417](https://response.page/status/417) | Expectation Failed |
| [418](https://response.page/status/418) | I'm a teapot |
| [419](https://response.page/status/419) | Page Expired |
| [420](https://response.page/status/420) | Enhance Your Calm |
| [421](https://response.page/status/421) | Misdirected Request |
| [422](https://response.page/status/422) | Unprocessable Entity |
| [423](https://response.page/status/423) | Locked |
| [424](https://response.page/status/424) | Failed Dependency |
| [425](https://response.page/status/425) | Too Early Experimental |
| [426](https://response.page/status/426) | Upgrade Required |
| [428](https://response.page/status/428) | Precondition Required |
| [429](https://response.page/status/429) | Too Many Requests |
| [430](https://response.page/status/430) | Request Header Fields Too Large |
| [431](https://response.page/status/431) | Request Header Fields Too Large |
| [440](https://response.page/status/440) | Login Time-out |
| [444](https://response.page/status/444) | No Response |
| [450](https://response.page/status/450) | Blocked by Windows Parental Controls |
| [451](https://response.page/status/451) | Unavailable For Legal Reasons |
| [460](https://response.page/status/460) |  |
| [463](https://response.page/status/463) |  |
| [494](https://response.page/status/494) | Request header too large |
| [495](https://response.page/status/495) | SSL Certificate Error |
| [496](https://response.page/status/496) | SSL Certificate Required |
| [497](https://response.page/status/497) | HTTP Request Sent to HTTPS Port |
| [498](https://response.page/status/498) | Invalid Token |
| [499](https://response.page/status/499) | Client Closed Request |
| [500](https://response.page/status/500) | Internal Server Error |
| [501](https://response.page/status/501) | Not Implemented |
| [502](https://response.page/status/502) | Bad Gateway |
| [503](https://response.page/status/503) | Service Unavailable |
| [504](https://response.page/status/504) | Gateway Timeout |
| [505](https://response.page/status/505) | HTTP Version Not Supported |
| [506](https://response.page/status/506) | Variant Also Negotiates |
| [507](https://response.page/status/507) | Insufficient Storage |
| [508](https://response.page/status/508) | Loop Detected |
| [509](https://response.page/status/509) | Bandwidth Limit Exceeded  |
| [510](https://response.page/status/510) | Not Extended |
| [511](https://response.page/status/511) | Network Authentication Required |
| [520](https://response.page/status/520) | Web Server Returned an Unknown Error |
| [521](https://response.page/status/521) | Web Server Is Down |
| [522](https://response.page/status/522) | Connection Timed Out |
| [523](https://response.page/status/523) | Origin Is Unreachable |
| [524](https://response.page/status/524) | A Timeout Occurred |
| [525](https://response.page/status/525) | SSL Handshake Failed |
| [526](https://response.page/status/526) | Invalid SSL Certificate |
| [527](https://response.page/status/527) | Railgun Error |
| [530](https://response.page/status/530) |  |
| [598](https://response.page/status/598) | Network read timeout error |
| [599](https://response.page/status/599) | Network Connect Timeout Error |

# FAQs

### Why don't you support 1xx HTTP status codes?

Unfortunately the Fetch API the workers runtime uses doesn't support returning 1xx responses and only supports returning a response within [200 and 599](https://fetch.spec.whatwg.org/#initialize-a-response)

### I can't get a response body for 204, 205 or 304 status codes

The Fetch API the workers runtime doesn't support having a response body for the [204, 205 and 304](https://fetch.spec.whatwg.org/#statuses) status codes

### Why build this?

When writing other Cloudflare workers, I wanted a way to easily check how my code would handle downstream errors, and it was a fun project to open source

### Do you log anything?

I keep no logs. Cloudflare does have the ability to live tail logs which may be used in the event of debugging. This contains some basic information about the event (see [here](https://developers.cloudflare.com/logs/reference/log-fields/account/workers_trace_events/))

### I've found a bug, would like to request a feature or contribute

Sure! Thank you for you interest. Please create an issue or PR in the [Github Repo](https://github.com/c-ameron/response-page). Please bare in mind this is a hobby project so I will get back to you as soon as possible.

# Fair Use

For now, this is running on the free workers plan which allows 100k requests a day. There is no rate limiting however if the usage gets high I may implement rate limiting.

# Similar projects

Both https://httpstat.us and https://httpbin.org allow the ability to receive http response status codes and I'd like to thank them both for inspiration.
