/**
 * CountdownTimerApi api implementation
 */
class CountdownTimerApi {
  /**
   * Creates an instance of CountdownTimerHandler.
   * @param {HTMLDivElement} countimerDiv 'div' HTML element that should contain the timer
   * @param {{controlsUl: HTMLUListElement, lapsUl: HTMLUListElement, keyboardControls: boolean}} [options]
   */
  constructor (countimerDiv, options) {
    // Initialize CountTimer
    this.counttimer = new CountTimer()
    // Create html structure for timer
    this.htmlDigitHandler = new HtmlDigitHandler(countimerDiv, this.counttimer)
    // Options
    if (options !== undefined) {
      if (options.controlsUl !== undefined) {
        // Create html structure for timer control / buttons
        this.htmlControlsHandler = new HtmlControlsHandler(options.controlsUl, this.counttimer, {
          keyBoardListener: options.keyboardControls !== undefined && options.keyboardControls })
      }
      if (options.lapsUl !== undefined) {
        // Create html structure for laps
        this.htmlLapHandler = new HtmlLapHandler(options.lapsUl, this.counttimer)
      }
    }

    this.paintNow = false
    this.counttimer.event('restart', () => {
      this.htmlDigitHandler.setTime()
    })
    this.counttimer.event('start', () => {
      this.paintNow = true
      this.paint()
    })
    this.counttimer.event('stop', () => {
      this.paintNow = false
      this.htmlDigitHandler.setTime()
    })
  }
  get state () {
    return {
      laps: this.counttimer.laps.map(time => ({
        getFormattedTime: TimeConverter.getTimeString(time),
        time
      })),
      time: {
        getFormattedTime: TimeConverter.getTimeString(this.counttimer.currentTime),
        time: this.counttimer.currentTime
      }
    }
  }
  paint () {
    if (this.paintNow) {
      this.htmlDigitHandler.setTime()
      window.requestAnimationFrame(this.paint.bind(this))
    }
  }
  /**
   * Event listener
   * @param {String} eventName
   * @param {function(...*): *} callback
   */
  event (eventName, callback) {
    this.counttimer.eventPublic(eventName, callback)
  }
}

class HtmlLapHandler {
  /**
   * Creates an instance of HtmlLapHandler.
   * @param {HTMLUListElement} lapsDivElement
   * @param {CountTimer} counttimer
   */
  constructor (lapsDivElement, counttimer) {
    this.lapsDivElement = lapsDivElement
	this.lapCounter = 0
    this.lastLapTime = 0
    this.counttimer = counttimer
    // Setup HTML document
    this.createLaps()
    // Setup counttimer connection
    this.counttimer.event('add_lap', this.addLap.bind(this))
    this.counttimer.event('remove_lap', this.removeLap.bind(this))
    this.counttimer.event('clear_laps', this.clearLaps.bind(this))
  }
  /**
   * Create laps in HTML document in specified HTMLUListElement
   */
  createLaps () {
    this.lapsDivElement.id = 'counttimer_laps_area'
    this.clearLaps()
  }
  /**
   * Add lap
   * @param {Number} index
   * @param {Number} time
   */
  addLap (index, time) {
    if (this.lastLapTime === time) {
      return
    }
	var lastTime = this.lastLapTime;
	var diff = this.lastLapTime - time;
	console.log("diff is..."+diff);
	var tempHours = parseInt(document.getElementById("thresholdHrs").value)
	var tempMin = parseInt(document.getElementById("thresholdMin").value)
	var tempSec = parseInt(document.getElementById("thresholdSec").value)
	var thresholdTime = (tempHours*60*60+tempMin*60+tempSec)*1000;
	console.log("thresholdTime....",thresholdTime);
    this.lastLapTime = time
    this.lapCounter += 1
    const element = document.createElement('li')

    const removeElementOpposite = document.createElement('div')
    removeElementOpposite.className = 'counttimer-remove-lap-cross-opposite'
    removeElementOpposite.style.display = 'none'

    const lapElement = document.createElement('div')
    lapElement.style.display = 'inline-block'
    lapElement.innerText = '' + this.lapCounter
    const removeElement = document.createElement('div')
    removeElement.className = 'counttimer-remove-lap-cross'
    removeElement.style.display = 'none'

    const timeElement = document.createElement('time')
	if (diff > thresholdTime && thresholdTime!=0)
	{
		timeElement.innerText = TimeConverter.getTimeTable(lastTime,time,diff)
		timeElement.style.color = "Red";
	}
	else
	{
		timeElement.innerText = TimeConverter.getTimeTable(lastTime,time,diff)
	}

    const timeContainerElement = document.createElement('div')
    timeContainerElement.className = 'counttimer_time_container'
    timeContainerElement.innerHTML = removeElementOpposite.outerHTML + timeElement.outerHTML + removeElement.outerHTML

    element.innerHTML = '#' + lapElement.outerHTML + ' ' + timeContainerElement.outerHTML
    element.addEventListener('mouseover', event => {
      element.childNodes[3].childNodes[0].style.display = 'inline-block'
      element.childNodes[3].childNodes[2].style.display = 'inline-block'
    })
    element.addEventListener('mouseout', event => {
      element.childNodes[3].childNodes[0].style.display = 'none'
      element.childNodes[3].childNodes[2].style.display = 'none'
    })
    element.childNodes[3].childNodes[2].addEventListener('click', event => {
      this.counttimer.removeLap(Number(element.childNodes[1].innerText) - 1)
    })
    this.lapsDivElement.appendChild(element)
  }
  
  /**
   * Remove lap
   * @param {Number} index
   */
  removeLap (index) {
    this.lapsDivElement.removeChild(this.lapsDivElement.childNodes[index])
    this.lapCounter = this.lapsDivElement.childElementCount
    for (let index = 0; index < this.lapCounter; index++) {
      const element = this.lapsDivElement.childNodes[index]
      element.childNodes[1].innerText = index + 1
    }
  }
  /**
   * Remove all laps
   */
  clearLaps () {
    this.lapCounter = 0
    while (this.lapsDivElement.firstChild) {
      this.lapsDivElement.removeChild(this.lapsDivElement.firstChild)
    }
  }
}

class HtmlControlsHandler {
  /**
   * Creates an instance of HtmlControlsHandler.
   * @param {HTMLUListElement} controlsDivElement
   * @param {counttimer} counttimer
   * @param {{keyBoardListener: boolean}} options
   */
  constructor (controlsDivElement, counttimer, options) {
    this.counttimer = counttimer
    this.controlsDivElement = controlsDivElement

    if (options !== undefined) {
      this.addKeyBoardListener = options.keyBoardListener !== undefined && options.keyBoardListener
    } else {
      this.addKeyBoardListener = false
    }

    // Create controls
    this.createControls()
  }
  /**
   * Create controls in HTML document in specified HTMLUListElement
   */
  createControls () {
    while (this.controlsDivElement.firstChild) {
      this.controlsDivElement.removeChild(this.controlsDivElement.firstChild)
    }
    this.controlsDivElement.id = 'counttimer_controls_area'
    this.controlsDivElement.appendChild(this.getControl('start_stop', 'Start', '16',
      () => {
        document.getElementById('start_stop').focus()
        if (this.counttimer.isRunning)
		{
			this.counttimer.stop();
			document.getElementById("start_stop").disabled = true;
		}
		else
		{
			document.getElementById("start_stop").innerText = "Stop";
			this.counttimer.start();
		}
      }))
    this.controlsDivElement.appendChild(this.getControl('restart', 'Pause/Resume', '',
      () => {
        document.getElementById('restart').focus()
        this.counttimer.isRunning ? this.counttimer.pause() : this.counttimer.restart()
      }))
    this.controlsDivElement.appendChild(this.getControl('add_lap', 'Lap', '32',
      () => {
        document.getElementById('add_lap').focus()
        this.counttimer.addLap()
      }))
   this.controlsDivElement.appendChild(this.getControl('clear_laps', 'Clear laps', '',
      () => {
        document.getElementById('clear_laps').focus()
        this.counttimer.clearLaps()
      }))
	  this.controlsDivElement.appendChild(this.getControl('reset', 'Reset', '',
      () => {
        document.getElementById('reset').focus()
        window.location.reload();
      }))
  }
  /**
   * Event listener
   * @param {String} eventName
   * @param {String} title
   * @param {String} keyboardShortcut
   * @param {function} callbackFun
   * @returns {HTMLButtonElement}
   */
  getControl (eventName, title, keyboardShortcut, callbackFun) {
    const controlButton = document.createElement('button')
    controlButton.id = eventName
    const keySymbol = document.createElement('kbd')
   	controlButton.innerHTML = title

    controlButton.addEventListener('click', event => callbackFun())
    if (this.addKeyBoardListener) {
      this.addKeyDownListener(keyboardShortcut, callbackFun)
    }
    return controlButton
  }
  addKeyDownListener (keyDownUpperCase, callbackFun) {
    document.addEventListener('keydown', event => {
      if (event.keyCode === parseInt(keyDownUpperCase)) {
        callbackFun()
		document.getElementById('add_lap').disabled=true;
      }
    }, false)
  }

}


/**
 * CountTimer implementation
 */
class CountTimer {
  /**
   * Creates an instance of CountTimer.
   */
  constructor () {
    // Reset/Initialize timer
    this.reset()
    // Reset event callbacks
    this.callbackAddLap = (index, lapTime) => {}
    this.callbackRemoveLap = (index, lapTime) => {}
    this.callbackClearLaps = () => {}
    this.callbackStart = (startedTime, startedUTCDate) => {}
    this.callbackStop = (stoppedTime, stoppedUTCDate) => {}
    this.callbackRestart = () => {}
    // Reset public event callbacks
    this.callbackPublicAddLap = this.callbackAddLap
    this.callbackPublicRemoveLap = this.callbackRemoveLap
    this.callbackPublicClearLaps = this.callbackClearLaps
    this.callbackPublicStart = this.callbackStart
    this.callbackPublicStop = this.callbackStop
    this.callbackPublicRestart = this.callbackRestart
  }
  /**
   * Get the current time
   * @returns {number}
   */
  get currentTime () {
    if (this.running) {
      return this.startedTime - window.performance.now()
    } else {
      return this.startedTime - this.stoppedTime
    }
  }
  /**
   * Get the current laps
   * @returns {*[]}
   */
  get currentLaps () {
    return this.laps
  }
  /**
   * Get if the timer is currently running
   * @returns {boolean}
   */
  get isRunning () {
    return this.running
  }
  /**
   * Reset and initialize all class variables
   */
  reset () {
    // Reset time
	//const STARTED_TIME = new Date(document.getElementById("startTimeDiv").value).getTime();
    //this.startedTime = STARTED_TIME
	this.startedTime = 0;
    this.stoppedTime = 0
    // Reset laps
    this.laps = []
    // Not running
    this.running = false
  }
  /**
   * Start CountTimer
   */
  start () {
    // if the timer isn't already running start it
    if (!this.running) {
      this.running = true
     //const STARTED_TIME = window.performance.now()
	 //const STARTED_TIME = new Date().getTime();
	 var tempHours = parseInt(document.getElementById("timerHrs").value)
	var tempMin = parseInt(document.getElementById("timerMin").value)
	var tempSec = parseInt(document.getElementById("timerSec").value)
	 var STARTED_TIME = (tempHours*60*60+tempMin*60+tempSec)*1000;
	 console.log("STARTED_TIME.....",STARTED_TIME);
	 if (STARTED_TIME === 0)
	 {
		 console.log("STARTED TIME IS 0...");
		 return false;
	 }
      const DATE_TEMP = new Date();
      const STARTED_DATE = [DATE_TEMP.getUTCHours(), DATE_TEMP.getUTCMinutes(),
        DATE_TEMP.getUTCSeconds(), DATE_TEMP.getUTCMilliseconds() ].join(':')
      this.startedTime = STARTED_TIME - (this.startedTime - this.stoppedTime)
	  console.log("STARTED_TIME 1.....",STARTED_TIME);
      // Event listeners
      this.callbackStart(STARTED_TIME, STARTED_DATE)
      this.callbackPublicStart(STARTED_TIME, STARTED_DATE)
	  document.getElementById('add_lap').disabled=false;
    }
  }
  /**
   * Stop CountTimer
   */
  stop () {
    if (this.running) {
      this.running = false
      const STOPPED_TIME = window.performance.now()
      const DATE_TEMP = new Date()
      const STOPPED_DATE = [DATE_TEMP.getUTCHours(), DATE_TEMP.getUTCMinutes(),
        DATE_TEMP.getUTCSeconds(), DATE_TEMP.getUTCMilliseconds() ].join(':')
      this.stoppedTime = STOPPED_TIME
      // Event listeners
      this.callbackStop(STOPPED_TIME, STOPPED_DATE)
      this.callbackPublicStop(STOPPED_TIME, STOPPED_DATE)
	  document.getElementById("counttimer_laps_area").style.display='block';
	  document.getElementById("restart").disabled = true;
	  document.getElementById("add_lap").disabled = true;
    }
  }
  /**
   * Pause CountTimer
   */
  pause () {
    if (this.running) {
      this.running = false
      const STOPPED_TIME = window.performance.now()
      const DATE_TEMP = new Date()
      const STOPPED_DATE = [DATE_TEMP.getUTCHours(), DATE_TEMP.getUTCMinutes(),
        DATE_TEMP.getUTCSeconds(), DATE_TEMP.getUTCMilliseconds() ].join(':')
      this.stoppedTime = STOPPED_TIME
      // Event listeners
      this.callbackStop(STOPPED_TIME, STOPPED_DATE)
      this.callbackPublicStop(STOPPED_TIME, STOPPED_DATE)
    }
  }
  /**
   * Resume CountTimer
   */
  restart () {
    this.reset()
    //this.clearLaps()
    // Event listeners
    this.callbackRestart()
    this.callbackPublicRestart()
    // ----------------
    this.start()
  }
  /**
   * Add a lap
   */
  addLap () {
    const temp = this.currentTime
	console.log("temp is ....."+temp);
    if (this.currentTime === 0) {
      return
    }
    let count = this.laps.push(temp)
	console.log("count is ....."+count);
    // Event listeners
    this.callbackAddLap(count - 1, temp)
    this.callbackPublicAddLap(count - 1, temp)
  }
  /**
   * Remove a lap
   * @param {number} index of lap that should be removed
   */
  removeLap (index) {
    let deletedElement = this.laps[index]
    if (index >= 0 && index < this.laps.length) {
      deletedElement = this.laps.splice(index, 1)
    }
    // Event listeners
    this.callbackRemoveLap(index, deletedElement)
    this.callbackPublicRemoveLap(index, deletedElement)
  }
  /**
   * Clear all laps
   */
  clearLaps () {
    this.laps = []
    // Event listeners
    this.callbackClearLaps()
    this.callbackPublicClearLaps()
  }
  /**
   * Event listener
   * @param {String} eventName
   * @param {*} callback
   */
  event (eventName, callback) {
    switch (eventName) {
      case 'start':
        this.callbackStart = callback
        break
      case 'stop':
        this.callbackStop = callback
        break
      case 'restart':
        this.callbackRestart = callback
        break
      case 'add_lap':
        this.callbackAddLap = callback
        break
      case 'remove_lap':
        this.callbackRemoveLap = callback
        break
      case 'clear_laps':
        this.callbackClearLaps = callback
        break
      default:
        console.error('The event "' + eventName + '" does not exist!')
        break
    }
  }
  /**
   * Public event listener
   * @param {String} eventName
   * @param {*} callback
   */
  eventPublic (eventName, callback) {
    switch (eventName) {
      case 'start':
        this.callbackPublicStart = callback
        break
      case 'stop':
        this.callbackPublicStop = callback
        break
      case 'restart':
        this.callbackPublicRestart = callback
        break
      case 'add_lap':
        this.callbackPublicAddLap = callback
        break
      case 'remove_lap':
        this.callbackPublicRemoveLap = callback
        break
      case 'clear_laps':
        this.callbackPublicClearLaps = callback
        break
      default:
        console.error('The public event "' + eventName + '" does not exist!')
        break
    }
  }
}

class HtmlDigitHandler {
  /**
   * @param {HTMLDivElement} counttimerDivElement
   * @param {counttimer} counttimer
   */
  constructor (counttimerDivElement, counttimer) {
    this.counttimerDivElement = counttimerDivElement
    this.createDigits()
    this.counttimer = counttimer
    this.setTime()
  }
  setTime () {
	if (this.counttimer.currentTime < 0)
	{
		console.log("In SetTime, current time is less than 0",this.counttimer.currentTime);
		this.counttimer.stop();
		return false;
	}
	const timeNumberStrings = TimeConverter.getTimeNumberString(this.counttimer.currentTime)
    for (let index = 0; index < 2; index++) {
      const tempElement = document.getElementById('hour' + index)
      tempElement.classList.remove(...TimeConverter.timeDigitStringMap)
      tempElement.classList.add(timeNumberStrings[0][index])
    }
    for (let index = 0; index < 2; index++) {
      const tempElement = document.getElementById('minute' + index)
      tempElement.classList.remove(...TimeConverter.timeDigitStringMap)
      tempElement.classList.add(timeNumberStrings[1][index])
    }
    for (let index = 0; index < 2; index++) {
      const tempElement = document.getElementById('second' + index)
      tempElement.classList.remove(...TimeConverter.timeDigitStringMap)
      tempElement.classList.add(timeNumberStrings[2][index])
    }
    for (let index = 0; index < 3; index++) {
      const tempElement = document.getElementById('millisecond' + index)
      tempElement.classList.remove(...TimeConverter.timeDigitStringMap)
      tempElement.classList.add(timeNumberStrings[3][index])
    }
  }
  /**
   * @returns {HTMLDivElement}
   */
  getDivider () {
    const node = document.createElement('div')
    node.className = 'counttimer_digits_divider'
    for (let index = 0; index < 2; index++) {
      const element = document.createElement('span')
      element.className = 'counttimer_digits_divider_' + index
      node.appendChild(element)
    }
    return node
  }
  /**
   * Get a digit
   * @param {String} digitId Id of digit
   * @returns {HTMLDivElement}
   */
  getDigit (digitId) {
    const node = document.createElement('div')
    node.id = digitId
    node.className = 'counttimer_digits_element'
    for (let index = 0; index < 7; index++) {
      const element = document.createElement('span')
      element.className = 'counttimer_digits_element_' + index
      node.appendChild(element)
    }
    return node
  }
  /**
   * Clears the area and creates counttimer digits
   */
  createDigits () {
    while (this.counttimerDivElement.firstChild) {
      this.counttimerDivElement.removeChild(this.counttimerDivElement.firstChild)
    }
    this.counttimerDivElement.id = 'counttimer_digits_area'
    for (let index = 0; index < 2; index++) {
      this.counttimerDivElement.appendChild(this.getDigit('hour' + index))
    }
    this.counttimerDivElement.appendChild(this.getDivider())
    for (let index = 0; index < 2; index++) {
      this.counttimerDivElement.appendChild(this.getDigit('minute' + index))
    }
    this.counttimerDivElement.appendChild(this.getDivider())
    for (let index = 0; index < 2; index++) {
      this.counttimerDivElement.appendChild(this.getDigit('second' + index))
    }
    this.counttimerDivElement.appendChild(this.getDivider())
    for (let index = 0; index < 3; index++) {
      this.counttimerDivElement.appendChild(this.getDigit('millisecond' + index))
    }
  }
}

/**
 * CountTimer handler implementation
 */
class TimeConverter {
  /**
   * Time digit strings
   */
  static get timeDigitStringMap () {
    return ['zero', 'one', 'two', 'three', 'four', 'five',
      'six', 'seven', 'eight', 'nine'
    ]
  }
  /**
   * Convert time to formatted time string array
   * @param {Number} time in milliseconds
   * @returns {String} time
   */
  static getTimeString (time) {
    return this.getTimeDigits(time).map(digits =>
      digits.join('')).join(':')
  }
   static getTimeTable (lasttime,time,diff) {
	  var diffStr=0;
	 if (diff > 0) 
	 {
		 diffStr = diff;
	 }
	 var lastTimeStr = this.getTimeDigits(lasttime).map(digits =>
      digits.join('')).join(':');
	   var time = this.getTimeDigits(time).map(digits =>
      digits.join('')).join(':');
	  var table = time + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0' +parseInt(diffStr);
	  return table;
  }
  
  /**
   * Convert time to formatted time
   * @param {Number} time in milliseconds
   * @returns {Number[]} time
   */
  static getFormattedTime (time) {
    const h = Math.floor( (time/(1000*60*60)) % 24 );
    const min = Math.floor( (time/1000/60) % 60 );
    const sec = Math.floor( (time/1000) % 60 );
    const millisec = Math.floor(time % 1000)
    return [h, min, sec, millisec]
  }
  /**
   * Convert time to formatted time string array
   * @param {Number} time in milliseconds
   * @returns {Number[][]} time
   */
  static getTimeDigits (time) {
    const timeNumbers = this.getFormattedTime(time)
    const padTime = (timeNumber, digits = 2) => ('0'.repeat(digits) + timeNumber).slice(-digits)
    const convertStringToDigits = digitsString => digitsString.split('')
    return [convertStringToDigits(padTime(timeNumbers[0])),
      convertStringToDigits(padTime(timeNumbers[1])),
      convertStringToDigits(padTime(timeNumbers[2])),
      convertStringToDigits(padTime(timeNumbers[3], 3))
    ]
  }
  /**
   * Convert time to formatted time string array
   * @param {Number} time in milliseconds
   * @returns {String[][]} time
   */
  static getTimeNumberString (time) {
    return this.getTimeDigits(time).map(digits =>
      digits.map(digit => this.timeDigitStringMap[digit]))
  }
}
