/** @package        @cubo-cms/node-framework
  * @module         /lib/Class/Template.mjs
  * @version        0.4.36
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Template extends Namespace.Class {
  /** @property {object} default - holds default values
    **/
  default = {
    template: '#/template/default.html'
  }
  /** @property {object} render - holds view methods
    **/
  render = {
    template: function() {
      return new Promise((resolve, reject) => {
        let template = this.get('template');
        if(template) {
          Namespace.FileLoader.load(template).then((template) => {
            this.set('template', template);
            return Namespace.HTMLRenderer.create(this.data, this);
          }).then((renderer) => {
            resolve(renderer.render(this.get('template')));
          }).catch((error) => {
            reject(Namespace.JResponse.respond('badRequest', { message: 'View cannot load template' }, this.type));
          });
        } else {
          reject(Namespace.JResponse.respond('badRequest', { message: 'Template cannot load template file' }, this.type));
        }
      });
    }
  }

  /** @function view()
    * Getter to retrieve the view object
    * @return {object}
    **/
  get view() {
    return this.calledBy;
  }

  /** @function invokeRender()
    * Invokes view render and returns processed data
    * @return {Promise <object>}
    **/
  invokeRender() {
    return new Promise((resolve, reject) => {
      _log_.info({ message: `Template invokes render \"template\"`, source: this.type });
      let template = this.render['template'].bind(this);
      resolve(template());
    }).catch((error) => {
      reject(error);
    });
  }
}
