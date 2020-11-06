describe('CloudBoost Server', () => {
  it('should tell whether it is a new server or not', (done) => {
    request
      .get('/server/isNewServer')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.be.oneOf(['true', 'false']);
        done();
      });
  });

  // 'get /server'
  it('should return the server settings', (done) => {
    request
      .get('/server')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        done();
      });
  });

  // 'get /server/isHosted'
  it('should return current status of hosted server', (done) => {
    request
      .get('/server/isHosted')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.be.oneOf(['true', 'false']);
        done();
      });
  });
  // 'get /status'
  it('should return current status of MongoDB & RedisDB', (done) => {
    request
      .get('/status')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('Service Status : OK');
        done();
      });
  });
});

describe('Update CloudBoost Server', () => {
  const test_user = {
    email: util.makeEmail(),
    password: util.makeString(),
    name: util.makeString(),
    isAdmin: true,
  };
  let Cookie; let id; let
    cbSettings;

  before(function (done) {
    this.timeout(0);
    request
      .post('/user/signup')
      .send(test_user)
      .end((err, res) => {
        request
          .get('/server')
          .end((err, res1) => {
            cbSettings = res1.body;
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

  // 'post /server'
  it('should update server setting', (done) => {
    request
      .post('/server')
      .set('Cookie', Cookie)
      .send({ id: cbSettings._id, allowedSignUp: true })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body._id).to.equal(cbSettings._id);
        expect(res.body.allowSignUp).to.be.true;
        done();
      });
  });

  // 'post /server/url'
  it('should update server api url', (done) => {
    const apiURL = `http://www.${util.makeString()}.com`;
    request
      .post('/server/url')
      .set('Cookie', Cookie)
      .send({ apiURL })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body._id).to.equal(cbSettings._id);
        expect(res.body.myURL).to.equal(apiURL);
        done();
      });
  });
});
