//Application Window Component Constructor
function ApplicationWindow() {
	//load component dependencies
	var FirstView = require('ui/FirstView');
		
	//create component instance
	var self = Ti.UI.createWindow({
		backgroundColor:'#ffffff',
		navBarHidden:true,
		exitOnClose:true
	});
		
	//construct UI
	var firstView = new FirstView();
	self.add(firstView);
	
	// test loading opentok module
	var opentok = require('com.tokbox.ti.opentok');
	Ti.API.info("module is => " + opentok);
	
	return self;
}

//make constructor function the public component interface
module.exports = ApplicationWindow;
