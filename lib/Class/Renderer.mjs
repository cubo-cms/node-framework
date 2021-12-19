/** @package        @cubo-cms/node-framework
  * @module         /lib/Class/Renderer.mjs
  * @version        0.4.38
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Renderer extends Namespace.Class {
  /** @property {object} format - holds routines to format tag values
    **/
  format = {};
  /** @property {object} rule - holds rules to render tags
    **/
  rule = {};
  counter = 0;

  /** @function addFormat(format)
    * Adds additional format functions to default ones
    * @param {object} format
    **/
  addFormat(format) {
    Object.assign(this.format, format);
  }
  /** @function addRule(rule)
    * Adds additional rule functions to default ones
    * @param {object} rule
    **/
  addRule(rule) {
    Object.assign(this.rule, rule);
  }
  /** @function render(text)
    *
    * Function render - renders tags in text
    *
    * @param {string} text
    * @return {string}
    **/
  render(text) {
    return new Promise((resolve, reject) => {
      let promises = [];
      Object.values(this.rule).forEach((rule) => {
        [...text.matchAll(rule.regex)].forEach((match) => {
          text = text.split(match[0]).join(`{{${this.counter}}}`);
          let routine = rule.routine.bind(this);
          promises.push(routine(match[0], match.slice(1), this.counter).then((data) => {
            text = text.split(`{{${data.counter}}}`).join(data.result);
          }));
          this.counter++;
        });
      });
      Promise.allSettled(promises).then(() => {
        resolve(text);
      });
    });
  }
}
