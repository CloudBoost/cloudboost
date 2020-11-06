const util = {

  makeString() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },

  makeEmail() {
    return `${this.makeString()}@sample.com`;
  },

  generateRandomString() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 8; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },

};
