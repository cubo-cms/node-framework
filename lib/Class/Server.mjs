/** @package        @cubo-cms/node-framework
  * @module         /lib/Class/Server.mjs
  * @version        0.4.27
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import http2 from 'http2';
import fs from 'fs';

import Class from '../Class.mjs';
import Cookie from '../Helper/Cookie.mjs';
import Log from './Log.mjs';

export default class Server extends Class {
  /** @property {object} default - holds defaults specific for this instance
    **/
  default = {
    port: 8000
  };
  /** @private @property {function} processor - function to be used to process requests
    **/
  #processor = this.invokeProcessor;

  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    super(data);
  }

  /** @function processor()
    * Getter to retrieve the processor
    * @return {function}
    **/
  get processor() {
    return this.#processor;
  }
  /** @function processor(caller)
    * Setter to store the processor
    * @param {object} processor - the function that processes requests
    * @return {string}
    **/
  set processor(processor = undefined) {
    return this.#processor = processor;
  }

  invokeProcessor(request, response, router) {
    _log_.info({ message: `Server receives request`, source: this.type, payload: `${request.method} ${request.url}` });
    let payload = [];
    request.on('data', (chunk) => {
      // Get request data and store as payload
      payload.push(chunk);
    }).on('end', () => {
      payload = Buffer.concat(payload).toString();
      // Route request and retrieve result
      router({ headers: request.headers, method: request.method, url: request.url, payload: payload, contentType: request.headers['content-type'], timestamp: Date.now() }).then((result) => {
        // Set response status code and headers
        response.statusCode = result.statusCode;
        response.setHeader('Content-Type', result.contentType || this.get('contentType', 'text/plain'));
        response.setHeader('X-Powered-By', this.get('poweredBy', 'Cubo CMS'));
        // Set headers that may have been added
        if(result.header) {
          for(const header of Object.keys(result.header)) {
            response.setHeader(header, result.header[header]);
          }
        }
        // Set cookie
        if(result.sessionId) {
          response.setHeader('Set-Cookie', Cookie.serialize({ sessionId: result.sessionId }));
        }
        // Write data
        if(result.data) {
          response.write(typeof result.data === 'string' ? result.data : JSON.stringify(result.data));
        } else {
          response.write(result.message);
        }
        response.end();
      }).catch((error) => {
        _log_.error(error);
        response.statusCode = error.statusCode;
        response.setHeader('Content-Type', error.contentType || this.get('contentType', 'text/plain'));
        response.setHeader('X-Powered-By', this.get('poweredBy', 'Cubo CMS'));
        response.end(typeof error === 'string' ? error : JSON.stringify(error));
      });
    });
  }

  listen(router, port = undefined) {
    port = this.get('port', port);
    const server = http2.createSecureServer({
      key: fs.readFileSync('.cert/privkey.pem'),
      cert: fs.readFileSync('.cert/cert.pem')
    }, (request, response) => {
      this.processor(request, response, router);
    }).on('error', (error) => {
      _log_.error(error);
    }).listen(port, () => {
      _log_.success({ message: `Server listens on port ${port}`, source: this.type });
    });
  }
  setProcessor(processor) {
    this.processor = processor;
  }
}
