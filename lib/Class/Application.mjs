/** @package        @cubo-cms/node-framework
  * @module         /lib/Class/Application.mjs
  * @version        0.4.24
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Class from '../Class.mjs';
import Controller from './Controller.mjs';
import Log from './Log.mjs';
import Router from './Router.mjs';
import Server from './Server.mjs';

export default class Application extends Class {
  /** @property {object} default - holds defaults specific for this class
    **/
  default = {
  };
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
    Log.info({ message: `Application invokes controller`, type: 'info', source: this.type });
    return new Promise((resolve, reject) => {
      return Controller.create(data, this);
    }).then((controller) => {
      resolve(controller.data);
    }).catch((error) => {
      reject(error);
    });
  }

  invokeRouter(data) {
    Log.info({ message: `Application invokes router`, type: 'info', source: this.type });
    return new Promise((resolve, reject) => {
      // The magic comes here
      new Router(this.get('router'))
        .success((router) => {
          router.parse(data).then((data) => {
            return this.invokeController(data);
          }).catch((error) => {
            reject(error);
          });
        }).error((error) => {
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
