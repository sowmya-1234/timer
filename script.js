document.addEventListener('DOMContentLoaded', event => {
  const countdownDiv = document.querySelector('div#countdowntimerDiv')
  const lapsUl = document.querySelector('ul#countdowntimerLapsUl')
  const controlsUl = document.querySelector('ul#countdowntimerControlsUl')
  const countdowntimer = new CountdownTimerApi(countdownDiv, { controlsUl, lapsUl, keyboardControls: true })
  countdowntimer.event('start', (startedTime, startedUTCDate) => {
    console.log('start', `startedTime=${startedTime}<=>${TimeConverter.getTimeString(startedTime)}`,
      `startedUTCDate=${startedUTCDate}`)
  })
  countdowntimer.event('stop', (stoppedTime, stoppedUTCDate) => {
    console.log('stop', `stoppedTime=${stoppedTime}<=>${TimeConverter.getTimeString(stoppedTime)}`,
      `stoppedUTCDate=${stoppedUTCDate}`)
  })
  countdowntimer.event('restart', () => { console.log('restart') })
  countdowntimer.event('add_lap', (index, lapTime) => {
    console.log('add_lap', `index=${index}`, `lapTime=${lapTime}<=>${TimeConverter.getTimeString(lapTime)}`)
  })
  countdowntimer.event('remove_lap', (index, lapTime) => {
    console.log('remove_lap', `index=${index}`, `lapTime=${lapTime}<=>${TimeConverter.getTimeString(lapTime)}`)
  })
  countdowntimer.event('clear_laps', () => { console.log('clear_laps') })

})
