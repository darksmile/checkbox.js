checkbox.js
===========

Small fully-customisable checkbox/radiobutton widget.

Usage
=====

new Checkbox(elem, options)
Checkbox(elem, options)

[new] Checkbox([elem0, elem1, ...], options)
[new] Checkbox(nodeList, options)

Options
=======

There are 4 parameters, that can be passed to constructor

"template" - template for single checkbox/radiobutton (default: <div class='checkbox'>[text]</div>)
"class-checked" - className for widget, showing checked checkbox
"attr-text" - name of the checkbox's attribute, that containes [text] value for the template