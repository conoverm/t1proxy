var test = require('tape')
var mock = require('mock-require');

mock('http-proxy-middleware', './spy');

mock('dotenv', { config: () => {
  return true;
}});

var adamaProxy = require('../index.js')

var mockProxyReq = {
  setHeader: (arg) => {
    return true;
  },
  write: (arg) => {
    return true;
  },
  end: (arg) => {
    return true;
  }
}

test('well-formed PROD request from login form', function (tape) {
  let stubRequest = {
    url: '/api/v2.0/login',
    method: 'POST',
    body: {
      user: 'STEVE',
      password: 'WINWOOD'
    }
  }

  process.env.NODE_ENV = 'prod';

  let proxyResult = adamaProxy(mockProxyReq, stubRequest);

  tape.equal(proxyResult, 'login request sent', 'login request sent');

  tape.end()
})

test('well-formed DEV request from login form', function (tape) {
  let stubRequest = {
    url: '/api/v2.0/login',
    method: 'POST',
    body: {
      user: 'DARYL',
      password: 'oates'
    }
  }

  process.env.NODE_ENV = 'develop';

  let proxyResult = adamaProxy(mockProxyReq, stubRequest);

  tape.equal(proxyResult, 'login request sent', 'login request sent');

  tape.end()
})

test('DEV request with local .env modifies login request',
  function (tape) {
  let stubRequest = {
    url: '/api/v2.0/login',
    method: 'GET'
  }

  process.env.NODE_ENV = 'develop';
  process.env.T1USER = 'donfagen';
  process.env.T1PASSWORD = 'e4gl3s'
  process.env.T1APIKEY = 'STILL-FAKE-API-KEY';

  let proxyResult = adamaProxy(mockProxyReq, stubRequest);

  tape.equal(proxyResult, 'login request sent', 'login request sent');

  tape.end()
})

test('DEV request with malformed .env sends request',
  function (tape) {
  let stubRequest = {
    url: '/api/v2.0/login',
    method: 'GET'
  }

  process.env.NODE_ENV = 'develop';
  process.env.T1USER = 'THIS';
  process.env.T1PASSWORD = null;
  // process.env.T1APIKEY = 'Commented out on purpose!';

  let proxyResult = adamaProxy(mockProxyReq, stubRequest);

  tape.comment(`Bad request sent`);
  tape.equal(proxyResult, 'login request sent', 'login request sent');

  tape.end()
})

test('Request to non-login route returns immediately',
  function (tape) {
  let stubRequest = {
    url: '/HENLEY',
    method: 'GET'
  }

  let proxyResult = adamaProxy(mockProxyReq, stubRequest);

  tape.equal(proxyResult, 'no login', 'no login');

  tape.end()
})

test('POST request with no req.body returns immediately',
  function (tape) {
  let stubRequest = {
    url: '/api/v2.0/login',
    method: 'POST'
  }

  let proxyResult = adamaProxy(mockProxyReq, stubRequest);

  tape.equal(proxyResult, 'no POST data', 'no POST data');

  tape.end()
})

test('lack of a NODE_ENV does not cause a fatal error',
  function (tape) {
  let stubRequest = {
    url: '/api/v2.0/login',
    method: 'GET'
  }

  process.env.NODE_ENV = undefined;

  let proxyResult = adamaProxy(mockProxyReq, stubRequest)

  tape.equal(proxyResult, 'login request sent',
    'login request sent');

  tape.end()
})