/** @package        @cubo-cms/node-framework
  * @module         /server.mjs
  * @version        0.4.29
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Cubo from './Namespace.mjs';
await Cubo.load();

const { Application } = Cubo;

new Application().error((error) => {
  console.error(error);
}).success((app) => {
  app.server();
});
