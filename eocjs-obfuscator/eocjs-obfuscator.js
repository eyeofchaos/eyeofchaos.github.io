/*!
 * eocjsTestingGround v0.0.1
 * Copyright (c) 2026 Dieter Schmitt
 * Released under the MIT license - https://opensource.org/licenses/MIT
 */

(function() {

  class Obfuscator {

    constructor() {
      this.inputEl   =  document.querySelector('.eocjs-jsr-input');
      this.outputEl  =  document.querySelector('.eocjs-jsr-output');
      this.button    =  document.querySelector('.eocjs-jsr-button');
    }

    init() {
      this._bind();
      this._rewrite();
    }

    _rewrite() {

      const input       =  this.inputEl.value;
      const inputArray  =  [];
      let output        =  '';

      for (let i = 0; i < input.length; i += 1) {
        inputArray.push(parseInt(input.charCodeAt(i), 16));
      }

      for (const [index, value] of inputArray.entries()) {
        output += (index > 0 ? ',' : '') + ((index + 1) % 100 === 0 ? '\n' : '') + value;
      }

      this.outputEl.value = "(function(){let a='';[\n" + output + "\n].forEach(function(v){a+=String.fromCharCode(parseInt(v.toString(16)));});let s=document.createElement('script');s.innerHTML=a;document?.head?.appendChild(s);s.remove();})();";

    }

    _bind() {
      this.button.addEventListener('click', () => {
        this._rewrite();
      });
    }

  }

  const obfuscatorObj = new Obfuscator();
  obfuscatorObj.init();

})();