/** @package        @cubo-cms/node-framework
  * @module         /lib/Class/Log.mjs
  * @version        0.4.30
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import fs from 'fs';

import Namespace from '../../Namespace.mjs';

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
function normalize(data, status = 'debug') {
  let returnData = {};
  if(typeof data === 'string') {
    returnData.message = data;
    returnData.status = status;
  } else if(typeof data === 'object') {
    returnData = data;
    returnData.message = data.message || 'Unknown error';
    returnData.status = data.status || status;
  } else {
    returnData.message = 'Unknown error';
    returnData.status = status;
  }
  returnData.time = new Date().getTime();
  return returnData;
}

export default class Log extends Namespace.Class {
  /** @property {object} default - holds default values
    **/
  default = {
    locale: new Intl.Locale('nl-NL', { timezone: 'America/Curacao' }),
    showColors: false,
    showDate: true,
    showPayload: false,
    showSource: false,
    suppressStatus: ['debug','info'],
    suppressSource: ['Namespace'],
    useLocale: false
  };
  format = this.defaultFormat;

  /** @function debug(data)
    * Writes debug message to console
    * @param {object} data
    **/
  debug(data) { this.log(data, 'debug'); }
  /** @function defaultFormat(data,type)
    * Outputs the data formatted with fancy colors
    * @param {string||object} data
    * @param {string} status
    * @return {string}
    **/
  defaultFormat(data, status = 'debug') {
    data = normalize(data, status);
    let output =
      (this.get('showColors') ? logColors['dim'].color : '') +
      (this.get('useLocale') ? new Date(data.time).toLocaleString(this.get('locale')) : new Date(data.time).toISOString()) +
      (this.get('showColors') ? logColors['reset'].color : '') + ' ' +
      (this.get('showColors') ? logColors[data.status].color + data.status + logColors['reset'].color : data.status) + ': ' +
      data.message +
      (this.get('showSource') ?
        (this.get('showColors') ? logColors['dim'].color : '') +
        ` in ${data.source}` +
        (this.get('showColors') ? logColors['reset'].color : '')
      : '');
    return output;
  }
  /** @function error(data)
    * Writes error message to console
    * @param {object} data
    **/
  error(data) { this.log(data, 'error'); }
  /** @function fail(data)
    * Writes fail message to console
    * @param {object} data
    **/
  fail(data) { this.log(data, 'fail'); }
  /** @function info(data)
    * Writes info message to console
    * @param {object} data
    **/
  info(data) { this.log(data, 'info'); }
  /** @function log(data,status)
    * Writes message to console
    * @param {object} data
    * @param {string} status
    **/
  log = function(data, status = 'debug') {
    if(!this.get('suppressStatus').includes(data.status || status) && !this.get('suppressSource').includes(data.source)) {
      console.log(this.format(data, data.status || status));
      if(this.get('showPayload') && data.payload) {
        console.group();
        console.log(data.payload);
        console.groupEnd();
      }
    }
  }
  /** @function defaultFormat(data,type)
    * Outputs the data formatted with fancy colors
    * @param {string||object} data
    * @param {string} status
    * @return {string}
    **/
  requestFormat(data, status = 'debug') {
    data = normalize(data, status);
    let output =
      (this.get('showColors') ? logColors['dim'].color : '') +
      (this.get('useLocale') ? new Date(data.time).toLocaleString(this.get('locale')) : new Date(data.time).toISOString()) +
      (this.get('showColors') ? logColors['reset'].color : '') + ' ' +
      (this.get('showColors') ? logColors[data.status].color + data.status + logColors['reset'].color : data.status) + ': ' +
      data.message +
      (this.get('showSource') ?
        (this.get('showColors') ? logColors['dim'].color : '') +
        ` in ${data.source}` +
        (this.get('showColors') ? logColors['reset'].color : '')
      : '');
    return output;
  }
  /** @function success(data)
    * Writes success message to console
    * @param {object} data
    **/
  success(data) { this.log(data, 'success'); }
  /** @function warning(data)
    * Writes warning message to console
    * @param {object} data
    **/
  warning(data) { this.log(data, 'warning'); }
}
