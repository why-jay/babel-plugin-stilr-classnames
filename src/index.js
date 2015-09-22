import evaluatePath from './evaluatePath';

// I don't know why, but ES6 import doesn't work here
const babel = require('babel-core');

import autoprefixer from 'autoprefixer';
import fs from 'fs';
import isString from 'lodash.isstring';
import rest from 'lodash.rest';
import path from 'path';
import postcss from 'postcss';
import stilr from 'stilr';
import stilrcx from 'stilr-classnames';

export default function ({Plugin, types: t}) {
  return new Plugin("babel-plugin-stilr-classnames", {
    visitor: {
      CallExpression(node) {

        if (node.callee.name ==='stilrcx') {
          const argPaths = rest(node._paths);

          const argValues = argPaths.map(path => {
            const {confident, value} = evaluatePath(path);
            if (!confident) {
              throw this.errorWithNode('babel-plugin-stilr-classnames:' +
                ' Every argument must be a constant' +
                ' that can be evaluated statically');
            }
            return value;
          });

          const className = stilrcx(...argValues);

          return t.literal(className);
        }

      },
      Program: {
        exit(node, parent, scope) {

          const stylesheet =
            postcss(autoprefixer())
              .process(stilr.render())
              .css;

          if (process.env.NODE_ENV === 'production') {

            global.stilrStylesheet = stylesheet;

          } else {

            scope.path.get('body')[0].insertBefore(
              babel.parse(`
                var stilrStyleElem =
                  document.getElementById('babel_stilrcx_style');
                if (!stilrStyleElem) {
                  stilrStyleElem = document.createElement('style');
                  stilrStyleElem.id = 'babel_stilrcx_style';
                  document.head.appendChild(stilrStyleElem);
                }
                var newStilrStylesheet = ${JSON.stringify(stylesheet)};
                if (newStilrStylesheet) {
                  stilrStyleElem.textContent = newStilrStylesheet;
                }
              `)
            );

          }
        }
      }
    }
  });
}
