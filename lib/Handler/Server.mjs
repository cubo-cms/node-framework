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
import FileLoader from '../Helper/FileLoader.mjs';
import JLoader from '../Helper/JLoader.mjs';

export default class Server extends Handler {
  static default = {
    digest: 'sha-256',
    poweredBy: 'Cubo CMS',
    port: 8000
  };
  static stack = [];

  handler(data = {}, request, response) {
    super.handler(data, request, response).then((data) => {
      return FileLoader.load(this.data.cert);
    }).then((cert) => {
      this.data.cert = cert;
      return FileLoader.load(this.data.key);
    }).then((key) => {
      this.data.key = key;
      http2.createSecureServer({ ...this.data }, (request, response) => {
        this.request({ ...this.data }, request, response, );
      }).on('error', (error) => {
        console.error(error);
      }).listen(this.data.port, () => {
        console.log({ message: `${this.name} starts listening on port ${this.data.port}`, source: this.name });
      }).on('end', () => {
        console.log({ message: `${this.name} stops listening`, source: this.name });
      });
    }).catch((error) => {
      console.error(error);
    });
  };
  request(data = {}, request, response) {
    console.log(`Receiving request`);
  };
};
