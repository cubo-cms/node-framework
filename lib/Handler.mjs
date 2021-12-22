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

export default class Handler extends Class {
  /** @static @property {object} stack - holds default handlers specific for this class
    **/
  static stack = [];
  /** @static @function use(handler)
    * Adds a handler to the default stack for this class
    * @param {object} handler
    **/
  static use(handler) {
    console.log(`${this.name} uses ${handler.name}`);
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
    console.log(`${this.name} creates instance with data:`, data);
    this.#stack = this.constructor.stack;
  };

  /** @function clear(handler)
    * Removes one or all handlers from the stack
    * @param {string|object} handler - class or class name to be removed
    **/
  clear(handler = undefined) {
    if(handler === undefined) {
      console.log(`${this.name} clears all handlers`);
      this.#stack = [];
    } else {
      if(typeof handler == 'function' || typeof handler == 'object') {
        handler = handler.name;
      };
      console.log(`${this.name} removes handler ${handler}`);
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
    console.log(`${this.name} invokes handler with data:`, data);
    return new Promise((resolve, reject) => {
      // Load data
      this.load(data).then((data) => {
        // Sequentially resolve promises
        resolve(this.#stack.reduce((result, handlerClass) => {
          return result.then((data) => {
            let instance = new handlerClass(data);
            return instance.handler(this.data[handlerClass.name.toLowerCase()], request, response);
          }).catch((error) => {
            reject(error);
          });
        }, Promise.resolve(this.data, request, response)));
      }).catch((error) => {
        reject(error);
      });
    });
  };
  /** @function use(handler)
    * Adds a handler to the stack
    * @param {object} handler
    **/
  use(handler) {
    console.log(`${this.name} uses module ${handler.name}`);
    this.#stack.push(handler);
  };
};
