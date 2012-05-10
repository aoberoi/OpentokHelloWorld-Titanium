// Private data
var self, logArea, opentok, session, subscribers, publisher, publishButton;

var CONFIG = {
	sessionId: '1_MX4wfn4yMDEyLTA0LTIxIDIwOjEwOjIzLjM5NTIxMiswMDowMH4wLjg5MTk2MDUyODI5NH4',
	apiKey: '1127',
	token: 'devtoken'
};

// Application Window Component Constructor
function ApplicationWindow() {
		
	//create component instance
	self = Ti.UI.createWindow({
		backgroundColor:'#ffffff',
		navBarHidden:true,
		exitOnClose:true,
		layout: 'vertical'
	});
	logArea = Ti.UI.createTextArea({
  		height : 200,
  		width : 300,
  		top : 20,
  		textAlign : 'left',
  		borderWidth : 2,
  		borderColor : '#bbb',
  		borderRadius : 5,
  		enabled: false,
  		editable: false
	});
	publishButton = Ti.UI.createButton({
		 title: 'Publish',
		 top: 20,
		 width: 100,
		 height: 50,
		 enabled: false
	});
	
	self.add(logArea);
	self.add(publishButton);
	
	initializeOpentok();
	
	return self;
}


function initializeOpentok() {
	// loading opentok module
	opentok = require('com.tokbox.ti.opentok');
	Ti.API.info("module is => " + opentok);
	
	// create a session
	session = opentok.createSession({ sessionId: CONFIG.sessionId });
	
	// listen to the relevent events from the session
	session.addEventListener('sessionConnected', sessionConnectedHandler);
	session.addEventListener('sessionDisconnected', sessionDisconnectedHandler);
	session.addEventListener('sessionFailed', sessionFailedHandler);
	session.addEventListener('streamCreated', streamCreatedHandler);
	session.addEventListener('streamDestroyed', streamDestroyedHandler);
	
	// add actions for the publish button
	publishButton.addEventListener('click', publishToSession);
	
	// connect to the session
	session.connect(CONFIG.apiKey, CONFIG.token);
	
	// initialize some data structures
	subscribers = {};
}

/* 
 * Event fired once the Opentok session has connected.
 * 
 * @param {object} event Information about the event
 * 		@property {Session} source The session (proxy object) which just connected
 */
function sessionConnectedHandler(event) {
	var i, aStream;
	
	log("session connected handler fired");
	
	publishButton.enabled = true;
	
	var streams = event.source.streams;
	
	log("initial number of streams: " + streams.length);
	
	// For all of the existing streams in the session, create a subscriber
	for (i = 0; i < streams.length; i++) {
		aStream = streams[i];
		
		// suscribe to stream if its not my own
		if (session.connection.connectionId !== aStream.connection.connectionId) {
			subscribeToStream(aStream);
		}
	}
}

function subscribeToStream(stream) {
	var newSubscriber = session.subscribe(stream);
	subscribers[stream.streamId] = newSubscriber;
	
	// Add Event Listeners
	newSubscriber.addEventListener('subscriberConnected', subscriberConnectedHandler);
	newSubscriber.addEventListener('subscriberFailed', subscriberFailedHandler);
	newSubscriber.addEventListener('subscriberStarted', subscriberStartedHandler);
	
	// TODO: Add the view
	
	// The new subscriber's view has some default sizing, but we should specify the desired sizing.
		//newSubscriber.view.top		= 0;
		//newSubscriber.view.left		= 0;
		//newSubscriber.view.width	= 120;
		//newSubscriber.view.height	= 90;
		
		// Add the view to the screen
		//self.add(newSubscriber.view);
		
	log(JSON.stringify(subscribers));
}

function removeSubscriber(stream) {
	var aSubscriber;
	if (subscribers[stream.streamId] !== undefined) {
		aSubscriber = subscribers[stream.streamId];
		
		// Remove event listeners
		aSubscriber.removeEventListener('subscriberConnected', subscriberConnectedHandler);
		aSubscriber.removeEventListener('subscriberFailed', subscriberFailedHandler);
		aSubscriber.removeEventListener('subscriberStarted', subscriberStartedHandler);
		
		// TODO: Remove views
		
		
		// Close the subscriber and stop the media stream gracefully
		aSubscriber.close();
		
		// Get rid of the subscriber reference
		delete subscribers[stream.streamId];
	}
	
	log(JSON.stringify(subscribers));
}

function subscriberConnectedHandler(event) {
	log("subscriber connected handler fired");
}

function subscriberFailedHandler(event) {
	// TODO: figure out how to read the error message
	log("subscriber failed handler fired with message:\n" + event);
}

function subscriberStartedHandler(event) {
	log("subscriber started handler fired");
}

/* 
 * Event fired once the Opentok session has disconnected.
 * Publishers and Subscribers will automatically be destroyed on disconnect.
 * 
 * @param {object} event Information about the event
 * 		@property {Session} source The session (proxy object) which just disconnected
 */
function sessionDisconnectedHandler(event) {
	log("session disconnected handler fired");
	publishButton.enabled = false;
}

/* 
 * Event fired if the Opentok session has an error after a call to connect().
 * 
 * @param {object} event Information about the event
 * 		@property {Session} source The session (proxy object) that could not connect.
 * 		@property {Error} error Error information
 */
function sessionFailedHandler(event) {
	// TODO: figure out how to read the error message
	log("session failed handler fired with message:\n" + event);
	// TODO: is this necessary? will the publish button ever have been enabled?
	//       does this only fire when connect fails, or when i disconnect mid-session?
	publishButton.enabled = false;
}

/* 
 * Event fired when a new stream is created within the Opentok session.
 * 
 * @param {object} event Information about the event
 * 		@property {Session} source The session (proxy object) which contains the new stream
 * 		@property {Stream} stream The stream (proxy object) that was just added to the session
 */
function streamCreatedHandler(event) {
	var aStream = event.stream;
	
	log('stream created with id: ' + aStream.streamId);
	
	log('now the number of streams in the session is ' + session.streams.length);
	
	// suscribe to stream if its not my own
	if (session.connection.connectionId !== aStream.connection.connectionId) {
		subscribeToStream(aStream);
	}
}


/* 
 * Event fired when a stream is dropped within the Opentok session.
 * 
 * @param {object} event Information about the event
 * 		@property {Session} source The session (proxy object) which contains the new stream
 * 		@property {Stream} stream The stream (proxy object) that just dropped in the session
 */
function streamDestroyedHandler(event) {
	var aStream = event.stream;
	
	log('stream destroyed with id: ' +  aStream.streamId);
	
	// close any subscribers this stream may have
	removeSubscriber(aStream);
	
	log('now the number of streams in the session is ' + session.streams.length);
}

function publishToSession(event) {
	publisher = session.publish();
	
	publisher.addEventListener('publisherFailed', publisherFailedHandler);
	publisher.addEventListener('publisherStarted', publisherStartedHandler);
	publisher.addEventListener('publisherStopped', publisherStoppedHandler);
	
	publishButton.enabled = false;
	
}

function publisherFailedHandler(event) {
	log('publisher failed');
	publishButton.enabled = true;
	delete publisher;
}

function publisherStartedHandler(event) {
	log('publisher started');
}

function publisherStoppedHandler(event) {
	log('publisher stopped');
	publishButton.enabled = true;
	delete publisher;
}

function log(message) {
	logArea.value += ('\n' + message);
	// TODO: replicate logArea.scrollToBottom()
}

//make constructor function the public component interface
module.exports = ApplicationWindow;
