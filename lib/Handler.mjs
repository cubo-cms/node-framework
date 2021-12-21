import JLoader from './Helper/JLoader.mjs';

export default class Handler {
  /** @static @property {object} default - holds defaults specific for this class
    **/
  static default = {};
  /** @static @property {object} default - holds handlers specific for this class
    **/
  static stack = [];
  static use(handler) {
    console.log(`${this.name} uses ${handler.name}`);
    this.stack.push(handler);
  };

  /** @property {object} default - holds data specific for this instance
    **/
  data = {};
  /** @property {object} default - holds defaults specific for this instance
    **/
  default = {};
  /** @private @property {object} stack - holds handlers specific for this instance
    **/
  #stack = [];

  /** @constructor (data)
    * Instance constructor
    * @param {string|object} data - data to store for this instance
    **/
  constructor(data = {}) {
    // Combine class defaults with instance defaults
    this.data = { ...this.constructor.default, ...this.default };
    if(typeof data === 'string') {
      // Need to load this data at initialisation
      this.loadData = data;
    } else {
      // Combine provided data
      this.data = { ...this.data, ...data };
    }
    // Store class stack
    this.#stack = this.constructor.stack;
    console.log(`${this.name} creates instance with data:`, data);
  };

  get name() {
    return this.constructor.name;
  }

  clear(handler = undefined) {
    if(handler === undefined) {
      console.log(`${this.name} clears all modules`);
      this.#stack = [];
    } else {
      if(typeof handler == 'function' || typeof handler == 'object') {
        handler = handler.name;
      };
      console.log(`${this.name} removes module ${handler}`);
      this.#stack = this.#stack.filter((module) => module == handler);
    }
  };
  handler(data = {}, request = {}, response = {}) {
    console.log(`${this.name} invokes module with data:`, data);
    return new Promise((resolve, reject) => {
      // Load data
      JLoader.load(this.loadData).then((loadedData) => {
        // Combine loaded data
        this.data = { ...this.data, ...loadedData };
        return JLoader.load(data);
      }).then((providedData) => {
        // Combine provided data
        this.data = { ...this.data, ...providedData };
        // ******************** THIS SHOULD BE REMOVED LATER **************
        this.data[this.constructor.name] = 'Been here';
        // Sequentially resolve promises
        resolve(this.#stack.reduce((previous, Module) => {
          return previous.then((data) => {
            let instance = new Module(data);
            return instance.handler(this.data[Module.name.toLowerCase()], request, response);
          }).catch((error) => {
            reject(error);
          });
        }, Promise.resolve(this.data)));
      }).catch((error) => {
        reject(error);
      });
    });
  };
  use(handler) {
    console.log(`${this.name} uses module ${handler.name}`);
    this.#stack.push(handler);
  };
};
