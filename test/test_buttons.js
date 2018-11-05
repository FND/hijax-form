/* eslint-env browser */
import { group, test, wait } from "./util.js";

let TAG = "hijax-form";

group("named buttons");

test("auto-generated intercepting wrapper", (t, fixtures) => {
	let el = fixtures.querySelector(TAG);
	return customElements.whenDefined(TAG).
		then(() => {
			let { form } = el;
			t.strictEqual(form.childNodes.length, 1);
			t.strictEqual(form.firstChild.nodeName, "HIJAX-FORM-INTERCEPTOR");
		});
});

test("temporary substitute field", (t, fixtures) => {
	let el = fixtures.querySelector(TAG);

	let submissions = [];
	let onSubmit = ev => {
		submissions.push(el.serialize());
		ev.preventDefault();
	};

	return customElements.whenDefined(TAG).
		then(() => {
			let { form } = el;
			t.strictEqual(el.querySelectorAll("input[type=hidden]").length, 1);

			form.addEventListener("submit", onSubmit);

			form.querySelector("button:not([name])").click();
			t.deepEqual(submissions, ["id=abc123&title="]);
			t.strictEqual(el.querySelectorAll("input[type=hidden]").length, 1);

			form.querySelector("button[name]").click();
			t.strictEqual(submissions.length, 2);
			t.strictEqual(submissions[1], "op=rm&id=abc123&title=");

			return wait(1); // wait for temporary substitute field to be removed
		}).
		then(() => {
			t.strictEqual(el.serialize(), "id=abc123&title=");
			t.strictEqual(el.querySelectorAll("input[type=hidden]").length, 1);
		});
});
