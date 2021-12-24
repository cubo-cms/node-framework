/** Base class module {Class} providing basic methods for the framework
  * classes.
  *
  * @package        @cubo-cms/node-framework
  * @module         /lib/Class.mjs
  * @version        0.5.39
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import JLoader from '../lib/Helper/JLoader.mjs';
import Namespace from '../Namespace.mjs';

export default class Class {
  /** @static @function create(data,caller,dataType)
    * Creates a new instance, after loading data, and remembers caller
    * @param {string|object} data
    * @param {object} caller
    * @param {string} dataType - optional dataType prepended; will take it from data if it exists
    * @return {Promise <object>}
    **/
  static create(data = {}, caller = undefined, prefix = undefined) {
    return new Promise((resolve, reject) => {
      this.load(data).then((data) => {
        let instance;
        prefix = prefix ?? data.dataType ?? '';
        if(this.exists(this.name, prefix)) {
          instance = new Namespace[prefix + this.name](data);
          if(caller && global.log) log.debug({ message: `${caller.name} creates ${prefix + this.name} instance`, source: this.name, payload: data });
        } else {
          instance = new this(data);
          if(caller && global.log) log.debug({ message: `${caller.name} creates ${this.name} instance`, source: this.name, payload: data });
        }
        instance.caller = caller;
        resolve(instance);
      }).catch((error) => {
        reject(error);
      });
    });
  }
  /** @static @function exists(module,dataType)
    * Returns true if the specified module exists in the namespace
    * @param {string} module
    * @param {string} dataType - optional dataType prepended
    * @return {boolean}
    **/
  static exists(module, prefix = '') {
    return Namespace.exists(prefix + module);
  }
  /** @static @function load(data)
    * Loads data and and returns it as an object
    * @param {string|object} data
    * @return {Promise <object>}
    **/
  static load(data = {}) {
    return JLoader.load(data);
  }

  #caller = undefined;
  /** @private @property {string} dataSource - data to be loaded for this instance
    **/
  #dataSource = undefined;

  /** @constructor (data)
    * Instance constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    if(typeof data === 'string') {
      // Store source to load later
      this.data = {};
      this.#dataSource = data;
    } else {
      // Store data
      this.data = {...data};
    }
  }

  /** @function caller()
    * Getter to retrieve the caller of this instance
    * @return {object}
    **/
  get caller() {
    return this.#caller;
  }
  /** @function caller(caller)
    * Setter to store the caller of this instance
    * @param {object} caller - the instance that created this instance
    **/
  set caller(caller = undefined) {
    return this.#caller = caller;
  }
  /** @function name()
    * Getter to retrieve the class name of this instance
    * @return {string}
    **/
  get name() {
    return this.constructor.name;
  }

  /** @function get(property,defaultValue)
    * Retrieves the property value
    * @param {string} property
    * @param {any} defaultValue
    * @return {any}
    **/
  get(property, defaultValue) {
    return this.data[property] ?? defaultValue ?? (this.constructor.default ? this.constructor.default[property] : undefined);
  }
  /** @function has(property)
    * Returns true if the property exists
    * @param {string} property
    * @return {boolean}
    **/
  has(property) {
    return this.data[property] !== undefined;
  }
  /** @function load(data)
    * Loads data and stores it as object data
    * @param {string|object} data
    * @return {Promise <object>}
    **/
  load(data = {}) {
    return new Promise((resolve, reject) => {
      JLoader.load(this.#dataSource).then((sourceData) => {
        this.data = {...this.default, ...this.data, ...sourceData};
        this.#dataSource = undefined;
        return JLoader.load(data);
      }).then((data) => {
        this.data = {...this.data, ...data};
        resolve(this.data);
      }).catch((error) => {
        reject(error);
      });
    });
  }
  /** @function set(property,value,defaultValue)
    * Stores a value for a property
    * @param {string} property
    * @param {any} value
    * @param {any} defaultValue
    * @return {any}
    **/
  set(property, value, defaultValue = this.default[property]) {
    return this.data[property] = value || defaultValue;
  }
  /** @function toJSON()
    * Prepares data to be shown as JSON
    * @return {object}
    **/
  toJSON() {
    return this.data;
  }
  /** @function toString()
    * Returns the name of the instance
    * @return {string}
    **/
  toString() {
    return this.name;
  }
  /** @function valueOf()
    * Returns instance data
    * @return {object}
    **/
  valueOf() {
    return this.data;
  }
}
