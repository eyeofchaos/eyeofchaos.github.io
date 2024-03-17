/*!
 * eocjs360ImgView v0.1
 * Copyright (c) 2023 Dieter Schmitt
 * Released under the MIT license - https://opensource.org/licenses/MIT
 */

class Eocjs360ImgView {

  // _______ Constructor _______

  constructor(options) {

    this.list          =  [];
    this.images        =  [];
    this.emboss        =  {};
    this.deferreds     =  [];
    this.loaded        =  0;
    this.currentFrame  =  0;
    this.width         =  0;
    this.height        =  0;
    this.ratio         =  0;
    this.threshold     =  0;
    this.active        =  'eocjs-360-img-view-active';

    this.options = options;
    this.defaults = {
      canvas:    '',    // css selector for canvas element
      width:     600,   // width of canvas
      height:    600,   // height of canvas
      count:     36,    // number of images
      interval:  25,    // rotation interval for first rotation (ms)
      path:      '',    // path to images including trailing slash ('/images/')
      prefix:    '',    // including underscore or dash ('myimage-')
      suffix:    '',    // including dot ('.jpg')
      icon:      '',    // 360-icon
      intro:     true,  // first round of images
      progress:  true   // show progress bar
    };
    this.settings = extend({}, this.defaults, this.options);

    this.canvas = document.querySelector(this.settings.canvas);
    this.context = document.querySelector(this.settings.canvas).getContext('2d');

    // Helper function to extend object
    function extend(obj, ...rest) {
      obj = obj || {};
      for (let i = 0; i < rest.length; i += 1) {
        if (!rest[i]) continue;
        for (let key in rest[i]) {
          if (rest[i].hasOwnProperty(key)) obj[key] = rest[i][key];
        }
      }
      return obj;
    }

  }


  // _______ Init _______

  init() {

    if (this.canvas && this.context && !this.canvas.classList.contains(this.active)) {
      this.create();
      this.build();
      this.start();
      this.responsive();
      this.canvas.classList.add(this.active);
    }

  }


  // _______ Create _______

  create() {

    // Generate list of image paths
    for (let i = 1; i <= this.settings.count; i += 1) {
      this.list.push(this.settings.path + this.settings.prefix + i + this.settings.suffix);
    }

  }


  // _______ Build Canvas _______

  build() {

    // Variables
    let needsUpdate  =  false;
    let parentWidth  =  parseInt(getComputedStyle(this.canvas.parentNode, null).width.replace('px', ''));

    // Factor
    this.ratio = parentWidth / this.settings.width;

    // Overwrite size, if parent element is too small
    if (this.ratio >= 1) {
      this.width  = this.settings.width;
      this.height = this.settings.height;
    } else {
      this.width  = parentWidth;
      this.height = parseInt(this.settings.height * this.ratio);
    }

    // Set threshold
    this.threshold = Math.floor((this.width / 2.5) / this.settings.count);

    // Set canvas size
    if (this.width !== parseInt(this.canvas.getAttribute('width')) || this.height !== parseInt(this.canvas.getAttribute('height'))) {
      this.canvas.setAttribute('width', this.width);
      this.canvas.setAttribute('height', this.height);
      needsUpdate = true;
    }

    return needsUpdate;

  }


  // _______ Main Function _______

  start() {

    for (let i = -1; i < this.list.length; i += 1) {

      if (i === -1) {
        if (this.settings.icon) {

          let img = new Image();
          let pro = new Promise((resolve, reject) => {
            img.addEventListener('load', () => {
              resolve();
            });
            img.addEventListener('error', () => {
              reject('Error: Icon could not be loaded! (Check path: ' + this.settings.icon + ')');
            });
          });

          this.deferreds.push(pro);
          img.src = this.settings.icon;
          this.emboss = img;

        }
      } else {

        let img = new Image();
        let pro = new Promise((resolve, reject) => {
          img.addEventListener('load', () => {
            resolve();
            if (this.settings.progress) this.loader();
          });
          img.addEventListener('error', () => {
            reject('Error: Image could not be loaded! (Check path: ' + this.list[i] + ')');
          });
        });

        this.deferreds.push(pro);
        img.src = this.list[i];
        this.images.push(img);

      }

    }

    Promise.all(this.deferreds).then(() => {
      this.show360(this.settings.intro);
    }).catch(error => {
      console.log(error);
      console.log('Error: At least one image could not be loaded!');
    });

  }


  // _______ Loader _______

  loader() {

    this.loaded += 1;

    let x          =  10;
    let y          =  10;
    let barWidth   =  Math.floor(this.loaded * ((this.width / 2) - 20) / this.settings.count);
    let barHeight  =  10;

    this.context.clearRect(0, 0, this.width, this.height);
    this.context.fillStyle = '#ccc';
    this.context.fillRect(x, y, barWidth, barHeight);

  }


  // _______ Show Images _______

  show360(intro) {

    this.update360(0);

    if (intro) {
      let rotate = setInterval(() => {
        this.update360(1);
        if (this.currentFrame === this.settings.count - 1) {
          clearInterval(rotate);
          this.addNavigation();
        }
      }, this.settings.interval);
    } else {
      this.addNavigation();
    }

  }


  // _______ Update 360 _______

  update360(dir) {

    this.currentFrame += dir;

    if (this.currentFrame < 0) {
      this.currentFrame = this.settings.count - 1;
    } else if (this.currentFrame > this.settings.count - 1) {
      this.currentFrame = 0;
    }

    this.context.clearRect(0, 0, this.width, this.height);
    this.context.drawImage(this.images[this.currentFrame], 0, 0, this.width, this.height);

    if (this.settings.icon) {

      let iconRatio   =  1;
      if (this.ratio < 1) iconRatio = this.ratio;
      let iconWidth   =  this.emboss.width * iconRatio;
      let iconHeight  =  this.emboss.height * iconRatio;
      let iconOffset  =  10 * iconRatio;

      this.context.drawImage(this.emboss, this.width - iconWidth - iconOffset, this.height - iconHeight - iconOffset, iconWidth, iconHeight);

    }

  }


  // _______ Add Navigation _______

  addNavigation() {

    let dragging  =  false;
    let startX    =  0;

    let down      =  ['mousedown', 'touchstart'];
    let move      =  ['mousemove',  'touchmove'];
    let up        =  ['mouseup',     'touchend'];

    down.forEach(event => {
      this.canvas.addEventListener(event, e => {
        let clientX = e.clientX;
        if (e.type === 'touchstart') clientX = e.touches[0].clientX;
        startX   = clientX;
        dragging = true;
      });
    });

    move.forEach(event => {
      window.addEventListener(event, e => {
        if (dragging === true) {

          let clientX = e.clientX;
          if (e.type === 'touchmove') clientX = e.touches[0].clientX;

          let dx     =  startX - clientX;
          let dxAbs  =  Math.abs(dx);

          if (dxAbs > this.threshold) {
            this.update360(dx / dxAbs);
            startX = clientX;
          }

        }
      });
    });

    up.forEach(event => {
      window.addEventListener(event, e => {
        if (dragging === true) {
          dragging = false;
        }
      });
    });

  }


  // _______ Responsive _______

  responsive() {

    let timer;
    let width = window.innerWidth;

    window.addEventListener('resize', () => {
      if (window.innerWidth != width) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          if (this.build()) this.update360(0);
          width = window.innerWidth;
        }, 300);
      }
    });

  }

}
