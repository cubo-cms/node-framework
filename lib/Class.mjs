/** @package        @cubo-cms/node-framework
  * @module         /lib/Class.mjs
  * @version        0.4.30
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import { EventEmitter } from 'events';

import JLoader from './Helper/JLoader.mjs';

export default class Class {
  /** @property {object} data - holds data specific for this class
    **/
  data = {};
  /** @property {object} default - holds defaults specific for this class
    **/
  default = {};
  /** @private @property {object} event - event emitter for this class
    **/
  #event = undefined;
  /** @private @property {object} caller - determines the object that created this class
    **/
  #caller = undefined;
  /** @private @property {string} name - returns the name of this class
    **/
  #name = constructor.prototype.name;

  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    this.#event = new EventEmitter();
    this.#name = this.__proto__.constructor.name;
    Class.load(data)
      .then((data) => {
        this.#event.emit('load', data);
        this.data = { ...data };
        this.#event.emit('success', this);
      }).catch((error) => {
        this.#event.emit('error', error);
      }).finally(() => {
        this.#event.emit('end', this);
      });
  }

  /** @function calledBy()
    * Getter to retrieve the caller of this class
    * @return {object}
    **/
  get calledBy() {
    return this.#caller;
  }
  /** @function calledBy(caller)
    * Setter to store the caller of this class
    * @param {object} caller - the class that created this class
    **/
  set calledBy(caller = undefined) {
    return this.#caller = caller;
  }
  /** @function caller()
    * Getter to retrieve the caller of this class
    * @return {object}
    **/
  get caller() {
    return this.#caller;
  }
  /** @function caller(caller)
    * Setter to store the caller of this class
    * @param {object} caller - the class that created this class
    **/
  set caller(caller = undefined) {
    return this.#caller = caller;
  }
  /** @function type()
    * Getter to retrieve the name of this class
    * @return {string}
    **/
  get type() {
    return this.#name;
  }

  /** @function error(eventHandler)
    * Sets a trigger on error event
    * @param {function} eventHandler
    **/
  error(eventHandler) {
    this.on('error', eventHandler);
    return this;
  }
  /** @function get(property,defaultValue)
    * Retrieves the property value
    * @param {string} property
    * @param {any} defaultValue
    * @return {any}
    **/
  get(property, defaultValue = this.default[property]) {
    return this.data[property] || defaultValue;
  }
  /** @function has(property)
    * Returns true if the property exists
    * @param {string} property
    * @return {boolean}
    **/
  has(property) {
    return this.data[property] !== undefined;
  }
  /** @function load(data,trigger)
    * Loads data and stores it as object data
    * @param {string|object} data
    * @param {string} trigger
    * @return {Promise <object>}
    **/
  load(data = {}, trigger = 'end') {
    return new Promise((resolve, reject) => {
      Class.load(data).then((data) => {
        this.#event.emit('load', data);
        this.data = { ...data };
        resolve(data);
        this.#event.emit('success', this);
      }).catch((error) => {
        reject(error);
        this.#event.emit('error', error);
      }).finally(() => {
        this.#event.emit(trigger, this)
      });
    });
  }
  /** @function on(trigger,eventHandler)
    * Sets a trigger on an event
    * @param {string} trigger
    * @param {function} eventHandler
    **/
  on(trigger, eventHandler) {
    this.#event.on(trigger, eventHandler.bind(this));
    return this;
  }
  /** @function once(trigger,eventHandler)
    * Sets a once-only trigger on an event
    * @param {string} trigger
    * @param {function} eventHandler
    **/
  once(trigger, eventHandler) {
    this.#event.once(trigger, eventHandler.bind(this));
    return this;
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
  /** @function success(eventHandler)
    * Sets a trigger on success event
    * @param {function} eventHandler
    * @return {object}
    **/
  success(eventHandler) {
    this.once('success', eventHandler);
    return this;
  }

  /** @static @function create(data,caller)
    * Creates a new instance and keeps track of creating instance
    * @param {object} data
    * @param {object} caller
    * @return {Promise <object>}
    **/
  static create(data = {}, caller = undefined) {
    return new Promise((resolve, reject) => {
      let instance = new this(data);
      instance.calledBy = caller;
      instance.success(() => {
        resolve(instance);
      }).error((error) => {
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
}
