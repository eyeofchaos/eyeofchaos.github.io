/*!
 * eocjsQRCodeGenerator v0.0.1
 * Copyright (c) 2026 Dieter Schmitt
 * Released under the MIT license - https://opensource.org/licenses/MIT
 */

(function() {

  class Generator {

    constructor() {
      this.inputEl   =  document.querySelector('.eocjs-jtr-input');
      this.outputEl  =  document.querySelector('.eocjs-jtr-output');
      this.button    =  document.querySelector('.eocjs-jtr-button');
      this.qrcode    =  null;
    }

    init() {
      this._bind();
      this._create();
    }

    _create() {
      let text = this.inputEl.value;
      if (!this.qrcode) {
        if (!text) return;
        this.qrcode = new QRCode(this.outputEl, {
          text:         text,
          width:        256,
          height:       256,
          colorDark:    '#000000',
          colorLight:   '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      } else {
        this.qrcode.makeCode(text);
      }
    }

    _bind() {
      this.button.addEventListener('click', () => {
        this._create();
      });
    }

  }

  const generatorObj = new Generator();
  generatorObj.init();

})();