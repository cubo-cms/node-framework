/** @package        @cubo-cms/node-framework
  * @module         /lib/Driver/MySQLDriver.mjs
  * @version        0.4.36
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
        connection.query(`SHOW COLUMNS FROM \`${this.get('database')}\`.\`${this.get('table')}\``, (error, result, fields) => {
          if(!error) {
            let columns = [];
            for(const value of result.values()) columns.push(value.Field);
            let { filter, values } = this.query();
            connection.query(`SELECT ${this.columns(columns)} FROM \`${this.get('database')}\`.\`${this.get('table')}\` WHERE ${filter} ${this.sort()}`, values, (error, result, fields) => {
              if(error) console.error(error);
              if(!error) {
                resolve(Namespace.JResponse.success({ data: result }));
                connection.end();
              }
            });
          }
        });
      } catch(error) {
        connection.end();
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
  columns(columns) {
    let data = this.get('show');
    data = data.filter(item => columns.includes(item));
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
    let connection = MySQL.createConnection(data);
    connection.connect();
    return connection;
  }
  /** @function query()
    * Constructs query parameters for MySQL
    * @return {object}
    **/
  query() {
    let query = [];
    let values = [];
    let data = this.get('query');
    for(const property of Object.keys(data)) {
      console.log('property:',property);
      query.push(`\`${property}\` IN(?)`);
      values.push(data[property]);
    }
    let filter = query.join(' AND ') || '1';
    return { filter, values };
  }
  /** @function sort()
    * Constructs sort parameters for MySQL
    * @return {object}
    **/
  sort() {
    let data = this.get('sort');
    return `ORDER BY \`${data[0]}\` ${data[1] === 'up' ? ' ASC' : ' DESC'}`;
  }
}
