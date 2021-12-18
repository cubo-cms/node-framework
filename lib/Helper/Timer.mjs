/** @package        @cubo-cms/node-framework
  * @module         /lib/Helper/Timer.mjs
  * @version        0.4.37
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

export default class Timer {
  /** @static @property {object} default - holds default values
    **/
  static default = {
    delay: '1d'
  }
  /** @static @function clear(timer)
    * Clears timer that was previously set
    * @param {object} timer
    **/
  static clear(timer) {
    timer.unref();
  }
  /** @static @function on(delay,process,param)
    * Sets timer to run after specified delay
    * @param {int|string} delay
    * @param {function} process
    * @param {object} param
    * @return {object} - timer object
    **/
  static on(delay = this.default.delay, process, param = {}) {
    return setTimeout(process, this.parse(delay), param);
  }
  /** @static @function onEvery(delay,process,param)
    * Sets timer to run at specified intervals
    * @param {int||string} delay
    * @param {function} process
    * @param {object} param
    * @return {object} - timer object
    **/
  static onEvery(delay = this.default.delay, process, param = {}) {
    return setInterval(process, this.parse(delay), param);
  }
  /** @static @function parse(delay)
    * Parses delay string to convert to ms
    * @param {int||string} delay
    * @return {int}
    **/
  static parse(delay) {
    if(typeof delay === 'string') {
      switch(delay[delay.length - 1]) {
        case 's': // Second
          return parseInt(delay.slice(0, -1), 10) * 1000;
        case 'm': // Minute
          return parseInt(delay.slice(0, -1), 10) * 60000;
        case 'h': // Hour
          return parseInt(delay.slice(0, -1), 10) * 3600000;
        case 'd': // Day
          return parseInt(delay.slice(0, -1), 10) * 86400000;
        default:
          return parseInt(this.default.delay, 10);
      }
    } else {      // Expect seconds
      return delay * 1000;
    }
  }
}
