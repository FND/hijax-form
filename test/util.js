/* global QUnit */

QUnit.config.noglobals = true;

export function html2dom(html) {
	let tmp = document.createElement("div");
	tmp.innerHTML = html;
	return Array.prototype.slice.call(tmp.childNodes);
}

export function group(name, options = {}) {
	let { before } = options;
	options.before = function() {
		// NB: `#qunit-fixture` is re-created for each test, thus the thunk here
		this.fixtures = () => document.getElementById("qunit-fixture");

		before && before.call(this);
	};

	QUnit.module(name, options);
}

// NB: relies on `before` hook injected by `group`
export function test(name, callback) {
	return QUnit.test(name, function(t) {
		return callback(t, this.fixtures());
	});
}

export function wait(delay) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, delay);
	});
}
