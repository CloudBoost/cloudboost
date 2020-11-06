/* eslint-disable
*/
const winston = require('winston');
const Q = require('q');
const xmlBodyParser = require('express-xml-bodyparser');
const keys = require('../config/keys.js');

/**

This API is from : https://github.com/Azure/azure-marketplace

*/

module.exports = (app) => {
  app.use(xmlBodyParser());
  app.put('/subscriptions/:subscription_id', subscription);
  app.put('/subscriptions/:subscription_id/resourceGroups/:resourceGroupName/providers/:resourceProviderNamespace/:resource_type/:resource_name', createOrUpdateResource);
  app.patch('/subscriptions/:subscription_id/resourceGroups/:resourceGroupName/providers/:resourceProviderNamespace/:resource_type/:resource_name', createOrUpdateResource);
  app.get('/subscriptions/:subscription_id/resourceGroups/:resourceGroupName/providers/:resourceProviderNamespace/:resource_type/:resource_name', getResource);
  app.get('/subscriptions/:subscription_id/resourceGroups/:resourceGroupName/providers/:resourceProviderNamespace/:resource_type', getProjectsInResourceGroup);
  app.get('/subscriptions/:subscription_id/providers/:resourceProviderNamespace/:resourceType', getProjectsInSubscription);
  app.get('/providers/:resourceProviderNamespace/operations', getOperations);
  app.get('/providers/:resourceProviderNamespace//operations', getOperations);
  app.post('/subscriptions/:subscription_id/resourceGroups/:resourceGroupName/providers/:resourceProviderNamespace/:resource_type/:resource_name/listSecrets', getListofSecrets);
  app.post('/subscriptions/:subscription_id/providers/:resourceProviderNamespace/updateCommunicationPreference', updateCommunicationPreference);
  app.post('/subscriptions/:subscription_id/providers/:resourceProviderNamespace/listCommunicationPreference', getCommunicationPreference);
  app.post('/subscriptions/:subscription_id/providers/:resourceProviderNamespace//listCommunicationPreference', getCommunicationPreference);
  app.post('/subscriptions/:subscription_id/resourceGroups/:resourceGroupName/providers/:resourceProviderNamespace/:resource_type/:resource_name/RegenerateKey', regenerateKeys);
  app.delete('/subscriptions/:subscription_id/resourceGroups/:resourceGroupName/providers/:resourceProviderNamespace/:resource_type/:resource_name', removeResource);

  // SSO
  app.post('/subscriptions/:subscription_id/resourceGroups/:resourceGroupName/providers/:resourceProviderNamespace/:resource_type/:resource_name/listSingleSignOnToken', getToken);
  app.get('/sso', sso);

  // RETURN
  return app;
};

function sso(req, res) {
  if (!validateRequest(req, res)) {
    return;
  }

  const url = require('url');
  const url_parts = url.parse(req.url, true);
  const query = url_parts.query;

  const resourceParams = new Buffer(query.resourceId.toString(), 'base64').toString('ascii').split('/');
  const password = new Buffer(query.token.toString(), 'base64').toString('ascii');

  let subscriptionId = null;

  if (resourceParams[1]) { subscriptionId = resourceParams[1]; } else { return res.status(400).send('Bad Params'); }


  getUserBySubscription(subscriptionId).then((user) => {
    if (!user) {
      return res.status(404).send('User not found.'); // subscription not found.
    }

    if (user.password === password) {
      req.login(user, (err) => {
        if (err) {
          return res.status(500).end(err);
        }

        delete user.emailVerificationCode;
        delete user.password; // delete this code form response for security

        res.writeHead(302, {
          Location: `https://dashboard.cloudboost.io?provider=azure&userId=${user.id}`,
        });

        res.end();
      });
    } else {
      return res.status(401).send('Unauthorized');
    }
  });
}

function subscription(req, res) {
  if (!validateRequest(req, res)) {
    return;
  }

  const state = req.body.state;
  switch (state) {
    case 'Registered':
      onSubscriptionRegistered(req, res);
      break;
    case 'Suspended':
      onSubscriptionUnregistered(req, res);
      break;
    case 'Unregistered':
      onSubscriptionUnregistered(req, res);
      break;
    case 'Warned':
      onSubscriptionUnregistered(req, res);
      break;
    case 'Deleted':
      onSubscriptionDeleted(req, res);
      break;
    case 'Enabled':
      onSubscriptionEnabled(req, res);
      break;
  }
}

/**
  This event is to just create a user.
*/

function onSubscriptionRegistered(req, res) {
  if (!validateRequest(req, res)) {
    return;
  }


  // generate the new user.
  const user = {};
  user.email = `${req.params.subscription_id}@azure.com`;
  user.emailVerified = true;
  user.password = global.utilService.generateRandomString();
  user.name = 'Azure User';
  user.isAdmin = false;
  user.isActive = true;
  user.provider = 'azure';
  user.providerProperties = req.body.Properties;

  global.userService.register(user).then(registeredUser => res.status(200).json(req.body), (error) => {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    return res.status(500).send(error);
  });
}


/**
  This event is to just block all the apps.
*/

function onSubscriptionUnregistered(req, res) {
  // get user by subscription
  // get list of all projects.
  // block all projects.

  if (!validateRequest(req, res)) {
    return;
  }


  getProjectListBySubscription(req.params.subscription_id).then((projects) => {
    if (projects && projects.length > 0) {
      const promises = [];

      for (let i = 0; i < projects.length; i++) {
        promises.push(global.projectService.blockProject(projects[i].id));
      }

      Q.all(promises).then(statuses => res.status(200).send(req.body), (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        return res.status(500).send(error);
      });
    } else {
      return res.status(200).send(req.body);
    }
  }, (error) => {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    return res.status(500).send(error);
  });
}

/**
  This event is to unblock all apps.
*/

function onSubscriptionEnabled(req, res) {
  if (!validateRequest(req, res)) {
    return;
  }


  getProjectListBySubscription(req.params.subscription_id).then((projects) => {
    if (projects && projects.length > 0) {
      const promises = [];

      for (let i = 0; i < projects.length; i++) {
        promises.push(global.projectService.unblockProject(projects[i].id));
      }

      Q.all(promises).then(statuses => res.status(200).send(req.body), (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        return res.status(500).send(error);
      });
    } else {
      return res.status(200).send(req.body);
    }
  }, (error) => {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    return res.status(500).send(error);
  });
}

/**
  This event is to delete apps from the current user.
*/

function onSubscriptionDeleted(req, res) {
  if (!validateRequest(req, res)) {
    return;
  }

  getProjectListBySubscription(req.params.subscription_id).then((projects) => {
    if (projects && projects.length > 0) {
      const promises = [];

      for (let i = 0; i < projects.length; ++i) {
        promises.push(global.projectService.deleteProjectBy({
          _id: projects[i].id,
        }));
      }

      Q.all(promises).then((list) => {
        res.status(200).send(req.body);
      }, error => res.status(500).send(error));
    } else {
      return res.status(200).send(req.body);
    }
  }, (error) => {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    return res.status(500).send(error);
  });
}

function getOperations(req, res) {
  if (!validateRequest(req, res)) {
    return;
  }


  res.status(200).json({
    value: [{
      name: 'hackerbay.cloudboost/operations/read',
      display: {
        operation: 'Read Operations',
        resource: 'Operations',
        description: 'Read any Operation',
        provider: 'HackerBay CloudBoost',
      },
    },
    {
      name: 'hackerbay.cloudboost/updateCommunicationPreference/action',
      display: {
        operation: 'Update Communication Preferences',
        resource: 'Update Communication Preferences',
        description: 'Updates Communication Preferences',
        provider: 'HackerBay CloudBoost',
      },
    },
    {
      name: 'hackerbay.cloudboost/listCommunicationPreference/action',
      display: {
        operation: 'List Communication Preferences',
        resource: 'List Communication Preferences',
        description: 'Read any Communication Preferences',
        provider: 'HackerBay CloudBoost',
      },
    },
    {
      name: 'hackerbay.cloudboost/services/read',
      display: {
        operation: 'Read CloudBoost app',
        resource: 'services',
        description: 'Read any CloudBoost app',
        provider: 'HackerBay CloudBoost',
      },
    },
    {
      name: 'hackerbay.cloudboost/services/write',
      display: {
        operation: 'Create or Update CloudBoost app',
        resource: 'services',
        description: 'Create or Update any CloudBoost app',
        provider: 'HackerBay CloudBoost',
      },
    },
    {
      name: 'hackerbay.cloudboost/services/delete',
      display: {
        operation: 'Delete CloudBoost apps',
        resource: 'services',
        description: 'Deletes any CloudBoost app',
        provider: 'HackerBay CloudBoost',
      },
    },
    {
      name: 'hackerbay.cloudboost/services/listSecrets/action',
      display: {
        operation: 'List Master Key and Client Keys',
        resource: 'services',
        description: 'Read any app Master Key and Client key.',
        provider: 'HackerBay CloudBoost',
      },
    },
    {
      name: 'hackerbay.cloudboost/services/regenerateKeys/action',
      display: {
        operation: 'Regenerate Master Key and Client Keys',
        resource: 'services',
        description: "Regenerate any CloudBoost app's Master Key and Client Key.",
        provider: 'HackerBay CloudBoost',
      },
    },
    {
      name: 'hackerbay.cloudboost/services/listSingleSignOnToken/action',
      display: {
        operation: 'List Single Sign On Tokens',
        resource: 'services',
        description: 'Read Single Sign On Tokens',
        provider: 'HackerBay CloudBoost',
      },
    },
    ],
  });
}

function createOrUpdateResource(req, res) {
  if (!validateRequest(req, res)) {
    return;
  }


  const subscriptionId = req.params.subscription_id;

  const criteria = {
    'providerProperties.resourceGroupName': req.params.resourceGroupName,
    'providerProperties.resourceProviderNamespace': req.params.resourceProviderNamespace,
    'providerProperties.resource_name': req.params.resource_name,
    'providerProperties.subscription_id': req.params.subscription_id,
    provider: 'azure',
  };

  getProjectByAzureSubscriptionAndQuery(subscriptionId, criteria).then((project) => {
    const subscription_id = req.params.subscription_id;
    const resourceGroupName = req.params.resourceGroupName;
    const resourceProviderNamespace = req.params.resourceProviderNamespace;
    const resource_name = req.params.resource_name;
    const tags = req.body.tags || {};
    const plan = getPlanId(req.body.plan.name.toString());
    const georegion = req.body.location;
    const type = req.params.resource_type;
    const properties = req.body.properties || {};

    getUserBySubscription(req.params.subscription_id).then((user) => {
      if (!user) {
        return res.status(404).send(); // subscription not found.
      }
      if (!project) {
        // insert project.
        const projObj = {
          provider: 'azure',
          providerProperties: {
            tags: tags || {},
            subscription_id,
            resourceGroupName,
            resourceProviderNamespace,
            resource_name,
            resource_type: type,
            plan: req.body.plan,
            properties: properties || {},
          },
        };

        if (georegion) {
          projObj.providerProperties.geoRegion = georegion.toString();
        }

        global.projectService.createProject(resource_name, user.id, projObj).then((project) => {
          if (!project) {
            return res.status(500).send();
          }

          global.paymentProcessService.createThirdPartySale(project.appId, plan).then(() => res.status(200).json({
            location: project.providerProperties.geoRegion,
            id: `/subscriptions/${subscription_id}/resourceGroups/${resourceGroupName}/providers/${resourceProviderNamespace}/${type}/${resource_name}`,
            name: resource_name,
            type: 'hackerbay.cloudboost/services',
            tags,
            plan: req.body.plan,
            properties: {
              provisioningState: 'Succeeded',
              CLOUDBOOST_URL: 'https://api.cloudboost.io',
              CLOUDBOOST_PORTAL: 'https://dashboard.cloudboost.io',
              CLOUDBOOST_APP_ID: project.appId,
              CLOUDBOOST_CLIENT_KEY: project.keys.js,
              CLOUDBOOST_MASTER_KEY: project.keys.master,
            },
          }), error => res.status(500).send());
        }, (error) => {
          winston.error({
            error: String(error),
            stack: new Error().stack,
          });
          return res.status(500).send();
        });
      } else {
        // update the project
        const projectId = project.id;

        // In case of update
        const updateData = {
          providerProperties: {
            tags,
            subscription_id,
            resourceGroupName,
            resourceProviderNamespace,
            resource_name,
            resource_type: type,
            plan: req.body.plan,
            properties,
          },
          provider: 'azure',
          name: resource_name,
          planId: plan,
        };

        if (georegion) {
          updateData.providerProperties.geoRegion = georegion.toString();
        }

        global.projectService.findOneAndUpdateProject(projectId, updateData).then((project) => {
          if (!project) {
            return res.status(400).send('Error : Project not created');
          }

          global.paymentProcessService.createThirdPartySale(project.appId, plan).then(() => res.status(200).json({
            location: project.providerProperties.geoRegion,
            id: `/subscriptions/${subscription_id}/resourceGroups/${resourceGroupName}/providers/${resourceProviderNamespace}/${type}/${resource_name}`,
            name: resource_name,
            type: 'hackerbay.cloudboost/services',
            tags,
            plan: req.body.plan,
            properties: {
              provisioningState: 'Succeeded',
              CLOUDBOOST_URL: 'https://api.cloudboost.io',
              CLOUDBOOST_PORTAL: 'https://dashboard.cloudboost.io',
              CLOUDBOOST_APP_ID: project.appId,
              CLOUDBOOST_CLIENT_KEY: project.keys.js,
              CLOUDBOOST_MASTER_KEY: project.keys.master,
            },
          }), error => res.status(500).send());
        }, error => res.status(500).send());
      }
    }, error => res.status(500).send());
  });
}

function getResource(req, res, next) {
  if (!validateRequest(req, res)) {
    return;
  }

  const subscriptionId = req.params.subscription_id;

  const criteria = {
    'providerProperties.resourceGroupName': req.params.resourceGroupName,
    'providerProperties.resourceProviderNamespace': req.params.resourceProviderNamespace,
    'providerProperties.resource_name': req.params.resource_name,
    'providerProperties.subscription_id': req.params.subscription_id,
    provider: 'azure',
  };

  getProjectByAzureSubscriptionAndQuery(subscriptionId, criteria).then((project) => {
    if (project) {
      return res.status(200).json({
        location: project.providerProperties.geoRegion,
        id: `/subscriptions/${req.params.subscription_id}/resourceGroups/${req.params.resourceGroupName}/providers/${req.params.resourceProviderNamespace}/${req.params.resource_type}/${req.params.resource_name}`,
        name: req.params.resource_name,
        type: 'hackerbay.cloudboost/services',
        tags: project.providerProperties.tags || {},
        plan: project.providerProperties.plan || {},
        properties: {
          provisioningState: 'Succeeded',
          CLOUDBOOST_URL: 'https://api.cloudboost.io',
          CLOUDBOOST_PORTAL: 'https://dashboard.cloudboost.io',
          CLOUDBOOST_APP_ID: project.appId,
          CLOUDBOOST_CLIENT_KEY: project.keys.js,
          CLOUDBOOST_MASTER_KEY: project.keys.master,
        },
      });
    }
    return res.status(404).send();
  }, error => res.status(500).send());
}

function getProjectsInResourceGroup(req, res, next) {
  if (!validateRequest(req, res)) {
    return;
  }

  const subscriptionId = req.params.subscription_id;

  const criteria = {
    'providerProperties.resourceGroupName': req.params.resourceGroupName,
    'providerProperties.resourceProviderNamespace': req.params.resourceProviderNamespace,
    'providerProperties.subscription_id': req.params.subscription_id,
    provider: 'azure',
  };

  getProjectsByAzureSubscriptionAndQuery(subscriptionId, criteria).then((projects) => {
    if (projects && projects.length > 0) {
      const value = [];

      for (let i = 0; i < projects.length; i++) {
        value.push({
          location: projects[i].providerProperties.geoRegion,
          id: `/subscriptions/${req.params.subscription_id}/resourceGroups/${req.params.resourceGroupName}/providers/${req.params.resourceProviderNamespace}/${req.params.resource_type}/${projects[i].name}`,
          name: projects[i].name,
          type: 'hackerbay.cloudboost/services',
          tags: projects[i].providerProperties.tags,
          plan: projects[i].providerProperties.plan || {},
          properties: {
            provisioningState: 'Succeeded',
            CLOUDBOOST_URL: 'https://api.cloudboost.io',
            CLOUDBOOST_PORTAL: 'https://dashboard.cloudboost.io',
            CLOUDBOOST_APP_ID: projects[i].appId,
            CLOUDBOOST_CLIENT_KEY: projects[i].keys.js,
            CLOUDBOOST_MASTER_KEY: projects[i].keys.master,
          },
        });
      }

      return res.status(200).json({
        value,
        nextLink: '',
      });
    }
    return res.status(200).json({
      value: [],
      nextLink: '',
    });
  }, error => res.status(500).send());
}

function getProjectsInSubscription(req, res, next) {
  if (!validateRequest(req, res)) {
    return;
  }

  const subscriptionId = req.params.subscription_id;

  const criteria = {
    'providerProperties.resourceProviderNamespace': req.params.resourceProviderNamespace,
    'providerProperties.subscription_id': req.params.subscription_id,
    provider: 'azure',
  };

  getProjectsByAzureSubscriptionAndQuery(subscriptionId, criteria).then((projects) => {
    if (projects && projects.length > 0) {
      const value = [];

      for (let i = 0; i < projects.length; i++) {
        value.push({
          location: projects[i].providerProperties.geoRegion,
          id: `/subscriptions/${req.params.subscription_id}/resourceGroups/${req.params.resourceGroupName}/providers/${req.params.resourceProviderNamespace}/${req.params.resource_type}/${projects[i].name}`,
          name: projects[i].name,
          type: 'hackerbay.cloudboost/services',
          tags: projects[i].providerProperties.tags,
          plan: projects[i].providerProperties.plan || {},
          properties: {
            provisioningState: 'Succeeded',
            CLOUDBOOST_URL: 'https://api.cloudboost.io',
            CLOUDBOOST_PORTAL: 'https://dashboard.cloudboost.io',
            CLOUDBOOST_APP_ID: projects[i].appId,
            CLOUDBOOST_CLIENT_KEY: projects[i].keys.js,
            CLOUDBOOST_MASTER_KEY: projects[i].keys.master,
          },
        });
      }

      return res.status(200).json({
        value,
        nextLink: '',
      });
    }
    return res.status(200).json({
      value: [],
      nextLink: '',
    });
  }, error => res.status(500).send());
}

function getListofSecrets(req, res) {
  if (!validateRequest(req, res)) {
    return;
  }

  const subscriptionId = req.params.subscription_id;

  const criteria = {
    'providerProperties.resourceGroupName': req.params.resourceGroupName,
    'providerProperties.resourceProviderNamespace': req.params.resourceProviderNamespace,
    'providerProperties.resource_name': req.params.resource_name,
    'providerProperties.subscription_id': req.params.subscription_id,
    provider: 'azure',
  };

  getProjectByAzureSubscriptionAndQuery(subscriptionId, criteria).then((project) => {
    if (project) {
      return res.status(200).json({
        CLOUDBOOST_CLIENT_KEY: project.keys.js,
        CLOUDBOOST_MASTER_KEY: project.keys.master,
      });
    }
    return res.status(404).send('Project not found.');
  }, error => res.status(500).send(error));
}

function updateCommunicationPreference(req, res) {
  if (!validateRequest(req, res)) {
    return;
  }

  const userData = {
    'azure.firstName': req.body.firstName,
    'azure.lastName': req.body.lastName,
    'azure.email': req.body.email,
    'azure.optInForCommunication': req.body.optInForCommunication,
  };

  getUserBySubscription(req.params.subscription_id).then((user) => {
    global.userService.updateAccountByQuery({
      _id: user.id,
    }, userData).then(user => res.status(200).send(req.body), error => res.status(500).send(error));
  }, error => res.status(500).send(error));
}

function getCommunicationPreference(req, res) {
  if (!validateRequest(req, res)) {
    return;
  }

  getUserBySubscription(req.params.subscription_id).then((user) => {
    if (user) {
      return res.status(200).json({
        firstName: user.azure.firstName || '',
        lastName: user.azure.lastName || '',
        email: user.azure.email || '',
        optInForCommunication: user.azure.optInForCommunication || true,
      });
    }
    return res.status(404).send('Azure Subscription not found.');
  }, error => res.status(500).send(error));
}

// ----------------------------------------------------------RegenerateKeys--------------------------
function regenerateKeys(req, res) {
  if (!validateRequest(req, res)) {
    return;
  }

  const subscriptionId = req.params.subscription_id;

  const criteria = {
    'providerProperties.resourceGroupName': req.params.resourceGroupName,
    'providerProperties.resourceProviderNamespace': req.params.resourceProviderNamespace,
    'providerProperties.resource_name': req.params.resource_name,
    'providerProperties.subscription_id': req.params.subscription_id,
    provider: 'azure',
  };

  getProjectByAzureSubscriptionAndQuery(subscriptionId, criteria).then((project) => {
    if (project) {
      // get user.
      getUserBySubscription(subscriptionId).then((user) => {
        if (user) {
          if (req.body.CLOUDBOOST_MASTER_KEY) {
            // regenerate client key
            global.projectService.changeAppMasterKey(user.id, project.appId).then(project => res.status(200).json({
              CLOUDBOOST_MASTER_KEY: project.keys.master,
            }), error => res.status(500).send(error));
          } else if (req.body.CLOUDBOOST_CLIENT_KEY) {
            // regenerate master key
            global.projectService.changeAppClientKey(user.id, project.appId).then(project => res.status(200).json({
              CLOUDBOOST_CLIENT_KEY: project.keys.js,
            }), error => res.status(500).send(error));
          } else {
            res.status(400).send();
          }
        } else {
          return res.status(404).send('Subscription not found.');
        }
      }, error => res.status(500).send(error));
    } else {
      return res.status(404).send('Project not found.');
    }
  }, error => res.status(500).send(error));
}


function removeResource(req, res, next) {
  if (!validateRequest(req, res)) {
    return;
  }

  const subscriptionId = req.params.subscription_id;


  const criteria = {
    'providerProperties.resourceGroupName': req.params.resourceGroupName,
    'providerProperties.resourceProviderNamespace': req.params.resourceProviderNamespace,
    'providerProperties.resource_name': req.params.resource_name,
    'providerProperties.subscription_id': req.params.subscription_id,
    provider: 'azure',
  };

  getProjectByAzureSubscriptionAndQuery(subscriptionId, criteria).then((project) => {
    if (!project) {
      return res.status(404).end();
    }

    global.projectService.deleteAppAsAdmin(project.appId).then(project => res.status(200).end(), error => res.status(500).end(error));
  }, error => res.status(500).end(error));
}


function getToken(req, res) {
  if (!validateRequest(req, res)) {
    return;
  }

  const resourceId = `/subscriptions/${req.params.subscription_id}/resourceGroups/${req.params.resourceGroupName}/providers/${req.params.resourceProviderNamespace}/${req.params.resource_type}/${req.params.resource_name}`;

  getUserBySubscription(req.params.subscription_id).then((user) => {
    if (!user) {
      return res.status(404).send('User not found.'); // subscription not found.
    }
    res.status(200).json({
      url: 'https://service.cloudboost.io/sso',
      resourceId: new Buffer(resourceId).toString('base64'),
      token: new Buffer(user.password).toString('base64'),
    });
  });
}

/** ******Private Functions************ */
function getProjectListBySubscription(subscriptionId) {
  const deferred = Q.defer();

  global.userService.getUserBy({
    email: `${subscriptionId}@azure.com`,
  }).then((user) => {
    if (user) {
      global.projectService.projectList(user.id).then((projects) => {
        deferred.resolve(projects);
      }, (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        deferred.reject(error);
      });
    } else {
      deferred.reject('Azure Subscription not found.');
    }
  }, (error) => {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    deferred.reject(error);
  });

  return deferred.promise;
}

function getUserBySubscription(subscriptionId) {
  const deferred = Q.defer();

  global.userService.getUserBy({
    email: `${subscriptionId}@azure.com`,
  }).then((user) => {
    if (user) {
      deferred.resolve(user);
    } else {
      deferred.reject('Azure Subscription not found.');
    }
  }, (error) => {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    deferred.reject(error);
  });

  return deferred.promise;
}

function getProjectByAzureSubscriptionAndQuery(subscriptionId, query) {
  const deferred = Q.defer();

  global.userService.getUserBy({
    email: `${subscriptionId}@azure.com`,
  }).then((user) => {
    if (user) {
      global.projectService.getProjectByUserIdAndQuery(user.id, query).then((project) => {
        deferred.resolve(project);
      }, (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        deferred.reject(error);
      });
    } else {
      deferred.reject('Azure Subscription not found.');
    }
  }, (error) => {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    deferred.reject(error);
  });

  return deferred.promise;
}

function getProjectsByAzureSubscriptionAndQuery(subscriptionId, query) {
  const deferred = Q.defer();

  global.userService.getUserBy({
    email: `${subscriptionId}@azure.com`,
  }).then((user) => {
    if (user) {
      global.projectService.getProjectsByUserIdAndQuery(user.id, query).then((projects) => {
        deferred.resolve(projects);
      }, (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        deferred.reject(error);
      });
    } else {
      deferred.reject('Azure Subscription not found.');
    }
  }, (error) => {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    deferred.reject(error);
  });

  return deferred.promise;
}

function getPlanId(plan) {
  let planId = 2;

  if (plan === 'launch') {
    planId = 2;
  }

  if (plan === 'bootstrap') {
    planId = 3;
  }

  if (plan === 'scale') {
    planId = 4;
  }

  if (plan === 'unicorn') {
    planId = 5;
  }

  return planId;
}

// This is used to validate the request if it comes from azure-service project of CloudBoost.

function validateRequest(req, res) {
  if (req.body && keys.secureKey === req.body.secureKey) {
    delete req.body.secureKey;
    return true;
  }
  res.status(404).send();
  return false;
}
