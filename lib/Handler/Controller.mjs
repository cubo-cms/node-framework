/** @package        @cubo-cms/node-framework
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
      data: {
        user: 'nobody',         // default user
        userRole: 'guest'       // default user role
      }
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

  /** @function application()
    * Getter to retrieve the application instance
    * @return {object}
    **/
  get application() {
    return this.caller;
  }

  /** @function handler(request,response)
    * Invokes controller handler and returns processed data
    * @param {object} request - requested data to be processed
    * @param {object} response - data returned back to server
    * @return {object} - data returned to application
    **/
  handler(request, response) {
    return new Promise((resolve, reject) => {
      // Load accepted methods
      this.method = {...this.constructor.method, ...this.method};
      // Load data from application
      Object.assign(this.data, this.application.data);
      // Invoke current method
      let method = this.get('method');
      response.setHeader('Allow', Object.keys(this.constructor.method).join(', ').toUpperCase());
      if(method && typeof this.method[method] === 'function') {
        log.info({ message: `${this.name} invokes method \"${method}\"`, source: this.name });
        method = this.method[method].bind(this);
        resolve(method());
      } else {
        log.warning({ message: `${this.name} fails to invoke method \"${method}\"`, source: this.name });
        reject(Namespace.JResponse.respond('notAllowed', { message: `This method is not allowed` }, this.name));
      }
    });
  }
  /** @function session()
    * Retrieves data of current session
    * @return {<object>}
    **/
  session() {
    if(!Namespace['Session']) return this.constructor.default;
    return Namespace.Session.get(this.get('sessionId'));
  }
};
