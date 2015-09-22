# babel-plugin-stilr-classnames

This plugin does the following things:

-   Locate any and all occurences of the call expression `stilrcx(...)` in your
code.
That is, `stilrcx` will be treated like a special compile-time macro.

-   Statically evaluate the return value of the function call using
[stilr-classnames](https://github.com/chcokr/stilr-classnames).
This means all of the arguments must be eligible for static evaluation.
This plugin should do its best to dig through your code to allow as much static
evaluation as possible.
If any of the arguments cannot be statically evaluated, then an error will be
thrown.

-   If static evaluation succeeds, replace the function call with the return
value of the function call.

-   After the above happens for all occurrences of `stilrcx(...)`, this plugin
will use [stilr](https://github.com/kodyl/stilr) to render a stylesheet
containing all of the styles you defined via `stilrcx(...)`.

-   Finally, if `process.env.NODE_ENV === 'production'`,
`global.stilrStylesheet` is set to the stylesheet that just got rendered.

- If `process.env.NODE_ENV !== 'production'`, the following code will be added
to the top of your program:

```JS
var stilrStyleElem =
    document.getElementById('babel_stilrcx_style');
if (!stilrStyleElem) {
  stilrStyleElem = document.createElement('style');
  stilrStyleElem.id = 'babel_stilrcx_style';
  document.head.appendChild(stilrStyleElem);
}
stilrStyleElem.textContent += "the stylesheet that just got rendered";
```
