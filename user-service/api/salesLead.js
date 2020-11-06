const winston = require('winston');


module.exports = function (app) {
  // Enterprise demo routes
  app.post('/requestDemo', (req, res) => {
    const data = req.body || {};
    if (!data) {
      return res.send(204, 'No content'); // no content.
    }

    return global.salesLeadService.saveSalesRequest(data, 'Demo').then((lead) => {
      if (!lead) {
        return res.status(400).send('Server Error');
      }

      if (lead.wantToSubscribe) {
        const newsListId = 'b0419808f9';
        global.mailChimpService.addSubscriber(newsListId, lead.salesEmail);
      }

      global.salesLeadService.sendSlackNotification(lead, 'Demo');
      global.mailService.sendRequestDemoMail(lead);
      return res.status(200).send('Demo successfully requested');
    }, (error) => {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.status(400).send(error);
    });
  });

  // Whitepaper routes
  app.post('/requestWhitepaper', (req, res) => {
    const data = req.body || {};
    if (!data) {
      return res.send(204, 'No content'); // no content.
    }
    return global.salesLeadService.saveSalesRequest(data, 'Whitepaper').then((lead) => {
      if (!lead) {
        return res.status(400).send('Server Error');
      }
      if (lead.wantToSubscribe) {
        const newsListId = 'b0419808f9';
        global.mailChimpService.addSubscriber(newsListId, lead.salesEmail);
      }
      global.salesLeadService.sendSlackNotification(lead, 'Whitepaper');
      global.mailService.sendWhitePaperMail(lead, 'Whitepaper');
      return res.status(200).send('Whitepaper successfully requested');
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
