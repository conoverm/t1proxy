const proxy = require('http-proxy-middleware');
const dotenv = require('dotenv');

dotenv.config();

function credentials() {
  let creds = {};

  creds.user = process.env.T1USER;
  creds.password = process.env.T1PASSWORD;
  creds.api_key = process.env.T1APIKEY;
  
  Object.keys(creds).forEach((key) => {
    if (creds[key].length == 0) {
      throw new Error('T1 Credentials not present in `.env`. Credentials are: T1USER, T1PASSWORD, and T1APIKEY');
    }
  })

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

    if (req.url === '/api/v2.0/login') {
      proxyReq.method = 'POST';
    }

    let body = creds;

    body.user = process.env.T1USER;
    body.password = process.env.T1PASSWORD;
    body.api_key = process.env.T1APIKEY;

    delete req.body;

    // URI encode JSON object
    body = Object.keys(body).map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(body[key]);
    }).join('&');

    // Update header
    proxyReq.setHeader('content-type', 'application/x-www-form-urlencoded');
    proxyReq.setHeader('content-length', body.length);

    proxyReq.write(body);
    proxyReq.end();
  }
});

module.exports = adamaProxy;