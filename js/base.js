(function() {

  class SimpleGreeting extends HTMLElement {

    constructor() {
      super();
    }

    _isJSON(str) {
      try {
        return (JSON.parse(str) && !!str);
      } catch(e) {
        return false;
      }
    }

    _getText(arr) {
      let result = 'Hello!';
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
      const output = this._getText(parsed);
      const styles = new CSSStyleSheet();
      styles.replaceSync('p { margin: 0; text-align: center; color: var(--bs-orange); }');
      const shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.adoptedStyleSheets.push(styles);
      shadowRoot.innerHTML = `<p>${output}</p>`;
    }

  }

  customElements.define('simple-greeting', SimpleGreeting);

})();
