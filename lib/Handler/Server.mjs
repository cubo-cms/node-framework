/** @package        @cubo-cms/node-framework
  * @module         /lib/Handler/Server.mjs
  * @version        0.5.39
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import http2 from 'http2';
import fs from 'fs';

import Handler from '../Handler.mjs';
import JLoader from '../Helper/JLoader.mjs';

export default class Server extends Handler {
  static default = {};
  static stack = [];

  listen(data = {}) {
    console.log(`${this.constructor.name} starts listening`);
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
        resolve(this.data);
      }).catch((error) => {
        reject(error);
      });
    });
    port = this.get('port', port);
    const server = http2.createSecureServer({ ...this.data }, (request, response) => {
      this.handler(request, response, { ...this.data });
    }).on('error', (error) => {
      _log_.error(error);
    }).listen(port, () => {
      _log_.success({ message: `Server listens on port ${port}`, source: this.type });
    });
  };
  setProcessor(processor) {
    this.processor = processor;
  };
};
