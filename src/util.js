/* eslint-env browser */
import { find } from "uitil/dom";
import httpRequest from "uitil/dom/http";

export function submitForm(form, { headers, cors, strict } = {}) {
	let method = form.getAttribute("method");
	method = method ? method.toUpperCase() : "GET";
	let uri = form.getAttribute("action");
	let payload = serializeForm(form);

	if(method === "GET") {
		if(uri.indexOf("?") !== -1) {
			throw new Error("query strings are invalid within `GET` forms' " +
					"`action` URI; please use hidden fields instead");
		}
		uri = [uri, payload].join("?");
	} else {
		headers = headers || {};
		headers["Content-Type"] = "application/x-www-form-urlencoded";
		var body = payload; // eslint-disable-line no-var
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

// stringify form data as `application/x-www-form-urlencoded`
// required due to insufficient browser support for `FormData`
// NB: only supports a subset of form fields, notably excluding named buttons
//     and file inputs
export function serializeForm(form) {
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
				throw new Error("`input[type=file]` fields are unsupported");
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
				let param = [name, value].map(encodeURIComponent).join("=");
				params.push(param);
			});
		}
		return params;
	}, []).join("&");
}
