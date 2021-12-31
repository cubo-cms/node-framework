/** @package        @cubo-cms/node-framework
  * @module         /lib/Handler/Driver.mjs
  * @version        0.5.40
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Driver extends Namespace.Handler {
  /** @static @property {object} default - holds default values for this class
    **/
  static default = {
    dataDriver: 'JSON'
  }
  /** @static @property {object} operation - holds default accepted operations
    **/
  static operation = {}

  /** @property {object} operation - holds a collection of accepted operations
    **/
  operation = {}

  /** @function model()
    * Getter to retrieve the model object
    * @return {object}
    **/
  get model() {
    return this.caller;
  }

  /** @static @function create(data,caller,prefix)
    * Creates a new instance, after loading data, and remembers caller
    * @param {string|object} data
    * @param {object} caller
    * @param {string} prefix - optional prefix prepended; to allow for override
    * @return {Promise <object>}
    **/
  static create(data = {}, caller = undefined, prefix = this.default.dataDriver) {
    return super.create(data, caller, caller.data.dataSource.dataDriver || this.default.dataDriver);
  }

  /** @function handler(request,response,data)
    * Invokes driver handler and returns processed data
    * @param {object} request - original server request
    * @param {object} response - server response
    * @param {object} data - data passed on to handler
    * @return {object} - data returned
    **/
  handler(request, response, data) {
    return new Promise((resolve, reject) => {
      // Load accepted operations
      this.operation = {...this.constructor.operation, ...this.operation};
      // Invoke current operation
      if(data.operation && typeof this.operation[data.operation] === 'function') {
        log.info({ message: `${this.name} invokes operation \"${data.operation}\"`, source: this.name });
        // Bind this object to the operation before calling it
        let operation = this.operation[data.operation].bind(this);
        resolve(operation(data));
      } else {
        log.warning({ message: `${this.name} fails to invoke operation \"${data.operation}\"`, source: this.name });
        reject(Namespace.JResponse.respond('notAcceptable', { message: `This operation is not allowed` }, this.name));
      }
    });
  }
}
