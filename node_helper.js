const exec = require('child_process').exec;
const fs = require('fs');
const callbackDir = __dirname + "/callbackScripts";

module.exports = NodeHelper.create({

    start: function () {
        this.started = false;
        this.screenState = false;
        this.forcedDown = false;
    },

    isScreenOn: function(){
        return this.screenState;
        // exec("/usr/bin/vcgencmd display_power").stdout.on('data', function(data) {
        //     if (data.indexOf("display_power=0") === 0) {
        //         return false;
        //     } else {
        //         return true;
        //     }
        // });
    },

    turnScreenOff: function(forced){
        const self = this;
        if (forced == true){
            console.log("Turn screen off (forced)!");
            this.forcedDown = true;
        } else {
            console.log("Turn screen off!");
            this.forcedDown = false;
        }
        self.screenState = false;
        self.runScriptsInDirectory(callbackDir+"/off");
    },

    turnScreenOn: function(forced){
        const self = this;
        if(forced == true){
            console.log("Turn screen on (forced)!");
            self.screenState = true;
            this.forcedDown = false;
            self.runScriptsInDirectory(callbackDir+"/on");
        } else {
            if(this.forcedDown == false){
                console.log("Turn screen on!");
                self.screenState = true;
                self.runScriptsInDirectory(callbackDir+"/on");
            } else {
                console.log("Screen is forced off and will not be turned on!");
            }
        }
    },

    toggleScreen: function(forced){
        const self = this;
        if (self.isScreenOn() == true){
            self.turnScreenOff(forced);
        } else {
            self.turnScreenOn(forced);
        }
    },

    runScriptsInDirectory(directory){
        console.log("Running all scripts in: "+directory);
        fs.readdir(directory, function(err, items) {         
            for (var i=0; i<items.length; i++) {
                console.log("  "+items[i]);
                exec(directory+"/"+items[i], function (error, stdout, stderr) {
                    if (error) {
                        console.log(stderr);
                    }
                });
            }
        });
    },

    socketNotificationReceived: function (notification, payload) {
        const self = this;
        if (notification === 'CONFIG' && this.started == false) {
            this.lastUserPresence = new Date().getTime();
            this.config = payload;
            this.started = true;
        } else if (notification === 'USER_PRESENCE'){
            this.lastUserPresence = new Date().getTime();
        } else if (notification === 'SCREEN_TOGGLE'){
            this.lastUserPresence = new Date().getTime();
            var forced = payload.forced == true ? payload.forced : false;
            this.toggleScreen(forced);
        } else if (notification === 'SCREEN_ON'){
            this.lastUserPresence = new Date().getTime();
            var forced = payload.forced == true ? payload.forced : false;
            this.turnScreenOn(forced);
        } else if (notification === 'SCREEN_OFF'){
            this.lastUserPresence = new Date().getTime();
            var forced = payload.forced == true ? payload.forced : false;
            this.turnScreenOff(forced);
        } else {
            console.log("Received Notification: "+notification);
        }
    },
});