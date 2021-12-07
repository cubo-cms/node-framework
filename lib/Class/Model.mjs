/** @package        @cubo-cms/node-framework
  * @module         /lib/Class/Model.mjs
  * @version        0.4.24
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../Namespace.mjs';

export default class Model extends Namespace.Class {
  /** @property {object} method - holds model methods
    **/
  method = {
    /** @method get()
      * Performs get method
      * @return {Promise <object>}
      **/
    get: function() {
      return new Promise((resolve, reject) => {
        // Invoke the driver
        Namespace.Driver.create(this.prepareData(), this).then((driver) => {
          // Invoke driver method
          return driver.invokeMethod();
        }).then((response) => {
          Namespace.Log.info({ message: `Model returns success`, source: this.name, payload: response });
          // Resolve response
          resolve(response);
        }).catch((error) => {
          Namespace.Log.info({ message: `Model returns failure`, source: this.name, payload: error });
          // Reject with error
          reject(error);
        });
      });
    }
  }

  /** @function invokeMethod()
    * Invokes model method and returns processed data
    * @return {Promise <object>}
    **/
  invokeMethod() {
    return new Promise((resolve, reject) => {
      let method = this.get('method');
      if(method) {
        if(typeof this.method[method] === 'function') {
          _log_.info({ message: `Model invokes method \"${method}\"`, source: this.type });
          method = this.method[method].bind(this);
          resolve(method());
        } else {
          _log_.warning({ message: `Model fails to invoke method \"${method}\"`, source: this.type });
          reject(Namespace.JResponse.respond('notAllowed', { header: { Allow: Object.keys(this.method).join(', ').toUpperCase() } }, this.type));
        }
      } else {
        _log_.warning({ message: `Model cannot determine method`, source: this.type });
        reject(Namespace.JResponse.respond('notAllowed', { header: { Allow: Object.keys(this.method).join(', ').toUpperCase() } }, this.type));
      }
    });
  }
}
