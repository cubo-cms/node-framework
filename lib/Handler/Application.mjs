/** Application module is the main entry point to start an application. It
  * automatically calls the server to start listening for requests.
  *
  * @package        @cubo-cms/node-framework
  * @module         /lib/Handler/Application.mjs
  * @version        0.5.40
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Application extends Namespace.Handler {
  static default = {
    dataSource: '$/.config/dataSource.json'
  }
  /** @static @property {object} stack - holds handlers specific for this class
    **/
  static stack = [ 'Router', 'Session', 'Controller' ]

  /** @property {object} default - holds default values
    **/
  default = {
    name: 'Cubo',
    title: 'Cubo Application',
    description: 'This application runs with the default configuration.',
  }

  /** @function server(data)
    * Calls server to start listening to requests
    * @param {object} data - data to be passed to application
    * @return {Promise <object>}
    **/
  server(data = {}) {
    return new Promise((resolve, reject) => {
      // Load data
      this.load(data).then((data) => {
        return Namespace.Logger.create(this.get('log'), this);
      }).then((logger) => {
        // Keep as global, so it can be used anywhere
        global.log = logger;
        delete this.data['log'];
        // Call server to listen for requests
        return Namespace.Server.create(this.data, this);
      }).then((server) => {
        delete this.data['server'];
        resolve(server.listen(this.get('server')));
      }).catch((error) => {
        if(global.log)
          log.error(error);
        else
          console.error(error);
      });
    });
  }
}
