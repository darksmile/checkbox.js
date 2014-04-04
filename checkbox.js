// Checkbox.js - кастомный checkbox, или radiobutton, реализованный на чистом джаваскрипт.

// Почему Checkbox.js ?
// --------------------

// Я вижу 3 преимущества над другими реализациями:
//  - Отсутствие зависимостей.
//  - Вы работаете с обычным элементом формы, а виджет синхронизируется с состоянием элемента. Т.е. для того, чтобы получить выбранное значение, вы будете обращаться к чекбоксу, а не к виджету через его АПИ. Аналогично, если Вы захотите изменить состояние чекбокса или радиобаттона
//  - Возможность кастомизировать его целиком и полностью. Стили Вы пишете самостоятельно, в зависимости от того, что хотите представить в виде такого виджета. HTML код можно переопределить посредством передачи своего шаблона. В настройках можно указать даже переменные шаблона и названия атрибутов элемента, на которых основывается шаблонизатор

// Аннотированный код
// ------------------

// Объявляем namespace. Это нужно, чтобы не засорять глобальный нэймспэйс, и для того, чтобы сделать код легко минимизируемым
(function(window, document, undefined) {

	// Создаем объект с различными утилитами.
	var util = {
			// Функция - декоратор класса виджета. Принимает в качестве параметра конструктор, и добавляет возможность вызывать его без оператора new. Также появляется возможность передавать в конструктор не один элемент, а массив или NodeList
			decorate : function(constructor) {
				// Создаем новую функцию-конструктор
				var decorated = function(elem, options) {

					// Если функция вызвана без оператора new
					var result = !(this instanceof constructor.classInstance)
							// Вызовем ее с оператором new, и сохраним новый объект как результат
							? new constructor.classInstance(elem, options)
							// Если конструктор вызван правильно, и в качестве параметра ему передан массив или список DOM елементов
							: elem instanceof NodeList || elem instanceof Array
								// Превратим в массив (актуально в случае с NodeList)
								? [].slice
									.call(elem)
									// И вызовем конструктор для каждого элемента отдельно. В качестве результата будет созранен массив виджетов
									.map(function(item) {
										return new constructor.classInstance(item, options) })
								// Если конструктор класса вызван с параметром-элементом, вызовем настоящую функцию-конструктор, для объекта this
								: constructor.call(this, elem, options);

					// Возвращаем полученный результат (это либо виджет, либо массив виджетов). В случае вызова функции с оператором new, оператор return игнорируется (стандартное поведение javascript)
					return result;
				}

				// Это необходимо для правильной работы функции decorated
				constructor.classInstance = decorated;

				// Возвращаем новый, декорированный конструктор
				return decorated;
			},

			// Эта функция превращает объект в массив объектов вида { key: <key>, value: <value> }
			toArray : function(object) {
				var arr = [];

				// Проходим по всем полям объекта
				for (var i in object)
					// Проверяем, чтобы это были поля объекта, а не его прототипа
					if (object.hasOwnProperty(i))
						// Добавляем поле в массив
						arr.push({ key: i, value: object[i]});

				// Возвращаем полученный массив
				return arr;
			},

			// Эта функция превращает массив такого вида, как результат предыдущей функции, обратно в объект
			toObject : function(array) {
				// См. документацию javascript
				return array.reduce(
					function(res, item) {
						// Добавляет к объекту элемент, с ключом key, и значение value. Если поле с таким ключом уже определено, переопределяет его значение.
						res[item.key] = item.value;
						return res; },
					{}); },

			// Эта функция расширяет obj1 полями объекта obj2, и переопределяет поля с совпадающими ключами. Не модифицирует obj1, возвращает новый объект
			extend : function(obj1, obj2) {
				// Например, obj1 = { a: 1, b: 2 }, obj2 = { b: 3, c: 4 }
				// Превращаем объекты в массивы, использую функцию toArray. Получаем такие массивы: [{ key: "a", value: 1 }, { key: "b", value: 2}], [{ key: "b", value: 3 }, { key: "c", value: 4}]
				// Объединяем массивы в один, используя метод массива concat. Получаем [{ key: "a", value: 1 }, { key: "b", value: 2}, { key: "b", value: 3 }, { key: "c", value: 4}]
				// Превращаем в объект, используя функцию toObject. Получаем: { a: 1, b: 3, c: 4}. Поле "b" получило значение 3 потому, что сначало было создано через { key: "b", value: 2}, потом переопределено через { key: "b", value: 3 }
				return
					util.toObject(
						util
							.toArray( obj1 )
							.concat(
								util.toArray(
									obj2)))},

			// Эта функция получает в качестве параметра HTML код, и превращает его в HTMLElement, или NodeList
			parseHTML : function(code) {
				// Создаем временный DOM элемент
				var temp = document.createElement("div");

				// Внутрь помещаем нужный нам код
				temp.innerHTML = code;

				// В temp.children получаем список элементов, созданных по коду, помещенному во временный элемент
				// Если в children только один элемент - вернем его, в противном случае - NodeList
				return temp.children.length > 1
					? temp.children
					: temp.children[0];
			},

			// Служит для рендеринга простых шаблонов вида "text blah blah [variable] sdfdsfdfs", делая текстовую замену [variable] полем контекста с ключем variable
			render : function(template, context) {
				// Проходим по всем ключам объекта-контекста
				for (var i in context)
					// Все подстроки вида [<key>] заменяем на value
					template = template.replace("[@]".replace("@", i), context[i]);

				// Возвращаем прорендеренный шаблон
				return template;
			}
		},

		// Параметры по умолчанию
		defaults = {
			// Шаблон виджета. В нем - одна переменная. text
			"template" : "<div class='checkbox'>[text]</div>",
			// Класс, который будет навешан на корень шаблона в случае, если связанный с виджетом чекбокс будет выбран
			"class-checked" : "checked",
			// Название переменной text в шаблоне. Можно определить любое имя, угодное для css класса
			"var-text" : "text",
			// Название атрибута checkbox`а, в значении которого находится значение text
			"attr-text" : "text"
		},

		// Этот массив содержит все созданные виджеты
		instances = [],

		// Создаем конструктор класса и декорируем его (см. util.decorate выше)
		Checkbox = util.decorate(function(elem, options) {

			// Сохраняем элемент с полях объекта-виджета
			this.elem = elem;

			// Создаем объект настроек, и сохраняем в полях объекта-виджета
			this.options = util.extend(defaults, options);

			// Создаем виджет
			this._createWidget()
			// Показываем его вместо чекбокса
				._showWidget()
			// Вызываем обработчик onChange, чтобы виджет принял начальное состояние чекбокса
				.onChange();

			// Добавляем только что созданнй виджет в массив виджетов
			instances.push(this);
		}),

		// Эта функция создает виджет
		_createWidget = function() {
			var options 		= this.options,

				classChecked	= options["class-checked"],
				varText			= options["var-text"],
				attrText		= options["attr-text"],

				elem 	= this.elem,

				// Достаем имя чекбокса. Если имени нет, именем будет номер чекбокса среди созданнх виджетов
				name 	= elem.attributes.name.value || instances.length,
				// Достаем из атрибутов чекбокса значение, которое будем вставлять в шаблон вместо [text]
				text	= elem.attributes[attrText].value,
				// Узнаем тип элемента (чекбокс, радиобаттон)
				type	= elem.attributes.type.value,

				// Сохраняем шаблон в переменную
				template 		= options["template"],

				// Создаем контекст. В нем будет только одно поле - text
				context			= (function() { var o = {}; o[varText] = text; return o; })(),

				// Рендерим шаблон и создаем html элемент
				widget 	= util.parseHTML(
					util.render(
						template,
						context)),

				// Эта функция будет вызвана при изменении состояния чекбокса. Она синхронизирует состояние элемента с его виджетом (независимо от того, чекбокс это, или радиобаттон)
				onChangeCheckbox = function() {
					// Если чекбокс выбран, добавляем класс checked к виджету
					elem.checked
						? widget.classList.add(classChecked)
						// Если не выбран - удаляем
						: widget.classList.remove(classChecked);
				},

				// Эта функция будет вызвана при изменении состояния радиобаттона
				onChangeRadio = function() {
					// Выбираем все радиобаттоны с таким-же именем, как у измененного (их состояние тоже могло измениться)
					instances
						.filter(function(item) { return item.name == name; })
						// И для каждого из них вызываем функцию синхронизации состояния
						.forEach(function(item) { item.onChangeCheckbox(); });
				},

				// Эта функция будет вызвана при изменении состояния элемента
				onChange = function() {
					// В зависимости от типа элемента, вызываем обработчик для чекбокса или радиобаттона
					type == "radio"
						? onChangeRadio()
						: onChangeCheckbox();
				},

				// Эта функция навешивает события, для связи между виджетом и элементом
				attachEvents = function() {
					// При изменении состояния элемента, вызываем функцию синхронизации
					elem.addEventListener("change", onChange);
					// При клике по виджету, кликаем по реальному элементу (изменится его состояние, или нет - зависит от его текущего состояния)
					widget.addEventListener("click", function() {
						elem.click();
					});
				};

			// Навешиваем события для связи
			attachEvents();

			// Пусть DOM элемент объект виджета виджет в своих полях, дабы можно было до виджета достучаться
			elem.widget	= this;

			// Сохраним в наш объект имя элемента, и DOM элемент виджета
			this.name	= name;
			this.widget	= widget;

			// Сохраним обработчики событий
			this.onChange			= onChange;
			this.onChangeRadio		= onChangeRadio;
			this.onChangeCheckbox	= onChangeCheckbox;

			// Возвращаем this для возможности цепных вызовов
			return this;
		},

		// Этот метод заменяет реальный жлемент виджетом
		_showWidget = function() {
			// Вставляем элемент виджета перед реальным элементом
			this.elem.parentElement.insertBefore(this.widget, this.elem);
			// "Прячем" реальный элемент
			this.elem.style.display = "none";

			// Возвращаем this для возможности цепных вызовов
			return this;
		},

		// Этот метод формирует прототип и статические поля класса Checkbox
		_configureClass = function() {
			// В прототип сохраним методы создания и показа виджета
			Checkbox.prototype = {
				_createWidget : _createWidget,
				_showWidget : _showWidget
			}
			// В статические поля сохраним настройки по умолчанию, дабы их можно было изменить
			Checkbox.defaults = defaults;

			// Добавим наш класс в глобальный namespace, дабы можно было его там юзать
			window.Checkbox = Checkbox;
		};

	// Вызываем метод формирования класса
	_configureClass();
})(window, document, undefined);

// КОНЕЦ, йопт