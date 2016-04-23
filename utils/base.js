var utils = module.exports = {};

function makeRequest(url, sender, method, messageData, callback) {
  request({
    url: url,
    qs: { access_token : PAGE_TOKEN },
    method: 'POST',
    json: {
      recipient: { id : sender },
      message: messageData,
    }
  }, callback);
}
utils.makeRequest = makeRequest;

function defaultErrorHandler(error, response, body) {
  if (error) {
    console.log('Error sending messages: ', error);
  } else if (response.body.error) {
    console.log('Error: ', response.body.error);
  }
}
utils.defaultErrorHandler = defaultErrorHandler;

function sendMessage(sender, messageData) {
  makeRequest(BASE_URL, sender, 'POST', messageData, defaultErrorHandler);
}
utils.sendMessage = sendMessage;