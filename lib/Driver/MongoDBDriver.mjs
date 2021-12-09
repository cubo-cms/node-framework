/** @package        @cubo-cms/node-framework
  * @module         /lib/Driver/JSONDriver.mjs
  * @version        0.4.31
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import MongoDB from 'mongodb';
const { MongoClient } = MongoDB;

import Namespace from '../../Namespace.mjs';

/** @property {object} method - holds driver methods specific for MongoDBDriver
  * NOTE: These methods will override any generic methods
  **/
const method = {
  /** @method get()
    * Performs get method
    * @return {Promise <object>}
    **/
  get: function() {
    return new Promise((resolve, reject) => {
      const client = new MongoClient(this.get('uri'), this.get('options'));
      client.connect().then(() => {
        let collection = client.db(this.get('database')).collection(this.get('collection'));
        let result;
        if(this.get('id')) {
          collection.findOne(this.query(), { projection: this.projection() })
            .then((response) => {
              client.close();
              if(response) {
                resolve(Namespace.JResponse.success({ data: response, dataType: this.get('dataType'), id: this.get('id') }));
              } else {
                reject(Namespace.JResponse.respond('notFound'));
              }
            }).catch((error) => {
              client.close();
              reject(Namespace.JResponse.respond('serverError'));
            });
        } else {
          collection.find(this.query(), { projection: this.projection() }).sort(this.sort()).toArray()
            .then((response) => {
              client.close();
              if(response) {
                let total = response.length;
                response = response.slice((this.get('page') - 1) * this.get('pageSize'), this.get('page') * this.get('pageSize'));
                resolve(Namespace.JResponse.success({ data: response, dataType: this.get('dataType'), size: response.length, page: this.get('page'), pageSize: this.get('pageSize'), totalSize: total }));
              } else {
                reject(Namespace.JResponse.respond('badRequest'));
              }
            }).catch((error) => {
              client.close();
              reject(Namespace.JResponse.respond('serverError'));
            });
        }
      }).catch((error) => {
        reject(Namespace.JResponse.respond('serverError'));
      });
    });
  },
  /** @method post()
    * Performs post method
    * @return {Promise <object>}
    **/
  post: function() {
    return new Promise((resolve, reject) => {
      const client = new MongoClient(this.get('uri'), this.get('options'));
      client.connect().then(() => {
        let collection = client.db(this.get('database')).collection(this.get('collection'));
        collection.insertOne(this.get('payload'))
          .then((response) => {
            client.close();
            resolve(Namespace.JResponse.respond('created'));
          }).catch((error) => {
            client.close();
            if(error.code == 11000) {
              reject(Namespace.JResponse.respond('forbidden', { message: 'Key already exists' }));
            } else {
              reject(Namespace.JResponse.respond('serverError'));
            }
            console.log(error);
          });
      }).catch((error) => {
        reject(Namespace.JResponse.respond('serverError'));
      });
    });
  }
}

export default class MongoDBDriver extends Namespace.Driver {
  /** @property {object} default - holds default values
    **/
  default = {
    options: { useNewUrlParser: true, useUnifiedTopology: true }
  }

  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    super(data);
    Object.assign(this.method, method);
  }

  /** @function projection()
    * Constructs array of properties effectively shown
    * @return {array}
    **/
  projection() {
    let projection = {};
    let data = this.get('show');
    for(const property of this.get('hide')) {
      data = data.filter(item => item !== property);
      if(property == '_id')
        projection[property] = 0;
    }
    for(const property of data)
      projection[property] = 1;
    return projection;
  }
  /** @function query()
    * Constructs query parameters for MongoDB
    * @return {object}
    **/
  query() {
    let query = {};
    let data = this.get('query');
    for(const property of Object.keys(data)) {
      query[property] = { '$in': data[property] };
    }
    return query;
  }
  /** @function sort()
    * Constructs sort parameters for MongoDB
    * @return {object}
    **/
  sort() {
    let sort = {};
    let data = this.get('sort');
    sort[data[0]] = data[1] === 'up' ? 1 : -1;
    return sort;
  }
}
