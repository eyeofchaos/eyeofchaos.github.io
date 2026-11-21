/*!
 * eocjsExampleImageGenerator v0.0.2
 * Copyright (c) 2026 Dieter Schmitt
 * Released under the MIT license - https://opensource.org/licenses/MIT
 */

(function() {

  class Generator {

    constructor() {
      this.inputIcon   =  document.querySelector('.eocjs-xcr-input-icon');
      this.inputColor  =  document.querySelector('.eocjs-xcr-input-color');
      this.button      =  document.querySelector('.eocjs-xcr-button');
      this.hidden      =  document.querySelector('.eocjs-xcr-hidden');
      this.canvas      =  document.querySelector('.eocjs-xcr-canvas');
      this.image       =  document.querySelector('.eocjs-xcr-image');
      this.context     =  this.canvas.getContext('2d');
    }

    init() {
      this._bind();
      this._create();
    }

    _create() {

      let iconA  =  this.inputIcon.value;
      let iconB  =  iconA.split(' ');
      let iconC  =  [];

      for (const item of iconB) { iconC.push(item.trim()); }
      iconC.push(...['fa-fw']);

      let icon = document.createElement('i');
      icon.classList.add( ...iconC );
      icon.setAttribute('style', 'font-size: 576px;');

      this.hidden.appendChild(icon);

      let styles   =  window.getComputedStyle(icon, '::before');
      let content  =  styles['content'].replace(/\"/g, '').replace(/\'/g, '');
      let font     =  `${styles['font-weight']} ${styles['font-size']}/1 ${styles['font-family']}`;

      let colorA  =  this.inputColor.value;
      let colorB  =  /^#[0-9A-F]{6}$/i.test(colorA);
      let colorC  =  colorB ? colorA : '#000000';

      this.context.textAlign = 'center';

      this.context.clearRect(0, 0, 1024, 1024);
      this.context.fillStyle = '#ffffff';
      this.context.fillRect(0, 0, 1024, 1024);
      this.context.fillStyle = colorC;

      document.fonts.ready.then(() => {
        this.context.font = font;
        this.context.fillText(content, 512, 728);
        const dataURL = this.canvas.toDataURL();
        this.image.setAttribute('src', dataURL);
        this.hidden.removeChild(icon);
      });

    }

    _bind() {

      this.button.addEventListener('click', () => {
        this._create();
      });

      this.inputIcon.addEventListener('keyup', e => {
        if (e.key === 'Enter' || e.code === 'Enter' || e.which === 13) this._create();
      });

      this.inputColor.addEventListener('keyup', e => {
        if (e.key === 'Enter' || e.code === 'Enter' || e.which === 13) this._create();
      });

    }

  }

  const generatorObj = new Generator();
  generatorObj.init();

})();
