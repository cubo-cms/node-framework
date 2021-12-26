/** @package        @cubo-cms/node-framework
  * @module         /lib/Handler/Session.mjs
  * @version        0.5.40
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import crypto from 'crypto';

import Namespace from '../../Namespace.mjs';

export default class Session extends Namespace.Handler {
  /** @static @property {object} default - holds defaults specific for this class
    **/
  static default = {
    cleanUpInterval: '1d',  // interval at which abandoned sessions are cleaned up
    keySize: 24,            // default size of generated keys
    maxAge: '1h',           // maximum lifetime of session after last request
    user: 'nobody',         // default user when starting session
    userRole: 'guest'       // default user role when starting session
  };
  /** @static @property {object} cleanUpTimer
    **/
  static cleanUpTimer;

  /** static @function cleanUp(sessions)
    * Removes abandoned sessions that have expired
    * @param {object} sessions
    **/
  static cleanUp() {
    if(!global._session_) return;
    let counter = 0;
    for(const sessionId of Object.keys(global._session_)) {
      if(global._session_[sessionId].expires && global._session_[sessionId].expires < Date.now()) {
        delete global._session_[sessionId];
        counter++;
      }
    }
    if(global.log) log.info({ message: `${this.name} cleans up ${counter} session(s)`, source: this.name });
  }
  /** static @function find(accessToken)
    * Find session by access token
    * @param {string} accessToken
    * @return {object}
    **/
  static find(accessToken) {
    if(!global._session_) return undefined;
    for(const sessionId of Object.keys(global._session_)) {
      if(global._session_[sessionId].accessToken === accessToken && global._session_[sessionId].expires > Date.now()) {
        return global._session_[sessionId];
      }
    }
    return undefined;
  }
  /** @static @function generateKey(keySize)
    * Generates a random key of specified size
    * @param {int} keySize
    * @return {string}
    **/
  static generateKey(keySize = this.default.keySize) {
    return crypto.randomBytes(keySize).toString('hex');
  }
  /** static @function get(sessionId)
    * Find session by session ID
    * @param {string} sessionId
    * @return {object}
    **/
  static get(sessionId) {
    if(!global._session_) return undefined;
    return global._session_[sessionId];
  }
  /** @static @function hash(data,algorithm)
    * Generates hash from
    * @param {string} data
    * @param {string} algorithm
    * @return {string}
    **/
  static hash(data, algorithm = 'sha-256') {
    return algorithm + '=' + crypto.createHash(algorithm.replaceAll('-', '')).update(data).digest('base64');
  }
  /** static @function setCleanUpTimer()
    * Sets the session clean up timer
    **/
  static setCleanUpTimer() {
    this.cleanUpTimer = Namespace.Timer.onEvery(this.default.cleanUpInterval, this.cleanUp, global._session_);
  }

  /** @function isAuthenticated()
    * Getter returns true if a session appears authenticated
    * @return {bool}
    **/
  get isAuthenticated() {
    return this.accessToken && this.expires > Date.now();
  }
  /** @function isGuest()
    * Getter returns true if a session appears unauthenticated
    * @return {bool}
    **/
  get isGuest() {
    return !this.isAuthenticated;
  }
  /** @function sessionId()
    * Getter returns session id
    * @return {string}
    **/
  get sessionId() {
    return this.get('sessionId');
  }

  /** @function handler(request,response)
    * Invokes session handler and returns processed data
    * @param {object} request - requested data to be processed
    * @param {object} response - data returned back to server
    * @return {object} - data returned to application
    **/
  handler(request, response) {
    // Initiate global sessions object
    if(!global._session_) {
      global._session_ = {};
      Session.setCleanUpTimer();
    }
    return new Promise((resolve, reject) => {
      let data = { sessionId: Session.generateKey(), sessionStarted: Date.now(), user: this.get('user'), userRole: this.get('userRole') };
      // Store the session into the global sessions object
      global._session_[data.sessionId] = this;
      this.setLifetime(this.get('maxAge'));
      if(global.log) log.info({ message: `Session is created`, source: this.name, payload: { sessionId: data.sessionId } });
      resolve(Namespace.JResponse.success({ data: data }, this.name));
    });
  }
  /** @function setAccessToken(maxAge)
    * Sets session lifetime
    * @param {int} keySize - no value clears the token
    * @return {string} - generated token
    **/
  setAccessToken(keySize = 0) {
    if(keySize) {
      return this.accessToken = Session.generateKey(keySize);
    } else {
      this.set('user', undefined);
      this.set('userRole', undefined);
      delete this.accessToken;
      return undefined;
    }
  }
  /** @function setLifetime(maxAge)
    * Sets session lifetime
    * @param {string} session
    **/
  setLifetime(maxAge = this.get('maxAge')) {
    this.expires = Date.now() + Namespace.Timer.parse(maxAge);
  }
}
