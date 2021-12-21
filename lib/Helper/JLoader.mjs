/** Helper module {JLoader} providing methods to load JSON data
  * into an object from a JSON string, a JSON file, a URL returning JSON,
  * or another object.
  *
  * @package        @cubo-cms/node-framework
  * @module         /lib/Helper/JLoader.mjs
  * @version        0.5.39
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

import JResponse from './JResponse.mjs';

export default class JLoader {
  /** @static @function basePath()
    * Getter to retrieve path to web root (removing node_modules and lib)
    * @return {string}
    **/
  static get basePath() {
    let filePath = this.path.substring(0, this.path.indexOf(path.sep + 'node_modules') == -1 ? this.path.lastIndexOf(path.sep) : this.path.indexOf(path.sep + 'node_modules'));
    return filePath.substring(0, this.path.indexOf(path.sep + 'lib') == -1 ? filePath.length : filePath.indexOf(path.sep + 'lib'));
  }
  /** @static @function path()
    * Getter to retrieve path to this module
    * @return {string}
    **/
  static get path() {
    return path.dirname(fileURLToPath(import.meta.url));
  }

  /** @static @function isPath(data)
    * Returns true if data is recognized as a file path
    * @param {string} data
    * @return {boolean}
    **/
  static isPath(data) {
    if(typeof data !== 'string') return false;
    const PathTester = /^(\$\/|\.\/|\.\.\/)/g;
    return PathTester.test(data);
  }
  /** @static @function isURL(data)
    * Returns true if data is a URL
    * @param {string} data
    * @return {boolean}
    **/
  static isURL(data) {
    if(typeof data !== 'string') return false;
    const URLTester = /^([\w\-\+_]+:\/\/.+\/|\/.*)/g;
    return URLTester.test(data);
  }
  /** @async @static @function load(data)
    * Loads data and returns it as an object
    * @param {string|object} data
    * @return {Promise <object>}
    **/
  static load(data = {}) {
    return new Promise((resolve, reject) => {
      if(typeof data === 'object') {
        resolve(data);
      } else if(typeof data === 'string') {
        if(this.isURL(data)) {
          this.loadURL(data).then((data) => {
            resolve(data);
          }).catch((error) => {
            reject(JResponse.error({ message: `Failed to load "${data}"`, payload: error }, this.name));
          });
        } else if(this.isPath(data)) {
          this.loadPath(data).then((data) => {
            resolve(data);
          }).catch((error) => {
            reject(JResponse.error({ message: `Failed to load "${data}"`, payload: error }, this.name));
          });
        } else {
          try {
            resolve(JSON.parse(data));
          } catch(error) {
            reject(JResponse.error({ message: `Incorrect data`, payload: error }, this.name));
          }
        }
      } else {
        reject(JResponse.error(`Incorrect data type`, this.name));
      }
    });
  }
  /** @async @static @function loadPath(data)
    * Loads data from file and returns it as an object
    * @param {string} data
    * @return {Promise <object>}
    **/
  static loadPath(data = {}) {
    return new Promise((resolve, reject) => {
      let filePath = this.resolvePath(data);
      fs.readFile(filePath, 'utf8', (error, data) => {
        if(error) {
          reject(JResponse.error({ message: `Failed to read data`, payload: error }, this.name));
        } else {
          try {
            resolve(JSON.parse(data));
          } catch(error) {
            reject(JResponse.error({ message: `Incorrect data`, payload: error }, this.name));
          }
        }
      });
    });
  }
  /** @async @static @function loadURL(data)
    * Loads data from URL and returns it as an object
    * @param {string} data
    * @return {Promise <object>}
    **/
  static loadURL(data = {}) {
    if(data.startsWith('file://')) return this.loadPath(data.substring(7));
    if(!data.startsWith('http')) return JResponse.error({ message: `Unacceptable protocol` }, this.name);
    return new Promise((resolve, reject) => {
      const scheme = data.startsWith('http://') ? http : https;
      scheme.get(data, (response) => {
        let payload = '';
        response.on('data', (chunk) => {
          payload += chunk;
        }).on('end', () => {
          try {
            resolve(JSON.parse(payload));
          } catch(error) {
            reject(JResponse.error({ message: `Incorrect data`, payload: error }, this.name));
          }
        }).on('error', (error) => {
          reject(JResponse.error({ message: `Failed to read data`, payload: error }, this.name));
        });
      }).on('error', (error) => {
        reject(JResponse.error({ message: `Failed to read data`, payload: error }, this.name));
      });
    });
  }
  /** @static @function resolvePath(data,basePath)
    * Returns a resolved path
    * @param {string} data
    * @param {string} basePath - optional alternative base path
    * @return {string}
    **/
  static resolvePath(data, basePath = this.basePath) {
    return data.startsWith('$/') ? path.resolve(basePath, data.substr(2)) : path.resolve(this.path, data);
  }
}
