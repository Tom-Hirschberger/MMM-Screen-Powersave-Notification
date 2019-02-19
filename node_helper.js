/* Magic Mirror
 * Module: Screen-Powersave-Notification
 *
 * By Tom Hirschberger
 * MIT Licensed.
 */
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const fs = require('fs');
const callbackDir = __dirname + "/callbackScripts";

module.exports = NodeHelper.create({

    start: function () {
        this.started = false;
        this.forcedDown = false;
    },

    isScreenOn: function() {
        const self = this;
        if (self.config.screenStatusCommand != ""){
            result = execSync(this.config.screenStatusCommand);
            if (result.indexOf("display_power=0") === 0){
                return false;
            } else {
                return true;
            }
        }
        return false;
    },

    turnScreenOff: function(forced) {
        const self = this;
        if (forced == true){
            console.log(this.name+": Turning screen off (forced)!");
            self.forcedDown = true;
        } else {
            console.log(this.name+": Turning screen off!");
            self.forcedDown = false;
        }
        if (self.config.screenOffCommand != ""){
            execSync(self.config.screenOffCommand);
        }
        self.runScriptsInDirectory(callbackDir+"/off");
    },

    turnScreenOn: function(forced) {
        const self = this;
        if(forced == true){
            console.log(this.name+": Turning screen on (forced)!");
            if (self.config.screenOnCommand != ""){
                execSync(self.config.screenOnCommand);
            }
            self.forcedDown = false;
            self.runScriptsInDirectory(callbackDir+"/on");
        } else {
            if(self.forcedDown == false) {
                console.log(this.name+": Turning screen on!");
                if (self.config.screenOnCommand != ""){
                    execSync(self.config.screenOnCommand);
                }
                self.runScriptsInDirectory(callbackDir+"/on");
            } else {
                console.log(this.name+": Screen is forced to be off and will not be turned on!");
            }
        }
    },

    toggleScreen: function(forced) {
        const self = this;
        if (self.isScreenOn() == true) {
            self.turnScreenOff(forced);
        } else {
            self.turnScreenOn(forced);
        }
    },

    runScriptsInDirectory(directory) {
        console.log(this.name+": Running all scripts in: "+directory);
        fs.readdir(directory, function(err, items) {         
            for (var i=0; i<items.length; i++) {
                console.log(this.name+":   "+items[i]);
                exec(directory+"/"+items[i], function (error, stdout, stderr) {
                    if (error) {
                        console.log(stderr);
                    }
                });
            }
        });
    },

    clearAndSetScreenTimeout: function(reset) {
        const self = this;
        clearTimeout(self.deactivateMonitor);
        if ((reset == true) && (self.config.delay > 0)){
            self.deactivateMonitorTimeout = setTimeout(function() {
                self.turnScreenOff(false);
                self.clearAndSetScreenTimeout(false);
            }, self.config.delay * 1000);
            console.log(this.name+": Resetted screen timeout to "+self.config.delay+" seconds!");
        } else {
            console.log(this.name+": Disabled screen timeout!");
        }
    },

    socketNotificationReceived: function (notification, payload) {
        const self = this;
        if (notification === 'CONFIG' && self.started == false) {
            self.config = payload;
            self.clearAndSetScreenTimeout(true);
            self.started = true;
        } else if (notification === 'USER_PRESENCE'){
            self.clearAndSetScreenTimeout(true);
        } else if (notification === 'SCREEN_TOGGLE'){
            var forced = payload.forced == true ? payload.forced : false;
            self.toggleScreen(forced);
        } else if (notification === 'SCREEN_ON'){
            var forced = payload.forced == true ? payload.forced : false;
            self.turnScreenOn(forced);
            self.clearAndSetScreenTimeout(true);
        } else if (notification === 'SCREEN_OFF'){
            var forced = payload.forced == true ? payload.forced : false;
            self.turnScreenOff(forced);
            self.clearAndSetScreenTimeout(false);
        } else if (notification === 'SCREEN_POWERSAVE'){
            if (payload.delay){
                self.config.delay = payload.delay;
            } else {
                self.config.delay = 0;
            }
            self.clearAndSetScreenTimeout(true);
        } else {
            console.log(this.name+": Received Notification: "+notification);
        }
    },
});