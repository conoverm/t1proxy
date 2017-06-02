// connect app
const connect = require('connect');
const http = require('http');
const path = require('path')
const proxy = require('http-proxy-middleware');
const url = require('url');
const bodyParser = require('body-parser');
const adamaProxy = require('../index.js');

const app = connect();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(adamaProxy);

// beanstalk default: 8081
http.createServer(app).listen(8081);
console.info('created test at: 8081');
console.info('open a browser and go to: localhost:8081/api/v2.0/session');
console.info('then to: localhost:8081/api/v2.0/login');
console.info('then to: localhost:8081/api/v2.0/session');
console.info('then to: localhost:8081/api/v2.0/campaigns');
console.info('etc etc');
console.info('if your .env file has a T1USER, T1PASSWORD, T1APIKEY everything should work');
