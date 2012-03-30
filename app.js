
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);
var esl = require('esl');
var routes = require('./routes')(app, io);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('transports', [                     // enable all transports (optional if you want flashsocket)
  'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
]);

var fsconn = esl.createCallServer()
fsconn.listen(3001);

// socket.io.
var log_client_response = function(data) {
  console.log("From client: %s", data);
}

var socket_connected = function(socket) {

  // FreeSWITCH.
  var call_connected = function(call) {
    //console.log(call);
    var dtmf_received = function(e) {
      var digit = e.body['DTMF-Digit']
      socket.emit('key press', { digit: digit });
      //console.log(e);
    }
    call.on('DTMF', dtmf_received);
    call.execute('answer');
  }
  fsconn.on('CONNECT', call_connected);

  var status_message = function(message) {
    socket.emit('status', { message: message });
  }
  status_message('ready to start demo');
  socket.on('key press received', log_client_response);
}
io.sockets.on('connection', socket_connected);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
