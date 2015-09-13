import isString from 'lodash.isstring';
import rest from 'lodash.rest';

// As of Babel 5.8.23, Babel doesn't know how to statically evaluate the
// following nodes:
// - object expressions
// - array expressions
// - identifiers that have a binding in their scopes
// - and of course, `require()` calls to static assets
// Proof: https://github.com/babel/babel/blob/442f1173d267299296924777352b58b6646525b6/packages/babel/src/traversal/path/evaluation.js
// All of the above types of nodes play an important role in stilr-classnames,
// so we provide an additional implementation on top of Babel's.
export default function evaluatePath(path) {
  if (!path.isObjectExpression() &&
      !path.isArrayExpression() &&
      !(path.isIdentifier() && path.scope.hasBinding(path.node.name, true)) &&
      !isRequireCallToStaticAsset(path)) {
    return path.evaluate();
  }

  if (path.isObjectExpression()) {

    let confident = true;
    let value = {};

    for (let prop of path.node.properties) {
      const keyPath = prop._paths[0];
      if (keyPath.computed) {
        confident = false;
        break;
      }

      const valPath = prop._paths[1];
      const valEvalResult = evaluatePath(valPath);
      if (!valEvalResult.confident) {
        confident = false;
        break;
      }

      value[keyPath.node.name] = valEvalResult.value;
    }

    if (!confident) {
      value = undefined;
    }

    return {confident, value};

  }

  if (path.isArrayExpression()) {

    let confident = true;
    let value = [];

    for (let elemPath of path.node._paths) {
      const elemEvalResult = evaluatePath(elemPath);
      if (!elemEvalResult.confident) {
        confident = false;
        break;
      }
      value.push(elemEvalResult.value);
    }

    if (!confident) {
      value = undefined;
    }

    return {confident, value};

  }

  if (path.isIdentifier() && path.scope.hasBinding(path.node.name, true)) {

    let confident = true;
    let value;

    const identifierName = path.node.name;
    const identifierDeclaratorPath = path.scope.getBinding(identifierName).path;
    const identifierDeclaratorNode = identifierDeclaratorPath.node;
    const declarationInitPath = identifierDeclaratorNode._paths[1];
    const initEvalResult = evaluatePath(declarationInitPath);

    const varLetConst = identifierDeclaratorPath.parentPath.node.kind;

    if (varLetConst === 'const' && initEvalResult.confident) {
      value = initEvalResult.value;
    }

    if (!confident) {
      value = undefined;
    }

    return {confident, value};

  }

  if (isRequireCallToStaticAsset(path)) {

    let confident = true;
    let value;

    if (!confident) {
      value = undefined;
    }

    return {confident, value};

  }

}

function isRequireCallToStaticAsset(path) {
  // TODO: this could definitely be better

  if (!path.isCallExpression()) {
    return false;
  }

  var node = path.node;

  if (node.callee.name !== 'require') {
    return false;
  }

  const argPaths = rest(node._paths);

  if (argPaths.length === 0) {
    return false;
  }

  const firstArgEvalResult = evaluatePath(argPaths[0]);

  if (!firstArgEvalResult.confident) {
    return false;
  }

  const firstArgVal = firstArgEvalResult.value;
  if (!isString(firstArgEvalResult.value)) {
    return false;
  }

  var staticAssetExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.otf',
    '.eot',
    '.svg',
    '.ttf',
    '.woff'
  ];

  if (!staticAssetExtensions.some(ext => firstArgVal.indexOf(ext) !== -1)) {
    return false;
  }

  return true;
}
