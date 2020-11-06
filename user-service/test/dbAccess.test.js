describe('Database Access', () => {
  const test_user = {
    email: util.makeEmail(),
    password: util.makeString(),
    name: util.makeString(),
  };
  const app_name = util.makeString();
  let Cookie; let id; let appId; let db_username; let
    db_password;

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

  // 'post /dbaccess/get/:appId'
  it('should not return the access url when no public url is present', (done) => {
    request
      .post(`/dbaccess/get/${appId}`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  // 'post /dbaccess/enable/:appId'
  it('should create a db access entry for user with valid appId', (done) => {
    request
      .post(`/dbaccess/enable/${appId}`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(200);
        const body = res.body;
        expect(body.data.user).to.have.all.keys(['username', 'password']);
        db_username = body.data.user.username;
        db_password = body.data.user.password;
        done();
      });
  });

  it('should not create a db access entry for user with invalid appId', (done) => {
    request
      .post(`/dbaccess/enable/${util.makeString()}`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

  // 'post /dbaccess/get/:appId'
  it('should not return the access url when appid is invalid', (done) => {
    request
      .post(`/dbaccess/get/${util.makeString()}`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

  it('should return the public access url when appid is valid', (done) => {
    request
      .post(`/dbaccess/get/${appId}`)
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(['data', 'url']);
        done();
      });
  });
});
