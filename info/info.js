/* Local Time */

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

/* User Agent */

if (!customElements.get('user-agent')) {

  class UserAgent extends HTMLElement {

    constructor() {
      super();
    }

    connectedCallback() {
      const shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.innerHTML = navigator.userAgent;
    }

  }

  customElements.define('user-agent', UserAgent);

}
