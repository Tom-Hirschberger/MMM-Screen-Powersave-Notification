/* global Module

/* Magic Mirror
 * Module: Screen-Powersave-Notification
 *
 * By Tom Hirschberger
 * MIT Licensed.
 */
Module.register("MMM-Screen-Powersave-Notification", {

    defaults: {
        delay: 60,
        screenOnCommand: "/usr/bin/vcgencmd display_power 1",
        screenOffCommand: "/usr/bin/vcgencmd display_power 0",
        screenStatusCommand: "/usr/bin/vcgencmd display_power",
    },

    start: function () {
        Log.info(this.name + ' is started');
        this.sendSocketNotification("CONFIG", this.config);
    },

    notificationReceived: function (notification, payload) {
        if (
            (notification === "USER_PRESENCE") || 
            (notification === "SCREEN_TOGGLE") || 
            (notification === "SCREEN_ON") || 
            (notification === "SCREEN_OFF") || 
            (notification === "SCREEN_POWERSAVE")
        ){
            this.sendSocketNotification(notification,payload);     
        }
    },
});