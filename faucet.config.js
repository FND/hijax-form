"use strict";

let bundle = {
	source: "./src/index.js",
	target: "./dist/bundle.js"
};

if(process.env.HIJAX_DIST) {
	bundle.target = "./hijax-form.js";
	bundle.esnext = true;
}

module.exports = {
	watchDirs: ["./src", "./test"],
	js: [bundle]
};
