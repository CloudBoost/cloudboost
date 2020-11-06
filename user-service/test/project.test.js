describe('Projects', () => {
  const test_user = {
    email: util.makeEmail(),
    password: util.makeString(),
    name: util.makeString(),
  };
  const secureKey = '1227d1c4-1385-4d5f-ae73-23e99f74b006';
  const app_name = util.makeString();
  const invitedEmail = util.makeEmail();
  let Cookie; let id; let appId; let masterKey; let
    clientKey;

  before(function (done) {
    this.timeout(0);
    let emailVerificationCode;
    request
      .post('/user/signup')
      .send(test_user)
      .end((err, res) => {
        emailVerificationCode = res.body.emailVerificationCode;
        request
          .post('/user/activate')
          .send({ code: emailVerificationCode })
          .end((err, res1) => {
            request
              .post('/user/signin')
              .send({ email: test_user.email, password: test_user.password })
              .end((err, res2) => {
                Cookie = res2.headers['set-cookie'].pop().split(';')[0];
                id = res2.body._id;
                done();
              });
          });
      });
  });

  after((done) => {
    request
      .post('/user/logout')
      .end((err, res) => {
        done();
      });
  });

  // 'post /app/create'
  it('should create an app', function (done) {
    this.timeout(10000);
    request
      .post('/app/create')
      .set('Cookie', Cookie)
      .send({ name: app_name })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.name).to.equal(app_name);
        appId = res.body.appId;
        done();
      });
  });

  // 'post /app/active/:appId'
  it('should set last active for app', (done) => {
    request
      .post(`/app/active/${appId}`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.equal(app_name);
        done();
      });
  });

  // 'delete /apps/inactive'
  it('should delete inactive app', (done) => {
    request
      .delete('/apps/inactive')
      .set('Cookie', Cookie)
      .send({ deleteReason: util.makeString(), secureKey })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  // 'post /apps/notifyInactive'
  it('should notify when app is inactive', (done) => {
    request
      .post('/apps/notifyInactive')
      .set('Cookie', Cookie)
      .send({ secureKey })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  // 'get /app'
  it('should get project list', (done) => {
    request
      .get('/app')
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body[0]).to.include({ appId });
        done();
      });
  });

  // 'post /app'
  it('should get project list on user credentials', (done) => {
    request
      .get('/app')
      .set('Cookie', Cookie)
      .send({ email: test_user.email, password: test_user.password })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body[0]).to.include({ appId });
        done();
      });
  });

  // 'get /:appId/status'
  it('should return app status', (done) => {
    request
      .get(`/${appId}/status`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  // 'put /app/:appId'
  it('should update app details', (done) => {
    const newAppName = util.makeString();
    request
      .put(`/app/${appId}`)
      .set('Cookie', Cookie)
      .send({ name: newAppName })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.name).to.equal(newAppName);
        done();
      });
  });

  // 'get /app/:appId'
  it('should get an app by appId', (done) => {
    request
      .get(`/app/${appId}`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.appId).to.equal(appId);
        masterKey = res.body.keys.master;
        clientKey = res.body.keys.js;
        done();
      });
  });

  // 'get /app/:appId/masterkey'
  it('should get masterkey by appId with valid secureKey', (done) => {
    request
      .get(`/app/${appId}/masterkey`)
      .set('Cookie', Cookie)
      .send({ key: secureKey })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.equal(masterKey);
        done();
      });
  });

  // 'get /app/:appId/change/masterkey'
  it('should change masterkey by appId', (done) => {
    request
      .get(`/app/${appId}/change/masterkey`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.not.equal(masterKey);
        done();
      });
  });

  // 'get /app/:appId/change/clientkey'
  it('should change clientkey by appId', (done) => {
    request
      .get(`/app/${appId}/change/clientkey`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.not.equal(clientKey);
        done();
      });
  });

  // 'post /app/:appId/invite'
  it('should invite to app using emailid, appId', (done) => {
    request
      .post(`/app/${appId}/invite`)
      .set('Cookie', Cookie)
      .send({ email: invitedEmail })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.equal('successfully Invited!');
        done();
      });
  });

  // 'post /app/:appId/removeinvitee'
  it('should remove Invitee by appId', (done) => {
    request
      .post(`/app/${appId}/removeinvitee`)
      .set('Cookie', Cookie)
      .send({ email: invitedEmail })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.appId).to.equal(appId);
        expect(res.body.invited).to.not.include(invitedEmail);
        done();
      });
  });

  // 'get /app/:appId/adddeveloper/:email'
  it('should add developer with an emailid', (done) => {
    request
      .post(`/app/${appId}/invite`)
      .set('Cookie', Cookie)
      .send({ email: invitedEmail })
      .end((err, res) => {
        request
          .get(`/app/${appId}/adddeveloper/${invitedEmail}`)
          .set('Cookie', Cookie)
          .send({ email: invitedEmail })
          .end((err, res1) => {
            expect(res1).to.have.status(200);
            // expect(res1.body.appId).to.equal(appId);
            // expect(res1.body.invited).to.not.include(invitedEmail);
            // expect(res1.body.developers[0].userId).to.equal(id);
            done();
          });
      });
  });

  // 'get /app/:appId/changerole/:userId/:role'
  it('should change developer role for an app', (done) => {
    request
      .get(`/app/${appId}/changerole/${id}/` + 'Admin')
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  // 'delete /app/:appId/removedeveloper/:userId'
  it('should remove developer by userId', (done) => {
    request
      .delete(`/app/${appId}/removedeveloper/${id}`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  // 'delete /app/:appId'
  it('should delete app by appId', (done) => {
    request
      .delete(`/app/${appId}`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
