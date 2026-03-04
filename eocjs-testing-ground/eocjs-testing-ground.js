/*!
 * eocjsTestingGround v0.1.6
 * Copyright (c) 2026 Dieter Schmitt
 * Released under the MIT license - https://opensource.org/licenses/MIT
 */

(function() {

  function extend(obj, ...rest) {

    obj = obj || {};

    for (let i = 0; i < rest.length; i += 1) {
      if (!rest[i]) continue;
      for (let key in rest[i]) {
        if (Object.hasOwn(rest[i], key)) obj[key] = rest[i][key];
      }
    }

    return obj;

  }

  function isJSON(str) {

    try {
      return (JSON.parse(str) && !!str);
    } catch(e) {
      return false;
    }

  }

  function utf8ToBase64(str) {

    const encoder = new TextEncoder();
    const data    = encoder.encode(str);
    const binary  = String.fromCharCode.apply(null, data);

    return btoa(binary);

  }

  function base64ToUtf8(b64) {

    const binary  = atob(b64);
    const bytes   = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) { bytes[i] = binary.charCodeAt(i); }
    const decoder = new TextDecoder();

    return decoder.decode(bytes);

  }

  class Main {

    constructor(options) {

      this.options    = options;
      this.defaults   = {};
      this.settings   = extend({}, this.defaults, this.options);
      this.elements   = {
        select:  document.querySelector('#select'),
        trash:   document.querySelector('#trash'),
        example: document.querySelector('#example'),
        load:    document.querySelector('#load'),
        save:    document.querySelector('#save'),
        run:     document.querySelector('#run'),
        curtain: document.querySelector('#curtain'),
        overlay: document.querySelectorAll('#html-overlay, #css-overlay, #js-overlay')
      };
      this.examples   =  {
        default: {
          html: `<h1 class="display-1 fw-bold">TEST</h1>`,
          css:  `h1 {\n  color: #dc3545;\n}`,
          js:   `(function() {\n  $('h1').html('HELLO WORLD!');\n})();`
        }
      };
      this.libraries  = new Map();
      this.editorHTML = {};
      this.editorCSS  = {};
      this.editorJS   = {};
      this.storage    = 'eocjs_testing_ground';

    }

    init() {
      this._editor();
      this._libraries();
      this._bind();
    }

    _editor() {

      this.editorHTML = ace.edit('html');
      this.editorHTML.setTheme('ace/theme/github_dark');
      this.editorHTML.session.setMode('ace/mode/html');
      this.editorHTML.session.setTabSize(2);
      this.editorHTML.setShowPrintMargin(false);

      this.editorCSS = ace.edit('css');
      this.editorCSS.setTheme('ace/theme/github_dark');
      this.editorCSS.session.setMode('ace/mode/css');
      this.editorCSS.session.setTabSize(2);
      this.editorCSS.setShowPrintMargin(false);

      this.editorJS = ace.edit('js');
      this.editorJS.setTheme('ace/theme/github_dark');
      this.editorJS.session.setMode('ace/mode/javascript');
      this.editorJS.session.setTabSize(2);
      this.editorJS.setShowPrintMargin(false);

      for (const el of this.elements.overlay) {
        setTimeout(() => { el.classList.add('fade-out'); }, 150);
        setTimeout(() => { el.classList.add('d-none');   }, 300);
      }

    }

    _libraries() {

      if (this.elements.select) {
        let str = this.elements.select.getAttribute('data-eocjs-packets');
        if (isJSON(str)) {
          let obj = JSON.parse(str);
          for (let prop in obj) {
            if (Object.hasOwn(obj, prop)) this.libraries.set(prop, obj[prop]);
          }
        }
      }

    }

    _start() {

      const result = [];
      const select = document.querySelector('#select');

      if (select) {

        const val = select.value;
        const arr = val ? val.split('|') : [];

        for (const el of arr) {
          if (el) {
            const v = this.libraries.get(el);
            if (v && typeof v === 'object') result.push(v);
          }
        }

      }

      return result;

    }

    _run(packets) {

      let output = document.querySelector('#output');

      if (output && Array.isArray(packets)) {

        let html    = '';
        let htmlAdd = '';
        let css     = '';
        let cssAdd  = '';
        let js      = '';
        let jsAdd   = '';

        for (const item of packets) {
          if (typeof item === 'object' && item) {
            if (Object.hasOwn(item, 'css') && Array.isArray(item.css)) {
              for (const el of item.css) css += `<link rel="stylesheet" href="${el}">`;
            }
            if (Object.hasOwn(item, 'js') && Array.isArray(item.js)) {
              for (const el of item.js) js += `<script src="${el}"></script>`;
            }
          }
        }

        // Additions

        htmlAdd += this.editorHTML.getValue() || '';
        cssAdd  += `<style>${this.editorCSS.getValue() || ''}</style>`;
        jsAdd   += `<script>${this.editorJS.getValue() || ''}</script>`;

        let source = `
          <!DOCTYPE html>
          <html lang="de">
          <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Output</title>
          ${css}${cssAdd}
          </head>
          <body>
          ${html}${htmlAdd}${js}${jsAdd}
          </body>
          </html>
        `;

        this.elements.curtain.classList.remove('d-none');
        this.elements.curtain.classList.remove('fade-out');

        const iframe = document.createElement('iframe');
        iframe.srcdoc = source;
        while (output.lastChild) { output.removeChild(output.lastChild); }
        output.appendChild(iframe);

        setTimeout(() => { this.elements.curtain.classList.add('fade-out'); }, 450);
        setTimeout(() => { this.elements.curtain.classList.add('d-none');   }, 600);

      }

    }

    _write(obj) {

      if (!confirm('This will overwrite all fields. Are you sure?')) return;
      if (!obj) obj = {};

      this.editorHTML.setValue(obj?.html || '', -1);
      this.editorCSS.setValue(obj?.css || '', -1);
      this.editorJS.setValue(obj?.js || '', -1);

    }

    _save() {

      const string = JSON.stringify({ 'version': 1,  html: utf8ToBase64(this.editorHTML.getValue()), css: utf8ToBase64(this.editorCSS.getValue()), js: utf8ToBase64(this.editorJS.getValue()) });
      localStorage.setItem(this.storage, string);

    }

    _load() {

      const string = localStorage.getItem(this.storage);

      if (typeof string === 'string' && string && isJSON(string)) {

        if (!confirm('This will overwrite all fields. Are you sure?')) return;
        const obj = JSON.parse(string);

        this.editorHTML.setValue((obj.html ? base64ToUtf8(obj.html) : ''), -1);
        this.editorCSS.setValue((obj.css ? base64ToUtf8(obj.css) : ''), -1);
        this.editorJS.setValue((obj.js ? base64ToUtf8(obj.js) : ''), -1);

      } else {

        alert('No valid save point found!');

      }

    }

    _bind() {

      if (this.elements.trash) {
        this.elements.trash.addEventListener('click', e => this._write());
      }

      if (this.elements.example) {
        this.elements.example.addEventListener('click', e => this._write(this.examples.default));
      }

      if (this.elements.save) {
        this.elements.save.addEventListener('click', e => this._save());
      }

      if (this.elements.load) {
        this.elements.load.addEventListener('click', e => this._load());
      }

      if (this.elements.run) {
        this.elements.run.addEventListener('click', e => this._run(this._start(e)));
      }

    }

  }

  const mainObj = new Main();
  mainObj.init();

})();