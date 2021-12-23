/** @package        @cubo-cms/node-framework
  * @module         /lib/Handler/Controller.mjs
  * @version        0.5.39
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Handler from '../Handler.mjs';
import Namespace from '../../Namespace.mjs';

export default class Controller extends Handler {
  /** @static @property {object} access - limits access to documents
    **/
  static access = {
    guest: {
      view: { accessLevel: ['public','private','unauthenticated'], documentStatus: ['published'] },
      list: { accessLevel: ['public','unauthenticated'], documentStatus: ['published'] }
    },
    user: {
      view: { accessLevel: ['public','private','authenticated'], documentStatus: ['published'] },
      list: { accessLevel: ['public','authenticated'], documentStatus: ['published'] }
    },
    author: {
      view: { accessLevel: ['public','private','authenticated'], documentStatus: ['published','unpublished'] },
      list: { accessLevel: ['public','authenticated'], documentStatus: ['published','unpublished'] }
    },
    editor: {
      view: { accessLevel: ['public','private','authenticated'], documentStatus: ['published','unpublished'] },
      list: { accessLevel: ['public','authenticated'], documentStatus: ['published','unpublished'] }
    },
    publisher: {
      view: { accessLevel: ['public','private','authenticated','unauthenticated'], documentStatus: ['published','unpublished','archived','trashed'] },
      list: { accessLevel: ['public','private','authenticated','unauthenticated'], documentStatus: ['published','unpublished','archived','trashed'] }
    },
    manager: {
      view: { accessLevel: ['public','private','authenticated','unauthenticated'], documentStatus: ['published','unpublished','archived','trashed'] },
      list: { accessLevel: ['public','private','authenticated','unauthenticated'], documentStatus: ['published','unpublished','archived','trashed'] }
    },
    administrator: {
      view: { accessLevel: ['public','private','authenticated','unauthenticated','system'], documentStatus: ['published','unpublished','archived','trashed'] },
      list: { accessLevel: ['public','private','authenticated','unauthenticated','system'], documentStatus: ['published','unpublished','archived','trashed'] }
    },
    canCreate: ['author','editor','publisher','manager','administrator']
  };
  /** @static @property {object} methods - holds default accepted methods
    **/
  static method = {
    /** @method get()
      * Performs get method
      * @return {Promise <object>}
      **/
    get: function() {
      return new Promise((resolve, reject) => {
        // Limit access to documents according to user role
        let access = Controller.access[this.session.get('userRole')];
        // Invoke the model
        Namespace.Model.create(this.data, this).then((model) => {
          // Invoke model method
          return model.invokeMethod();
        }).then((response) => {
          // Merge controller data (remoteAddress and sessionId)
          Object.assign(response, this.data);
          // Invoke the view
          return Namespace.View.create(response, this);
        }).then((view) => {
          // Invoke view render method
          return view.invokeRender();
        }).then((response) => {
          // Resolve data
          resolve(response);
        }).catch((error) => {
          // Add session id to error
          error.sessionId = this.session.get('sessionId');
          // Reject with error
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
        // Limit access to documents according to user role
        let access = Controller.access[this.session.get('userRole')];
        // Invoke the model
        Namespace.Model.create(this.data, this).then((model) => {
          // Invoke model method
          return model.invokeMethod();
        }).then((response) => {
          resolve(response);
        }).catch((error) => {
          // Add session id to error
          //error.sessionId = this.session.get('sessionId');
          // Reject with error
          reject(error);
        });
      });
    }
  }

  /** @property {object} method - holds a collection of accepted methods
    **/
  method = {};

  /** @function handler(data,request,response)
    * Invokes controller handler and returns processed data
    * @param {object} data
    * @param {object} request
    * @param {object} response
    * @return {Promise <object>}
    **/
  handler(data = {}, request, response) {
    return new Promise((resolve, reject) => {
      // Load accepted methods
      this.method = {...this.constructor.method, ...this.method};
      // Invoke current method
      let method = this.get('method');
      if(method) {
        if(typeof this.method[method] === 'function') {
          log.info({ message: `${this.name} invokes method \"${method}\"`, source: this.name });
          method = this.method[method].bind(this);
          resolve(method());
        } else {
          log.warning({ message: `${this.name} fails to invoke method \"${method}\"`, source: this.name });
          reject(Namespace.JResponse.respond('notAllowed', { header: { Allow: Object.keys(this.method).join(', ').toUpperCase() } }, this.name));
        }
      } else {
        log.warning({ message: `${this.name} cannot determine method`, source: this.type });
        reject(Namespace.JResponse.respond('notAllowed', { header: { Allow: Object.keys(this.method).join(', ').toUpperCase() } }, this.name));
      }
    });
  }
};
