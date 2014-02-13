/**
 * Module dependencies.
 */

var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var routes = require( __dirname + '/routes') ;
var http = require('http');
var path = require('path');
var token = require('token');

var app = express();

// all environments

app.set( 'port', process.env.PORT || 3000);
app.set( 'views', path.join(__dirname, 'views'));
app.set( 'view engine', 'ejs');


app.use(express.favicon())
    .use(express.logger('dev'))
    .use(express.cookieParser())
    .use(express.json())
    .use(express.urlencoded())
    .use(token.middleWare)
    .use(express.methodOverride())
    .use(expressLayouts)
    .use(app.router)
    .use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Declare database model
require(__dirname + '/models/models.js');


// load routes
var user = require('./routes/user');
var beacon = require('./routes/beacon');


// Define routes
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/beacons',  beacon.list );
app.get('/rpc/beacons', beacon.rpc_list );
app.post('/rpc/beacon', beacon.rpc_register );
app.delete('/rpc/beacon', beacon.rpc_delete );

app.post('/rpc/login', user.rpc_login );
app.post('/rpc/user', user.rpc_create );

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
