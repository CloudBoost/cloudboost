describe('Subscriber', () => {
  let email = `(${util.makeEmail()})`;
  // post '/subscribe'
  it('should not add a subscriber if emailid is invalid', (done) => {
    request
      .post('/subscribe')
      .send({ email })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.text).to.equal('Emailid invalid..');
        done();
      });
  });

  it('should add email to subscriber list', (done) => {
    email = util.makeEmail();
    request
      .post('/subscribe')
      .send({ email })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.equal(email);
        done();
      });
  });

  it('should not add a subscriber if already present', (done) => {
    request
      .post('/subscribe')
      .send({ email })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.text).to.equal('Already Subscribed');
        done();
      });
  });
});
