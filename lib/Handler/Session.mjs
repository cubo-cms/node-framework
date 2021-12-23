/** @package        @cubo-cms/node-framework
  * @module         /lib/Handler/Session.mjs
  * @version        0.5.39
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import crypto from 'crypto';

import Handler from '../Handler.mjs';
import JResponse from '../Helper/JResponse.mjs';
import Timer from '../Helper/Timer.mjs';

export default class Session extends Handler {
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
    for(const session of Object.keys(_session_)) {
      if(_session_[session].expires && _session_[session].expires < Date.now()) {
        delete _session_[session];
        counter++;
      }
    }
    if(global.log) log.info({ message: `Session cleans up ${counter} session(s)`, source: this.type });
  }
  /** static @function find(accessToken)
    * Find session by access token
    * @param {string} accessToken
    * @return {object}
    **/
  static find(accessToken) {
    if(!global._session_) return undefined;
    for(const sessionId of Object.keys(_session_)) {
      if(_session_[sessionId].accessToken === accessToken && _session_[sessionId].expires > Date.now()) {
        return _session_[sessionId];
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
    return _session_[sessionId];
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
    this.cleanUpTimer = Timer.onEvery(this.default.cleanUpInterval, this.cleanUp, global._session_);
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

  /** @function handler(data,request,response)
    * Invokes session handler method and returns processed data
    * @param {object} data
    * @param {object} request
    * @param {object} response
    * @return {Promise <object>}
    **/
  handler(data = {}, request, response) {
    // Initiate global sessions object
    if(!global.session) {
      global.session = {};
      Session.setCleanUpTimer();
    }
    return new Promise((resolve, reject) => {
      data = { sessionId: Session.generateKey(), sessionStarted: Date.now(), setLifetime: this.get('maxAge'), user: this.get('user'), userRole: this.get('userRole') };
      // Store the session into the global sessions object
      session[data.sessionId] = this;
      if(global.log) log.info({ message: `Session is created`, source: this.name, payload: data });
      resolve(JResponse.success({ data: data }, this.name));
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
    this.expires = Date.now() + Timer.parse(maxAge);
  }
}