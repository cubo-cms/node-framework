/** @package        @cubo-cms/node-framework
  * @module         /lib/Helper/Cookie.mjs
  * @version        0.4.31
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

export default class Cookie {
  /** @static @function serialize(data)
    * Converts object to cookie string
    * @param {object} data
    * @return {string}
    **/
  static serialize(data) {
    let crumbs = [];
    for(let property of Object.keys(data)) {
      crumbs.push(property + (data[property] && data[property] !== true ? '=' + data[property] : ''));
    }
    return crumbs.join('; ');
  }
  /** @static @function unserialize(data)
    * Converts cookie string to object
    * @param {string} data
    * @return {object}
    **/
  static unserialize(data = '') {
    let crumbs = {};
    for(let crumb of data.split('; ')) {
      if(crumb) {
        let [property, value] = crumb.split('=', 2);
        crumbs[property] = value;
      }
    }
    return crumbs;
  }
}
