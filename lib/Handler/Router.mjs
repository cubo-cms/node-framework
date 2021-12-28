/** @package        @cubo-cms/node-framework
  * @module         /lib/Handler/Router.mjs
  * @version        0.5.40
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Router extends Namespace.Handler {
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

  /** @function handler(request,response,data)
    * Invokes router handler and returns processed data
    * @param {object} request - original server request
    * @param {object} response - server response
    * @param {object} data - data passed on to handler
    * @return {object} - data returned
    **/
  handler(request, response, data) {
    return new Promise((resolve, reject) => {
      log.info({ message: `Router parses request`, source: this.name, payload: `${request.method} ${request.url}` });
      const url = new URL(request.url, request.headers[':scheme'] + '://' + request.headers[':authority']);
      let requestURL = request.method + ' ' + url.pathname;
      if(url.pathname.substr(-1) == '/' && url.pathname.length > 1)
        requestURL = requestURL.substr(0, requestURL.length - 1); // Strip trailing slash
      let postData = {};
      if(request.headers['content-type'] === 'application/json') {
        postData = JSON.parse(this.get('payload'));
      } else if(request.headers['content-type'] === 'application/x-www-form-urlencoded') {
        for(const [property, value] of new URLSearchParams(this.get('payload'))) {
          postData[property] = value;
        }
      }
      // Store parsed query properties
      let queryData = {};
      for(const [property, value] of url.searchParams) {
        queryData[property] = value;
      }
      // Reset data object to contain only useful parameters
      let regexRoute = /^([A-Z]+)\s\/([^/:?]+)?([/:]+)?([^/:?]+)?([/:]+)?([^/:?]+)?([/:]+)?([^/:?]+)?([/:]+)?([^/:?]+)?$/g;
      let regexProp = /^\{([\w_-]+)\}$/g;
      let parseData = {};
      let foundRoute = false;
      // Now start comparing each possible route with the url
      for(const [route, routeData] of Object.entries(this.get('route'))) {
        let matchRequest = [...requestURL.matchAll(regexRoute)][0] || [];
        let matchRoute = [...route.matchAll(regexRoute)][0] || [];
        let matched = true;
        for(let i = 1; i < matchRoute.length && matched; i++) {
          if(matchRoute[i] && matchRoute[i].match(regexProp)) {
            if(matchRequest[i]) {
              parseData[matchRoute[i].replace(regexProp, '$1')] = matchRequest[i];
            } else {
              matched = false;
            }
          } else {
            // Match exactly
            matched &= (matchRoute[i] === matchRequest[i]);
          }
        }
        if(matched) {
          Object.assign(parseData, routeData);
          foundRoute = true;
          break;
        } else {
          parseData = {};
        }
      }
      if(foundRoute && parseData.method != 'skip') {
        Object.assign(parseData, { method: request.method.toLowerCase(), postData: postData, queryData: queryData });
        resolve(Namespace.JResponse.success({ data: parseData }, this.name));
      } else {
        reject(Namespace.JResponse.respond('notFound', { message: 'Router ignores this route' }, this.name));
      }
    });
  }
}
