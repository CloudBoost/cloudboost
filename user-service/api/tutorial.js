

module.exports = function (app) {
  // tutorials routes
  app.get('/tutorial', (req, res) => {
    global.tutorialService.getTutorialList()
      .then(tutorial => res.status(200).json(tutorial), error => res.status(500).send(error));
  });

  app.get('/tutorial/:id', (req, res) => {
    const tutorialDocId = req.params.id;

    global.tutorialService.getTutorialById(tutorialDocId)
      .then(tutorial => res.status(200).json(tutorial), error => res.status(500).send(error));
  });

  return app;
};
