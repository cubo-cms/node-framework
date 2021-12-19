/** @package        @cubo-cms/node-framework
  * @module         /lib/Renderer/HTMLRenderer.mjs
  * @version        0.4.38
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import { marked } from 'marked';

import Namespace from '../../Namespace.mjs';

/** @property {object} format - holds routines to format tag values
  **/
const format = {
  ccase: function(str) {       // Returns lower camelcase
    return new Promise((resolve, reject) => {
      let word = str.toLowerCase().split(/[\s-]+/);
      for(let i = 1; i < word.length; i++) {
        word[i] = word[i].charAt(0).toUpperCase() + word[i].substring(1);
      }
      resolve(word.join(''));
    });
  },
  count: function(str) {       // Returns count
    return new Promise((resolve, reject) => {
      resolve(str.length);
    });
  },
  lcase: function(str) {       // Returns lowercase
    return new Promise((resolve, reject) => {
      resolve(str.toLowerCase());
    });
  },
  render: function(str) {
    return new Promise((resolve, reject) => {
      if(Namespace.FileLoader.isURL(str)) {
        Namespace.FileLoader.load(str).then((content) => {
          resolve(marked(content));
        });
      } else {
        resolve(marked(str));
      }
    });
    return marked(str);
  },
  tcase: function(str) {       // Returns titlecase (first letter of each word caps)
    return new Promise((resolve, reject) => {
      let word = str.toLowerCase().split(' ');
      for(let i = 0; i < word.length; i++) {
        word[i] = word[i].charAt(0).toUpperCase() + word[i].substring(1);
      }
      resolve(word.join(' '));
    });
  },
  ucase: function(str) {       // Returns uppercase
    return new Promise((resolve, reject) => {
      resolve(str.toUpperCase());
    });
  }
};
/** @property {object} rule - holds rules to render tags
  **/
const rule = {
  each: {                 // Each block
    regex: /\{\s*each\s*([\w_-]+)\s*of\s*([\w_.-]+)\s*\}([\s\S]*)\{\/\s*each\s*\}/gm,
    routine: function(str, match, counter) {
      return new Promise((resolve, reject) => {
        let promises = [];
        if(Array.isArray(this.data[match[1]])) {
          let result = '';
          for(const item of this.data[match[1]]) {
            this.data[match[0]] = item;
            promises.push(this.render(match[2]).then((thisResult) => {
              result += thisResult;
            }));
          }
          Promise.allSettled(promises).then(() => {
            resolve({ result: result, counter: counter });
          });
        } else {
          resolve({ result: this.render(match[2]), counter: counter });
        }
      });
    }
  },
  include: {              // Include module
    regex: /\{\s*include\s*([^\s\}]+)\s*\}/gm,
    routine: function(str, match, counter) {
      return new Promise((resolve, reject) => {
        Namespace.FileLoader.load(match[0]).then((data) => {
          resolve({ result: data, counter: counter });
        });
      });
    }
  },
  comment: {              // Comment (left out)
    regex: /\{#(.*)\}/gm,
    routine: function(str, match, counter) {
      return new Promise((resolve, reject) => {
        resolve({ result: '', counter: counter });
      });
    }
  },
  variable: {             // Variable
    regex: /\{=\s*([\w_.-]+)(\->[^\}]+)?\s*\}/gm,
    routine: function(str, match, counter) {
      return new Promise((resolve, reject) => {
        let parts = match[0].split('.');
        let result = this.data;
        for(const part of parts) {
          if(result[part]) {
            result = result[part];
          } else {
            resolve({ result: str, counter: counter });
          }
        }
        if(match[1]) {
          let format = match[1].substring(2);
          if(this.format[format]) {
            this.format[format](result).then((result) => {
              resolve({ result: result, counter: counter });
            });
          } else {
            resolve({ result: result, counter: counter });
          }
        } else {
          resolve({ result: result, counter: counter });
        }
      });
    }
  }
};

export default class HTMLRenderer extends Namespace.Renderer {
  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    super(data);
    this.addFormat(format);
    this.addRule(rule);
  }
}
