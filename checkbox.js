(function(window, document, undefined) {
	var util = {
			// Decorates class constructor. You can call decorated constractor with or without new operator + with 1 DOMElement or Array of DOMElement or NodeList
			decorate : function(constructor) {
				var decorated = function(elem, options) {
					var result = !(this instanceof constructor.classInstance)
							? new constructor.classInstance(elem, options)
							: elem instanceof NodeList || elem instanceof Array
								? [].slice
									.call(elem)
									.map(function(item) {
										return new constructor.classInstance(item, options) })
								: constructor.call(this, elem, options);

					return result;
				}

				constructor.classInstance = decorated;

				return decorated;
			},

			toArray : function(object) {
				var arr = [];

				for (var key in object)
					if (object.hasOwnProperty(key))
						arr.push({ key: key, value: object[key]});

				return arr;
			},

			toObject : function(array) {
				return array.reduce(
					function(res, item) {
						res[item.key] = item.value;
						return res; },
					{}); },

			extend : function(obj1, obj2) {
				return
					// toObject([{ key: a, value: 1}, {key: a, value: 2}]) => { a: 2 }
					util.toObject(
						util
							.toArray( obj1 )
							.concat(
								util.toArray(
									obj2)))},

			// WARNING: parseHTML("<tr><td> test </td></tr>") will not work. TR can't be created inside <div> tag.
			parseHTML : function(code) {
				var temp = document.createElement("div");

				temp.innerHTML = code;

				return temp.children.length > 1
					? temp.children
					: temp.children[0];
			},

			// render("--[vname]--", { vname: "qwerty" }) => "--qwerty--"
			render : function(template, context) {
				for (var i in context)
					template = template
						.replace("[@]"
							.replace("@", i),
							context[i]);

				return template;
			}
		},

		defaults = {
			"template" : "<div class='checkbox'>[text]</div>",
			"class-checked" : "checked",
			"var-text" : "text",
			"attr-text" : "text"
		},

		instances = [],

		Checkbox = util.decorate(function(elem, options) {
			this.elem = elem;

			this.options = util.extend(defaults, options);

			this._createWidget()
				._showWidget()
				.onChange();

			instances.push(this);
		});

	Checkbox.prototype._createWidget = function() {
		var options 		= this.options,

			classChecked	= options["class-checked"],
			varText			= options["var-text"],
			attrText		= options["attr-text"],

			elem 	= this.elem,

			name 	= elem.attributes.name.value || instances.length,
			text	= elem.attributes[attrText].value,
			type	= elem.attributes.type.value,

			template 		= options["template"],

			context			= util.toObject([{ key: varText, value: text}]),

			widget 	= util.parseHTML(
				util.render(
					template,
					context));

		elem.widget	= this;

		this.name	= name;
		this.widget	= widget;

		this.classChecked = classChecked;
		this.type = type;

		this.attachEvents();

		return this;
	};

	Checkbox.prototype.onChangeCheckbox = function() {
		this.elem.checked
			? this.widget.classList.add(this.classChecked)
			: this.widget.classList.remove(this.classChecked);
	};

	Checkbox.prototype.onChangeRadio = function() {
		var name = this.name;
		instances
			.filter(function(item) { return item.name == name; })
			.forEach(function(item) { item.onChangeCheckbox(); });
	};

	Checkbox.prototype.onChange = function() {
		this.type == "radio"
			? this.onChangeRadio()
			: this.onChangeCheckbox();
	};

	Checkbox.prototype.attachEvents = function() {
		this.elem.addEventListener("change", this.onChange.bind(this))
		this.widget.addEventListener("click", this.elem.click.bind(this.elem));
	};

	Checkbox.prototype._showWidget = function() {
		this.elem.parentElement.insertBefore(this.widget, this.elem);
		this.elem.style.display = "none";

		return this;
	};

	Checkbox.defaults = defaults;

	window.Checkbox = Checkbox;
})(window, document, undefined);
