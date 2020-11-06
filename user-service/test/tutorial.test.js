describe('Tutorial', () => {
  // 'get /tutorial'
  it('should return a list of tutorial', (done) => {
    request
      .get('/tutorial')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.null;
        done();
      });
  });

  // 'get /tutorial/:id'
  /* it('should return with tutorial details', function(done) {
		done();
	}); */
});
