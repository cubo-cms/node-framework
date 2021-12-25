/** @package        @cubo-cms/node-framework
  * @module         /lib/Handler/Driver.mjs
  * @version        0.5.39
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Driver extends Namespace.Handler {
  /** @property {object} method - holds driver methods
    **/
  method = {
  }

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
    * @param {string} dataType - optional dataType prepended; will take it from data if it exists
    * @return {Promise <object>}
    **/
  static create(data = {}, caller = undefined, prefix = undefined) {
    return super.create(data, caller, caller.get('dataDriver'));
  }

  /** @function handler(request,response)
    * Invokes driver handler and returns processed data
    * @param {object} request - requested data to be processed
    * @param {object} response - data returned back to server
    * @return {Promise <object>}
    **/
  handler(request, response) {
    console.log('Driver.data',this.data);
    return new Promise((resolve, reject) => {
      // Load accepted methods
      this.method = {...this.constructor.method, ...this.method};
      // Load data from model
      Object.assign(this.data, this.model.data);
      // Invoke current method
      let method = this.get('method');
      if(method) {
        if(typeof this.method[method] === 'function') {
          log.info({ message: `${this.name} invokes method \"${method}\"`, source: this.name });
          method = this.method[method].bind(this);
          resolve(method());
        } else {
          log.warning({ message: `${this.name} fails to invoke method \"${method}\"`, source: this.name });
          reject(Namespace.JResponse.respond('notAllowed', { header: { Allow: Object.keys(this.method).join(', ').toUpperCase() } }, this.type));
        }
      } else {
        log.warning({ message: `${this.name} cannot determine method`, source: this.name });
        reject(Namespace.JResponse.respond('notAllowed', { header: { Allow: Object.keys(this.method).join(', ').toUpperCase() } }, this.type));
      }
    });
  }
}
