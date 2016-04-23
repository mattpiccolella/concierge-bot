var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var utils = require('./utils/base.js');
var app = express();

var VERIFY_TOKEN = 'AYVO6O4wey7NFD5';
var PAGE_TOKEN = 'CAAXZCBiQkd4YBALZBk4wqOZAXoPjjatHH1xzed05ZAQA0PRCNjKIflyzRDsmgv2ZCsas5VPyd6GKxBvalaig8NsTyEnMxTpNPcFUPXHiOdygC05vZANOsIUQn2bMJ3qbgjv0g3uEyipyzC0xLKWpbUJ78p01wzVzXkxmEDY30cZC186dLDsMxJc75ZCZANDwQlrIZD';
var BASE_URL = 'https://graph.facebook.com/v2.6/me/messages';

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Welcome to Concierge Bot!');
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
		if (event.message && event.message.text) {
			var text = event.message.text;
			utils.sendMessage(sender, { text: text.substring(0, 200) });
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