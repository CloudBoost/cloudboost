describe('User Analytics', () => {
  const test_user = {
    email: util.makeEmail(),
    password: util.makeString(),
    name: util.makeString(),
  };
  const app_name = util.makeString();
  let Cookie; let id; let
    appId;

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
                request
                  .post('/app/create')
                  .set('Cookie', Cookie)
                  .send({ name: app_name })
                  .end((err, res) => {
                    appId = res.body.appId;
                    done();
                  });
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

  // 'get /analytics/api/:appId/usage'
  it('should return api usage of the app', (done) => {
    request
      .get(`/analytics/api/${appId}/usage`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(200);
        // expect(res.body).to.have.keys('totalApiCount', 'usage');
        done();
      });
  });

  // 'get /analytics/storage/:appId/usage'
  it('should return analytics storage details for the app', (done) => {
    request
      .get(`/analytics/storage/${appId}/usage`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  // 'get /analytics/api/:appId/count'
  it('should return api count for the app', (done) => {
    request
      .get(`/analytics/api/${appId}/count`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.appId).to.equal(appId);
        done();
      });
  });

  // 'get /analytics/storage/:appId/count'
  it('should return storage count for the app', (done) => {
    request
      .get(`/analytics/storage/${appId}/count`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.appId).to.equal(appId);
        done();
      });
  });

  // 'get /analytics/api-storage/bulk/count'
  it('should return api-storage bulk count for the app', (done) => {
    request
      .post('/analytics/api-storage/bulk/count')
      .set('Cookie', Cookie)
      .send({ appIdArray: [appId] })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.api[0].appId).to.equal(appId);
        expect(res.body.storage[0].appId).to.equal(appId);
        done();
      });
  });

  // 'post /analytics/get/statistics'
  it('should return app statistics for an app', (done) => {
    request
      .post('/analytics/get/statistics')
      .set('Cookie', Cookie)
      .send({ appIdArray: appId })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(typeof JSON.parse(res.text).count['total-users']).to.equal('object');
        expect(typeof JSON.parse(res.text).count['monthly-active-users']).to.equal('object');
        expect(typeof JSON.parse(res.text).count['daily-active-users']).to.equal('object');
        done();
      });
  });
});
