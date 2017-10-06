/*
  Requires server running this proxy to use body-parser
  or another solution
  that puts the POST data on req.body
*/
var proxy = require('http-proxy-middleware');
var dotenv = require('dotenv');

dotenv.config();

function credentials() {
  var creds = {};

  creds.user = process.env.T1USER;
  creds.password = process.env.T1PASSWORD;
  creds.api_key = process.env.T1APIKEY;

  return creds;
}

function login(proxyReq, req) {
  var creds = credentials();
  process.env.NODE_ENV = process.env.NODE_ENV || '';

  if (req.url !== '/api/v2.0/login') {
    return 'no login';
  }

  if (req.method === 'POST' && !req.body) {
    console.error(`T1Proxy: Either no user or password in POST object`);
    return 'no POST data';
  }

  if (req.method === 'POST' && req.body) {
    // assume the request is from a login form
    creds.user = req.body.user;
    creds.password = req.body.password;
  }

  if (req.method === 'GET' && process.env.NODE_ENV.match(/dev/)) {
    /***
    local dev login route. Purely a convienence route for developers.
    Running in NODE_ENV=dev and with a proper .env file will put an Adama
    session cookie in the browser that makes the request to /api/v2.0/login
    without the need of manually using a T1 Login Form.

    This proxy will not fail the request if the credentials file is not
    accurately setup. It will send the improper credentials to T1.
    ***/
    Object.keys(creds).forEach((key) => {
      if (!creds[key] || creds[key].length == 0) {
        console.error(`T1Proxy: T1 Credentials missing from '.env': ${key}`);
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
  return 'login request sent';
};

var t1proxy = proxy(['/api/v2.0', '/media/v1.0'], {
  target: 'https://api.mediamath.com',
  changeOrigin: true,
  headers: {
    'x-local-proxy': 'proxied request',
  },
  onProxyReq: login
});

module.exports = t1proxy;