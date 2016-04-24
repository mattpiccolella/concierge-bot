var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var wit = require('./utils/wit.js');
var utils = require('./utils/base.js');
var constants = require('./config/constants.js');
var app = express();
var sessions = wit.sessions;

// TODO: Verify using page ID.
var VERIFY_TOKEN = constants.VERIFY_TOKEN;

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send(VERIFY_TOKEN);
});

// Verify Facebook webhook. Only run once.
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
		res.send(req.query['hub.challenge'])
	}
	res.send(utils.test());
});

// Get post data from our webhook.
app.post('/webhook/', function (req, res) {
	messages = req.body.entry[0].messaging;
	for (i = 0; i < messages.length; i++) {
		var event = messages[i];
		var sender = event.sender.id;
		var sessionId = wit.findOrCreateSession(sender);
		if (event.message && event.message.text) {
			var text = event.message.text;
			var attachments = event.message.attachments;
			if (attachments) {
				utils.sendMessage(sender, { text : 'Sorry, I can only process text messages for now.' });
			} else if (text) {
				// Runs all action on the wit.ai section.
      	wit.client.runActions(sessionId, text, sessions[sessionId].context, function(error, context) {
          if (error) {
            console.log('Oops! Got an error from Wit: ', error);
          } else {
           // Our bot did everything it has to do. Wait for future messages.
           console.log('Waiting for futher messages.');
           // Updating the user's current session state
           sessions[sessionId].context = context;
          }
        });
			}
		}
		if (event.postback) {
			text = JSON.stringify(event.postback);
			utils.sendMessage(sender, { text : "You clicked my button!"} );
		}
	}
	res.sendStatus(200);
});

app.listen(app.get('port'), function() {
	console.log('Running Concierge Bot on ', app.get('port'))
})