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
