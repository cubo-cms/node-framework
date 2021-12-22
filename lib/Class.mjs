/** Base class module {Class} providing basic methods for the framework
  * classes.
  *
  * @package        @cubo-cms/node-framework
  * @module         /lib/Class.mjs
  * @version        0.4.39
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import JLoader from './Helper/JLoader.mjs';

export default class Class {
  /** @static @function create(data,caller)
    * Creates a new instance and remembers caller
    * @param {string|object} data
    * @param {object} caller
    * @return {Promise <object>}
    **/
  static create(data = {}, caller = undefined) {
    return new Promise((resolve, reject) => {
      this.load(data).then((data) => {
        let instance = new this(data);
        instance.caller = caller;
        resolve(instance);
      }).catch((error) => {
        reject(error);
      });
    });
  }
  /** @static @function load(data)
    * Loads data and and returns it as an object
    * @param {string|object} data
    * @return {Promise <object>}
    **/
  static load(data = {}) {
    return JLoader.load(data);
  }

  /** @property {object} data - holds data specific for this instance
    **/
  data = {};
  /** @property {object} default - holds defaults specific for this instance
    **/
  default = {};
  /** @private @property {object} caller - the object that created this instance
    **/
  #caller = undefined;
  /** @private @property {string} dataSource - data to be loaded for this instance
    **/
  #dataSource = undefined;

  /** @constructor (data)
    * Instance constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    this.data = this.constructor.default;
    if(typeof data === 'string')
      this.#dataSource = data;
    else
      this.data = {...this.data, ...data};
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
  get(property, defaultValue = this.default[property]) {
    return this.data[property] ?? defaultValue;
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
      JLoader.load(this.#dataSource).then((thisData) => {
        this.data = {...this.data, ...thisData};
        this.#dataSource = undefined;
        return JLoader.load(data);
      }).then((data) => {
        this.data = {...this.data, ...data};
        resolve(data);
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
