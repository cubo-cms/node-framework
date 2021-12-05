/** @package        @cubo-cms/node-framework
  * @module         /lib/Namespace.mjs
  * @version        0.4.24
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import Class from './Class.mjs';
import JLoader from './Helper/JLoader.mjs';
import Log from './Class/Log.mjs';

class Namespace {
  /** @static @property {object} default - holds default settings for class
    **/
  static default = {
    autoRegister: true,     // automatically register the current namespace
    useGlobal: false,       // option to publish namespace objects globally
    includeExtensions: ['.mjs', '.js'],
    searchPath: '#/lib'     // search path to locate modules
  };
  /** @static @private @property {object} registry - holds registry of modules
    **/
  static #registry = {};
  /** @static @private @property {object} failed - modules failed to load
    **/
  static #failed = [];
  /** @static @private @property {object} omitted - modules omitted to load
    **/
  static #omitted = [];
  /** @static @private @property {object} succeeded - modules loaded
    **/
  static #succeeded = [];

  /** @static @function exists(moduleName)
    * Returns true if module exists
    * @param {string} moduleName - name of module
    * @return {boolean}
    **/
  static exists(moduleName) {
    return typeof this[moduleName] === 'function';
  }
  /** @static @function isRegistered(moduleName)
    * Returns true if module is registered
    * @param {string} moduleName - name of module
    * @return {boolean}
    **/
  static isRegistered(moduleName) {
    return typeof this.#registry[moduleName] !== 'undefined';
  }
  /** @static @function load(registry)
    * Loads all registered modules
    * @param {object} data - optionally provide alternative registry
    * @return {object}
    **/
  static load(data = this.#registry) {
    return new Promise((resolve, reject) => {
      let promises = [];
      for(const moduleName of Object.keys(data)) {
        if(this.#registry[moduleName] && !this.#registry[moduleName].done)
          promises.push(this.loadModule(moduleName));
      }
      Promise.allSettled(promises)
        .then(() => {
          Log.success({ message: `Namespace completed loading modules`, type: 'success', source: this.name, payload: this.#succeeded });
          if(Object.keys(this.#failed).length) {
            Log.warning({ message: `Namespace failed loading some modules`, type: 'warning', source: this.name, payload: this.#failed });
          }
          this.#registry = {};
          resolve(this);
        });
    });
    return this;
  }
  /** @static @function loadModule(moduleName)
    * Loads a module
    * @param {string} moduleName - name of module
    * @return {object}
    **/
  static loadModule(moduleName) {
    return new Promise((resolve, reject) => {
      let registry = this.#registry[moduleName];
      if(registry) {
        if(registry.done) {
          resolve(moduleName);
        } else {
          if(registry.dependency) {
            this.loadModule(registry.dependency)
              .then(() => {
                import(registry.path)
                  .then((module) => {
                    this[moduleName] = module.default;
                    if(this.default.useGlobal)
                      global[moduleName] = this[moduleName];
                    this.#succeeded.push(moduleName);
                    registry.done = true;
                    resolve(moduleName);
                  }).catch((error) => {
                    this.#failed.push(moduleName);
                    reject(error);
                  });
              });
          } else {
            import(registry.path)
              .then((module) => {
                this[moduleName] = module.default;
                if(this.default.useGlobal)
                  global[moduleName] = this[moduleName];
                this.#succeeded.push(moduleName);
                registry.done = true;
                resolve(moduleName);
              }).catch((error) => {
                this.#failed.push(moduleName);
                reject(error);
              });
          }
        }
      } else {
        this.#omitted.push(moduleName);
        resolve(moduleName);
      }
    });
  }
  /** @static @function module()
    * Shows all loaded, omitted, and failed modules
    * @return {object}
    **/
  static modules() {
    return { succeeded: this.#succeeded, omitted: this.#omitted, failed: this.#failed };
  }
  /** @static @function register(searchPath,basePath)
    * @param {string} searchPath - path to examine; default if none given
    * @param {string} basePath - base path for module path; defaults to current directory
    * @return {object}
    **/
  static register(searchPath = this.default.searchPath, basePath = JLoader.basePath) {
    return new Promise((resolve, reject) => {
      this.registerPath(JLoader.resolvePath(searchPath))
        .then((namespace) => {
          Log.success({ message: `Namespace completed registering modules`, type: 'success', source: this.name, payload: this.#registry });
          resolve(this.#registry);
        }).catch((error) => {
          Log.error({ message: error, type: 'error', source: this.name });
          reject(error);
        });
    });
    return this;
  }
  /** @static @function registerModule(registration,moduleName)
    * function register - returns the registration of the module
    * @param {object} registration - object containing module registration info
    * @param {string} moduleName - (optional) name of module; allows override/alias
    * @return {object}
    **/
  static registerModule(registration, moduleName = registration.name) {
    if(typeof moduleName === 'undefined') {
      return undefined;
    } else {
      return this.#registry[moduleName] = registration;
    }
  }
  /** @static @function registerPath(searchPath,dependency)
    * @param {string} searchPath - path to examine; default if none given
    * @return {object}
    **/
  static registerPath(searchPath, dependency = undefined) {
    return new Promise((resolve, reject) => {
      let promises = [];
      fs.readdir(searchPath, { 'encoding': 'utf8', 'withFiletypes': true }, (error, files) => {
        if(error) {
          reject(error);
        } else files.forEach(file => {
          if(fs.statSync(path.join(searchPath, file)).isDirectory()) {
            promises.push(this.registerPath(path.join(searchPath, file), file));
          } else if(this.default.includeExtensions.includes(path.extname(file))) {
            this.registerModule({name: path.basename(file, path.extname(file)), path: 'file://' + path.join(searchPath, file), dependency: dependency});
          }
        });
        Promise.allSettled(promises)
          .then(() => {
            resolve(this.#registry);
          });
      });
    });
  }
}

if(Namespace.default.autoRegister)
  await Namespace.register();

export default Namespace;
