/** Handler module {Access} provides access methods for users. The methods
  * determine whether a specific visitor or user is allowed to perform CRUD
  * operations.
  *
  * @package        @cubo-cms/node-framework
  * @module         /lib/Handler/Access.mjs
  * @version        0.5.40
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Access extends Namespace.Handler {
  /** @static @property {object} allowed - holds default allowed operations for this class
    **/
  static allowed = {
    guest: {
      canRead: ['published'],
      canCreate: ['none'],
      canUpdate: ['none'],
      canPublish: ['none'],
      canDelete: ['none']
    },
    user: {
      canRead: ['published', 'own'],
      canCreate: ['none'],
      canUpdate: ['none'],
      canPublish: ['none'],
      canArchive: ['none'],
      canTrash: ['none'],
      canDelete: ['none']
    },
    author: {
      canRead: ['published', 'own'],
      canCreate: ['all'],
      canUpdate: ['own'],
      canPublish: ['none'],
      canArchive: ['none'],
      canTrash: ['none'],
      canDelete: ['none']
    },
    editor: {
      canRead: ['published', 'own'],
      canCreate: ['all'],
      canUpdate: ['all'],
      canPublish: ['none'],
      canArchive: ['none'],
      canTrash: ['none'],
      canDelete: ['none']
    },
    publisher: {
      canRead: ['all'],
      canCreate: ['all'],
      canUpdate: ['all'],
      canPublish: ['all'],
      canArchive: ['none'],
      canTrash: ['none'],
      canDelete: ['none']
    },
    manager: {
      canRead: ['all'],
      canCreate: ['all'],
      canUpdate: ['all'],
      canPublish: ['all'],
      canArchive: ['all'],
      canTrash: ['all'],
      canDelete: ['none']
    },
    administrator: {
      canRead: ['all'],
      canCreate: ['all'],
      canUpdate: ['all'],
      canPublish: ['all'],
      canArchive: ['all'],
      canTrash: ['all'],
      canDelete: ['all']
    }
  }
  /** @static @property {object} default - holds defaults specific for this class
    **/
  static default = {
    guest: {
      accessLevel: ['public', 'unauthenticated'],
      documentStatus: ['published']
    },
    user: {
      accessLevel: ['public', 'authenticated'],
      documentStatus: ['published']
    },
    author: {
      accessLevel: ['public', 'authenticated'],
      documentStatus: ['published']
    },
    editor: {
      accessLevel: ['public', 'authenticated'],
      documentStatus: ['published']
    },
    publisher: {
      accessLevel: ['public', 'private', 'authenticated'],
      documentStatus: ['published', 'unpublished']
    },
    manager: {
      accessLevel: ['public', 'private', 'authenticated', 'unauthenticated'],
      documentStatus: ['published', 'unpublished', 'archived', 'trashed']
    },
    administrator: {
      accessLevel: ['public', 'private', 'authenticated', 'unauthenticated'],
      documentStatus: ['published', 'unpublished', 'archived', 'trashed']
    }
  }

  /** @function handler(request,response,data)
    * Invokes access handler and returns processed data
    * @param {object} request - original server request
    * @param {object} response - server response
    * @param {object} data - data passed on to handler
    * @return {object} - data returned
    **/
  handler(request, response, data) {
    return new Promise((resolve, reject) => {
      // Return access filter based on current user role
      resolve(Namespace.JResponse.success({ data: { accessFilter: this.get(data.sessionData.userRole), this.get('guest')) } }, this.name));
    });
  }
}
