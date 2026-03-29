(function() {

  class EocjsGreeting extends HTMLElement {

    constructor() {
      super();
      this.output = 'Hello!';
    }

    _isJSON(str) {
      try {
        return (JSON.parse(str) && !!str);
      } catch(e) {
        return false;
      }
    }

    _getText(arr) {

      let result = '';

      if (Array.isArray(arr) && arr.length > 0) {
        const date = new Date();
        const hours = date.getHours();
        const obj = arr.filter((obj) => hours >= obj.time);
        const txt = obj[obj.length - 1]?.text;
        if (typeof txt === 'string' && txt) result = txt;
      }

      return result;

    }

    connectedCallback() {

      const data = this.getAttribute('data-content');
      const parsed = this._isJSON(data) ? JSON.parse(data) : [];
      this.output = this._getText(parsed) || this.output;

      const styles = new CSSStyleSheet();
      styles.replaceSync('p { margin: 0; }');

      const shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.adoptedStyleSheets.push(styles);
      shadowRoot.innerHTML = `<p>${this.output}</p>`;

    }

  }

  customElements.define('eocjs-greeting', EocjsGreeting);

})();
