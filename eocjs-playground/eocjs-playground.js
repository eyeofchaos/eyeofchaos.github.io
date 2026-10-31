/*!
 * eocjsPlayground v0.1.13
 * Copyright (c) 2026 Dieter Schmitt
 * Released under the MIT license - https://opensource.org/licenses/MIT
 */

(function() {

  class Main {

    constructor(options) {

      this.options    = options;
      this.defaults   = {};
      this.settings   = { ...this.defaults, ...this.options };
      this.elements   = {
        select:  document.querySelector('#select'),
        save:    document.querySelector('#save'),
        load:    document.querySelector('#load'),
        run:     document.querySelector('#run'),
        curtain: document.querySelector('#curtain'),
        overlay: document.querySelectorAll('#html-overlay, #css-overlay, #js-overlay')
      };
      this.editorHTML = {};
      this.editorCSS  = {};
      this.editorJS   = {};
      this.storage    = 'eocjs_playground';

    }

    init() {
      this._editor();
      this._bind();
    }

    _isJSON(str) {

      try {
        return (JSON.parse(str) && !!str);
      } catch(e) {
        return false;
      }

    }

    _utf8ToBase64(str) {

      const encoder = new TextEncoder();
      const data    = encoder.encode(str);
      const binary  = String.fromCharCode.apply(null, data);

      return btoa(binary);

    }

    _base64ToUtf8(b64) {

      const binary  = atob(b64);
      const bytes   = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) { bytes[i] = binary.charCodeAt(i); }
      const decoder = new TextDecoder();

      return decoder.decode(bytes);

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

    _run() {

      const select = document.querySelector('#select');
      const packets = select ? select.value : '';

      let output = document.querySelector('#output');

      if (packets) {

        let html    = '';
        let htmlAdd = '';
        let css     = '';
        let cssAdd  = '';
        let js      = '';
        let jsAdd   = '';

        htmlAdd += this.editorHTML.getValue() || '';

        if (packets === 'jquery@3.5.1|bootstrap@4.5.3') {

          css    += `<link rel="stylesheet" href="/css/bootstrap-4.5.3/bootstrap.min.css">`;
          cssAdd += `<style>${this.editorCSS.getValue() || ''}</style>`;
          js     += `<script src="/js/bootstrap-4.5.3/bootstrap.bundle.min.js"></script>`;
          jsAdd  += `<script>${this.editorJS.getValue() || ''}</script>`;

        } else if (packets === 'jquery@3.7.1|bootstrap@5.3.8') {

          css    += `<link rel="stylesheet" href="/css/bootstrap-5.3.8/bootstrap.min.css">`;
          cssAdd += `<style>${this.editorCSS.getValue() || ''}</style>`;
          js     += `<script src="/js/bootstrap-5.3.8/bootstrap.bundle.min.js"></script>`;
          jsAdd  += `<script>${this.editorJS.getValue() || ''}</script>`;

        } else if (packets === 'bootstrap@6.0.0-alpha.1') {

          css    += `<link rel="stylesheet" href="/css/bootstrap-6.0.0-alpha.1/bootstrap.min.css">`;
          cssAdd += `<style>${this.editorCSS.getValue() || ''}</style>`;
          js     += `<script type="importmap">{ "imports": { "bootstrap": "/js/bootstrap-6.0.0-alpha.1/bootstrap.bundle.min.js" } }</script>
                     <script type="module">import * as bootstrap from 'bootstrap'; window.bootstrap = bootstrap;</script>`;
          jsAdd  += `<script type="module">${this.editorJS.getValue() || ''}</script>`;

        }

        let source = `
          <!DOCTYPE html>
          <html lang="de" data-bs-theme="light">
          <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Output</title>
          ${css}${cssAdd}
          </head>
          <body>
          ${html}${htmlAdd}
          ${js}${jsAdd}
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

      const string = JSON.stringify({ 'version': 1,  html: this._utf8ToBase64(this.editorHTML.getValue()), css: this._utf8ToBase64(this.editorCSS.getValue()), js: this._utf8ToBase64(this.editorJS.getValue()) });
      localStorage.setItem(this.storage, string);

    }

    _load() {

      const string = localStorage.getItem(this.storage);

      if (typeof string === 'string' && string && this._isJSON(string)) {

        if (!confirm('This will overwrite all fields. Are you sure?')) return;
        const obj = JSON.parse(string);

        this.editorHTML.setValue((obj.html ? this._base64ToUtf8(obj.html) : ''), -1);
        this.editorCSS.setValue((obj.css ? this._base64ToUtf8(obj.css) : ''), -1);
        this.editorJS.setValue((obj.js ? this._base64ToUtf8(obj.js) : ''), -1);

      } else {

        alert('No valid save point found!');

      }

    }

    _bind() {

      if (this.elements.save) {
        this.elements.save.addEventListener('click', e => this._save());
      }

      if (this.elements.load) {
        this.elements.load.addEventListener('click', e => this._load());
      }

      if (this.elements.run) {
        this.elements.run.addEventListener('click', e => this._run());
      }

    }

  }

  const mainObj = new Main();
  mainObj.init();

})();