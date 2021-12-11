/** Helper module {JResponse} providing methods and objects
  * to enable responses with status information.
  *
  * Partly based on the unofficial JSend proposal, but extended
  * with more properties to provide better feedback to the calling
  * module.
  *
  * @package        @cubo-cms/node-framework
  * @module         /lib/Helper/JResponse.mjs
  * @version        0.4.33
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

export default class JResponse {
  /** @static @property {object} status - JSend status types
    **/
  static status = {
    success: { status: 'success', statusCode: 200, message: 'OK' },
    fail: { status: 'fail', statusCode: 400, message: 'Incomplete request' },
    error: { status: 'error', statusCode: 500, message: 'Processing error' }
  }
  /** @static @property {object} status - JSend status types
    **/
  static message = {
    ok: { status: 'success', statusCode: 200, message: 'OK' },
    created: { status: 'success', statusCode: 201, message: 'Item has been created' },
    accepted: { status: 'success', statusCode: 202, message: 'Authentication accepted' },
    modified: { status: 'success', statusCode: 204, message: 'Item has been modified' },
    found: { status: 'success', statusCode: 302, message: 'Item was found' },
    notModified: { status: 'success', statusCode: 304, message: 'No modification made' },
    redirect: { status: 'success', statusCode: 307, message: 'Redirected' },
    badRequest: { status: 'fail', statusCode: 400, message: 'Bad or malformed request' },
    notAuthorized: { status: 'fail', statusCode: 401, message: 'User is unauthorized' },
    forbidden: { status: 'fail', statusCode: 403, message: 'Access is forbidden' },
    notFound: { status: 'fail', statusCode: 404, message: 'Item was not Found' },
    notAllowed: { status: 'fail', statusCode: 405, message: 'Method is not allowed', header: { Allow: 'GET, POST, PUT, OPTIONS' } },
    notAcceptable: { status: 'fail', statusCode: 406, message: 'Method is not acceptable' },
    serverError: { status: 'error', statusCode: 500, message: 'Internal error' }
  }

  /** @static @function error(data,source)
    * Returns error status
    * @param {object|string} data
    * @param {string} source - name of class that triggered the response
    * @return {object}
    **/
  static error(data = {}, source = undefined) {
    return {...this.status['error'], ...{ source: source, contentType: 'application/json' }, ...(typeof data === 'string' ? { payload: data } : data)};
  }
  /** @static @function fail(data,source)
    * Returns fail status
    * @param {object} data
    * @return {object}
    **/
  static fail(data = {}, source = undefined) {
    return {...this.status['fail'], ...{ source: source, contentType: 'application/json' }, ...(typeof data === 'string' ? { payload: data } : data)};
  }
  /** @static @function respond(message,data,source)
    * Returns the response based on message
    * @param {string} message
    * @param {object|string} data
    * @param {string} source - name of class that triggered the response
    * @return {object}
    **/
  static respond(message, data = {}, source = undefined) {
    return {...this.message[message], ...{ source: source, contentType: 'application/json' }, ...(typeof data === 'string' ? { payload: data } : data)};
  }
  /** @static @function success(data,source)
    * Returns success status
    * @param {object|string} data
    * @param {string} source - name of class that triggered the response
    * @return {object}
    **/
  static success(data = {}, source = undefined) {
    return {...this.status['success'], ...{ source: source, contentType: 'application/json' }, ...(typeof data === 'string' ? { payload: data } : data)};
  }
}
