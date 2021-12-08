/** @package        @cubo-cms/node-framework
  * @module         /lib/Driver/JSONDriver.mjs
  * @version        0.4.26
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../Namespace.mjs';

/** @property {object} method - holds driver methods specific for JSONDriver
  * NOTE: These methods will override any generic methods
  **/
const method = {
  /** @method get()
    * Performs get method
    * @return {Promise <object>}
    **/
  get: function() {
    return new Promise((resolve, reject) => {
      console.log('URI:',this.get('uri'));
      Namespace.Class.load(this.get('uri'))
        .then((data) => {
          this.post = [];
          this.unsorted = new Map();
          for(const item of data) {
            if(typeof item === 'object' && item[this.get('sort')[0]])
              this.unsorted.set(item[this.get('sort')[0]], item);
            else
              this.unsorted.set(item['id'], item);
          }
          if(this.get('sort')[1] && this.get('sort')[1] === 'down')
            this.sorted = new Map([...this.unsorted.entries()].sort().reverse());
          else
            this.sorted = new Map([...this.unsorted.entries()].sort());
          this.sorted.forEach(function(item) {
            this.matched = true;
            for(const property of Object.keys(item)) {
              if(this.matched = this.matched && JSONDriver.match(this.get('query'), property, item[property])) {
                if(!JSONDriver.fields(this.get('show'), this.get('hide')).includes(property)) {
                  delete(item[property])
                }
              }
            }
            if(this.matched) {
              this.post.push(item);
            }
          }.bind(this));
          if(this.get('id')) {
            let result = this.post[0];
            if(result) {
              resolve(Namespace.JResponse.success({ data: result, dataType: this.get('dataType'), id: this.get('id') }));
            } else {
              reject(Namespace.JResponse.respond('notFound'));
            }
          } else {
            let result = this.post;
            if(result) {
              let total = result.length;
              result = result.slice((this.get('page') - 1) * this.get('pageSize'), this.get('page') * this.get('pageSize'));
              resolve(Namespace.JResponse.success({ data: result, dataType: this.get('dataType'), size: result.length, page: this.get('page'), pageSize: this.get('pageSize'), totalSize: total }));
            } else {
              reject(Namespace.JResponse.respond('badRequest'));
            }
          }
        }).catch((error) => {
          reject(Namespace.JResponse.error({ message: error }));
        });
    });
  }
}

export default class JSONDriver extends Namespace.Driver {
  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    super(data);
    Object.assign(this.method, method);
  }

  /** @static @function fields(show,hide)
    * Returns constructed array of fields effectively shown
    * @param {array} show
    * @param {array} hide
    * @return {array}
    **/
  static fields(show, hide) {
    let fields = show;
    for(const field of hide) {
      fields = fields.filter(item => item !== field);
    }
    return fields;
  }
  /** @static @function match(query,property,value)
    * Returns false if property/value pair does not satisfy the query
    * @param {object} query
    * @param {string} property
    * @param {string} value
    * @return {bool}
    **/
  static match(query, property, value) {
    let ok = true;
    // Skip if no query is given
    if(!query)
      return ok;
    // Match every value
    for(let [queryName, queryValue] of Object.entries(query)) {
      if(property == queryName && !queryValue.includes(value))
        ok = false;
    }
    return ok;
  }
}
