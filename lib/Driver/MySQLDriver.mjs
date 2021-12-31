/** @package        @cubo-cms/node-framework
  * @module         /lib/Driver/MySQLDriver.mjs
  * @version        0.5.40
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import MySQL from 'mysql';

import Namespace from '../../Namespace.mjs';

export default class MySQLDriver extends Namespace.Driver {
  /** @property {object} default - holds default values
    **/
  default = {
  }
  /** @property {object} operation - holds driver operations specific for
    * MongoDBDriver
    * NOTE: These operations will override any generic operations
    **/
  operation = {
    /** @method findOne()
      * Performs findOne operation
      * @return {Promise <object>}
      **/
    findOne: function(data) {
      return new Promise((resolve, reject) => {
        console.log('MySQLDriver data', data);
        try{
          let connection = this.connect(data.dataSource.uri || data.dataSource.connection);
          connection.query(`SHOW COLUMNS FROM \`${data.dataSource.database}\`.\`${data.dataSource.table}\``, (error, result, fields) => {
            if(error) console.error(error);
            if(!error) {
              let columns = [];
              for(const value of result.values()) columns.push(value.Field);
              let { filter, values } = this.filter(data.filter, data.sessionData);
              console.log('Values:', values);
              console.log('Query:', `SELECT ${this.fields(columns, data.fields, data.hideFields)} FROM \`${data.dataSource.database}\`.\`${data.dataSource.table}\` ${filter}`);
              connection.query(`SELECT ${this.fields(columns, data.fields, data.hideFields)} FROM \`${data.dataSource.database}\`.\`${data.dataSource.table}\` ${filter}`, values, (error, result, fields) => {
                if(error) console.error(error);
                if(!error) {
                  connection.end();
                  if(result.length) {
                    resolve(Namespace.JResponse.success({ data: { result: result } }, this.name));
                  } else {
                    reject(Namespace.JResponse.respond('notFound', {}, this.name));
                  }
                }
              });
            }
          });
        } catch(error) {
          connection.end();
          reject(Namespace.JResponse.error({ message: `Could not execute query`, payload: error }, this.name));
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
  /** @function fields()
    * Constructs array of properties effectively shown
    * @return {string}
    **/
  fields(columns, fields, hideFields) {
    let data = fields.filter(field => columns.includes(field));
    for(const property of hideFields) {
      data = data.filter(field => field !== property);
    }
    return data.join(',');
  }
  /** @function filter(data)
    * Constructs query parameters for MySQL
    * @return {object}
    **/
  filter(data,session) {
    let filter = [];
    let values = [];
    for(const property of Object.keys(data)) {
      filter.push(`\`${property}\` IN(?)`);
      values.push(data[property]);
    }
    values.push(session.user);
    filter = `WHERE (${filter.join(' AND ') || '1'}) OR \`owner\`=?`;
    return { filter, values };
  }
  /** @function sort()
    * Constructs sort parameters for MySQL
    * @return {object}
    **/
  sort(order) {
    if(order) {
      let direction = '';
      if(order.substr(0, 1) == '+') {
        direction = ' ASC';
        order = order.substr(1);
      } else if(order.substr(0, 1) == '-') {
        direction = ' DESC';
        order = order.substr(1);
      }
      return `ORDER BY \`${order}\`${direction}`;
    } else
      return '';
  }
}
