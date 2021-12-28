/** Handler module {Controller} retrieves the data source, and checks whether the data source is implemented.
  * Depending on the request method and the data source parameters, the handler also checks whether the user
  * has sufficient privileges to perform the method.
  *
  * @package        @cubo-cms/node-framework
  * @module         /lib/Handler/Controller.mjs
  * @version        0.5.40
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Controller extends Namespace.Handler {
  /** @static @property {object} default - holds defaults specific for this class
    **/
  static default = {
    session: {
      user: 'nobody',         // default user
      userRole: 'guest'       // default user role
    }
  }
  /** @static @property {object} methods - holds default accepted methods
    **/
  static method = {
    /** @method delete()
      * Performs patch method
      * @return {Promise <object>}
      **/
    delete: function() {
      return new Promise((resolve, reject) => {
        // Load dataSource
        Namespace.JLoader.load(this.get('dataSource')).then((dataSource) => {
          if(dataSource[this.get('dataType')] == undefined) {
            reject(Namespace.JResponse.respond('notAcceptable', { message: `Data type ${this.get('dataType')} is not implemented` }, this.name));
          } else if(this.get('user') == 'nobody') {
            reject(Namespace.JResponse.respond('unauthenticated', { message: `This method requires authentication` }, this.name));
          } else if(dataSource.readOnly || dataSource.systemOnly) {
            reject(Namespace.JResponse.respond('forbidden', { message: `This method is forbidden for ${this.get('user')}` }, this.name));
          } else {
            // Resolve data
            resolve(Namespace.JResponse.success({ data: { dataSource: dataSource[this.get('dataType')] }}, this.name));
          }
        }).catch((error) => {
          reject(error);
        });
      });
    },
    /** @method get()
      * Performs get method
      * @return {Promise <object>}
      **/
    get: function() {
      return new Promise((resolve, reject) => {
        // Load dataSource
        Namespace.JLoader.load(this.get('dataSource')).then((dataSource) => {
          if(dataSource[this.get('dataType')] == undefined) {
            reject(Namespace.JResponse.respond('notAcceptable', { message: `Data type ${this.get('dataType')} is not implemented` }, this.name));
          } else if(dataSource.systemOnly) {
            reject(Namespace.JResponse.respond('forbidden', { message: `This method is forbidden for ${this.get('user')}` }, this.name));
          } else {
            // Resolve data
            resolve(Namespace.JResponse.success({ data: { dataSource: dataSource[this.get('dataType')] }}, this.name));
          }
        }).catch((error) => {
          reject(error);
        });
      });
    },
    /** @method patch()
      * Performs patch method
      * @return {Promise <object>}
      **/
    patch: function() {
      return new Promise((resolve, reject) => {
        // Load dataSource
        Namespace.JLoader.load(this.get('dataSource')).then((dataSource) => {
          if(dataSource[this.get('dataType')] == undefined) {
            reject(Namespace.JResponse.respond('notAcceptable', { message: `Data type ${this.get('dataType')} is not implemented` }, this.name));
          } else if(this.get('user') == 'nobody') {
            reject(Namespace.JResponse.respond('unauthenticated', { message: `This method requires authentication` }, this.name));
          } else if(dataSource.readOnly || dataSource.systemOnly) {
            reject(Namespace.JResponse.respond('forbidden', { message: `This method is forbidden for ${this.get('user')}` }, this.name));
          } else {
            // Resolve data
            resolve(Namespace.JResponse.success({ data: { dataSource: dataSource[this.get('dataType')] }}, this.name));
          }
        }).catch((error) => {
          reject(error);
        });
      });
    },
    /** @method post()
      * Performs post method
      * @return {Promise <object>}
      **/
    post: function() {
      return new Promise((resolve, reject) => {
        // Load dataSource
        Namespace.JLoader.load(this.get('dataSource')).then((dataSource) => {
          if(dataSource[this.get('dataType')] == undefined) {
            reject(Namespace.JResponse.respond('notAcceptable', { message: `Data type ${this.get('dataType')} is not implemented` }, this.name));
          } else if(this.get('user') == 'nobody') {
            reject(Namespace.JResponse.respond('unauthenticated', { message: `This method requires authentication` }, this.name));
          } else if(dataSource.readOnly || dataSource.systemOnly) {
            reject(Namespace.JResponse.respond('forbidden', { message: `This method is forbidden for ${this.get('user')}` }, this.name));
          } else {
            // Resolve data
            resolve(Namespace.JResponse.success({ data: { dataSource: dataSource[this.get('dataType')] }}, this.name));
          }
        }).catch((error) => {
          reject(error);
        });
      });
    },
    /** @method put()
      * Performs put method
      * @return {Promise <object>}
      **/
    put: function() {
      return new Promise((resolve, reject) => {
        // Load dataSource
        Namespace.JLoader.load(this.get('dataSource')).then((dataSource) => {
          if(dataSource[this.get('dataType')] == undefined) {
            reject(Namespace.JResponse.respond('notAcceptable', { message: `Data source for "${this.get('dataType')}" is not implemented` }, this.name));
          } else if(this.get('user') == 'nobody') {
            reject(Namespace.JResponse.respond('unauthenticated', { message: `This method requires authentication` }, this.name));
          } else if(dataSource.readOnly || dataSource.systemOnly) {
            reject(Namespace.JResponse.respond('forbidden', { message: `This method is forbidden for ${this.get('user')}` }, this.name));
          } else {
            // Resolve data
            resolve(Namespace.JResponse.success({ data: { dataSource: dataSource[this.get('dataType')] }}, this.name));
          }
        }).catch((error) => {
          reject(error);
        });
      });
    }
  }
  /** @static @property {object} stack - holds handlers specific for this class
    **/
  static stack = [ 'Access', 'Model' ]

  /** @property {object} method - holds a collection of accepted methods
    **/
  method = {}

  /** @function handler(request,response,data)
    * Invokes controller handler and returns processed data
    * @param {object} request - original server request
    * @param {object} response - server response
    * @param {object} data - data passed on to handler
    * @return {object} - data returned
    **/
  handler(request, response, data) {
    return new Promise((resolve, reject) => {
      // Load accepted methods
      this.method = {...this.constructor.method, ...this.method};
      // Invoke current method
      response.setHeader('Allow', Object.keys(this.constructor.method).join(', ').toUpperCase());
      if(data.method && typeof this.method[data.method] === 'function') {
        log.info({ message: `${this.name} invokes method \"${data.method}\"`, source: this.name });
        // Bind this object to the method before calling it
        let method = this.method[data.method].bind(this);
        resolve(method());
      } else {
        log.warning({ message: `${this.name} fails to invoke method \"${data.method}\"`, source: this.name });
        reject(Namespace.JResponse.respond('notAcceptable', { message: `This method is not allowed` }, this.name));
      }
    });
  }
};
