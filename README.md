# MMM-Screen-Powersave-Notification
MMM-Screen-Powersave-Notification is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror) project by [Michael Teeuw](https://github.com/MichMich).

It uses notifications to check for user presence or forced on and offs of the screen. After a configurated time without user presence the display will turn off. Additionaly scripts can be run after the screen turned of or on.

## Installation
    cd ~/MagicMirror/modules
    git clone 
    cd MMM-Screen-Powersave-Notification
    npm install


## Configuration
To display the module insert it in the config.js file. Here is an example:

    {
        module: 'MMM-Screen-Powersave-Notification',
        config: {
            delay: 60,
        }
    }


<br>

| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| delay | time before the mirror turns off the display if no user activity is detected. (in seconds) | Integer | 60 |
| screenOnCommand | the command which is used to turn the screen on | String | '/usr/bin/vcgencmd display_power 1' |
| screenOffCommand | the command which is used to turn the screen off | String | '/usr/bin/vcgencmd display_power 0' |
| screenStatusCommand | the command which is used to check if the screen is on (result needs to be 'display_power 1' if on) | String | '/usr/bin/vcgencmd display_power' |
