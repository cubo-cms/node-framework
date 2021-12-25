/** @package        @cubo-cms/node-framework
  * @module         /lib/Handler/Model.mjs
  * @version        0.5.39
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Model extends Namespace.Handler {
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
          log.info({ message: `${this.name} returns success`, source: this.name, payload: response });
          // Resolve response
          resolve(response);
        }).catch((error) => {
          log.info({ message: `${this.name} returns failure`, source: this.name, payload: error });
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
    return this.caller;
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

  /** @function handler(request,response)
  * Invokes model handler and returns processed data
  * @param {object} request - requested data to be processed
  * @param {object} response - data returned back to server
  * @return {object} - data returned to controller
    **/
  handler(request, response) {
    return new Promise((resolve, reject) => {
      // Load accepted methods
      this.method = {...this.constructor.method, ...this.method};
      // Load data from controller
      Object.assign(this.data, this.controller.data);
      console.log('Model data:',this.data);
      // Invoke current method
      let method = this.get('method');
      if(method) {
        if(typeof this.method[method] === 'function') {
          log.info({ message: `${this.name} invokes method \"${method}\"`, source: this.name });
          method = this.method[method].bind(this);
          resolve(Namespace.JResponse.success({ data: method() }));
        } else {
          log.warning({ message: `${this.name} fails to invoke method \"${method}\"`, source: this.name });
          reject(Namespace.JResponse.respond('notAllowed', { header: { Allow: Object.keys(this.method).join(', ').toUpperCase() } }, this.name));
        }
      } else {
        log.warning({ message: `${this.name} cannot determine method`, source: this.name });
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
    data['driver'] = data['driver'] || this.get('driver');
    data['page'] = data['page'] || Model.parseInt(this.get('page'));
    data['pageSize'] = data['pageSize'] || Model.parseInt(this.get('pageSize'));
    data['show'] = data['show'] || Model.parseArray(this.get('show'));
    data['hide'] = data['hide'] || Model.parseArray(this.get('hide'));
    data['sort'] = data['sort'] || Model.parseArray(this.get('sort'));
    // Pass all these on when constructing driver
    data['query'] = query;
    return data;
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
