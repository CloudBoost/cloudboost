
const request = require('request');

module.exports = (app) => {
  // routes

  app.post('/partner', (req, res) => {
    const data = req.body || {};

    global.cbPartnerService.save(data).then((result) => {
      data.id = result.id.toString();

      // This Zapier integration sends emails to CloudBoost Partners after a day of delay.
      // Zapier Integration can be found at cloudboost1@outlook.com.
      request.post({
        headers: {
          'content-type': 'application/json',
        },
        url: 'https://hooks.zapier.com/hooks/catch/2024362/mr0i5b/',
        body: JSON.stringify(data),
      });
      global.cbPartnerService.sendSlackNotification(data);
      res.status(200).json(result);
    }, error => res.status(400).json(error));
  });


  app.get('/partner/item/:id', (req, res) => {
    const partnerId = req.params.id;

    global.cbPartnerService.getById(partnerId)
      .then(result => res.status(200).json(result), error => res.status(400).json(error));
  });


  app.get('/partner/export', (req, res) => {
    const { skip, limit } = req.query;

    global.cbPartnerService.getList(skip, limit).then((result) => {
      const jsonString = JSON.stringify(result);
      const sanitizedJSON = JSON.parse(jsonString);

      res.xls('partners.xlsx', sanitizedJSON);
    }, error => res.status(400).json(error));
  });


  return app;
};
