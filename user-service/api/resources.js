const winston = require('winston');


module.exports = function (app) {
  // Resources
  app.get('/resources/', async (req, res) => {
    try {
      const resources = await global.resourceService.getAllResources();
      if (!resources) {
        return res.status(400).send('Server Error');
      }
      return res.status(200).json(resources);
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.status(400).send(error);
    }
  });

  // Resources
  app.get('/resources/enterprise-page', async (req, res) => {
    try {
      const resources = await global.resourceService.getEntrepriseResources();
      if (!resources) {
        return res.status(400).send('Server Error');
      }
      return res.status(200).json(resources);
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.status(400).send(error);
    }
  });

  app.get('/resources/:type/:slug', async (req, res) => {
    const { type, slug } = req.params;
    try {
      const resource = await global.resourceService.getResource(type, slug);
      if (!resource) {
        return res.status(400).send('Server Error');
      }
      return res.status(200).json(resource);
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.status(400).send(error);
    }
  });


  app.post('/resources/:type/:slug', async (req, res) => {
    const { type, slug } = req.params;
    const data = req.body || {};
    if (!data) {
      return res.send(204, 'No content'); // no content.
    }
    try {
      const lead = await global.salesLeadService.saveSalesRequest(data, req.params.type);
      if (!lead) {
        return res.status(400).send('Server Error');
      }
      if (lead.wantToSubscribe) {
        const newsListId = 'b0419808f9';
        global.mailChimpService.addSubscriber(newsListId, lead.salesEmail);
      }
      const resource = await global.resourceService.getResource(type, slug);
      if (!resource) {
        return res.status(400).end();
      }
      global.salesLeadService.sendSlackNotification(lead, resource.type, resource);
      global.mailService.sendResourceMail(lead, resource);
      return res.status(200).send('Whitepaper successfully requested');
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.status(400).send(error);
    }
  });

  return app;
};
