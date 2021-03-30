/* eslint-env browser */
import { html2dom, group, test, wait } from "./util.js";

let TAG = "hijax-form";
let REQUESTS, RESTORE;

group("hijax-form", {
	before: () => {
		// hijack `fetch` to track HTTP requests
		REQUESTS = [];
		RESTORE = hijack("fetch", window, (uri, options) => {
			REQUESTS.push(Object.assign({ uri }, options));
			return wait(1);
		});

		return customElements.whenDefined(TAG);
	},
	after: () => void RESTORE()
});

test("form serialization", (t, fixtures) => {
	let el = fixtures.querySelector(TAG);
	t.strictEqual(el.serialize(), "id=abc123&title=");

	el.querySelector("input[name=title]").value = "hello world";
	t.strictEqual(el.serialize(), "id=abc123&title=hello%20world");

	let field = html2dom('<input type="file" name="document">').childNodes[0];
	el.form.appendChild(field);
	t.throws(() => el.serialize(), /unsupported/);
});

test("AJAX submission", function(t, fixtures) {
	let el = fixtures.querySelector(TAG);
	return el.submit().
		then(() => {
			t.deepEqual(REQUESTS, [{
				method: "POST",
				uri: "/dummy",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: "id=abc123&title=",
				credentials: "same-origin"
			}]);

			el.setAttribute("cors", "");
			el.form.setAttribute("method", "get");
			return el.submit();
		}).
		then(() => {
			t.strictEqual(REQUESTS.length, 2);
			t.deepEqual(REQUESTS[1], {
				method: "GET",
				uri: "/dummy?id=abc123&title=",
				credentials: "include"
			});
		});
});

function hijack(prop, obj, value) {
	let original = obj[prop];
	obj[prop] = value;
	return () => {
		obj[prop] = original;
	};
}
