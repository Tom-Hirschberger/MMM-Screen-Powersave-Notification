# MMM-Screen-Powersave-Notification

MMM-Screen-Powersave-Notification is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror) project by [Michael Teeuw](https://github.com/MichMich) and is based on https://github.com/mboskamp/MMM-PIR and https://github.com/mboskamp/MMM-PIR.

It uses notifications to check for user presence or forced on and offs of the screen. After a configurated time without user presence the display will turn off. Additionaly scripts can be run after the screen turned of or on.
If you like you can specify different delays for different profiles. The "normal" delay is used if no specific delay for a profile is configured.

As of version 0.0.4 it is also possible to only hide/show the modules for users that use a display that does not support turn off/on commands.

**You need a second module like in example [MMM-GPIO-Notifications](https://github.com/Tom-Hirschberger/MMM-GPIO-Notifications) whichs sends the notifications. I wrote a [english](https://www.github.com/Tom-Hirschberger/MMM-GPIO-Notifications/tree/master/examples%2FHC-SR501%2FHC-SR501-GPIO4-README-EN.md) and [german](https://www.github.com/Tom-Hirschberger/MMM-GPIO-Notifications/tree/master/examples%2FHC-SR501%2FHC-SR501-GPIO4-README-DE.md) tutorial on howto use an HC-SR501 PIR sensor with these modules.**

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

| Option                          | Description                                                                                                                                                                      | Type    | Default                             |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------- |
| delay                           | time before the mirror turns off the display if no user activity is detected. (in seconds)                                                                                       | Integer | 60                                  |
| profiles                        | it is possible to configure different delays for different profiles (i.e. if you use profiles as pages)                                                                          | Map     | empty                               |
| screenOnCommand                 | the command which is used to turn the screen on                                                                                                                                  | String  | '/usr/bin/vcgencmd display_power 1' |
| screenOffCommand                | the command which is used to turn the screen off                                                                                                                                 | String  | '/usr/bin/vcgencmd display_power 0' |
| screenStatusCommand             | the command which is used to check if the screen is on (result needs to be 'display_power 1' if on)                                                                              | String  | '/usr/bin/vcgencmd display_power'   |
| turnScreenOnIfProfileDelayIsSet | if you do not want the screen to be turned on if the profile changes and a profile specific delay is set set this value to false                                                 | boolean | true                                |
| countDownText                   | If you specify a position for the module in the config an countdown will be displayed; the countdown starts with an text that you can change with this value                     | String  | 'Display powersave: '               |
| disabledText                    | If the display powersave is disabled an message instead of the counter will be display                                                                                           | String  | 'disabled'                          |
| displayHours                    | If you use such long powersave intervals that you need hours you can set this value to true                                                                                      | boolean | false                               |
| countDownUpdateInterval         | How often should the counter be updated                                                                                                                                          | Integer | 5000                                |
| animationSpeed                  | If you like the update of the counter to be animated you can specify an interval with this value                                                                                 | Integer | 0                                   |
| hideInsteadShutoff              | If you use an display that can not be turned off and on with the pi you can hide the modules only instead. Turning this option to true will do so                                | boolean | false                               |
| hideAnimationSpeed              | The hiding and reappearing off the modules will be animated with this speed                                                                                                      | Integer | 500                                 |
| changeToProfile                 | If the hiding is enabled and this string is set an change to the new profile is triggered. If the screensave mode is disabled a change to the previous profile will be initiated | String  | null                                |
| changeToProfileBeforeAction     | Set a profile string to this variable if you like the module to change the screen to a specific profile (i.e. start page) before the "normal" action is triggerd                 | String  | null                               |

## Alternative commands

In default the module uses `vcgencmd` to control the screen. There might be situations where `vcgencmd` fails (for example with newer Raspberry Bullseye or Bookworm versions) and you need to find an alterative way to control the screen.

You can provide your own scripts and set the paths to them with the configuration options `screenStatusCommand`, `screenOnCommand` and `screenOffCommand`.

Make sure to let the scripts return/print "display_power=0" if the screen is turned off and "display_power=1" if the screen is turned on!

The module already provides alternative scripts in the controlScripts directory which will be described in the following sections...

### xrandr_control

This solution will work even with Raspberry OS Bullseye which uses the new "vc4-kms-v3d" graphics driver.

If you use Raspberry OS Bookworm you can either change your default graphics stack back to X11 instead of Wayland or you can use the `wlr-randr_control` wrapper in the next section (preferred way).

If you want to change back to X11 you can do it with the following steps:

```bash
sudo raspi-config
```

Select Option "6 - advanced options" then "A6-Wayland" and switch back to X11 (thanks to [https://forums.raspberrypi.com/viewtopic.php?t=360281#p2161288](https://forums.raspberrypi.com/viewtopic.php?t=360281#p2161288))

The first option of the script is the action you want the second option is optional and the port you want to use.
My Raspberry 4 provides two HDMI ports which are called "HDMI-1" and "HDMI-2".

You can check which port is used with the command:

```bash
xrandr -display :0.0 --current
```

The output will look something like:

```bash
Screen 0: minimum 320 x 200, current 800 x 1280, maximum 7680 x 7680
HDMI-1 connected primary 800x1280+0+0 right (normal left inverted right x axis y axis) 519mm x 324mm
   1280x800      59.91*+  60.00  
   1920x1080     60.00    59.94  
   1920x1080i    60.00    59.94  
   1280x1024     60.02  
   1280x960      60.00  
   1152x864      75.00  
   1280x720      60.00    59.94  
   1024x768      75.03    70.07    60.00  
   800x600       72.19    75.00    60.32    56.25  
   720x576i      50.00  
   720x480       60.00    59.94  
   720x480i      60.00    59.94  
   640x480       75.00    72.81    60.00    59.94  
HDMI-2 disconnected (normal left inverted right x axis y axis)
```

The output above shows that HDMI-1 is connected and HDMI-2 is disconnected. Depending of your output you need to change the second option in the command configurtions which are following.

In the following example the output is simply shut off or on and no rotation is provided:

```json5
    {
        module: 'MMM-Screen-Powersave-Notification',
        config: {
            delay: 60,
            screenStatusCommand: "./modules/MMM-Screen-Powersave-Notification/controlScripts/xrandr_control status HDMI-1",
            screenOnCommand: "./modules/MMM-Screen-Powersave-Notification/controlScripts/xrandr_control on HDMI-1",
            screenOffCommand: "./modules/MMM-Screen-Powersave-Notification/controlScripts/xrandr_control off HDMI-1"
        }
    }
```

In the following example the output is shut off and on but it is rotatet left:

```json5
    {
        module: 'MMM-Screen-Powersave-Notification',
        config: {
            delay: 60,
            screenStatusCommand: "./modules/MMM-Screen-Powersave-Notification/controlScripts/xrandr_control status HDMI-1",
            screenOnCommand: "./modules/MMM-Screen-Powersave-Notification/controlScripts/xrandr_control left HDMI-1",
            screenOffCommand: "./modules/MMM-Screen-Powersave-Notification/controlScripts/xrandr_control off HDMI-1"
        }
    }
```

Other possible rotations are "normal", "inverted", "right".

### wlr-randr_control

This solution will work even with Raspberry OS Bookworm.

The first option of the script is the action you want the second option is optional and the port you want to use. The third option is optional, too and can be used to set the `WAYLAND_DISPLAY` ("wayland-1" usually).

My Raspberry 4 provides two HDMI ports which are called "HDMI-A-1" and "HDMI-A-2".

You can check which port is used with the command:

```bash
WAYLAND_DISPLAY=wayland-1 wlr-randr
```

The output will look something like:

```bash
HDMI-A-1 "HCD PJ402D-2 LTM12 (HDMI-A-1)"
  Enabled: yes
  Modes:
    640x480 px, 59.939999 Hz
    640x480 px, 60.000000 Hz
    640x480 px, 72.808998 Hz
    640x480 px, 75.000000 Hz
    720x480 px, 59.939999 Hz
    720x480 px, 59.939999 Hz
    720x480 px, 59.939999 Hz
    720x480 px, 60.000000 Hz
    720x480 px, 60.000000 Hz
    720x576 px, 50.000000 Hz
    800x600 px, 56.250000 Hz
    800x600 px, 60.317001 Hz
    800x600 px, 72.188004 Hz
    800x600 px, 75.000000 Hz
    1024x768 px, 60.004002 Hz
    1024x768 px, 70.069000 Hz
    1024x768 px, 75.028999 Hz
    1280x720 px, 59.939999 Hz
    1280x720 px, 60.000000 Hz
    1152x864 px, 75.000000 Hz
    1280x800 px, 59.995998 Hz
    1280x960 px, 60.000000 Hz
    1280x1024 px, 60.020000 Hz
    1920x1080 px, 59.939999 Hz
    1920x1080 px, 60.000000 Hz
    1920x1080 px, 60.000000 Hz
    1280x800 px, 59.910000 Hz (preferred, current)
  Position: 0,0
  Transform: normal
  Scale: 1.000000
```

The first line in the output above shows that HDMI-A-1 is connected. Depending of your output you need to change the second option in the command configurtions which are following.

In the following example the output is simply shut off or on and no rotation is provided:

```json5
    {
        module: 'MMM-Screen-Powersave-Notification',
        config: {
            delay: 60,
            screenStatusCommand: "./modules/MMM-Screen-Powersave-Notification/controlScripts/wlr-randr_control status HDMI-A-1",
            screenOnCommand: "./modules/MMM-Screen-Powersave-Notification/controlScripts/wlr-randr_control on HDMI-A-1",
            screenOffCommand: "./modules/MMM-Screen-Powersave-Notification/controlScripts/wlr-randr_control off HDMI-A-1"
        }
    }
```

In the following example the output is shut off and on but it is turned up-side down:

```json5
    {
        module: 'MMM-Screen-Powersave-Notification',
        config: {
            delay: 60,
            screenStatusCommand: "./modules/MMM-Screen-Powersave-Notification/controlScripts/wlr-randr_control status HDMI-A-1",
            screenOnCommand: "./modules/MMM-Screen-Powersave-Notification/controlScripts/wlr-randr_control 180 HDMI-A-1",
            screenOffCommand: "./modules/MMM-Screen-Powersave-Notification/controlScripts/wlr-randr_control off HDMI-A-1"
        }
    }
```

The supported transformation options are: normal, 90, 180, 270, flipped, flipped-90, flipped-180, flipped-270

### tvservice_control

The `tvservice` command was an alternative to `vcgencmd` but it will **NOT** work with current installations of Raspberry OS Bullseye!

Rotation is **NOT** supported only simple on or off!

Use the following configuration if you want to use `tvservice` command.

```json5
    {
        module: 'MMM-Screen-Powersave-Notification',
        config: {
            delay: 60,
            screenStatusCommand: "./modules/MMM-Screen-Powersave-Notification/controlScripts/tvservice_control status",
            screenOnCommand: "./modules/MMM-Screen-Powersave-Notification/controlScripts/tvservice_control on",
            screenOffCommand: "./modules/MMM-Screen-Powersave-Notification/controlScripts/tvservice_control off"
        }
    }
```

## Received Notifications

| Notification     | Payload                                                              | Default | Result                                                                                                        |
| ---------------- | -------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| USER_PRESENCE    | true (mandatory)                                                     |         | the timeout to turn of the screen will be reseted                                                             |
| SCREEN_OFF       | forced=true or false                                                 | false   | turns the screen off; if the forced option is set to true also if the screen was turned on forced             |
| SCREEN_ON        | forced=true or false                                                 | false   | turns the screen on; if the forced option is set to true also if the screen was turned off forced             |
| SCREEN_TOGGLE    | forced=true or false                                                 | false   | switches the state of the screen; the forced option will be used for on off like in SCREEN_ON or SCREEN_OFF   |
| SCREEN_POWERSAVE | delay=NUMBER                                                         | delay=0 | can be used to set the delay for the timeout to an different value (or deactivate it if 0) during runtime     |
| CHANGED_PROFILE  | from and to values which are the name of the old and the new profile |         | resets the screen timeout to either the default delay or to a specific delay configured with the profiles map |

## Send Notifications

| Notification        | Payload | Cause                                                                                              |
| ------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| SCREENSAVE_ENABLED  | nothing | This notification is send if the module sets the display to screensave mode (or hides the modules) |
| SCREENSAVE_DISABLED | nothing | This notification is send if the module sets the display to screensave mode (or shows the modules) |


## Known Problems and their solutions

### Screen won't stay off and gets on after a couple of seconds again

If the screen does not stay off but gets on again after a couple of seconds you might have a problem with hdmi hotplug.
User @Aergernis discoverd this problem and found a solution by forcing hdmi hotplug in file `/boot/firmware/cmdline.txt`.
Set the value of `vc4.force_hotplug` to the following values:
* `1`: Activate hotplug for first screen
* `2`: Activate hotplug for the second screen
* `3`: Activate hotplug for both screens
