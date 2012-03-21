// Private data in this window's sub-context
var self, opentok, session, subscribers;

var CONFIG = {
	sessionId: '1sdemo00855f8290f8efa648d9347d718f7e06fd',
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
	subscribers = new Array();
	
	return self;
}

/* 
 * Event fired once the Opentok session has connected.
 * 
 * @param {object} event Information about the event
 * 		@property {Session} source The session (proxy object) which just connected
 */
function sessionConnectedHandler(event) {
	var i, newSubscriber;
	
	Ti.API.info("session connected handler is fired");
	
	// For all of the existing streams in the session, create a subscriber
	for (i = 0; i < event.source.streams.length; i++) {
		// Debug info
		Ti.API.info("Stream #" + i + ": " + event.source.streams[i].streamId);
		
		// Create a subscriber object (its view is not necessarily on screen, but data is being streamed)
		//newSubscriber = opentok.createSubscriber({ stream: event.source.streams[i] });
		//subscribers.push(newSubscriber);
		
		// The new subscriber's view has some default sizing, but we should specify the desired sizing.
		//newSubscriber.view.top		= 0;
		//newSubscriber.view.left		= 0;
		//newSubscriber.view.width	= 120;
		//newSubscriber.view.height	= 90;
		
		// Add the view to the screen
		//self.add(newSubscriber.view);
	}
}

/* 
 * Event fired once the Opentok session has disconnected.
 * Publishers and Subscribers will automatically be destroyed on disconnect.
 * 
 * @param {object} event Information about the event
 * 		@property {Session} source The session (proxy object) which just disconnected
 */
function sessionDisconnectedHandler(event) {
	
}

/* 
 * Event fired if the Opentok session has an error after a call to connect().
 * 
 * @param {object} event Information about the event
 * 		@property {Session} source The session (proxy object) that could not connect.
 * 		@property {Error} error Error information
 */
function sessionFailedHandler(event) {
	
}

/* 
 * Event fired when a new stream is created within the Opentok session.
 * 
 * @param {object} event Information about the event
 * 		@property {Session} source The session (proxy object) which contains the new stream
 * 		@property {Stream} stream The stream (proxy object) that was just added to the session
 */
function streamCreatedHandler(event) {
	
}


/* 
 * Event fired when a stream is dropped within the Opentok session.
 * 
 * @param {object} event Information about the event
 * 		@property {Session} source The session (proxy object) which contains the new stream
 * 		@property {Stream} stream The stream (proxy object) that just dropped in the session
 */
function streamDestroyedHandler(event) {
	
}

//make constructor function the public component interface
module.exports = ApplicationWindow;
