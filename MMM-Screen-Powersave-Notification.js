/* global Module

/* MagicMirror²
 * Module: Screen-Powersave-Notification
 *
 * By Tom Hirschberger
 * MIT Licensed.
 */
Module.register("MMM-Screen-Powersave-Notification", {
  defaults: {
    delay: 60,
    profiles: {},
    screenOnCommand: "/usr/bin/vcgencmd",
    screenOffCommand: "/usr/bin/vcgencmd",
    screenStatusCommand: "/usr/bin/vcgencmd",
    screenOnArgs: ["display_power", "1"],
    screenOffArgs: ["display_power", "0"],
    screenStatusArgs: ["display_power"],
    turnScreenOnIfProfileDelayIsSet: true,
    countDownText: "Display powersave: ",
    disabledText: "disabled",
    countDownUpdateInterval: 5000,
    displayHours: false,
    animationSpeed: 0,
    hideInsteadShutoff: false,
    changeToProfile: null,
    hideAnimationSpeed: 500,
    changeToProfileBeforeAction: null
  },

  getStyles: function () {
    return ["screen-powersave.css"];
  },

  getScripts: function () {
    return ["moment.js"];
  },

  getTimeString: function (seconds) {
    var remainingSeconds = seconds;
    if (this.config.displayHours) {
      remainingSeconds = seconds % 3600;
      hours = Math.round((seconds - remainingSeconds) / 3600);
    }

    remainingSeconds2 = remainingSeconds % 60;
    var minutes = Math.round((remainingSeconds - remainingSeconds2) / 60);

    if (this.config.displayHours) {
      return (
        ("" + hours).padStart(2, "0") +
        ":" +
        ("" + minutes).padStart(2, "0") +
        ":" +
        ("" + remainingSeconds2).padStart(2, "0")
      );
    } else {
      return (
        ("" + minutes).padStart(2, "0") +
        ":" +
        ("" + remainingSeconds2).padStart(2, "0")
      );
    }
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    if (typeof this.data.position !== "undefined"){
      clearTimeout(this.currentDelayTimer);

      if (!this.delayDisabled || this.config.disabledText !== null) {
        const textWrapper = document.createElement("span");
        textWrapper.className = "textWrapper";

        textWrapper.innerHTML = this.config.countDownText;
        wrapper.appendChild(textWrapper);

        const valueWrapper = document.createElement("span");
        valueWrapper.className = "valueWrapper";

        if (this.delayDisabled) {
          valueWrapper.innerHTML = this.config.disabledText;
        } else {
          //valueWrapper.innerHTML = moment("1900-01-01 00:00:00").add(this.currentDelay, 'seconds').format(this.config.countDownFormatString)
          valueWrapper.innerHTML = this.getTimeString(this.currentDelay);
        }

        wrapper.appendChild(valueWrapper);

        const self = this;
        self.currentDelayTimer = setTimeout(function () {
          self.currentDelay =
            self.currentDelay - self.config.countDownUpdateInterval / 1000;
          self.updateDom(self.config.animationSpeed);
        }, self.config.countDownUpdateInterval);
      }
    }

    return wrapper;
  },

  start: function () {
    Log.info("Starting module: " + this.name);

    if ( this.config.screenOnCommand.indexOf(" ") != -1 ) {
      this.config.screenOnCommand = this.config.screenOnCommand.split(" ")
      if (this.config.screenOnCommand.length > 1) {
        this.config.screenOnArgs = this.config.screenOnCommand.slice(1)
      } else {
        this.config.screenOnArgs = []
      }
      
      this.config.screenOnCommand = this.config.screenOnCommand[0]
    }

    if ( this.config.screenOffCommand.indexOf(" ") != -1 ) {
      this.config.screenOffCommand = this.config.screenOffCommand.split(" ")
      if (this.config.screenOffCommand.length > 1) {
        this.config.screenOffArgs = this.config.screenOffCommand.slice(1)
      } else {
        this.config.screenOffArgs = []
      }
      
      this.config.screenOffCommand = this.config.screenOffCommand[0]
    }

    if ( this.config.screenStatusCommand.indexOf(" ") != -1 ) {
      this.config.screenStatusCommand = this.config.screenStatusCommand.split(" ")
      if (this.config.screenStatusCommand.length > 1) {
        this.config.screenStatusArgs = this.config.screenStatusCommand.slice(1)
      } else {
        this.config.screenStatusArgs = []
      }
      
      this.config.screenStatusCommand = this.config.screenStatusCommand[0]
    }

    this.sendSocketNotification("CONFIG", this.config);
    this.currentDelay = this.config.delay;
    this.delayDisabled = false;
    this.hiddenModules = null;
    this.profileHistory = [];
  },

  hideModules: function () {
    const self = this;
    self.hiddenModules = [];
    var allModules = MM.getModules();
    allModules.enumerate(function (curModule) {
      if (!curModule.hidden) {
        var callback = function () {};
        var options = { lockString: self.identifier };
        self.hiddenModules.push(curModule);
        curModule.hide(self.config.hideAnimationSpeed, callback, options);
      }
    });
  },

  showModules: function () {
    const self = this;
    if (self.hiddenModules) {
      for (var curModule in self.hiddenModules) {
        var callback = function () {};
        var options = { lockString: self.identifier };
        self.hiddenModules[curModule].show(
          self.config.hideAnimationSpeed,
          callback,
          options
        );
      }
      self.hiddenModules = null;
    }
  },

  socketNotificationReceived: function (notification, payload) {
    const self = this;
    if (notification === "SCREEN_TIMEOUT_CHANGED") {
      this.currentDelay = payload.delay;
      if (payload.delay === 0) {
        this.delayDisabled = true;
      } else {
        this.delayDisabled = false;
      }
      this.updateDom();
    } else if (notification === "SCREEN_HIDE_MODULES") {
      self.sendNotification("DISABLE_PROFILE_TIMERS");
      if (self.config.changeToProfile !== null) {
        if (self.profileHistory[1] === self.config.changeToProfile) {
          self.profileHistory[0] = self.profileHistory[1];
        }
        self.sendNotification("CURRENT_PROFILE", self.config.changeToProfile);
      } else {
        self.hideModules();
      }
    } else if (notification === "SCREEN_SHOW_MODULES") {
      self.sendNotification("ENABLE_PROFILE_TIMERS");
      if (self.config.changeToProfile !== null) {
        self.sendNotification("CURRENT_PROFILE", self.profileHistory[0]);
      } else {
        self.showModules();
      }
    } else if (
      notification === "SCREENSAVE_ENABLED" ||
      notification === "SCREENSAVE_DISABLED" ||
      notification === "CURRENT_PROFILE"
    ) {
      this.sendNotification(notification, payload);
    }
  },

  notificationReceived: function (notification, payload) {
    const self = this;
    if (
      notification === "USER_PRESENCE" ||
      notification === "SCREEN_TOGGLE" ||
      notification === "SCREEN_ON" ||
      notification === "SCREEN_OFF" ||
      notification === "SCREEN_POWERSAVE"
    ) {
      if (
        typeof payload !== "undefined" &&
        typeof payload.forced !== "undefined"
      ) {
        if (
          payload.forced === true ||
          payload.forced.toString().toLowerCase() === "true"
        ) {
          payload.forced = true;
        } else {
          payload.forced = false;
        }
      }
      this.sendSocketNotification(notification, payload);
    } else if (notification === "CHANGED_PROFILE") {
      if (self.profileHistory.length > 1) {
        self.profileHistory[0] = self.profileHistory[1];
        self.profileHistory[1] = payload.to;
      } else {
        self.profileHistory[0] = payload.to;
        self.profileHistory[1] = payload.to;
      }
      this.sendSocketNotification(notification, payload);
    }
  }
});
