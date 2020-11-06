describe('Sales Lead', () => {
  const requestData = {
    firstName: util.makeString(),
    lastName: util.makeString(),
    salesEmail: util.makeEmail(),
    jobTitle: util.makeString(),
    company: util.makeString(),
    companySize: '0 - 25',
    phoneNo: '9876565131',
    selectCountry: 'India',
    interestedFor: 'Cloudboost product',
    requested: 'Demo',
    wantToSubscribe: true,
  };

  // post '/requestDemo'
  it('should not add the lead if emailid is invalid', (done) => {
    request.post('/requestDemo').send({
      firstName: util.makeString(),
      lastName: util.makeString(),
      salesEmail: `(${util.makeEmail()})`,
      jobTitle: util.makeString(),
      company: util.makeString(),
      companySize: '0 - 25',
      phoneNo: '9876565131',
      selectCountry: 'India',
      interestedFor: 'Cloudboost product',
      requested: 'Demo',
      wantToSubscribe: true,
    }).end((err, res) => {
      expect(res).to.have.status(400);
      expect(res.text).to.equal('Emailid invalid..');
      done();
    });
  });

  it('should add email to Sales list', (done) => {
    request.post('/requestDemo').send(requestData).end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.text).to.equal('Demo successfully requested');
      done();
    });
  });

  it('should not add a subscriber if already present', (done) => {
    request.post('/requestDemo').send(requestData).end((err, res) => {
      expect(res).to.have.status(400);
      expect(res.text).to.equal('Already Requested');
      done();
    });
  });
});
