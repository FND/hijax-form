/* eslint-env browser */
import { find } from "uitil/dom";
import httpRequest from "uitil/dom/http";

export function submitForm(form, { headers, cors, strict } = {}) {
	let method = form.getAttribute("method");
	method = method ? method.toUpperCase() : "GET";
	let uri = form.getAttribute("action");
	let body;

	if(method === "GET") {
		if(uri.indexOf("?") !== -1) {
			throw new Error("query strings are invalid within `GET` forms' " +
					"`action` URI; please use hidden fields instead");
		}
		uri = [uri, serializeForm(form, new StringParams())].join("?");
	} else if(form.getAttribute("enctype") === "multipart/form-data") {
		body = serializeForm(form, new FormDataParams());
	} else {
		headers = headers || {};
		headers["Content-Type"] = "application/x-www-form-urlencoded";
		body = serializeForm(form, new StringParams());
	}

	form.setAttribute("aria-busy", "true");
	let reset = () => {
		form.removeAttribute("aria-busy");
	};
	return httpRequest(method, uri, headers, body, { cors, strict }).
		then(res => {
			reset();
			return res;
		}).
		catch(err => {
			reset();
			throw err;
		});
}

// Collects form parameters using the `params` accumulator which is passed
// into the function. The accumulator then serializes the data either
// as a `FormData` object or as an `application/x-www-form-urlencoded` string
// NB: only supports a subset of form fields, notably excluding named buttons
export function serializeForm(form, params = new StringParams()) {
	let selector = ["input", "textarea", "select"].
		map(tag => `${tag}[name]:not(:disabled)`).join(", ");
	let radios = {};
	return find(form, selector).reduce((params, node) => {
		let { name } = node;
		let value;
		switch(node.nodeName.toLowerCase()) {
		case "textarea":
			value = node.value;
			break;
		case "select":
			value = node.multiple ?
				find(node, "option:checked").map(opt => opt.value) :
				node.value;
			break;
		case "input":
			switch(node.type) {
			case "file":
				value = node.files[0];
				break;
			case "checkbox":
				if(node.checked) {
					value = node.value;
				}
				break;
			case "radio":
				if(!radios[name]) {
					let field = form.
						querySelector(`input[type=radio][name=${name}]:checked`);
					value = field ? field.value : undefined;
					if(value) {
						radios[name] = true;
					}
				}
				break;
			default:
				value = node.value;
				break;
			}
			break;
		}

		if(value !== undefined) {
			let values = value || [""];
			if(!values.pop) {
				values = [values];
			}
			values.forEach(value => {
				params.setParameter(name, value);
			});
		}
		return params;
	}, params).serialize();
}

class FormDataParams {
	constructor() {
		this.formData = new FormData();
	}

	setParameter(name, value) {
		this.formData.append(name, value);
	}

	serialize() {
		return this.formData;
	}
}

class StringParams {
	constructor() {
		this.params = [];
	}

	setParameter(name, value) {
		if(typeof (value) !== "string") {
			throw new Error("`input[type=file]` fields are only supported for " +
				"forms with [enctype=multipart/form-data]");
		}

		let param = [name, value].map(encodeURIComponent).join("=");
		this.params.push(param);
	}

	serialize() {
		return this.params.join("&");
	}
}

// TODO: move into uitil?
export function wrapChildren(parentNode, wrapperNode) {
	[].slice.call(parentNode.childNodes).forEach(node => {
		wrapperNode.appendChild(node);
	});
	parentNode.appendChild(wrapperNode);
}
