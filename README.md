# Countdown Timer 1.0

A Javascript application for a countdown timer

## Features
What is addressed in this version?
1. Countdown Timer:
- Takes the input from the user for the count down time (hh:mm:ss)
- Supports Start/Stop , Pause/Resume, Laps/Clear laps in the clock timer
2. Laps/Threshold:
- Threshold settings should be shown and allowed  to be configured by user , by default it is 00:00:00
- Add Lap when Lap Button or spacebar is pressed
- if current lap exceeds the threshold limit, the specific entry would be shown in ‘red’
- Once the Stop timer is pressed, Lap would not be added
- Option to clear the Laps is provided
- Each lap also has a delete icon for removing individual lap
- All Laps could be seen while adding Laps
3. Stop Button:
- Stop Button would not allow Pause/Resume or Laps anymore
- User needs to refresh the page or click on Refresh button 
4. Supported in Chrome Browser

Features planned in future?
- If backspace key is pressed and a lap is ongoing, a confirmation would be asked to the user if the ongoing lap should be clubbed with the previous lap.
- Stop Button once pressed all laps details will be shown as grid.  Till that time only current lap details will be shown.
- Allow to show negative count in the timer
- Resuming from current state
- Multibrowser support
- Support for Redex (state maintenance)

## Display
- This repository contains the countdown timer using an Nginx container inside Docker. The code for the site is contained in index.html, and the Nginx config is in default.conf. 
- The Dockerfile contains commands to build a Docker Image.
- To build a Docker image from the Dockerfile, run the following command from inside this directory
$ docker build -t <docker-hub-username>/countdowntimer:1.0 .
$ docker run -itd --name countdowncontainer --publish 8080:80 <docker-hub-username>/countdowntimer:1.0
- Open http://localhost:8080 on Chrome browser to take a look at the countdowntimer


