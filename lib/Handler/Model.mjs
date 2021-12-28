/** Handler module {Model} prepares the data to perform the driver operation, and checks whether the operation
  * is allowed. Depending on the determined operation and the driver parameters, the handler also checks whether the user
  * has sufficient privileges to perform the operation.
  *
  * @package        @cubo-cms/node-framework
  * @module         /lib/Handler/Model.mjs
  * @version        0.5.40
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Model extends Namespace.Handler {
  /** @property {object} default - holds default values
    **/
  default = {
    dataDriver: 'JSON',
    documentStatus: 'published',
    page: 1,
    pageSize: 100,
    fields: ['id', 'name', 'description', 'introText', 'text', 'metadata', 'category', 'tags'],
    hideFields: ['_id','password'],
    sort: 'name'
  }
  /** @property {object} method - holds model methods
    **/
  method = {
    /** @method get(data)
      * Performs get method
      * @param {object} data - data passed on from handler
      * @return {Promise <object>}
      **/
    get: function(data) {
      return new Promise((resolve, reject) => {
        data = this.prepareData(data);
        if(data.isCollection) {
          data.operation = 'findMany';
        } else {
          data.operation = 'findOne';
        }
        resolve(Namespace.JResponse.success({ data: data }, this.name));
      });
    },
    /** @method patch(data)
      * Performs patch method
      * @param {object} data - data passed on from handler
      * @return {Promise <object>}
      **/
    patch: function(data) {
      return new Promise((resolve, reject) => {
        data = this.prepareData(data);
        if(data.isCollection) {
          reject(Namespace.JResponse.respond('notAcceptable', { message: `Cannot update multiple items` }, this.name));
        } else {
          data.operation = 'updateOne';
          resolve(Namespace.JResponse.success({ data: data }, this.name));
        }
      });
    },
    /** @method post(data)
      * Performs post method
      * @param {object} data - data passed on from handler
      * @return {Promise <object>}
      **/
    post: function(data) {
      return new Promise((resolve, reject) => {
        data = this.prepareData(data);
        if(data.isCollection) {
          reject(Namespace.JResponse.respond('notAcceptable', { message: `Cannot create multiple items` }, this.name));
        } else {
          data.operation = 'insertOne';
          resolve(Namespace.JResponse.success({ data: data }, this.name));
        }
      });
    },
    /** @method put(data)
      * Performs put method
      * @param {object} data - data passed on from handler
      * @return {Promise <object>}
      **/
    put: function(data) {
      return new Promise((resolve, reject) => {
        data = this.prepareData(data);
        if(data.isCollection) {
          reject(Namespace.JResponse.respond('notAcceptable', { message: `Cannot update multiple items` }, this.name));
        } else {
          data.operation = 'updateOne';
          resolve(Namespace.JResponse.success({ data: data }, this.name));
        }
      });
    }
  }
  /** @static @property {object} stack - holds handlers specific for this class
    **/
  static stack = [ 'Driver' ]

  /** @function handler(request,response,data)
    * Invokes controller handler and returns processed data
    * @param {object} request - original server request
    * @param {object} response - server response
    * @param {object} data - data passed on to handler
    * @return {object} - data returned
    **/
  handler(request, response, data) {
    return new Promise((resolve, reject) => {
      // Load accepted methods
      this.method = {...this.constructor.method, ...this.method};
      // Invoke current method
      if(data.method && typeof this.method[data.method] === 'function') {
        log.info({ message: `${this.name} invokes method \"${data.method}\"`, source: this.name });
        // Bind this object to the method before calling it
        let method = this.method[data.method].bind(this);
        resolve(method(data));
      } else {
        log.warning({ message: `${this.name} fails to invoke method \"${data.method}\"`, source: this.name });
        reject(Namespace.JResponse.respond('notAcceptable', { message: `This method is not allowed` }, this.name));
      }
    });
  }
  /** @function prepareData(data)
    * Prepares and presets data to pass onto driver
    * @param {object} data - data passed on from method
    * @return {object} - data returned
    **/
  prepareData(data) {
    // Store data for easy access
    this.data = {...this.default, ...data.queryData, ...data};
    data = {};
    let query = this.data.query || {};
    // Apply filter if provided
    if(this.get('filter') && this.get('id')) {
      if(query[this.get('filter')]) {
        if(query[this.get('filter')].includes(this.get('id')))
          query[this.get('filter')] = [this.get('id')];
        else
          query[this.get('filter')] = [];
      } else {
        query[this.get('filter')] = [this.get('id')];
      }
      delete this.data.id;
    }
    if(this.get('id')) {
      // Setting to manipulate a single item
      query['id'] = [this.get('id')];
      data.isCollection = false;
    } else {
      data.page = Model.parseInt(this.get('page'));
      data.pageSize = Model.parseInt(this.get('pageSize'));
      data.sort = Model.parseString(this.get('sort'));
      data.isCollection = true;
    }
    // Fill in defaults, if not requested specifically
    data.fields = Model.parseArray(this.get('fields'));
    data.hideFields = Model.parseArray(this.get('hideFields'));
    // Pass all these on when constructing driver
    data.filter = {...query, ...this.data.accessFilter};
    return data;
  }

  /** @static @function parseArray(data)
    * Returns array of properties or values
    * @param {string||array} data
    * @return {array}
    **/
  static parseArray(data) {
    if(Array.isArray(data)) {
      return data;
    } else {
      if(data && typeof data === 'string') {
        return data.match(/([^\[\]]+)/g)[0].split(',');
      } else {
        return undefined;
      }
    }
    if(!Array.isArray(data))
      if(data)
        return Array.from(data.matchAll(/[\[]?(\w[\w\d-_]+)[\]]?/g), match => match[0]);
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
    if(data && typeof data === 'string')
      return parseInt(data, 10);
    else
      return data;
  }
  /** @static @function parseString(data)
    * Returns string of property or value
    * @param {string} data
    * @return {string}
    **/
  static parseString(data) {
    if(typeof data === 'string')
      return data.match(/([-\+]?\w[\w\d-_]+)/g)[0];
    else
      return undefined;
  }
}
