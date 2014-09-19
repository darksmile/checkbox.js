checkbox.js
===========

Small fully-customisable checkbox/radiobutton widget.

Usage
=====

new Checkbox(elem, options) <br/>
Checkbox(elem, options)

[new] Checkbox([elem0, elem1, ...], options) <br/>
[new] Checkbox(nodeList, options)

Options
=======

There are 3 parameters, that can be passed to constructor:

  "<b>template</b>" - template for single checkbox/radiobutton (default: '\<div class="checkbox">[text]\</div>') <br/>
  "<b>class-checked</b>" - className for widget, showing checked checkbox <br/>
  "<b>attr-text</b>" - name of the checkbox's attribute, that containes [text] value for the template <br/>
