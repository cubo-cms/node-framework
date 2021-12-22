/** Helper module {Loader} providing methods to load data from a file path or a stream
  * into an object.
  *
  * @package        @cubo-cms/node-framework
  * @module         /lib/Helper/Loader.mjs
  * @version        0.5.39
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import fs from 'fs';
import http2 from 'http2';
import os from 'os';
import path from 'path';
import { fileURLToPath, parse } from 'url';

import JResponse from './JResponse.mjs';

export default class Loader {
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
    const PathTester = /^(\$\/|~\/|\.\/|\.\.\/)/g;
    return PathTester.test(data);
  }
  /** @static @function isURI(data)
    * Returns true if data is a URI
    * @param {string} data
    * @return {boolean}
    **/
  static isURI(data) {
    if(typeof data !== 'string') return false;
    const URITester = /^([\w\-\+_]+:\/\/.+\/|\/.*)/g;
    return URITester.test(data);
  }
  /** @static @function load(data)
    * Loads data and returns it as an object
    * @param {string|object} data
    * @return {Promise <string|object>}
    **/
  static load(data = {}) {
    return new Promise((resolve, reject) => {
      if(typeof data === 'string') {
        if(this.isURI(data)) {
          this.loadFromURI(data).then((data) => {
            resolve(data);
          }).catch((error) => {
            reject(JResponse.error({ message: `Failed to load "${data}"`, payload: error }, this.name));
          });
        } else if(this.isPath(data)) {
          this.loadFromPath(data).then((data) => {
            resolve(data);
          }).catch((error) => {
            reject(JResponse.error({ message: `Failed to load "${data}"`, payload: error }, this.name));
          });
        } else {
          // Probably the string did not refer to a URI or file path; return as is
          resolve(data);
        }
      } else {
        // Probably the object did not refer to a URI or file path; return as is
        resolve(data);
      }
    });
  }
  /** @static @function loadAll(data)
    * Loads data from multiple sources and returns it as an object; this will load multiple files synchronously
    * @param {object} data
    * @return {Promise <object>}
    **/
  static loadAll(data = {}) {
    let promise = [];
    return new Promise((resolve, reject) => {
      Object.keys(data).forEach((file) => {
        promise.push(this.load(data[file]).then((result) => {
          data[file] = result;
        }).catch((error) => {
          reject(error);
        }));
      });
      Promise.allSettled(promise).then(() => {
        resolve(data);
      });
    });
  }
  /** @static @function loadFromPath(data)
    * Loads data from file path and returns it as a string
    * @param {string} data
    * @return {Promise <string>}
    **/
  static loadFromPath(data = '') {
    return new Promise((resolve, reject) => {
      if(!this.isPath(data)) {
        // Probably the string did not refer to a URI or file path; return as is
        resolve(data);
      } else {
        let filePath = this.resolvePath(data);
        fs.readFile(filePath, 'utf8', (error, data) => {
          if(error) {
            reject(JResponse.error({ message: `Failed to read data`, payload: error }, this.name));
          } else {
            resolve(data);
          }
        });
      }
    });
  }
  /** @static @function loadFromURI(data)
    * Loads data from URI and returns it as a string
    * @param {string} data
    * @return {Promise <string>}
    **/
  static loadFromURI(data = '') {
    if(data.startsWith('file://')) return this.loadFromPath(data.substring(7));
    return new Promise((resolve, reject) => {
      if(!data.startsWith('http')) {
        reject(JResponse.error({ message: `Unacceptable protocol` }, this.name));
      } else {
        let uri = parse(data, true);
        const session = http2.connect(uri.protocol + '//' + uri.host).on('error', (error) => {
          reject(JResponse.error({ message: `Failed to connect to URI`, payload: error }, this.name));
        });
        const request = session.request({ ':path': uri.path });
        let payload = '';
        request.setEncoding('utf8');
        request.on('data', (chunk) => {
          payload += chunk;
        }).on('end', () => {
          resolve(payload);
          session.close();
        }).on('error', (error) => {
          reject(JResponse.error({ message: `Failed to read data`, payload: error }, this.name));
          session.close();
        });
      }
    });
  }
  /** @static @function resolvePath(data,basePath)
    * Returns a resolved path
    * @param {string} data
    * @param {string} basePath - optional alternative base path
    * @return {string}
    **/
  static resolvePath(data = '', basePath = this.basePath) {
    return data.startsWith('$/') ? path.resolve(basePath, data.substr(2)) : data.startsWith('~/') ? path.resolve(os.homedir(), data.substr(2)) : path.resolve(this.path, data);
  }
}
