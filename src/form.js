/* eslint-env browser */
import { submitForm, serializeForm } from "./util";
import { prependChild, removeNode } from "uitil/dom";

export default class HijaxForm extends HTMLElement {
	connectedCallback() {
		let { form } = this;
		let interceptor = document.createElement("hijax-form-interceptor");
		// TODO: move as `wrap` into uitil?
		[].slice.call(form.childNodes).forEach(node => {
			interceptor.appendChild(node);
		});
		form.appendChild(interceptor);
		// TODO: `MutationObserver` to ensure `interceptor` remains in place?

		this.addEventListener("submit", this._reset);
		interceptor.addEventListener("click", this._onClick.bind(this));
	}

	submit({ headers, strict } = {}) {
		return submitForm(this.form, { headers, cors: this.cors, strict });
	}

	serialize() {
		return serializeForm(this.form);
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

	// cleans up temporary substitute field
	_reset(ev) {
		let field = this._tmpField;
		if(field) {
			removeNode(field);
			this._tmpField = null;
		}
	}

	get cors() {
		return this.hasAttribute("cors");
	}

	get form() {
		return this.querySelector("form");
	}
}
