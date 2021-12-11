/** @package        @cubo-cms/node-framework
  * @module         /lib/Driver/MySQLDriver.mjs
  * @version        0.4.33
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import MySQL from 'mysql';

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
      try{
        let connection = this.connect(this.get('uri') || this.get('connection'));
        connection.query(`SELECT ${this.columns()} FROM ${this.table} WHERE ${this.query()} ORDER BY ${this.sort()}`, (error, result, fields) => {
          if(error) throw(error);
          resolve(result);
        });
      } catch(error) {
        reject(error);
      }
    });
  },
  /** @method post()
    * Performs post method
    * @return {Promise <object>}
    **/
  post: function() {
    return new Promise((resolve, reject) => {
      resolve({});
    });
  }
}

export default class MySQLDriver extends Namespace.Driver {
  /** @property {object} default - holds default values
    **/
  default = {
  }

  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    super(data);
    Object.assign(this.method, method);
  }

  /** @function columns()
    * Constructs array of properties effectively shown
    * @return {string}
    **/
  columns() {
    let data = this.get('show');
    for(const property of this.get('hide')) {
      data = data.filter(item => item !== property);
    }
    return data.join(',');
  }
  /** @function connect(data)
    * Connects to the database
    * @param {object|string} data - connection data or uri
    * @return {object}
    **/
  connect(data) {
    let connection = mysql.createConnection(data);
    connection.connect((error) => {
      throw(error);
    });
    return connection;
  }
  /** @function query()
    * Constructs query parameters for MySQL
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
    * Constructs sort parameters for MySQL
    * @return {object}
    **/
  sort() {
    let sort = {};
    let data = this.get('sort');
    sort[data[0]] = data[1] === 'up' ? 1 : -1;
    return sort;
  }
}
