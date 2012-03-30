
/**
 * Module dependencies.
 */

var _ = require('underscore');
var express = require('express');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);
var esl = require('esl');
var Backbone = require('backbone');
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

var models = {};

models.Call = Backbone.Model.extend({
  initialize: function(options) {
    // Bind this beforehand.
    _.bindAll(this, 'keyPressed', 'answer');

    // Set a private member to keep track of the call.
    this._call = options.call;

    // Trigger a local method on these events,
    // could also be a map against pretty names / arg transforms
    this._call.on('DTMF', this.keyPressed);
  },
  answer: function() {
    // Answer the call and emit an event.
    this._call.execute('answer');
    // This is a hack to force some media over the channel, which smooths
    // out provider problems with them not recognizing we're ready to receive
    // data.
    this._call.execute('playback', 'voipong/intro.wav');
    this.trigger('answered');
  },
  keyPressed: function(args) {
    // Emit an event for the keypress.
    this.trigger('keyPressed', args);
  }
});

// Create a collection of calls.
models.Calls = Backbone.Collection.extend({
  model: models.Call
});

// Instantiate it.
var activeCalls = new models.Calls();

var add_call = function(call) {
  // New calls should be answered automatically.
  call.answer();
}
activeCalls.on('add', add_call);

// FreeSWITCH.
var fsconn = esl.createCallServer()
var call_connected = function(call) {
  // Just adding it to this collection will
  // instantiate it and trigger events.
  activeCalls.add([ {call: call} ]);
}
fsconn.on('CONNECT', call_connected);
fsconn.listen(3001);

// New socket connections from the client (browser).
var socket_connected = function(socket) {
  var log_client_response = function(data) {
    console.log(data);
  }
  socket.on('key press received', log_client_response);

  // Standard way to pass messages to client.
  var status_message = function(message) {
    socket.emit('status', { message: message });
  }
  status_message('ready to start demo');
  var answered = function() {
    status_message('call connected');
  }
  activeCalls.on("answered", answered);
  var key_pressed = function(data) {
    socket.emit("keyPressed", {digit: data.body['DTMF-Digit']});
  }
  activeCalls.on("keyPressed", key_pressed);
}
io.sockets.on('connection', socket_connected);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

