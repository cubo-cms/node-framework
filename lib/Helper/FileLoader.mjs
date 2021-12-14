/** @package        @cubo-cms/node-framework
  * @module         /lib/Helper/FileLoader.mjs
  * @version        0.4.35
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

import JLoader from './JLoader.mjs';
import JResponse from './JResponse.mjs';

export default class FileLoader {
  static basePath = JLoader.basePath;
  static path = JLoader.path;
  static isPath = JLoader.isPath;
  static isURL = JLoader.isURL;
  static resolvePath = JLoader.resolvePath;

  /** @async @static @function load(data)
    * Loads data and returns it as an object
    * @param {string|object} data
    * @return {Promise <object>}
    **/
  static load(data = {}) {
    return new Promise((resolve, reject) => {
      if(typeof data === 'string') {
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
          resolve(data);
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
          resolve(data);
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
          resolve(payload);
        }).on('error', (error) => {
          reject(JResponse.error({ message: `Failed to read data`, payload: error }, this.name));
        });
      }).on('error', (error) => {
        reject(JResponse.error({ message: `Failed to read data`, payload: error }, this.name));
      });
    });
  }
}
