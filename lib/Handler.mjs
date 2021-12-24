/** Base class module {Handler} providing basic methods for the framework
  * handlers.
  *
  * @package        @cubo-cms/node-framework
  * @module         /lib/Handler.mjs
  * @version        0.4.39
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Class from './Class.mjs';
import JLoader from './Helper/JLoader.mjs';
import JResponse from './Helper/JResponse.mjs';

export default class Handler extends Class {
  /** @static @function use(handler)
    * Adds a handler to the default stack for this class
    * @param {object} handler
    **/
  static use(handler) {
    if(global.log) log.debug(`${this.name} uses ${handler.name}`);
    if(!this.stack) this.stack = [];
    this.stack.push(handler);
  };

  /** @private @property {object} stack - holds handlers specific for this instance
    **/
  #stack = [];

  /** @constructor (data)
    * Instance constructor
    * @param {string|object} data - data to store for this instance
    **/
  constructor(data = {}) {
    super(data);
    // Store class stack
    if(global.log) log.debug({ message: `${this.name} creates instance with data:`, payload: data });
    this.#stack = this.constructor.stack || [];
  };

  /** @function clear(handler)
    * Removes one or all handlers from the stack
    * @param {string|object} handler - class or class name to be removed
    **/
  clear(handler = undefined) {
    if(handler === undefined) {
      if(global.log) log.debug(`${this.name} clears all handlers`);
      this.#stack = [];
    } else {
      if(typeof handler == 'function' || typeof handler == 'object') {
        handler = handler.name;
      };
      if(global.log) log.debug(`${this.name} removes handler ${handler}`);
      this.#stack = this.#stack.filter((module) => module == handler);
    }
  };
  /** @function handler(data,request,response)
    * Calls the handler for this instance
    * @param {object} data - data to be passed to handler
    * @param {object} request - original request data
    * @param {object} response - data that will be returned
    * @return {Promise <object>}
    **/
  handler(data = {}, request = {}, response = {}) {
    return new Promise((resolve, reject) => {
      resolve(JResponse.success({ data: data }));
    });
  };
  /** @function invoke(data,request,response)
    * Invokes execution of the handlers for this instance
    * @param {object} data - data to be passed to handler
    * @param {object} request - original request data
    * @param {object} response - data that will be returned
    * @return {Promise <object>}
    **/
  invoke(data = {}, request = {}, response = {}) {
    if(global.log) log.debug({ message: `${this.name} invokes handler with data:`, payload: data });
    return new Promise((resolve, reject) => {
      // Load data
      this.load(data).then((data) => {
        // Execute handler
        return this.handler(data, request, response);
      }).then((result) => {
        log.debug({ message: `${this.name} returns results from handler`, source: this.name, payload: result });
        // Merge with existing data
        if(result.status == 'success') {
          this.data = {...this.data, ...result.data};
        } else if(!result.status) {
          this.data = {...this.data, ...result};
        }
        // Sequentially resolve promises
        resolve(this.#stack.reduce((result, handler) => {
          return result.then((data) => {
            let instance = new handler(data.status === 'success' ? data.data : data);
            return instance.invoke(this.data[handler.name.toLowerCase()], request, response);
          }).catch((error) => {
            reject(error);
          });
        }, Promise.resolve(this.data, request, response)));
      }).catch((error) => {
        reject(error);
      });
    });
  }
  /** @function use(handler)
    * Adds a handler to the stack
    * @param {object} handler
    **/
  use(handler) {
    if(global.log) log.debug(`${this.name} uses module ${handler.name}`);
    this.#stack.push(handler);
  };
};
