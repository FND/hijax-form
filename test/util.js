/* eslint-env browser */
/* global QUnit */

QUnit.config.noglobals = true;

export function html2dom(html) {
	let parser = new DOMParser();
	return parser.parseFromString(html, "text/html").body;
}

// wrapper for `QUnit.module` to inject fixtures into tests
export function group(name, options = {}) {
	let { before } = options;
	options.before = function() {
		// NB: `#qunit-fixture` is re-created for each test, thus the thunk here
		this.fixtures = () => document.getElementById("qunit-fixture");

		return before && before.call(this);
	};

	QUnit.module(name, options);
}

// wrapper for `QUnit.test` to inject fixtures
// NB: relies on `before` hook injected by `group`
export function test(name, callback) {
	return QUnit.test(name, function(t) {
		return callback.call(this, t, this.fixtures());
	});
}

export function wait(delay) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, delay);
	});
}
