var assert = require('assert');
var babel = require('babel-core');
var fs = require('fs');
var path = require('path');

describe('Plugin', function () {
  describe("'s evaluatePath passes", function () {
    var testFilePaths = fs.readdirSync(path.join(__dirname, 'evaluatePath'));

    testFilePaths.forEach(function (filePath) {

      it(path.basename(filePath, '.js'), function () {

        babel.transformFileSync(
          path.join(__dirname, 'evaluatePath', filePath),
          {
            plugins: ['../dist/index']
          }
        );

      })

    });

  });

  var transformResult =
    babel.transformFileSync(path.join(__dirname, 'general', 'targetFile.js'), {
      plugins: ['../dist/index']
    });

  it('writes proper header at beginning of program', function () {
    var expectedHeader =
      fs.readFileSync(path.join(__dirname, 'general', 'expectedHeader.js'))
        .toString()
        .replace(/\n/g, '');
    assert(
      transformResult.code.replace(/\n/g, '').indexOf(expectedHeader) !== -1);

  });

  it('replaces the function call with the return value', function () {
    assert(transformResult.code.indexOf("var stylesheet = '_1A3OE5'") !== -1);
  });

});
