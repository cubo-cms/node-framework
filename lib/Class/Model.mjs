/** @package        @cubo-cms/node-framework
  * @module         /lib/Class/Model.mjs
  * @version        0.4.36
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Model extends Namespace.Class {
  /** @property {object} default - holds default values
    **/
  default = {
    driver: 'JSON',
    documentStatus: 'published',
    page: 1,
    pageSize: 100,
    show: ['id', 'name', 'description', 'introText', 'text', 'metadata', 'category', 'tags'],
    hide: ['_id','password'],
    sort: ['name', 'up']
  }
  /** @property {object} method - holds model methods
    **/
  method = {
    /** @method get()
      * Performs get method
      * @return {Promise <object>}
      **/
    get: function() {
      return new Promise((resolve, reject) => {
        // Invoke the driver
        Namespace.Driver.create(this.prepareData(), this).then((driver) => {
          // Invoke driver method
          return driver.invokeMethod();
        }).then((response) => {
          _log_.info({ message: `Model returns success`, source: this.name, payload: response });
          // Resolve response
          resolve(response);
        }).catch((error) => {
          _log_.info({ message: `Model returns failure`, source: this.name, payload: error });
          // Reject with error
          reject(error);
        });
      });
    }
  }

  /** @function controller()
    * Getter to retrieve the controller object
    * @return {object}
    **/
  get controller() {
    return this.calledBy;
  }
  /** @function dataSource()
    * Getter to retrieve the dataSource object
    * @return {object}
    **/
  get dataSource() {
    return this.controller.dataSource;
  }
  /** @function driver()
    * Getter to retrieve the driver
    * @return {object}
    **/
  get driver() {
    return this.dataSource.driver;
  }

  /** @function invokeMethod()
    * Invokes model method and returns processed data
    * @return {Promise <object>}
    **/
  invokeMethod() {
    return new Promise((resolve, reject) => {
      let method = this.get('method');
      if(method) {
        if(typeof this.method[method] === 'function') {
          _log_.info({ message: `Model invokes method \"${method}\"`, source: this.type });
          method = this.method[method].bind(this);
          resolve(method());
        } else {
          _log_.warning({ message: `Model fails to invoke method \"${method}\"`, source: this.type });
          reject(Namespace.JResponse.respond('notAllowed', { header: { Allow: Object.keys(this.method).join(', ').toUpperCase() } }, this.type));
        }
      } else {
        _log_.warning({ message: `Model cannot determine method`, source: this.type });
        reject(Namespace.JResponse.respond('notAllowed', { header: { Allow: Object.keys(this.method).join(', ').toUpperCase() } }, this.type));
      }
    });
  }
  /** @function prepareData()
    * Prepares and presets data to pass onto driver
    * @return {object}
    **/
  prepareData() {
    let data = {...this.data, ...this.dataSource};
    let query = this.get('query') || {};
    // Apply filter
    if(this.has('filter') && this.has('id')) {
      if(query[this.get('filter')]) {
        if(query[this.get('filter')].includes(this.get('id')))
          query[this.get('filter')] = [this.get('id')];
        else
          query[this.get('filter')] = [];
      } else {
        query[this.get('filter')] = [this.get('id')];
      }
      delete data['id'];
    }
    if(this.has('id'))
      query['id'] = [this.get('id')];
    // Fill in defaults, if not requested specifically
    data['driver'] = this.driver === undefined ? this.get('driver') : this.driver;
    data['page'] = Model.parseInt(this.get('page'));
    data['pageSize'] = Model.parseInt(this.get('pageSize'));
    data['show'] = Model.parseArray(this.get('show'));
    data['hide'] = Model.parseArray(this.get('hide'));
    data['sort'] = Model.parseArray(this.get('sort'));
    // Pass all these on when constructing driver
    data['query'] = query;
    return data;
  }

  /** @static @function create(data,caller)
    * Creates a new model and keeps track of creating instance
    * @param {object} data
    * @param {object} caller
    * @return {Promise <object>}
    **/
  static create(data = {}, caller = undefined) {
    return new Promise((resolve, reject) => {
      let instance;
      if(this.exists(data.dataType)) {
        instance = new Namespace[data.dataType](data);
        if(caller) _log_.debug({ message: `${caller.type} creates ${data.dataType} instance`, source: this.name, payload: data });
      } else {
        instance = new this(data);
        if(caller) _log_.debug({ message: `${caller.type} creates ${this.name} instance`, source: this.name, payload: data });
      }
      instance.calledBy = caller;
      instance.success(() => {
        resolve(instance);
      }).error((error) => {
        reject(error);
      });
    });
  }
  /** @static @function exists(dataType)
    * Returns true if the specified model exists in the namespace
    * @param {string} dataType
    * @return {boolean}
    **/
  static exists(dataType) {
    return Namespace.exists(dataType);
  }
  /** @static @function parseArray(data)
    * Returns array of properties or values
    * @param {string||array} data
    * @return {array}
    **/
  static parseArray(data) {
    if(!Array.isArray(data))
      if(data)
        return Array.from(data.matchAll(/([\w\-_]+)/g), m =>m[0]);
      else
        return undefined;
    else
      return data;
  }
  /** @static @function parseBool(data)
    * Returns true or false from value
    * @param {string||int||bool} data
    * @return {bool}
    **/
  static parseBool(data) {
    return data === 'true' || data;
  }
  /** @static @function parseInt(data)
    * Returns integer value
    * @param {string} data
    * @return {int}
    **/
  static parseInt(data) {
    if(data)
      return parseInt(data, 10);
    else
      return undefined;
  }
  /** @static @function parseString(data)
    * Returns string of property or value
    * @param {string} data
    * @return {string}
    **/
  static parseString(data) {
    if(typeof data === 'string')
      return data.match(/([\w\-_]+)/g)[0];
    else
      return undefined;
  }
}
