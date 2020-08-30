# MMM-Screen-Powersave-Notification
MMM-Screen-Powersave-Notification is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror) project by [Michael Teeuw](https://github.com/MichMich) and is based on https://github.com/mboskamp/MMM-PIR and https://github.com/mboskamp/MMM-PIR.

It uses notifications to check for user presence or forced on and offs of the screen. After a configurated time without user presence the display will turn off. Additionaly scripts can be run after the screen turned of or on.
If you like you can specify different delays for different profiles. The "normal" delay is used if no specific delay for a profile is configured.

As of version  0.0.4 it is also possible to only hide/show the modules for users that use a display that does not support turn off/on commands.

## Installation
```sh
    cd ~/MagicMirror/modules
    git clone https://github.com/Tom-Hirschberger/MMM-Screen-Powersave-Notification.git
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
            profiles: {
                "pageOneEverone pageTwoEveryone": 600
            }
        }
    }
```

<br>

| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| delay | time before the mirror turns off the display if no user activity is detected. (in seconds) | Integer | 60 |
| profiles | it is possible to configure different delays for different profiles (i.e. if you use profiles as pages) | Map | empty |
| screenOnCommand | the command which is used to turn the screen on | String | '/usr/bin/vcgencmd display_power 1' |
| screenOffCommand | the command which is used to turn the screen off | String | '/usr/bin/vcgencmd display_power 0' |
| screenStatusCommand | the command which is used to check if the screen is on (result needs to be 'display_power 1' if on) | String | '/usr/bin/vcgencmd display_power' |
| turnScreenOnIfProfileDelayIsSet | if you do not want the screen to be turned on if the profile changes and a profile specific delay is set set this value to false | boolean | true |
| countDownText | If you specify a position for the module in the config an countdown will be displayed; the countdown starts with an text that you can change with this value | String | 'Display powersave: ' |
| disabledText | If the display powersave is disabled an message instead of the counter will be display | String | 'disabled' |
| displayHours | If you use such long powersave intervals that you need hours you can set this value to true | boolean | false |
| countDownUpdateInterval | How often should the counter be updated | Integer | 5000 |
| animationSpeed | If you like the update of the counter to be animated you can specify an interval with this value | Integer | 0 |
| hideInsteadShutoff | If you use an display that can not be turned off and on with the pi you can hide the modules only instead. Turning this option to true will do so | boolean | false |
| hideAnimationSpeed | The hiding and reappearing off the modules will be animated with this speed | Integer | 500 |
| changeToProfile | If the hiding is enabled and this string is set an change to the new profile is triggered. If the screensave mode is disabled a change to the previous profile will be initiated | String | null |

## Received Notifications
| Notification | Payload | Default | Result |
| ------------ | ------- | ------- | ------ |
| USER_PRESENCE | true (mandatory) |  | the timeout to turn of the screen will be reseted |
| SCREEN_OFF | forced=true or false | false | turns the screen off; if the forced option is set to true also if the screen was turned on forced |
| SCREEN_ON | forced=true or false | false | turns the screen on; if the forced option is set to true also if the screen was turned off forced |
| SCREEN_TOGGLE | forced=true or false | false | switches the state of the screen; the forced option will be used for on off like in SCREEN_ON or SCREEN_OFF |
| SCREEN_POWERSAVE | delay=NUMBER | delay=0 | can be used to set the delay for the timeout to an different value (or deactivate it if 0) during runtime |
| CHANGED_PROFILE | from and to values which are the name of the old and the new profile| | resets the screen timeout to either the default delay or to a specific delay configured with the profiles map |

## Send Notifications
| Notification | Payload | Cause |
| ------------ | ------- | ------ |
| SCREENSAVE_ENABLED | nothing | This notification is send if the module sets the display to screensave mode (or hides the modules) |
| SCREENSAVE_DISABLED | nothing | This notification is send if the module sets the display to screensave mode (or shows the modules) |
