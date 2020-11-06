module.exports = function(){
  var cors = require('cors');
  global.app.use(cors());
};