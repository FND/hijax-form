hijax-form
==========

`<hijax-form>` is a
[custom element](https://html.spec.whatwg.org/multipage/custom-elements.html)
for AJAX form submission, relying on established HTML form semantics and leaving
markup up to the server. Thus server-side implementations can remain agnostic of
this client-side enhancement.

Its core functionality can also be used as a library (→ `util.js`), though the
custom element is required to support named buttons.


Usage
-----

```html
<hijax-form cors>
    <form action="/items" method="post">
        <input type="text" name="message">
        <button>submit</button>
    </form>
</hijax-form>
```

The optional `cors` boolean attribute, if present, ensures
[credentials](https://fetch.spec.whatwg.org/#credentials) are included with
cross-origin requests.

```javascript
import "hijax-form"; // automatically registers custom element

let form = document.querySelector("form");
form.addEventListener("submit", function(ev) {
    this.closest("hijax-form").submit().
        then(response => response.text()).
        then(html => {
            // process response, e.g. by updating page contents
        });

    ev.preventDefault(); // suppress the browser's default form handling
});
```


Caveats
-------

* file input fields are unsupported

  Attempting to serialize a form which includes `<input type="file" …>` will
  throw an exception. Thus it is recommended to invoke `Event#preventDefault`
  only after serialization has occurred, allowing the browser to fall back to
  regular (non-AJAX) form submission.

* named buttons (i.e. `<button name="…" …>`) are supported by injecting a
  temporary substitute field (i.e. `<input type="hidden" name="…" …>`) - thus:
    * `submit` event handlers' form processing, i.e. invocation of the
      `#serialize` or `#submit` methods, must occur synchronously
    * if no `submit` event handler is registered, i.e. the browser's default
      handling is not suppressed, the temporary substitute field will result
      in the respective button's parameter being duplicated when the browser
      submits the form


Dependencies
------------

hijax-form has no external dependencies (though it includes a few tiny utility
functions from [uitil](https://github.com/FND/uitil)).

However, it does rely on modern browser features which might need to be
polyfilled:

* custom elements — suggested polyfill:
  [document-register-element](https://github.com/WebReflection/document-register-element)
* `fetch` — suggested polyfill: [whatwg-fetch](https://github.com/github/fetch)
  or [unfetch](https://github.com/developit/unfetch)
* `Element#closest`
* `Object.assign`

The source code is written in ES2015, without relying on non-standardized
language extensions.


Contributing
------------

* ensure [Node](http://nodejs.org) is installed
* `npm install` downloads dependencies
* `npm run compile` performs a one-time compilation, generating `dist/bundle.js`
* `npm start` automatically recompiles while monitoring code changes
* `npm test` checks code for stylistic consistency
* the test suite (`test/index.html`) needs to be opened in a browser


License
-------

hijax-form is licensed under the Apache 2.0 License.
