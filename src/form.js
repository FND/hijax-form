/* eslint-env browser */
import { submit, serializeForm } from "./util";

export default class HijaxForm extends HTMLElement {
	submit({ headers, strict }) {
		// XXX: getters result in redundant DOM queries
		return submit(this.method, this.uri, this.serialize(),
				{ headers, cors: this.cors, strict });
	}

	serialize() {
		return serializeForm(this.form);
	}

	get cors() {
		return this.hasAttribute("cors");
	}

	get uri() {
		return this.form.getAttribute("action");
	}

	get method() {
		let method = this.form.getAttribute("method");
		return method ? method.toUpperCase() : "GET";
	}

	get form() {
		return this.querySelector("form");
	}
}
