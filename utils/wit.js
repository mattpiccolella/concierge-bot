var Wit = require('node-wit').Wit;
var utils = require('../utils/base.js');
var constants = require('../config/constants.js');

var wit = module.exports = {};
const sessions = {};

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

// Our bot actions
const actions = {
  say(sessionId, context, message, callback) {
    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to
    var sender = sessions[sessionId].fbid;
    if (sender) {
      utils.sendMessage(sender, { text : message } );
    } else {
      console.log('Oops! Did not find user for session: ', sessionId);
      callback();
    }
  },
  merge(sessionId, context, entities, message, callback) {
    var search = firstEntityValue(entities, 'local_search_query');
    var loc = firstEntityValue(entities, 'location');
    if (search && loc) {
      context.search = search;
      context.loc = loc;
    }
    callback(context);
  },
  error(sessionId, context, error) {
    console.log(error);
    console.log('Here we go!');
    console.log(error.message);
  },
  ['findPlaces'](sessionId, context, callback) {
    var searchTerm = context.search;
    var locationTerm = context.loc;

    var sender = sessions[sessionId].fbid;
    if (sender) {
      utils.sendMessage(sender, { text : 'So we see you are looking for?' });
    } else {
      console.log('Invalid Facebook id.');
    }

    callback(context);
  }
};
wit.actions = actions;

function findOrCreateSession(fbid) {
  var sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {fbid: fbid, context: {}};
  }
  return sessionId;
};
wit.findOrCreateSession = findOrCreateSession;


const client = new Wit(constants.WIT_TOKEN, actions);
wit.client = client;
wit.sessions = sessions;