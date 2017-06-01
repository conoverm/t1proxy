// connect app
const connect = require('connect');
const http = require('http');
const path = require('path')
const proxy = require('http-proxy-middleware');
const serveStatic = require('serve-static');
const url = require('url');
const bodyParser = require('body-parser');
const adamaProxy = require('../index.js')


const app = connect();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())
app.use(serveStatic(path.join(__dirname, '/dist')))
app.use(adamaProxy);

// beanstalk default: 8081
http.createServer(app).listen(8081);
console.info('created app at: 8081');
