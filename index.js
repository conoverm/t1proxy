const proxy = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

function credentials() {
  let creds = {};

  creds.user = process.env.T1USER;
  creds.password = process.env.T1PASSWORD;
  creds.api_key = process.env.T1APIKEY;

  return creds;
}

const adamaProxy = proxy(['/api/v2.0', '/media/v1.0'], {
  target: 'https://api.mediamath.com',
  changeOrigin: true,
  headers: {
    'x-local-proxy': 'proxied request',
  },
  onProxyReq(proxyReq, req) {
    let creds = credentials();

    if (req.url === '/api/v2.0/login' && req.method === 'POST') {
      // assume the request is from a login form
      creds.user = req.body.user;
      creds.password = req.body.password;
    }

    if (req.url === '/api/v2.0/login' &&
        req.method === 'GET' &&
        process.env.NODE_ENV.match(/dev/)) {
      // local dev login route.
      // Running in NODE_ENV=dev and with a proper .env file will put an Adama
      // session cookie in the browser that makes the request to /api/v2.0/login
      Object.keys(creds).forEach((key) => {
        if (!creds[key] || creds[key].length == 0) {
          console.error(`T1 Credentials missing from \`.env\`. Credentials are: T1USER, T1PASSWORD, T1APIKEY`);
        }
      })

      proxyReq.method = 'POST';

    }

    delete req.body;

    // URI encode JSON object
    // this elegant solution found deep in http-proxy-middleware github issues
    creds = Object.keys(creds).map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(creds[key]);
    }).join('&');

    // Update header
    proxyReq.setHeader('content-type', 'application/x-www-form-urlencoded');
    proxyReq.setHeader('content-length', creds.length);

    proxyReq.write(creds);
    proxyReq.end();
  }
});

module.exports = adamaProxy;