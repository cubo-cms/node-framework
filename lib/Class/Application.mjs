/** @package        @cubo-cms/node-framework
  * @module         /lib/Class/Application.mjs
  * @version        0.4.30
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Application extends Namespace.Class {
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

  /** @function getSessionId(accessToken,sessionId)
    * Creates or retrieves session from optional accessToken and returns sessionId
    * @param {string} accessToken
    * @param {string} sessionId
    * @return {string} - final sessionId
    **/
  getSessionId(accessToken = undefined, sessionId) {
    let session;
    if(accessToken) {
      if(session = Namespace.Session.find(accessToken)) {
        session.setLifetime();
        return session.get('sessionId');
      }
    }
    if(session = Namespace.Session.get(sessionId)) {
      session.setLifetime();
      return session.get('sessionId');
    } else {
      session = new Namespace.Session({ sessionId: sessionId });
      return sessionId;
    }
  }
  /** @function invokeController(data)
    * Invokes controller
    * @param {object} data - data passed to controller
    * @return {Promise <object>}
    **/
  invokeController(data) {
    _log_.info({ message: `Application invokes Controller`, source: this.type });
    return new Promise((resolve, reject) => {
      Namespace.Controller.create(data, this).then((controller) => {
        return controller.invokeMethod();
      }).then((data) => {
        // Generate JSON response from data
        resolve(Namespace.JResponse.success(data, this.type));
      }).catch((error) => {
        // Generate JSON response from error
        reject(Namespace.JResponse.error(error, this.type));
      });
    });
  }
  /** @function invokeRouter(data)
    * Invokes router
    * @param {object} data - data passed to router
    * @return {Promise <object>}
    **/
  invokeRouter(data) {
    _log_.info({ message: `Application invokes Router`, source: this.type });
    return new Promise((resolve, reject) => {
      // Collect start time
      let startedAt = Date.now();
      // Create router instance
      Namespace.Router.create(this.get('router'), this).then((router) => {
        // Retrieve cookie and preset sessionId
        data.sessionId = Namespace.Cookie.unserialize(data.headers['cookie']) || Namespace.Session.generateKey();
        // Store start time
        data.startedAt = startedAt;
        // Let router parse request
        return router.parse(data);
      }).then((data) => {
        // Retrieve sessionId considering accessToken
        data.data.sessionId = this.getSessionId(data.data.accessToken, data.data.sessionId);
        // Invoke controller
        return this.controller(data.data);
      }).then((data) => {
        // Store finish time
        data.finishedAt = Date.now();
        // Generate JSON response from result
        resolve(Namespace.JResponse.success(data, this.type));
      }).catch((error) => {
        // Store finish time
        error.finishedAt = Date.now();
        // Generate JSON response from error
        reject(Namespace.JResponse.error(error, this.type));
      });
    });
  }

  server(data = this.data.server) {
    // Apply log settings
    if(!global._log_) global._log_ = this.log = new Namespace.Log(this.get('log'));
    // Load datasources
    this.dataSource = new Namespace.DataSource(this.get('dataSource'));
    // Start the server
    return this.data.server = new Namespace.Server(data)
      .success((server) => {
        server.calledBy = this;
        server.listen(this.router.bind(this));
        _log_.success({ message: `Application '${this.get('name')}' starts`, source: this.type });
      }).error((error) => {
        _log_.error(error);
      });
  };
}
