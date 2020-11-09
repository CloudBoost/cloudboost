var express = require('express');
var router = express.Router();
var Q = require('q');
var request = require('request');
var isStaging = process.env["IS_STAGING"];

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/quickstart', function(req, res) {
  res.render('quickstart');
});


router.get('/pricing', function(req, res) {
  res.render('pricing');
});

router.get('/development-service|software-development-service|consulting', function(req, res) {
  res.render('consulting');
});

router.get('/experts', function(req, res) {
  res.render('expertProgram');
});

router.get('/about', function(req, res) {
  res.render('about');
});

router.get('/partners', function(req, res) {
  res.render('partner');
});

router.get('/partners/:id', function(req, res) {
  var patnerId = req.params.id;

  if (!patnerId) {
    return res.render('partner');
  }

  if (patnerId) {

    _getResultsById(patnerId).then(function(results) {
      res.render('partnerDetails', {partnerDetails: results});
    }, function(error) {
      res.render('partner');
    });

  }
});

router.get('/joinus', function(req, res) {
  res.render('joinus');
});

router.get('/contact', function(req, res) {
  res.render('contact');
});

router.get('/investors', function(req, res) {
  res.render('investors');
});

router.get('/terms', function(req, res) {
  res.render('terms');
});

router.get('/privacy', function(req, res) {
  res.render('privacy');
});

router.get('/service-level-agreement', function(req, res) {
  res.render('sla');
});

router.get('/tutorials', function(req, res) {
  res.render('tutorial');
});

router.get('/enterprise/demo', function(req, res) {
  res.render('demo');
});


router.get('/enterprise/resources', function(req, res) {
  _getAllResource().then(function(resource) {
    console.log()
    res.render('resources', {resourceList: resource});
  }, function(error) {
    res.render('resources', {resourceList: []});
  });
});

router.get('/enterprise/resources/:type/:slug', function(req, res) {
  var type = req.params.type;
  var slug = req.params.slug;

  if (!type || !slug) {
    return res.render('404');
  }

  if (type && slug) {
    _getResource(type, slug).then(function(resource) {
      console.log(resource);
      res.render('resource', {resourceDetails: resource});
    }, function(error) {
      console.log(error);
      res.render('404');
    });

  }
});

router.get('/enterprise/demo/thank-you', function(req, res) {
  res.render('thankyou');
});

router.get('/enterprise/resources/thank-you', function(req, res) {
  res.render('thankyou');
});

router.get('/enterprise', function(req, res) {
  _getEnterpriseResource().then(function(resource) {
    console.log()
    res.render('enterprise', {resourceList: resource});
  }, function(error) {
    res.render('enterprise', {resourceList: []});
  });

});


router.get('/blogFeed', function(req, res) {

  request.get('https://blog.cloudboost.io/feed', function(err, html, body) {
    res.send(html);
  });
});

module.exports = router;

/***********************Pinging Frotend Services*********************************/

function _getResultsById(partnerId) {

  console.log("Fetch results by typeformId");

  var deferred = Q.defer();

  try {
    var serverlUrl;
    if(isStaging) {
      serverlUrl = 'https://staging-service.cloudboost.io/partner/item/';
    } else {
      serverlUrl = 'https://service.cloudboost.io/partner/item/';
    }
    var url = serverlUrl + partnerId;

    request.get(url, function(err, response, body) {

      if (err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
        console.log("Error on Fetch results by partnerId");
        deferred.reject(err);
      } else {

        console.log("Success on Fetch results by partnerId");

        try {
          var respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.reject(e);
        }

      }
    });

  } catch (err) {
    deferred.reject(err)
  }

  return deferred.promise;
}

function _getResource(type, slug) {

  console.log("Fetch results from user-service");

  var deferred = Q.defer();

  try {
    //var serverlUrl = 'http://localhost:3000/resources/';
    var serverlUrl;
    if(isStaging) {
      serverlUrl = 'https://staging-service.cloudboost.io/resources/';
    } else {
      serverlUrl = 'https://service.cloudboost.io/resources/';
    }
    var url = serverlUrl + type + "/" + slug;

    request.get(url, function(err, response, body) {

      if (err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
        console.log("Error on Fetch results by type and slug");
        deferred.reject(err);
      } else {

        console.log("Success on Fetch results by type and slug");
        console.log(body);
        try {
          var respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.reject(e);
        }

      }
    });

  } catch (err) {
    deferred.reject(err)
  }

  return deferred.promise;
}

function _getAllResource() {
  console.log("Fetch all resource from user-service");

  var deferred = Q.defer();

  try {
    //var serverlUrl = 'http://localhost:3000/';
    var serverlUrl;
    if(isStaging) {
      serverlUrl = 'https://staging-service.cloudboost.io/';
    } else {
      serverlUrl = 'https://service.cloudboost.io/';
    }
    var url = serverlUrl + "resources";
    console.log(url)
    request.get(url, function(err, response, body) {

      if (err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
        console.log("Error on Fetch results");
        console.log(err)
        deferred.reject(err);
      } else {

        console.log("Success on fetching all resources");

        try {
          var respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.reject(e);
        }

      }
    });

  } catch (err) {
    deferred.reject(err)
  }

  return deferred.promise;
}

function _getEnterpriseResource() {
  console.log("Fetch all resource from user-service");

  var deferred = Q.defer();

  try {
    //var serverlUrl = 'http://localhost:3000/';
    var serverlUrl;
    if(isStaging) {
      serverlUrl = 'https://staging-service.cloudboost.io/';
    } else {
      serverlUrl = 'https://service.cloudboost.io/';
    }
    var url = serverlUrl + "resources/enterprise-page";
    console.log(url)
    request.get(url, function(err, response, body) {

      if (err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
        console.log("Error on Fetch results");
        console.log(err)
        deferred.reject(err);
      } else {

        console.log("Success on fetching all resources");

        try {
          var respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.reject(e);
        }

      }
    });

  } catch (err) {
    deferred.reject(err)
  }

  return deferred.promise;
}
