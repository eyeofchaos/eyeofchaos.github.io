if (!customElements.get('local-time')) {

  class LocalTime extends HTMLElement {

    constructor() {
      super();
    }

    connectedCallback() {
      const shadowRoot = this.attachShadow({mode: 'open'});
      const obj = new Date();
      shadowRoot.innerHTML = obj.toLocaleString();
    }

  }

  customElements.define('local-time', LocalTime);

}
