describe('Analytics Notifications', () => {
  const test_user = {
    email: util.makeEmail(),
    password: util.makeString(),
    name: util.makeString(),
  };
  const secureKey = '1227d1c4-1385-4d5f-ae73-23e99f74b006';
  const app_name = util.makeString();
  const invitedEmail = util.makeEmail();
  let Cookie; let id; let
    appId;

  before(function (done) {
    this.timeout(0);
    let emailVerificationCode;
    request
      .post('/user/signup')
      .send(test_user)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
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


  // 'post /:appId/notifications/over80'
  it('should send notifications when 80% usage', (done) => {
    request
      .post(`/${appId}/notifications/over80`)
      .send({ secureKey })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('success');
        done();
      });
  });

  // 'post /:appId/notifications/over100'
  it('should send notifications when 100% usage', (done) => {
    request
      .post(`/${appId}/notifications/over100`)
      .send({ secureKey })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('success');
        done();
      });
  });
});
