module.exports = {

  makeString: function () {
    var text = "x";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return 'x' + text;
  },

  makeEmail: function () {
    return this.makeString() + '@sample.com';
  },

  generateHash: function () {
    var hash = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++) {
      hash = hash + possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return hash;
  }


}