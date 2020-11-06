/* eslint no-param-reassign:0 */
const keys = require('../config/keys.js'); // eslint-disable-line
const winston = require('winston');
const stripe = require('stripe')(keys.stripeSecureKey);
const request = require('request');
const _ = require('underscore');
const moment = require('moment');
const ejs = require('ejs');
const fs = require('fs');
const html2Pdf = require('html-pdf');
const middlewares = require('../config/middlewares');

const momentFormatDate = date => moment.unix(date).format('MMM DD, YYYY');
const centToUSD = cent => (cent / 100).toFixed(2);

module.exports = (app) => {
  // routes
  app.post('/app/create', middlewares.checkAuth, (req, res) => {
    const data = req.body || {};
    const currentUserId = req.user.id;

    if (currentUserId && data) {
      global.projectService.createApp(data.name, currentUserId, null, data.paymentData).then((project) => {
        if (!project) {
          return res.status(400).send('Error : Project not created');
        }
        if (project._doc.keys.encryption_key) {
          delete project._doc.keys.encryption_key;
        }
        return res.status(200).json(project._doc);
      }, (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        return res.status(500).send(error);
      });
    } else {
      res.status(401).send('Unauthorised');
    }
  });

  app.post('/app/active/:appId', (req, res) => {
    const id = req.params.appId;

    if (req.params.appId) {
      global.projectService.activeApp(id).then((project) => {
        if (!project) {
          return res.send(500, 'Error: Project not found');
        }

        if (project.keys && project.keys.encryption_key) {
          delete project.keys.encryption_key;
        }

        return res.status(200).send(project);
      }, error => res.status(500).send(error));
    } else {
      res.send(401);
    }
  });

  app.delete('/apps/inactive', (req, res) => {
    const body = req.body || {};
    const { deleteReason } = body;
    if (keys.secureKey === body.secureKey) {
      global.projectService.deleteInactiveApps(deleteReason).then((inactiveApps) => {
        inactiveApps.forEach((appData) => {
          if (appData.keys.encryption_key) {
            delete appData.keys.encryption_key;
          }
        });
        return res.status(200).send(inactiveApps);
      }, error => res.status(500).send(error));
    } else {
      res.status(401).send('unauthorized');
    }
  });

  app.post('/apps/notifyInactive', (req, res) => {
    const body = req.body || {};

    if (keys.secureKey === body.secureKey) {
      global.projectService.notifyInactiveApps().then((inactiveApps) => {
        inactiveApps.forEach((appData) => {
          if (appData.keys.encryption_key) {
            delete appData.keys.encryption_key;
          }
        });
        return res.status(200).send(inactiveApps);
      }, error => res.status(500).send(error));
    } else {
      res.status(500).send('Unauthorized');
    }
  });

  app.get('/app', middlewares.checkAuth, (req, res) => {
    const currentUserId = req.user.id;

    if (currentUserId) {
      global.projectService.projectList(currentUserId).then((list) => {
        if (!list) {
          return res.send(500, 'Error: Something Went Wrong');
        }
        list.forEach((appData) => {
          if (appData.keys.encryption_key) {
            delete appData.keys.encryption_key;
          }
        });

        return res.status(200).json(list);
      }, error => res.send(500, error));
    } else {
      res.send(401);
    }
  });

  app.post('/app', middlewares.checkAuth, (req, res) => {
    const { body } = req;

    global.userService.getAccountByEmail(body.email).then((user) => {
      if (global.userService.validatePassword(body.password, user.password, user.salt)) {
        const userId = String(user._id);

        global.projectService.projectList(userId).then((list) => {
          if (!list) {
            return res.send(500, 'Error: Something Went Wrong');
          }
          return res.status(200).json(list);
        }, error => res.send(500, error));
      } else {
        res.send(401);
      }
    }, () => res.send(404, 'Error: User Not Found'));
  });


  app.get('/:appId/status', middlewares.checkAuth, middlewares.isAppDisabled, (req, res) => {
    const currentUserId = req.user.id;

    if (currentUserId && req.params.appId) {
      global.projectService.projectStatus(req.params.appId)
        .then(status => res.json(200, status), error => res.send(500, error));
    } else {
      res.send(401);
    }
  });

  app.put('/app/:appId', middlewares.checkAuth, middlewares.isAppDisabled, (req, res) => {
    const currentUserId = req.user.id;
    const { appId } = req.params;
    const data = req.body || {};
    const { name } = data;

    if (currentUserId && appId && !_.isEmpty(data)) {
      global.projectService.editProject(currentUserId, appId, name).then((project) => {
        if (!project) {
          return res.status(500).send("Error: Project didn't get edited");
        }

        if (project.keys.encryption_key) {
          delete project.keys.encryption_key;
        }

        return res.status(200).json(project);
      }, error => res.status(500).send(error));
    } else {
      res.send(401);
    }
  });

  app.get('/app/:appId', middlewares.checkAuth, middlewares.isAppDisabled, (req, res) => {
    const currentUserId = req.user.id;
    const id = req.params.appId;
    const authUser = {
      appId: id,
      developers: {
        $elemMatch: {
          userId: currentUserId,
        },
      },
    };
    if (id && currentUserId) {
      global.projectService.getProjectBy(authUser).then((project) => {
        if (!project || project.length === 0) {
          return res.send(500, 'Error: Invalid User or project not found');
        }

        if (project[0].keys.encryption_key) {
          delete project[0].keys.encryption_key;
        }

        return res.status(200).json(project[0]);
      }, error => res.status(500).send(error));
    } else {
      res.send(401);
    }
  });

  app.get('/app/:appId/masterkey', middlewares.checkAuth, middlewares.isAppDisabled, (req, res) => {
    const currentUserId = req.user.id;
    const id = req.params.appId;
    const { key } = req.body;
    if (key && id && currentUserId) {
      global.projectService.getProject(id).then((project) => {
        if (!project) {
          return res.send(500, 'Error: Project not found');
        }

        return res.status(200).send(project.keys.master);
      }, error => res.status(500).send(error));
    } else {
      res.send(401);
    }
  });

  app.get('/app/:appId/invoices', middlewares.checkAuth, middlewares.isAppDisabled, (req, res) => {
    const id = req.params.appId;

    if (id) {
      stripe.invoices.list({}, (err, response) => {
        if (err) {
          return res.status(500).send(err);
        }
        const appInvoices = response.data
          .filter(invoice => invoice.lines.data.filter(subscription => subscription.metadata.appId === id).length)
          .map((invoice) => {
            invoice.line_items = invoice.lines.data;
            invoice.line_info = _.omit(invoice.lines, 'data');
            return invoice;
          });
        return res.status(200).send({
          invoices: appInvoices,
        });
      });
    } else {
      res.send(401);
    }
  });

  app.get('/invoices/:invoiceId/pdf', middlewares.checkAuth, (req, res) => {
    request(`https://dashboard.stripe.com/v1/invoices/${req.params.invoiceId}\?expand%5B%5D\=customer\&expand%5B%5D\=subscription`, {
      headers: {
        Authorization: `Bearer ${keys.stripeSecureKey}`,
      },
    }, (err, response, body) => {
      if (err) {
        return res.status(400).send('Error fetching invoice');
      }

      const invoice = JSON.parse(body);

      const data = {
        invoice_number: invoice.number,
        customer_email: invoice.customer.email,
        issue_date: momentFormatDate(invoice.date),
        due_date: invoice.due_date ? momentFormatDate(invoice.due_date) : momentFormatDate(invoice.date),
        amount_due: `$${centToUSD(invoice.amount_due)}`,
        start_date: momentFormatDate(invoice.subscription.current_period_start),
        end_date: momentFormatDate(invoice.subscription.current_period_end),
        quantity: invoice.subscription.quantity,
        sub_total: `$${centToUSD(invoice.subtotal)}`,
        total: `$${centToUSD(invoice.total)}`,
        plan_name: invoice.subscription.plan.name,
      };

      const htmlStr = ejs.compile(fs.readFileSync(`${process.cwd()}/mail-templates/invoice_pdf.html`, 'utf-8'))({
        params: data,
      });

      return html2Pdf.create(htmlStr).toStream((err1, stream) => {
        if (err1) {
          return res.status(400).send('Error downloading pdf');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
        return stream.pipe(res);
      });
    });
  });

  app.get('/app/:appId/client', middlewares.isAppDisabled, (req, res) => {
    const id = req.params.appId;

    if (id) {
      global.projectService.getProject(id).then((project) => {
        if (!project) {
          return res.send(500, 'Error: Project not found');
        }

        return res.status(200).send(project.keys.js);
      }, error => res.status(500).send(error));
    } else {
      res.send(401);
    }
  });

  app.get('/app/:appId/change/masterkey', middlewares.checkAuth, middlewares.isAppDisabled, (req, res) => {
    const currentUserId = req.user.id;
    const id = req.params.appId;

    if (currentUserId && id) {
      global.projectService.changeAppMasterKey(currentUserId, id).then((project) => {
        if (!project) {
          return res.send(400, 'Error: Project not found');
        }

        return res.status(200).send(project.keys.master);
      }, error => res.status(400).send(error));
    } else {
      res.send(401);
    }
  });

  app.get('/app/:appId/change/clientkey', middlewares.checkAuth, middlewares.isAppDisabled, (req, res) => {
    const currentUserId = req.user.id;
    const id = req.params.appId;

    if (currentUserId && id) {
      global.projectService.changeAppClientKey(currentUserId, id).then((project) => {
        if (!project) {
          return res.send(400, 'Error: Project not found');
        }

        return res.status(200).send(project.keys.js);
      }, error => res.status(400).send(error));
    } else {
      res.send(401);
    }
  });

  app.delete('/app/:appId', middlewares.checkAuth, (req, res) => {
    const currentUserId = req.user.id;
    const { appId } = req.params;

    if (currentUserId) {
      global.paymentProcessService.cancelPlanAndRefund(appId, currentUserId).then(() => global.projectService.delete(appId, currentUserId))
        .then(() => res.status(200).json({}), error => res.send(500, error));
    } else {
      res.status(401).send('unauthorized');
    }
  });

  app.delete('/app/:appId/removedeveloper/:userId', middlewares.checkAuth, middlewares.isAppDisabled, (req, res) => {
    const currentUserId = req.user.id;

    const { appId, userId } = req.params;

    if (currentUserId && appId && userId) {
      global.projectService.removeDeveloper(currentUserId, appId, userId)
        .then(project => res.status(200).json(project), error => res.status(400).send(error));
    } else {
      res.status(401).send('unauthorized');
    }
  });

  app.post('/app/:appId/removeinvitee', middlewares.checkAuth, middlewares.isAppDisabled, (req, res) => {
    const currentUserId = req.user.id;

    const { appId } = req.params;
    const data = req.body || {};

    if (currentUserId && appId && data.email) {
      global.projectService.removeInvitee(currentUserId, appId, data.email).then((project) => {
        if (project.keys.encryption_key) {
          delete project.keys.encryption_key;
        }
        return res.status(200).json(project);
      }, error => res.status(400).send(error));
    } else {
      res.status(401).send('unauthorized');
    }
  });

  app.post('/app/:appId/invite', middlewares.checkAuth, middlewares.isAppDisabled, (req, res) => {
    const currentUserId = req.user.id;
    const { appId } = req.params;
    const data = req.body || {};
    if (currentUserId && appId && data.email) {
      global.projectService.inviteUser(appId, data.email).then((response) => {
        if (!response) {
          return res.send(400, 'Error: Project not found');
        }
        return res.status(200).send(response);
      }, error => res.status(400).send(error));
    } else {
      res.send(401);
    }
  });

  app.get('/app/:appId/adddeveloper/:email', middlewares.checkAuth, middlewares.isAppDisabled, (req, res) => {
    const currentUserId = req.user.id;
    const { appId, email } = req.params;

    if (currentUserId && appId && email) {
      global.projectService.addDeveloper(currentUserId, appId, email).then((project) => {
        if (!project) {
          return res.send(400, 'Error: Project not found');
        }
        return res.status(200).json(project);
      }, error => res.status(400).send(error));
    } else {
      res.send(401);
    }
  });

  app.get('/app/:appId/changerole/:userId/:role', middlewares.checkAuth, middlewares.isAppDisabled, (req, res) => {
    const currentUserId = req.user.id;
    const { appId } = req.params;
    const requestedUserId = req.params.userId;
    const newRole = req.params.role;

    if (currentUserId && appId && requestedUserId && newRole) {
      global.projectService.changeDeveloperRole(currentUserId, appId, requestedUserId, newRole).then((project) => {
        if (!project) {
          return res.send(400, 'Error: Project not found');
        }
        if (project.keys.encryption_key) {
          delete project.keys.encryption_key;
        }
        return res.status(200).json(project);
      }, error => res.status(400).send(error));
    } else {
      res.send(401);
    }
  });

  return app;
};
