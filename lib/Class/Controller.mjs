/** @package        @cubo-cms/node-framework
  * @module         /lib/Class/Controller.mjs
  * @version        0.4.25
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../Namespace.mjs';

export default class Controller extends Namespace.Class {
  /** @property {object} method - holds controller methods
    **/
  method = {
    /** @method get()
      * Performs get method
      * @return {Promise <object>}
      **/
    get: function() {
      return new Promise((resolve, reject) => {
        // Limit access to documents according to user role
        let access = Namespace.Controller.access[this.session.get('userRole')];
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
    },
    /** @method put()
      * Performs put method
      * @return {Promise <object>}
      **/
    put: function() {
      return new Promise((resolve, reject) => {
        // Limit access to documents according to user role
        let access = Namespace.Controller.access[this.session.get('userRole')];
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
  }

  /** @function application()
    * Getter to retrieve the application object
    * @return {object}
    **/
  get application() {
    return this.calledBy;
  }
  /** @function dataSource()
    * Getter to retrieve the dataSource object
    * @return {object}
    **/
  get dataSource() {
    return this.application.dataSource.get(this.get('dataType'));
  }
  /** @function session()
    * Getter to retrieve the session object
    * @return {object}
    **/
  get session() {
    return _session_[this.get('sessionId')];
  }

  /** @function invokeMethod()
    * Invokes controller method and returns processed data
    * @return {Promise <object>}
    **/
  invokeMethod() {
    return new Promise((resolve, reject) => {
      let method = this.get('method');
      if(method) {
        if(typeof this.method[method] === 'function') {
          _log_.info({ message: `Controller invokes method \"${method}\"`, source: this.type });
          method = this.method[method].bind(this);
          resolve(method());
        } else {
          _log_.warning({ message: `Controller fails to invoke method \"${method}\"`, source: this.type });
          reject(Namespace.JResponse.respond('notAllowed', { header: { Allow: Object.keys(this.method).join(', ').toUpperCase() } }, this.type));
        }
      } else {
        _log_.warning({ message: `Controller cannot determine method`, source: this.type });
        reject(Namespace.JResponse.respond('notAllowed', { header: { Allow: Object.keys(this.method).join(', ').toUpperCase() } }, this.type));
      }
    });
  }

  /** @static @function create(data,caller)
    * Creates a new controller and keeps track of creating instance
    * @param {object} data
    * @param {object} caller
    * @return {Promise <object>}
    **/
  static create(data = {}, caller = undefined) {
    return new Promise((resolve, reject) => {
      let instance;
      if(this.exists(data.dataType)) {
        instance = new Namespace[data.dataType + this.name](data);
        if(caller) _log_.debug({ message: `${caller.type} creates ${data.dataType + this.name} instance`, source: this.name, payload: data });
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
  /** @static @function exists(dataType)
    * Returns true if the specified controller exists in the namespace
    * @param {string} dataType
    * @return {boolean}
    **/
  static exists(dataType) {
    return Namespace.exists(dataType + this.name);
  }
}
