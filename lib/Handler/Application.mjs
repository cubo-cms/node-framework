/** Application module is the main entry point to start an application. It
  * automatically calls the server to start listening for requests.
  *
  * @package        @cubo-cms/node-framework
  * @module         /lib/Handler/Application.mjs
  * @version        0.5.39
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Controller from './Controller.mjs';
import Handler from '../Handler.mjs';
import Logger from '../Class/Logger.mjs';
import Router from './Router.mjs';
import Server from '../Class/Server.mjs';

export default class Application extends Handler {
  static default = {
    name: 'Cubo',
    title: 'Cubo Application',
    description: 'This application runs with the default configuration.',
    dataSource: '$/.config/dataSource.json'
  };
  static stack = [ Router, Controller ];

  /** @function server(data)
    * Calls server to start listening to requests
    * @param {object} data - data to be passed to application
    * @return {Promise <object>}
    **/
  server(data = {}) {
    return new Promise((resolve, reject) => {
      // Load data
      this.load(data).then((data) => {
        return Logger.create(this.data['log'], this);
      }).then((logger) => {
        // Keep as global, so it can be used anywhere
        global.log = logger;
        // Call server to listen for requests
        return Server.create(this.data, this);
      }).then((server) => {
        resolve(server.listen(this.data['server']));
      }).catch((error) => {
        if(global.log)
          log.error(error);
        else
          console.error(error);
      });
    });
  }
}
