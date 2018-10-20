"use strict";

let bundle = {
	source: "./src/index.js",
	target: "./dist/bundle.js"
};

if(process.env.HIJAX_DIST) {
	Object.assign(bundle, {
		target: "./hijax-form.js",
		esnext: true
	});
}

module.exports = {
	watchDirs: ["./src", "./test"],
	js: [bundle]
};
