import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'
import 'dns';
const dns = globalThis["@i2labs/dns"];
const rootDomain = "goto.brinkmanlab.ca";
const statusCode = 301;

if (Response.redirect === undefined) {
    // Support running in nodejs
    Response.redirect = function (url, status) {
        return new Response('', {headers: {Location: url}, status});
    }
}

async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname.split('/').filter(p => p).reverse().map(p => p.replace(/[^\w-]/g, '-').replace(/^-|-$/g, ''));
    const hostname = [...path, url.hostname].join('.');
    console.log(`${hostname} ${request.referrer}`);
    if (hostname === rootDomain) {
        return new Response(Info, {
            headers: {"content-type": "text/html;charset=UTF-8",},
            status: 200,
        });
    }
    let records = await dns.promises.resolve(hostname, 'URI');
    if (records.length === 0) {
        // Retry without path
        records = await dns.promises.resolve(url.hostname, 'URI');
    }
    if (records.length === 0) {
        return new Response(NotFound(hostname), {
            headers: {"content-type": "text/html;charset=UTF-8",},
            status: 404,
            statusText: "Not Found"
        });
    }
    let result = records[0];
    for (const record of records) {
        if (result.priority < record.priority || (result.priority === record.priority && result.weight < record.weight)) result = record;
    }
    const resultURL = new URL(result.target);
    for (const [name, value] of url.searchParams) resultURL.searchParams.append(name, value);
    return Response.redirect(resultURL.toString(), statusCode);
}

addEventListener("fetch", async event => {
    event.respondWith(handleRequest(event.request))
})


function NotFound(hostname) {
    return `<html>
<head><title>Brinkman Lab - 404 Not Found</title></head>
<body>
<header>
    <h1>Brinkman Lab URL Minifier Service</h1>
    <h2>404 Not Found</h2>
</header>
<main>
  The requested resource (${hostname}) was not found. If you believe this to be an error, please contact us at <a href="mailto:brinkman-ws@sfu.ca">brinkman-ws@sfu.ca</a>.
</main>
<footer style="margin-top: 5em">
  <a href="https://brinkmanlab.ca/">Fiona Brinkman Laboratory</a> - Simon Fraser University
</footer>
</body>
</html>`
}

const Info = `<html>
<head><title>Brinkman Lab Minifier Service</title></head>
<body>
<header>
    <h1>Brinkman Lab URL Minifier Service</h1>
</header>
<main>
  <p>Welcome to the Fiona Brinkman Laboratory URL minifier service. If you were looking for the lab website, it is hosted at <a href="https://brinkmanlab.ca/">https://brinkmanlab.ca</a></p>
  <p>This service provides long lived urls to our various resources. They are intended to be used in publications or anywhere where we need to guarantee the link will remain active independent of any underlying resource.</p>
  <p>Staff can add new URLs in the <a href="https://github.com/brinkmanlab/brinkman_cloud/blob/brinkmanlab_ca/goto.tf">brinkman_cloud repository</a> (access restricted).</p>
</main>
<footer style="margin-top: 5em">
    <p>
      Contact us at <a href="mailto:brinkman-ws@sfu.ca">brinkman-ws@sfu.ca</a>
    </p>
    <p>
      <a href="https://brinkmanlab.ca/">Fiona Brinkman Laboratory</a> - Simon Fraser University
    </p>
</footer>
</body>
</html>`
