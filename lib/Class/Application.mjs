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

  invokeController(data) {
    Log.info({ message: `Application invokes Controller`, type: 'info', source: this.type });
    return new Promise((resolve, reject) => {
      Controller.create(data, this).then((controller) => {
        resolve(controller.data);
      }).catch((error) => {
        reject(error);
      });
    }).catch((error) => {
      reject(error);
    });
  }
  invokeRouter(data) {
    Log.info({ message: `Application invokes Router`, type: 'info', source: this.type });
    return new Promise((resolve, reject) => {
      Router.create(this.get('router'), this).then((router) => {
        router.parse(data).then((data) => {
          resolve(this.controller(data));
        }).catch((error) => {
          reject(error);
        });
      }).catch((error) => {
        reject(error);
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
        Log.success({ message: `Application '${this.get('name')}' starts`, type: 'success', source: this.type });
      }).error((error) => {
        Log.error(error);
      });
  };
  setRouter(router) {
    this.router = router;
  }
}
