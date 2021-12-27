/** Base class module {Handler} providing basic methods for the framework
  * handlers.
  *
  * @package        @cubo-cms/node-framework
  * @module         /lib/Class/Handler.mjs
  * @version        0.5.40
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Handler extends Namespace.Class {
  /** @static @function use(handler)
    * Adds a handler to the default stack for this class
    * @param {object} handler
    **/
  static use(handler) {
    if(global.log) log.debug(`${this.name} uses ${handler.name}`);
    if(!this.stack) this.stack = [];
    this.stack.push(handler);
  }

  /** @private @property {object} stack - holds handlers specific for this instance
    **/
  #stack = []

  /** @constructor (data)
    * Instance constructor
    * @param {string|object} data - data to store for this instance
    **/
  constructor(data = {}) {
    super(data);
    // Store class stack
    this.#stack = this.constructor.stack || [];
  }

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
  }
  /** @function handler(request,response)
    * Calls the handler for this instance
    * @param {object} request - original request data
    * @param {object} response - data that will be returned
    * @return {Promise <object>}
    **/
  handler(request, response) {
    return new Promise((resolve, reject) => {
      resolve(Namespace.JResponse.success({ data: {} }));
    });
  }
  /** @function invoke(request,response,data)
    * Invokes execution of the handlers for this instance
    * @param {object} request - original request data
    * @param {object} response - data that will be returned
    * @param {object} data - data to be passed to handler
    * @return {Promise <object>}
    **/
  invoke(request, response, data = {}) {
    if(global.log) log.debug({ message: `${this.name} invokes handler`, source: this.name });
    return new Promise((resolve, reject) => {
      // Load data
      this.load(data).then((data) => {
        // Execute handler
        return this.handler(request, response);
      }).then((result) => {
        log.debug({ message: `${this.name} returns results from handler`, source: this.name, payload: result });
        // Merge with existing data
        if(result.status == 'success') Object.assign(this.data, result.data);
        // Sequentially resolve promises
        resolve(this.#stack.reduce((result, handler) => {
          handler = typeof handler === 'string' ? Namespace[handler] : handler;
          return result.then((data) => {
            if(data.status && data.status != 'success') return data;
            if(data.status && data.status == 'success')
              this.data = Object.assign(this.data, data.data);
            else
              this.data = Object.assign(this.data, data);
            return handler.create(this.data[handler.name.toLowerCase()], this);
          }).then((instance) => {
            delete this.data[handler.name.toLowerCase()];
            return instance.invoke(request, response);
          }).catch((error) => {
            return error;
          });
        }, Promise.resolve(result.data, request, response)));
      }).catch((error) => {
        log.error({ message: `${this.name} returns error`, source: this.name, payload: error });
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
  }
}
