/* eslint-env browser */
import { html2dom, group, test } from "./util.js";

let TAG = "hijax-form";

group("hijax-form");

// XXX: simplistic and unhelpful; test actual functionality instead
test("DOM API", (t, fixtures) => {
	let el = fixtures.querySelector(TAG);
	return customElements.whenDefined(TAG).
		then(() => {
			t.strictEqual(el.form.tagName, "FORM");
			t.strictEqual(el.method, "POST");
			t.strictEqual(el.uri, "/dummy");
			t.strictEqual(el.cors, false);
			t.strictEqual(typeof el.submit, "function");

			el.form.removeAttribute("method");
			t.strictEqual(el.method, "GET");

			el.setAttribute("cors", "");
			t.strictEqual(el.cors, true);
		});
});

test("form serialization", (t, fixtures) => {
	let el = fixtures.querySelector(TAG);
	return customElements.whenDefined(TAG).
		then(() => {
			t.strictEqual(el.serialize(), "id=abc123&title=");

			el.querySelector("input[name=title]").value = "hello world";
			t.strictEqual(el.serialize(), "id=abc123&title=hello%20world");

			let field = html2dom('<input type="file" name="document">')[0];
			el.form.appendChild(field);
			t.throws(() => el.serialize(), /unsupported/);
		});
});
