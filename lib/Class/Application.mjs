/** @package        @cubo-cms/node-framework
  * @module         /lib/Class/Application.mjs
  * @version        0.4.24
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Class from '../Class.mjs';
import Controller from './Controller.mjs';
import Cookie from '../Helper/Cookie.mjs';
import JResponse from '../Helper/JResponse.mjs';
import Log from './Log.mjs';
import Router from './Router.mjs';
import Server from './Server.mjs';
import Session from './Session.mjs';

export default class Application extends Class {
  /** @property {object} default - holds defaults specific for this class
    **/
  default = {
  };
  /** @private @property {function} controller - function to be used as controller
    **/
  #controller = this.invokeController;
  /** @private @property {function} router - function to be used to process routes
    **/
  #router = this.invokeRouter;

  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = '#/application.json') {
    super(data);
  }

  /** @function controller()
    * Getter to retrieve the controller
    * @return {function}
    **/
  get controller() {
    return this.#controller;
  }
  /** @function controller(controller)
    * Setter to store the controller
    * @param {object} controller - the function that acts as controller
    * @return {string}
    **/
  set controller(controller = undefined) {
    return this.#controller = controller;
  }
  /** @function router()
    * Getter to retrieve the router
    * @return {function}
    **/
  get router() {
    return this.#router;
  }
  /** @function router(router)
    * Setter to store the router
    * @param {object} router - the function that processes routes
    * @return {string}
    **/
  set router(router = undefined) {
    return this.#router = router;
  }

  /** @function getSession(accessToken,cookie)
    * Creates or retrieves session from optional accessToken
    * @param {string} accessToken
    * @param {object} cookie
    * @return {object} - session object
    **/
  getSession(accessToken = undefined, cookie) {
    let session;
    if(accessToken) {
      if(session = Session.find(accessToken))
        session.setLifetime();
    }
    if(session === undefined) {
      if(session = Session.get(cookie.sessionId))
        session.setLifetime();
      else
        session = new Session(cookie);
    }
    return session;
  }
  /** @function invokeController(data)
    * Invokes controller
    * @param {object} data - data passed to controller
    * @return {Promise <object>}
    **/
  invokeController(data) {
    Log.info({ message: `Application invokes Controller`, source: this.type });
    return new Promise((resolve, reject) => {
      Controller.create(data, this).then((controller) => {
        resolve(JResponse.success(controller.data, this.type));
      }).catch((error) => {
        // Pass back error to parent promise
        reject(error);
      });
    }).catch((error) => {
      // Generate JSON response from error
      errorResponse = JResponse.error(error, this.type);
      Log.info({ message: `Error generated`, source: this.type, payload: errorResponse });
      reject(JResponse.error(error, this.type));
    });
  }
  /** @function invokeMethod(data)
    * Invokes controller method
    * @param {object} data - data passed to method
    * @return {Promise <object>}
    **/
  invokeMethod(controller) {
    Log.info({ message: `Application invokes Controller method`, source: this.type });
    return new Promise((resolve, reject) => {
      resolve(this.controller(data));
    });
  }
  /** @function invokeRouter(data)
    * Invokes router
    * @param {object} data - data passed to router
    * @return {Promise <object>}
    **/
  invokeRouter(data) {
    Log.info({ message: `Application invokes Router`, source: this.type });
    let cookie;
    let session;
    return new Promise((resolve, reject) => {
      // Create router instance
      Router.create(this.get('router'), this).then((router) => {
        // Retrieve cookies
        cookie = Cookie.unserialize(data.headers['cookie']);
        data.sessionId = cookie.sessionId || Session.generateKey();
        // Let router parse request
        router.parse(data).then((data) => {
          // Create or retrieve session before invoking controller
          session = this.getSession(data.accessToken, cookie);
          // Invoke controller
          this.controller(data).then((data) => {
            // SessionID may have changed; update accessToken
            data.sessionId = session.get('sessionId', data.sessionId);
            data.data = {...data};    // **** TEMPORARY
            resolve(JResponse.success(data, this.type));
          }).catch((error) => {
            // Pass back error to parent promise
            reject(error);
          });
        }).catch((error) => {
          // Pass back error to parent promise
          reject(error);
        });
      }).catch((error) => {
        // Generate JSON response from error
        errorResponse = JResponse.error(error, this.type);
        Log.info({ message: `Error generated`, source: this.type, payload: errorResponse });
        reject(JResponse.error(error, this.type));
      });
    });
  }

  server(data = this.data.server) {
    // Apply log settings
    Object.assign(Log.default, this.get('log'));
    // Start the server
    return this.data.server = new Server(data)
      .success((server) => {
        server.calledBy = this;
        server.listen(this.router.bind(this));
        Log.success({ message: `Application '${this.get('name')}' starts`, source: this.type });
      }).error((error) => {
        Log.error(error);
      });
  };
}
