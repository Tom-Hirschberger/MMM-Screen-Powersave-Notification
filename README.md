# MMM-Screen-Powersave-Notification
MMM-Screen-Powersave-Notification is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror) project by [Michael Teeuw](https://github.com/MichMich) and is based on https://github.com/mboskamp/MMM-PIR and https://github.com/mboskamp/MMM-PIR.

It uses notifications to check for user presence or forced on and offs of the screen. After a configurated time without user presence the display will turn off. Additionaly scripts can be run after the screen turned of or on.

## Installation
```sh
    cd ~/MagicMirror/modules
    git clone 
    cd MMM-Screen-Powersave-Notification
    npm install
```

## Configuration
To display the module insert it in the config.js file. Here is an example:
```js
    {
        module: 'MMM-Screen-Powersave-Notification',
        config: {
            delay: 60,
        }
    }
```

<br>

| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| delay | time before the mirror turns off the display if no user activity is detected. (in seconds) | Integer | 60 |
| screenOnCommand | the command which is used to turn the screen on | String | '/usr/bin/vcgencmd display_power 1' |
| screenOffCommand | the command which is used to turn the screen off | String | '/usr/bin/vcgencmd display_power 0' |
| screenStatusCommand | the command which is used to check if the screen is on (result needs to be 'display_power 1' if on) | String | '/usr/bin/vcgencmd display_power' |

## Notifications
| Notification | Payload | Default | Result
| ------------ | ------- | ------ | 
| USER_PRESENCE | true (mandatory) |  | the timeout to turn of the screen will be reseted
| SCREEN_OFF | forced=true or false | false | turns the screen off; if the forced option is set to true also if the screen was turned on forced
| SCREEN_ON | forced=true or false | false | turns the screen on; if the forced option is set to true also if the screen was turned off forced
| SCREEN_TOGGLE | forced=true or false | false | switches the state of the screen; the forced option will be used for on off like in SCREEN_ON or SCREEN_OFF
| SCREEN_POWERSAVE | delay=NUMBER | delay=0 | can be used to set the delay for the timeout to an different value (or deactivate it if 0) during runtime
