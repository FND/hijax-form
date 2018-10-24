"use strict";

let config = require("./faucet.config.js");

let bundle = config.js[0];
bundle.target = "./dist/hijax-form.js";
bundle.esnext = true;

module.exports = config;
