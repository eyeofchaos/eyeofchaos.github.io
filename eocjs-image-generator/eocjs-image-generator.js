/*!
 * eocjsExampleImageGenerator v0.0.1
 * Copyright (c) 2026 Dieter Schmitt
 * Released under the MIT license - https://opensource.org/licenses/MIT
 */

(function() {

  class Generator {

    constructor() {
      this.inputIcon   =  document.querySelector('.eocjs-xcr-input-icon');
      this.inputColor  =  document.querySelector('.eocjs-xcr-input-color');
      this.button      =  document.querySelector('.eocjs-xcr-button');
      this.outer       =  document.querySelector('.eocjs-xcr-outer');
      this.canvas      =  document.querySelector('.eocjs-xcr-canvas');
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
      iconC.push(...['fa-fw', 'icon', 'visually-hidden']);

      let icon = document.createElement('i');
      icon.classList.add( ...iconC );
      icon.setAttribute('style', 'font-size: 400px;');

      document.body.appendChild(icon);

      let styles   =  window.getComputedStyle(icon, '::before');
      let content  =  styles['content'].replace(/\"/g, '').replace(/\'/g, '');
      let font     =  `${styles['font-weight']} ${styles['font-size']}/1 ${styles['font-family']}`;

      let colorA  =  this.inputColor.value;
      let colorB  =  /^#[0-9A-F]{6}$/i.test(colorA);
      let colorC  =  colorB ? colorA : '#000000';

      this.context.textAlign = 'center';

      this.context.clearRect(0, 0, 1000, 1000);
      this.context.fillStyle = '#ffffff';
      this.context.fillRect(0, 0, 1000, 1000);
      this.context.fillStyle = colorC;

      document.fonts.ready.then(() => {
        this.context.font = font;
        this.context.fillText(content, 500, 650);
        document.body.removeChild(icon);
      });

      this.outer.setAttribute('style', `border: 2px solid ${colorC};`);

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