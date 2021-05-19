# URL Minifier Service

Minifier service that translates HTTP requests to DNS URI record lookups and redirects.

Request paths are converted to subdomains and appended to the request hostname before looking for a record. For
example, `https://goto.brinkmanlab.ca/foo/bar` will query the DNS URI record `bar.foo.goto.brinkmanlab.ca`.

Any URL query parameters in the request url are appended to the redirect url.

## Deployment

This script is intended to be deployed as a CloudFlare worker. Alternatively it can be independently hosted using
the [cloudflare-workers-local](https://github.com/gja/cloudflare-worker-local) NPM package.
