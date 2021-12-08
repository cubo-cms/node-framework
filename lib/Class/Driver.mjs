/** @package        @cubo-cms/node-framework
  * @module         /lib/Class/Driver.mjs
  * @version        0.4.29
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';
//import Class from '../Class.mjs';
//import JResponse from '../Helper/JResponse.mjs';

export default class Driver extends Namespace.Class {
  /** @property {object} method - holds driver methods
    **/
  method = {
  };

  /** @function invokeMethod()
    * Invokes driver method and returns processed data
    * @return {Promise <object>}
    **/
  invokeMethod() {
    return new Promise((resolve, reject) => {
      let method = this.get('method');
      if(method) {
        if(typeof this.method[method] === 'function') {
          _log_.info({ message: `Driver invokes method \"${method}\"`, source: this.type });
          method = this.method[method].bind(this);
          resolve(method());
        } else {
          _log_.warning({ message: `Driver fails to invoke method \"${method}\"`, source: this.type });
          reject(Namespace.JResponse.respond('notAllowed', { header: { Allow: Object.keys(this.method).join(', ').toUpperCase() } }, this.type));
        }
      } else {
        _log_.warning({ message: `Model cannot determine method`, source: this.type });
        reject(Namespace.JResponse.respond('notAllowed', { header: { Allow: Object.keys(this.method).join(', ').toUpperCase() } }, this.type));
      }
    });
  }

  /** @static @function create(data,caller)
    * Creates a new driver and keeps track of creating instance
    * @param {object} data
    * @param {object} caller
    * @return {Promise <object>}
    **/
  static create(data = {}, caller = undefined) {
    return new Promise((resolve, reject) => {
      let instance;
      if(this.exists(data.dataDriver)) {
        instance = new Namespace[data.dataDriver + this.name](data);
        if(caller) _log_.debug({ message: `${caller.type} creates ${data.dataDriver + this.name} instance`, source: this.name, payload: data });
      } else {
        instance = new this(data);
        if(caller) _log_.debug({ message: `${caller.type} creates ${this.name} instance`, source: this.name, payload: data });
      }
      instance.calledBy = caller;
      instance.success(() => {
        resolve(instance);
      }).error((error) => {
        reject(error);
      });
    });
  }
  /** @static @function exists(datariver)
    * Returns true if the specified driver exists in the namespace
    * @param {string} dataDriver
    * @return {boolean}
    **/
  static exists(dataDriver) {
    return Namespace.exists(dataDriver + this.name);
  }
}
