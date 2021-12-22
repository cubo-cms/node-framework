/** Helper module {JLoader} providing methods to load JSON data
  * into an object from a JSON string, a JSON file, a URL returning JSON,
  * or another object.
  *
  * @package        @cubo-cms/node-framework
  * @module         /lib/Helper/JLoader.mjs
  * @version        0.5.39
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import JResponse from './JResponse.mjs';
import Loader from './Loader.mjs';

export default class JLoader extends Loader {
  /** @static @function load(data)
    * Loads data and returns it as an object
    * @param {string|object} data
    * @return {Promise <object>}
    **/
  static load(data = {}) {
    return new Promise((resolve, reject) => {
      if(typeof data === 'string') {
        Loader.load(data).then((data) => {
          console.log(data);
          try {
            // Try to parse it as JSON and resolve it as an object
            resolve(JSON.parse(data));
          } catch(error) {
            reject(JResponse.error({ message: `Incorrect data`, payload: error }, this.name));
          }
        }).catch((error) => {
          reject(error);
        });
      } else {
        // This should already be an object; pass back as is
        resolve(data);
      }
    });
  }
}
