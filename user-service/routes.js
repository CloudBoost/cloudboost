const passport = require('passport');
const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const pjson = require('./package.json');

const requireEndpoints = (dir, appConfig, passportConfig) => fs.readdirSync(path.join(__dirname, dir)).forEach((file) => {
  const fileArray = file.split('.');
  const fileName = _.head(fileArray);
  const fileExt = _.head(_.tail(fileArray));
  if (fileExt === 'js') {
    const fileUrl = path.join(__dirname, dir, fileName);
    require(fileUrl)(appConfig, passportConfig); // eslint-disable-line
  }
});

module.exports = function (app) {
  app.get('/', (req, res) => res.status(200).json({ status: 200, message: 'Service Status - OK', version: pjson.version }));

  requireEndpoints('workers');
  requireEndpoints('api', app, passport);
  requireEndpoints('webhooks', app);

  app.use((req, res) => {
    res.json({ status: 404, message: 'The endpoint was not found. Please check.' });
  });
};
