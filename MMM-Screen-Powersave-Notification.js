/* global Module

/* Magic Mirror
 * Module: Screen-Powersave-Notification
 *
 * By Tom Hirschberger
 * MIT Licensed.
 */
Module.register('MMM-Screen-Powersave-Notification', {

  defaults: {
    delay: 60,
    profiles: {},
    screenOnCommand: '/usr/bin/vcgencmd display_power 1',
    screenOffCommand: '/usr/bin/vcgencmd display_power 0',
    screenStatusCommand: '/usr/bin/vcgencmd display_power',
    turnScreenOnIfProfileDelayIsSet: true,
    countDownText: 'Display powersave: ',
    disabledText: 'disabled',
    countDownUpdateInterval: 5000,
    displayHours: false,
    animationSpeed : 0,
    hideInsteadShutoff: false,
    hideAnimationSpeed: 500,
  },

  getStyles: function() {
    return ['screen-powersave.css']
  },

  getScripts: function() {
    return ['moment.js']
  },

  getTimeString: function(seconds) {
    var remainingSeconds = seconds
    if(this.config.displayHours){
      remainingSeconds = seconds % 3600
      hours = Math.round((seconds - remainingSeconds)/ 3600)
    }

    remainingSeconds2 = remainingSeconds % 60
    var minutes = Math.round((remainingSeconds - remainingSeconds2) / 60)
    

    if(this.config.displayHours){
      return (""+hours).padStart(2,'0')+":"+(""+minutes).padStart(2,'0')+":"+(""+remainingSeconds2).padStart(2,'0')
    } else {
      return (""+minutes).padStart(2,'0')+":"+(""+remainingSeconds2).padStart(2,'0')
    }
  },

  getDom: function() {
    clearTimeout(this.currentDelayTimer)

    const wrapper = document.createElement('div')
    const textWrapper = document.createElement('span')
      textWrapper.className = 'textWrapper'

    textWrapper.innerHTML=this.config.countDownText
    wrapper.appendChild(textWrapper)


    const valueWrapper = document.createElement('span')
      valueWrapper.className = 'valueWrapper'

      if(this.delayDisabled){
        valueWrapper.innerHTML = this.config.disabledText
      } else {
        //valueWrapper.innerHTML = moment("1900-01-01 00:00:00").add(this.currentDelay, 'seconds').format(this.config.countDownFormatString)
        valueWrapper.innerHTML = this.getTimeString(this.currentDelay)
      }

    wrapper.appendChild(valueWrapper)

    const self = this
    self.currentDelayTimer = setTimeout(function() {
			console.log("UPDATING currentDelay");
      self.currentDelay = self.currentDelay - (self.config.countDownUpdateInterval/1000);
      self.updateDom(self.config.animationSpeed)
		}, self.config.countDownUpdateInterval);

    return wrapper;
  },

  start: function () {
    Log.info("Starting module: " + this.name);
    this.sendSocketNotification('CONFIG', this.config)
    this.currentDelay = this.config.delay
    this.delayDisabled = false
    this.hiddenModules = null
  },

  hideModules: function(){
    const self = this
    self.hiddenModules = []
    var allModules = MM.getModules()
    self.sendNotification("DISABLE_PROFILE_TIMERS")
    allModules.enumerate(function(curModule){
      var callback = function(){}
      var options = {lockString: self.identifier}
      self.hiddenModules.push(curModule)
      curModule.hide(self.config.hideAnimationSpeed,callback,options)
    })
  },

  showModules: function(){
    const self = this
    self.sendNotification("ENABLE_PROFILE_TIMERS")
    if(self.hiddenModules){
      for(var curModule in self.hiddenModules){
        var callback = function(){}
        var options = {lockString:self.identifier}
        self.hiddenModules[curModule].show(self.config.hideAnimationSpeed, callback, options)
      }
      self.hiddenModules = null
    }
  },

  socketNotificationReceived: function (notification, payload) {
    const self = this
    if( notification === 'SCREEN_TIMEOUT_CHANGED'){
      this.currentDelay = payload.delay
      if(payload.delay === 0){
        this.delayDisabled = true
      } else {
        this.delayDisabled = false
      }
      this.updateDom()
    } else if (notification === 'SCREEN_HIDE_MODULES'){
      self.hideModules()
    } else if (notification === 'SCREEN_SHOW_MODULES'){
      self.showModules()
    } else if (
        (notification === 'SCREENSAVE_ENABLED') ||
        (notification === 'SCREENSAVE_DISABLED')
    ){
      this.sendNotification(notification,payload)
    }
  },

  notificationReceived: function (notification, payload) {
    if (
       (notification === 'USER_PRESENCE') ||
       (notification === 'CHANGED_PROFILE') ||
       (notification === 'SCREEN_TOGGLE') ||
       (notification === 'SCREEN_ON') ||
       (notification === 'SCREEN_OFF') ||
       (notification === 'SCREEN_POWERSAVE')
    ) {
      this.sendSocketNotification(notification, payload)
    }
  }
})
