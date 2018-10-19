/* eslint-env browser */
import { submit, serializeForm } from "./util";
import { prependChild, removeNode } from "uitil/dom";

export default class HijaxForm extends HTMLElement {
	connectedCallback() {
		let { form } = this;
		let interceptor = document.createElement("div");
		// TODO: move as `wrap` into uitil?
		[].slice.call(form.childNodes).forEach(node => {
			interceptor.appendChild(node);
		});
		form.appendChild(interceptor);
		// TODO: `MutationObserver` to ensure `interceptor` remains in place?

		this.addEventListener("submit", this._onSubmit);
		interceptor.addEventListener("click", this._onClick.bind(this));
	}

	// cleans up temporary substitute field
	_onSubmit(ev) {
		let field = this._tmpField;
		if(field) {
			removeNode(field);
			this._tmpField = null;
		}
	}

	// injects a temporary substitute field for named buttons
	_onClick(ev) {
		let btn = ev.target;
		let name = btn.nodeName === "BUTTON" && btn.getAttribute("name");
		if(!name) {
			return;
		}
		// inject temporary field (cleaned up by `<hijax-form>`
		let field = document.createElement("input");
		field.setAttribute("type", "hidden");
		field.setAttribute("name", name);
		if(btn.hasAttribute("value")) {
			field.setAttribute("value", btn.getAttribute("value"));
		}
		prependChild(field, this.form);
		this._tmpField = field;
	}

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
