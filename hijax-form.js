(function(){'use strict';if(typeof global === "undefined" && typeof window !== "undefined") {
	window.global = window;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}function find(node, selector) {
  var nodes = node.querySelectorAll(selector);
  return [].slice.call(nodes);
}
function prependChild(node, container) {
  container.insertBefore(node, container.firstChild);
}
function removeNode(node) {
  node.parentNode.removeChild(node);
}function httpRequest(method, uri, headers, body) {
  var _ref = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {},
      cors = _ref.cors,
      strict = _ref.strict;
  var options = {
    method: method,
    credentials: cors ? "include" : "same-origin"
  };
  if (headers) {
    options.headers = headers;
  }
  if (body) {
    options.body = body;
  }
  var res = fetch(uri, options);
  return !strict ? res : res.then(function (res) {
    if (!res.ok) {
      throw new Error("unexpected ".concat(res.status, " response at ").concat(uri));
    }
    return res;
  });
}function submitForm(form) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      headers = _ref.headers,
      cors = _ref.cors,
      strict = _ref.strict;
  var method = form.getAttribute("method");
  method = method ? method.toUpperCase() : "GET";
  var uri = form.getAttribute("action");
  var payload = serializeForm(form);
  if (method === "GET") {
    if (uri.indexOf("?") !== -1) {
      throw new Error("query strings are invalid within `GET` forms' " + "`action` URI; please use hidden fields instead");
    }
    uri = [uri, payload].join("?");
  } else {
    headers = headers || {};
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    var body = payload;
  }
  form.setAttribute("aria-busy", "true");
  var reset = function reset() {
    form.removeAttribute("aria-busy");
  };
  return httpRequest(method, uri, headers, body, {
    cors: cors,
    strict: strict
  }).then(function (res) {
    reset();
    return res;
  }).catch(function (err) {
    reset();
    throw err;
  });
}
function serializeForm(form) {
  var selector = ["input", "textarea", "select"].map(function (tag) {
    return "".concat(tag, "[name]:not(:disabled)");
  }).join(", ");
  var radios = {};
  return find(form, selector).reduce(function (params, node) {
    var name = node.name;
    var value;
    switch (node.nodeName.toLowerCase()) {
      case "textarea":
        value = node.value;
        break;
      case "select":
        value = node.multiple ? find(node, "option:checked").map(function (opt) {
          return opt.value;
        }) : node.value;
        break;
      case "input":
        switch (node.type) {
          case "file":
            throw new Error("`input[type=file]` fields are unsupported");
          case "checkbox":
            if (node.checked) {
              value = node.value;
            }
            break;
          case "radio":
            if (!radios[name]) {
              var field = form.querySelector("input[type=radio][name=".concat(name, "]:checked"));
              value = field ? field.value : undefined;
              if (value) {
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
    if (value !== undefined) {
      var values = value || [""];
      if (!values.pop) {
        values = [values];
      }
      values.forEach(function (value) {
        var param = [name, value].map(encodeURIComponent).join("=");
        params.push(param);
      });
    }
    return params;
  }, []).join("&");
}
function wrapChildren(parentNode, wrapperNode) {
  [].slice.call(parentNode.childNodes).forEach(function (node) {
    wrapperNode.appendChild(node);
  });
  parentNode.appendChild(wrapperNode);
}var HijaxForm =
function (_HTMLElement) {
  _inherits(HijaxForm, _HTMLElement);
  function HijaxForm() {
    _classCallCheck(this, HijaxForm);
    return _possibleConstructorReturn(this, _getPrototypeOf(HijaxForm).apply(this, arguments));
  }
  _createClass(HijaxForm, [{
    key: "connectedCallback",
    value: function connectedCallback() {
      var form = this.form;
      var interceptor = document.createElement("hijax-form-interceptor");
      wrapChildren(form, interceptor);
      this.addEventListener("submit", this._reset);
      interceptor.addEventListener("click", this._onClick.bind(this));
    }
  }, {
    key: "submit",
    value: function submit() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          headers = _ref.headers,
          strict = _ref.strict;
      return submitForm(this.form, {
        headers: headers,
        cors: this.cors,
        strict: strict
      });
    }
  }, {
    key: "serialize",
    value: function serialize() {
      return serializeForm(this.form);
    }
  }, {
    key: "_onClick",
    value: function _onClick(ev) {
      var btn = ev.target;
      var name = btn.nodeName === "BUTTON" && btn.getAttribute("name");
      if (!name) {
        return;
      }
      var field = document.createElement("input");
      field.setAttribute("type", "hidden");
      field.setAttribute("name", name);
      if (btn.hasAttribute("value")) {
        field.setAttribute("value", btn.getAttribute("value"));
      }
      prependChild(field, this.form);
      this._tmpField = field;
    }
  }, {
    key: "_reset",
    value: function _reset(ev) {
      var field = this._tmpField;
      if (field) {
        removeNode(field);
        this._tmpField = null;
      }
    }
  }, {
    key: "cors",
    get: function get() {
      return this.hasAttribute("cors");
    }
  }, {
    key: "form",
    get: function get() {
      return this.querySelector("form");
    }
  }]);
  return HijaxForm;
}(_wrapNativeSuper(HTMLElement));customElements.define("hijax-form", HijaxForm);}());