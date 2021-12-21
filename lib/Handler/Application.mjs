/** @package        @cubo-cms/node-framework
  * @module         /lib/Handler/Application.mjs
  * @version        0.5.39
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Controller from './Controller.mjs';
import Handler from '../Handler.mjs';
import Router from './Router.mjs';
import Server from './Server.mjs';

export default class Application extends Handler {
  static default = {};
  static stack = [];

  constructor(data = '$/application.json') {
    super(data);
    this.use(Server);
  //  this.use(Router);
  //  this.use(Controller);
  }

  handler(request, response, data) {
    return super.handler(request, response, data);
  };
};
