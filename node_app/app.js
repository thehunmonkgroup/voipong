const debug = true;

/**
 * Module dependencies.
 */

const _ = require('underscore');
const express = require('express');
const errorHandler = require('errorhandler');

const app = module.exports = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const esl = require('esl');
esl.debug = false;
const Backbone = require('backbone');
const routes = require('./routes')(app, io);

const env = process.env.NODE_ENV || 'development';

// Configuration

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

if (env == 'development') {
  app.use(errorHandler({dumpExceptions: true, showStack: true}));
}
else {
  app.use(errorHandler());
}


app.get('/', routes.index);

const debug_log = (message) => {
  if (debug) {
    console.log(message);
  }
}

const models = {};

models.Call = Backbone.Model.extend({
  initialize: function(options) {
    // Bind this beforehand.
    _.bindAll(this, 'keyPressed', 'answer', 'hangup');

    // Set a private member to keep track of the call.
    this._call = options.call;

    // Trigger a local method on these events,
    // could also be a map against pretty names / arg transforms
    this._call.on('DTMF', this.keyPressed);
    this._call.on('CHANNEL_HANGUP', this.hangup);

    debug_log("initialized new call: " + this.id);
  },
  answer: function() {
    debug_log("answering call " + this.id);
    // Answer the call and emit an event.
    this._call.execute('answer');
    this._call.execute('playback', 'voipong/intro.wav');
    this.trigger('answered', this.id);
  },
  hangup: function(data) {
    debug_log("call hung up: " + this.id);
    this.trigger('hungUp', this.id);
  },
  keyPressed: function(data) {
    const digit = data.body['DTMF-Digit'];
    debug_log("key press on " + this.id + ": " + digit);
    const event_data = {
      id: this.id,
      digit: digit,
    }
    // Emit an event for the keypress.
    this.trigger('keyPressed', event_data);
  }
});

// Create a collection of calls.
models.Calls = Backbone.Collection.extend({
  model: models.Call
});

// Instantiate it.
const activeCalls = new models.Calls();

const add_call = (call) => {
  // New calls should be answered automatically.
  call.answer();
}
activeCalls.on('add', add_call);

const remove_call = (call) => {
  debug_log("removing call: " + call.id);
}
activeCalls.on('remove', remove_call);

// FreeSWITCH.
const fsconn = esl.server(function() {
  debug_log("connected to FreeSWITCH");
  const call = this;
  // Only two players, so drop other calls.
  if (activeCalls.length < 2) {
    // Just adding it to this collection will
    // instantiate it and trigger events.
    //console.log(call);
    const new_call = {
      id: call.uuid,
      call: call,
    }
    activeCalls.add([ new_call ]);
  }
  else {
    call.hangup();
  }
});
fsconn.listen(3001);

// New socket connections from the client (browser).
const socket_connected = (socket) => {
  const log_client_response = (data) => {
    console.log(data);
  }
  socket.on('key press received', log_client_response);

  // Standard way to pass messages to client.
  const status_message = (message) => {
    socket.emit('status', { message: message });
  }
  status_message('ready to start demo');
  const answered = (id) => {
    socket.emit('new player', id);
  }
  activeCalls.on("answered", answered);
  const hungup = (id) => {
    const call = activeCalls.get(id);
    activeCalls.remove(call);
    socket.emit('player quit', id);
  }
  activeCalls.on("hungUp", hungup);
  const key_pressed = (data) => {
    socket.emit("keyPressed", data);
  }
  activeCalls.on("keyPressed", key_pressed);
}
io.on('connection', socket_connected);

server.listen(3000);
console.log("Express server listening on port %d in %s mode", 3000, app.settings.env);

