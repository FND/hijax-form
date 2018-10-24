/* eslint-disable no-var, padded-blocks, no-console */
(function() {

var form = document.querySelector("form");
var note = document.createElement("p");
form.addEventListener("submit", function(ev) {
	var form = this;
	togglePending(form, true);
	form.closest("hijax-form").submit().
		then(function(res) {
			return res.text();
		}).
		then(function(html) {
			togglePending(form, false);

			note.innerHTML = html;
			form.appendChild(note);
		});

	ev.preventDefault(); // suppress the browser's default form handling
});

function togglePending(form, state) {
	form.querySelector("button").disabled = state;
}

// hijack `fetch`
console.info("☝️ overriding `fetch` to simulate HTTP requests");
window.fetch = function(uri, options) {
	var details = Object.assign({}, options);
	delete details.method;
	console.info("📡", options.method, uri, details);

	return new Promise(function(resolve) {
		setTimeout(function() {
			resolve({
				text: function() {
					var time = (new Date()).toLocaleString();
					var html = "<pre>" + details.body + "</pre>received at ";
					return Promise.resolve(html + time);
				}
			});
		}, 500);
	});
};

}());
