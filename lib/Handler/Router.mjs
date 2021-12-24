/** @package        @cubo-cms/node-framework
  * @module         /lib/Handler/Router.mjs
  * @version        0.5.39
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Handler from '../Handler.mjs';
import JResponse from '../Helper/JResponse.mjs';

export default class Router extends Handler {
  /** @static @property {object} default - holds default values
    **/
  static default = {
    route: {
      'GET /': { dataType: 'Document', id: 'home' },
      'GET /favicon.ico': { method: 'skip' },
      'GET /{dataType}': {},
      'GET /{dataType}:{id}': {},
      'GET /{dataType}/:{id}': {},
      'GET /{dataType}/${filter}:{id}': {},
      'GET /{dataType}/${filter}/:{id}': {},
      'POST /User/authenticate': { dataType: 'User', method: 'authenticate' }
    }
  };

  /** @function handler(data,request,response)
    * Parses a requested URL and returns parsed data
    * @param {object} data - contains routes to be parsed
    * @param {object} request - requested data to be processed
    * @param {object} response - data returned back to server
    * @return {object}
    **/
  handler(data = {}, request, response) {
    return new Promise((resolve, reject) => {
      log.info({ message: `Router parses request`, source: this.name, payload: `${request.headers[':method']} ${request.headers[':path']}` });
      const url = new URL(request.headers[':path'], request.headers[':scheme'] + '://' + request.headers[':authority']);
      let requestURL = request.headers[':method'] + ' ' + url.pathname;
      if(url.pathname.substr(-1) == '/' && url.pathname.length > 1)
        requestURL = requestURL.substr(0, requestURL.length - 1); // Strip trailing slash
      let data = {};
      // Store payload *********** REVIEW DEBUG ***************************************
      if(request.headers['contentType'] === 'application/json') {
        data.payload = JSON.parse(data.payload);
      } else if(request.headers['contentType'] === 'application/x-www-form-urlencoded') {
        let payload = {};
        let postedParams = new URLSearchParams(data.payload);
        for(const [property, value] of postedParams) {
          payload[property] = value;
        }
        data.payload = payload;
      }
      // Store parsed query properties
      for(const [property, value] of url.searchParams) {
        data[property] = value;
      }
      let regexRoute = /^([A-Z]+)\s\/([^/:?]+)?([/:]+)?([^/:?]+)?([/:]+)?([^/:?]+)?([/:]+)?([^/:?]+)?([/:]+)?([^/:?]+)?$/g;
      let regexProp = /^\{([\w_-]+)\}$/g;
      let parsedData = {};
      let foundRoute = false;
      // Now start comparing each possible route with the url
      for(const [route, routeData] of Object.entries(this.get('route'))) {
        let matchRequest = [...requestURL.matchAll(regexRoute)][0] || [];
        let matchRoute = [...route.matchAll(regexRoute)][0] || [];
        let matched = true;
        for(let i = 1; i < matchRoute.length && matched; i++) {
          if(matchRoute[i] && matchRoute[i].match(regexProp)) {
            if(matchRequest[i]) {
              parsedData[matchRoute[i].replace(regexProp, '$1')] = matchRequest[i];
            } else {
              matched = false;
            }
          } else {
            // Match exactly
            matched &= (matchRoute[i] === matchRequest[i]);
          }
        }
        if(matched) {
          Object.assign(parsedData, routeData);
          foundRoute = true;
          break;
        } else {
          parsedData = {};
        }
      }
      if(foundRoute && parsedData.method != 'skip') {
        data.method = request.headers[':method'].toLowerCase();
        Object.assign(data, parsedData);
        resolve(JResponse.success({ data: data }, this.name));
      } else {
        reject(JResponse.respond('notFound', { message: 'Router ignores this route' }, this.name));
      }
    });
  }
}
