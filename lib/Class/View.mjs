/** @package        @cubo-cms/node-framework
  * @module         /lib/Class/View.mjs
  * @version        0.4.34
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class View extends Namespace.Class {
  /** @property {object} default - holds default values
    **/
  default = {
    render: 'html'
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
    },
    /** @method json()
      * Performs json render
      * @return {Promise <object>}
      **/
    json: function() {
      return new Promise((resolve, reject) => {
        this.set('contentType', 'application/json; charset=utf-8');
        resolve(this.data);
      });
    },
    /** @method json-pretty()
      * Performs json-pretty render
      * @return {Promise <object>}
      **/
    'json-pretty': function() {
      return new Promise((resolve, reject) => {
        resolve(Namespace.JResponse.success({ contentType: 'application/json; charset=utf-8', data: JSON.stringify(this.get('data'), null, 2), sessionId: this.get('sessionId') }));
      });
    }
  }

  /** @function invokeRender()
    * Invokes view render and returns processed data
    * @return {Promise <object>}
    **/
  invokeRender() {
    return new Promise((resolve, reject) => {
      let render = this.get('render');
      let response = this.data.data;
      if(render) {
        if(typeof this.render[render] === 'function') {
          _log_.info({ message: `View invokes render \"${render}\"`, source: this.name });
          if(response && response.text && (Namespace.JLoader.isPath(response.text) || Namespace.JLoader.isURL(response.text))) {
            Namespace.FileLoader.load(response.text)
              .then((text) => {
                //this.data.data.text = marked(text);
                render = this.render[render].bind(this);
                resolve(render());
              }).catch((error) => {
                reject(error);
              })
          } else {
            render = this.render[render].bind(this);
            resolve(render());
          }
        } else {
          _log_.warning({ message: `View fails to invoke render \"${render}\"`, source: this.type });
          reject(Namespace.JResponse.respond('notAcceptable', {}, this.type));
        }
      } else {
        _log_.warning({ message: `View cannot determine render`, source: this.type });
        reject(Namespace.JResponse.respond('notAcceptable', {}, this.type));
      }
    });
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
        if(caller) _log_.debug({ message: `${caller.type} creates ${data.dataType} instance`, source: this.name, payload: data });
      } else {
        instance = new this(data);
        if(caller) _log_.debug({ message: `${caller.type} creates ${this.name} instance`, source: this.name, payload: data });
      }
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
