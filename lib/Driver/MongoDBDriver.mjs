/** @package        @cubo-cms/node-framework
  * @module         /lib/Driver/JSONDriver.mjs
  * @version        0.4.30
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

/** @property {object} method - holds driver methods specific for JSONDriver
  * NOTE: These methods will override any generic methods
  **/
const method = {
}

export default class JSONDriver extends Namespace.Driver {
  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    super(data);
    Object.assign(this.method, method);
  }
}
