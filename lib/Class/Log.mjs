/** @package        @cubo-cms/node-framework
  * @module         /lib/Class/Log.mjs
  * @version        0.4.24
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import fs from 'fs';

import Class from '../Class.mjs';

// Define colors for different types of messages
const logColors = {
  bright: { color: "\x1b[1m" },   // Bright
  debug: { color: "\x1b[35m" },   // Magenta
  dim: { color: "\x1b[2m" },      // Dim
  error: { color: "\x1b[31m" },   // Red
  fail: { color: "\x1b[33m" },    // Yellow
  info: { color: "\x1b[36m" },    // Cyan
  reset: { color: "\x1b[0m" },    // Reset to normal
  success: { color: "\x1b[32m" }, // Green
  warning: { color: "\x1b[33m" }  // Yellow
};

/** @function normalize(data)
  * Makes sure there is an object with required fields
  * @param {string||object} data
  * @param {string} type - error type
  * @return {object}
  **/
function normalize(data, type = 'debug') {
  let returnData = {};
  if(typeof data === 'string') {
    returnData.message = data;
    returnData.type = type;
  } else if(typeof data === 'object') {
    returnData = data;
    returnData.message = data.message || 'Unknown error';
    returnData.type = data.type || type;
  } else {
    returnData.message = 'Unknown error';
    returnData.type = type;
  }
  returnData.time = new Date().getTime();
  return returnData;
}
/** @function formatted(data)
  * Outputs the data formatted with fancy colors
  * @param {string||object} data
  * @param {string} type - error type
  * @return {string}
  **/
function formatted(data, type = 'debug') {
  data = normalize(data, type);
  let output =
    (Log.default.showColors ? logColors['dim'].color : '') +
    (Log.default.useLocale ? new Date(data.time).toLocaleString(Log.default.locale) : new Date(data.time).toISOString()) +
    (Log.default.showColors ? logColors['reset'].color : '') + ' ' +
    (Log.default.showColors ? logColors[data.type].color + data.type + logColors['reset'].color : data.type) + ': ' +
    data.message +
    (Log.default.showSource ?
      (Log.default.showColors ? logColors['dim'].color : '') +
      ` in ${data.source}` +
      (Log.default.showColors ? logColors['reset'].color : '')
    : '');
  return output;
}

export default class Log extends Class {
  /** @static @property {object} default - holds default values
    **/
  static default = {
    locale: new Intl.Locale('nl-NL', { timezone: 'America/Curacao' }),
    showColors: false,
    showDate: true,
    showPayload: false,
    showSource: false,
    suppressType: ['debug','info'],
    suppressSource: ['Namespace'],
    useLocale: false
  };
  static logFile = undefined;

  /** @static @function debug(data)
    * Writes debug message to console
    * @param {object} data
    **/
  static debug(data) { this.log(data, 'debug'); }
  /** @static @function error(data)
    * Writes error message to console
    * @param {object} data
    **/
  static error(data) { this.log(data, 'error'); }
  /** @static @function fail(data)
    * Writes fail message to console
    * @param {object} data
    **/
  static fail(data) { this.log(data, 'fail'); }
  /** @static @function info(data)
    * Writes info message to console
    * @param {object} data
    **/
  static info(data) { this.log(data, 'info'); }
  /** @static @function log(data,type)
    * Writes message to console
    * @param {object} data
    * @param {string} type - log type
    **/
  static log = function(data, type = 'debug') {
    if(!this.default.suppressType.includes(data.type || data.status || type) && !this.default.suppressSource.includes(data.source)) {
      console.log(formatted(data, data.type || type));
      if(this.default.showPayload && data.payload) {
        console.group();
        console.log(data.payload);
        console.groupEnd();
      }
    }
  }
  /** @static @function success(data)
    * Writes success message to console
    * @param {object} data
    **/
  static success(data) { this.log(data, 'success'); }
  /** @static @function warning(data)
    * Writes warning message to console
    * @param {object} data
    **/
  static warning(data) { this.log(data, 'warning'); }
}
