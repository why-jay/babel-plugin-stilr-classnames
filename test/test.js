var assert = require('assert');
var babel = require('babel-core');
var fs = require('fs');
var path = require('path');

describe('Plugin', function () {
  describe("'s evaluatePath passes", function () {
    var testFilePaths = fs.readdirSync(path.join(__dirname, 'evaluatePath'));

    testFilePaths.forEach(function (filePath) {

      it(path.basename(filePath, '.js'), function () {
        process.env.NODE_ENV = 'development';
        // so that global.stilrStylesheet isn't polluted

        babel.transformFileSync(
          path.join(__dirname, 'evaluatePath', filePath),
          {
            plugins: ['../dist/index']
          }
        );

      })

    });

  });

  describe(', when process.env.NODE_ENV !== "production",',
    function () {
      process.env.NODE_ENV = 'development';

      var transformResult =
        babel.transformFileSync(
          path.join(__dirname, 'general', 'targetFile.js'),
          {
            plugins: ['../dist/index']
          }
        );

      it('writes proper header at beginning of program', function () {
        var expectedHeader =
          fs.readFileSync(path.join(__dirname, 'general', 'expectedHeader.js'))
            .toString()
            .replace(/\n/g, '');
        assert.notDeepEqual(
          transformResult.code.replace(/\n/g, '').indexOf(expectedHeader),
          -1);
      });

      it('replaces the function call with the return value', function () {
        assert.notDeepEqual(
          transformResult.code.indexOf("var stylesheet = '_1A3OE5'"),
          -1);
      });
    });

  describe(', when process.env.NODE_ENV === "production",',
    function () {
      process.env.NODE_ENV = 'production';

      babel.transformFileSync(
        path.join(__dirname, 'general', 'targetFile.js'),
        {
          plugins: ['../dist/index']
        }
      );

      it('sets global.stilrStylesheet to the rendered stylesheet', function () {
        var expectedHeader =
          fs.readFileSync(path.join(__dirname, 'general', 'expectedHeader.js'))
            .toString()
            .replace(/\n/g, '');
        assert.deepEqual(global.stilrStylesheet,
          '._1A3OE5{' +
            '-webkit-box-align:center;' +
            '-webkit-align-items:center;' +
            '-ms-flex-align:center;' +
            'align-items:center;}');
      });

    });

});


