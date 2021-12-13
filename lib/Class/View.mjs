/** @package        @cubo-cms/node-framework
  * @module         /lib/Class/View.mjs
  * @version        0.4.33
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class View extends Namespace.Class {
  /** @property {object} default - holds default values
    **/
  default = {
    render: 'html';
  }
  /** @property {object} render - holds view render methods
    **/
  render = {
    /** @method html()
      * Performs html render
      * @return {Promise <object>}
      **/
    html: function() {
      return new Promise((resolve, reject) => {
        this.set('contentType', 'text/html');
        resolve(this.data);
      });
    /** @method json()
      * Performs json render
      * @return {Promise <object>}
      **/
    json: function() {
      return new Promise((resolve, reject) => {
        this.set('contentType', 'application/json; charset=utf-8');
        resolve(this.data);
      });
    /** @method json-pretty()
      * Performs json-pretty render
      * @return {Promise <object>}
      **/
    "json-pretty": function() {
      return new Promise((resolve, reject) => {
        resolve(Namespace.JResponse.success({ contentType: 'application/json; charset=utf-8', data: JSON.stringify(this.get('data'), null, 2), sessionId: this.get('sessionId') }));
      });
    }
  }

  /** @static @function create(data,caller)
    * Creates a new view and keeps track of creating instance
    * @param {object} data
    * @param {object} caller
    * @return {Promise <object>}
    **/
  static create(data = {}, caller = undefined) {
    return new Promise((resolve, reject) => {
      let instance;
      if(this.exists(data.dataType)) {
        instance = new Namespace[data.dataType + this.name](data);
      } else {
        instance = new this(data);
      }
      if(caller)
        Namespace.Log.info({ message: `${caller.name} creates ${instance.name} instance`, source: instance.name, payload: data });
      instance.caller = caller;
      instance.success(() => {
        resolve(instance);
      }).error((error) => {
        reject(error);
      });
    });
  }
  /** @static @function exists(dataType)
    * Returns true if the specified view exists in the namespace
    * @param {string} dataType
    * @return {boolean}
    **/
  static exists(dataType) {
    return Namespace.exists(dataType + this.name);
  }
}
