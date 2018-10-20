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
			t.strictEqual(el.cors, false);

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

test("AJAX submission", (t, fixtures) => {
	let el = fixtures.querySelector(TAG);
	// hijack `fetch` to track HTTP requests
	let requests = [];
	let { fetch } = window;
	window.fetch = (uri, options) => {
		requests.push(Object.assign({}, options, { uri }));
	};
	let restore = () => {
		window.fetch = fetch;
	};

	return customElements.whenDefined(TAG).
		then(() => el.submit()).
		then(() => {
			t.deepEqual(requests, [{
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
			t.strictEqual(requests.length, 2);
			t.deepEqual(requests[1], {
				method: "GET",
				uri: "/dummy?id=abc123&title=",
				credentials: "include"
			});

			restore();
		}).
		catch(err => {
			restore();
			throw err;
		});
});
