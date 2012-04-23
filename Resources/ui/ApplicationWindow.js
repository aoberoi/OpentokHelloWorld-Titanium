// Private data in this window's sub-context
var self, opentok, session, subscribers;

var CONFIG = {
	sessionId: '1_MX4wfn4yMDEyLTA0LTIxIDIwOjEwOjIzLjM5NTIxMiswMDowMH4wLjg5MTk2MDUyODI5NH4',
	apiKey: '1127',
	token: 'devtoken'
};

// Application Window Component Constructor
function ApplicationWindow() {
	//load component dependencies
	var FirstView = require('ui/FirstView');
		
	//create component instance
	self = Ti.UI.createWindow({
		backgroundColor:'#ffffff',
		navBarHidden:true,
		exitOnClose:true
	});
		
	//construct UI
	var firstView = new FirstView();
	self.add(firstView);
	
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
	
	// connect to the session
	session.connect(CONFIG.apiKey, CONFIG.token);
	
	// initialize some data structures
	subscribers = {};
	
	return self;
}

/* 
 * Event fired once the Opentok session has connected.
 * 
 * @param {object} event Information about the event
 * 		@property {Session} source The session (proxy object) which just connected
 */
function sessionConnectedHandler(event) {
	var i, aStream;
	
	Ti.API.info("session connected handler fired");
	
	var streams = event.source.streams;
	
	Ti.API.info("initial number of streams: " + streams.length);
	
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
		
	Ti.API.info(subscribers);
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
	
	Ti.API.info(subscribers);
}

function subscriberConnectedHandler(event) {
	Ti.API.info("subscriber connected handler fired");
}

function subscriberFailedHandler(event) {
	// TODO: figure out how to read the error message
	Ti.API.info("subscriber failed handler fired with message:\n" + event);
}

function subscriberStartedHandler(event) {
	Ti.API.info("subscriber started handler fired");
}

/* 
 * Event fired once the Opentok session has disconnected.
 * Publishers and Subscribers will automatically be destroyed on disconnect.
 * 
 * @param {object} event Information about the event
 * 		@property {Session} source The session (proxy object) which just disconnected
 */
function sessionDisconnectedHandler(event) {
	Ti.API.info("session disconnected handler fired");
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
	Ti.API.info("session failed handler fired with message:\n" + event);
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
	
	Ti.API.info('stream created with id: ' + aStream.streamId);
	
	Ti.API.info('now the number of streams in the session is ' + session.streams.length);
	
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
	
	Ti.API.info('stream destroyed with id: ' +  aStream.streamId);
	
	// close any subscribers this stream may have
	removeSubscriber(aStream);
	
	Ti.API.info('now the number of streams in the session is ' + session.streams.length);
}

//make constructor function the public component interface
module.exports = ApplicationWindow;
