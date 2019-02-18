Module.register("MMM-Screen-Powersave-Notification", {

    defaults: {
        delay: 10000,
    },

    start: function () {
        Log.log(this.name + ' is started!');
        this.sendSocketNotification("CONFIG", this.config);
    },

    socketNotificationReceived: function (notification, payload) {
        
    },

    notificationReceived: function (notification, payload) {
        if (
            (notification === "USER_PRESENCE") || 
            (notification === "SCREEN_TOGGLE") || 
            (notification === "SCREEN_ON") || 
            (notification === "SCREEN_OFF")
        ){
            this.sendSocketNotification(notification,payload);     
        }
    },
});