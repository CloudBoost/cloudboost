
const winston = require('winston');

module.exports = function (app) {
  // routes
  app.post('/subscribe', (req, res) => {
    const data = req.body || {};

    if (!data || !data.email) {
      return res.send(204, 'No content'); // no content.
    }

    return global.subscriberService.subscribe(data.email).then((subscriber) => {
      if (!subscriber) {
        return res.status(400).send('Server Error');
      }
      const newsListId = 'b0419808f9';
      global.mailChimpService.addSubscriber(newsListId, data.email);
      return res.status(200).json(subscriber);
    }, (error) => {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.status(400).send(error);
    });
  });

  return app;
};
