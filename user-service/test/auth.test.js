const chai = require('chai');

const stripeServer = 'https://api.stripe.com';

describe('Authentication', () => {
  // describe('Register', function () {
  //     var id, emailVerificationCode, Cookie, token, appId;

  //     var test_user = {
  //         name: util.makeString(),
  //         email: util.makeEmail(),
  //         password: util.makeString(),
  //         isAdmin: false,
  //         companyName: util.makeString(),
  //         companySize: '1-10',
  //         phone: '+255714061234',
  //         jobRole: util.makeString(),
  //         reference: util.makeString(),
  //         appName: util.makeString(),
  //         token: token,
  //         planId: 4,
  //         billingAddr: {
  //             name: 'John Doe',
  //             addrLine1: 'Test Street',
  //             city: 'Test City',
  //             state: 'US',
  //             zipCode: '55555',
  //             country: util.makeString(),
  //         }
  //     };

  //     var test_card = {
  //       card:{
  //         name: test_user.name,
  //         number: '4242 4242 4242 4242',
  //         cvc: 555,
  //         exp_month: 08,
  //         exp_year: 2018
  //       },
  //         key: process.env['STRIPE_PUBLISH_KEY']
  //     };

  //     after(function(done) {
  //         // Log user out
  //         request
  //             .post('/user/logout')
  //             .end(function(err, res){
  //                 done();
  //             });
  //     });

  //     it('should register a card and create a stripe token', function(done) {
  //       this.timeout(0);

  //         chai.request(stripeServer)
  //             .post('/v1/tokens')
  //             .set('content-type', 'application/x-www-form-urlencoded')
  //             .send(test_card)
  //             .end(function(err, res) {
  //                 test_user.token = res.body.id;
  //                 done();
  //             });
  //     });

  //     it('should register user with name, email, password and token', function (done) {
  //       this.timeout(80000);

  //       request.post('/user/register')
  //               .send(test_user)
  //               .end(function (err, res) {
  //                   emailVerificationCode = res.body.emailVerificationCode;
  //                   id = res.body._id;

  //                   expect(res).to.have.status(200);
  //                   expect(res.body).to.be.an('object');
  //                   expect(res.body.name).to.equal(test_user.name);
  //                   expect(res.body.email).to.equal(test_user.email);
  //                   expect(res.body.phone).to.equal(test_user.phoneNumber);
  //                   expect(res.body.companyName).to.equal(test_user.companyName);
  //                   expect(res.body.companySize).to.equal(test_user.companySize);
  //                   done();
  //               });

  //     });

  //     it('should activate a user when registered', function (done) {
  //         this.timeout(8000);
  //         request.post('/user/activate').send({ code: 'NhVnopXb' }).end(function (err, res) {
  //             expect(res).to.have.status(200);
  //             expect(res.body.emailVerified).to.be.true;
  //             done();
  //         });
  //     });

  //     it('should login registered user', function(done) {
  //         this.timeout(10000);
  //       //login and set cookies
  //       request
  //           .post('/user/signin')
  //           .send({email: test_user.email, password: test_user.password})
  //           .end(function(err, res) {
  //             Cookie = res.headers['set-cookie'].pop().split(';')[0];
  //             id = res.body._id;

  //             expect(res.body).to.be.an('object');
  //             expect(res.body.email).to.equal(test_user.email);
  //             expect(Cookie).to.be.a('string');
  //             done();
  //           });
  //     });

  //     it('should create an app when user registered successfully', function(done) {
  //       this.timeout(8000);

  //       request.post('/app')
  //               .set('Cookie', Cookie)
  //               .send({ email: test_user.email, password: test_user.password })
  //               .end(function(err, res) {
  //                 appId = res.body[0].appId;

  //                 expect(res).to.have.status(200);
  //                 expect(res.body).to.be.an('array');
  //                 expect(res.body[0].name).to.equal(test_user.appName);
  //                 done();
  //               });
  //     });

  //     it('should create a customer when sales made successfully', function(done) {
  //       this.timeout(8000);

  //       request.get('/' + appId + '/customer')
  //               .send({userId: id})
  //               .end(function(err, res) {
  //                 expect(res).to.have.status(200);
  //                 expect(res.body).to.be.an('object');
  //                 expect(res.body.email).to.equal(test_user.email);
  //                 done();
  //               });
  //     });


  //     it('should fail to register if incomplete data is provided.', function (done) {
  //         this.timeout(10000);
  //         var test_user2 = {
  //             name: null,
  //             email: util.makeEmail(),
  //             password: null,
  //             appName: util.makeString(),
  //             token: util.makeString(),
  //             planId: 2,
  //             annual: true,
  //         };

  //         request.post('/user/register').send(test_user2).end(function (err, res) {
  //             expect(res).to.have.status(400);
  //             done();
  //         });
  //     });
  // });

  describe('Sign Up', () => {
    // 'post /user/signup'
    it('should register with name, email, password', (done) => {
      const test_user = {
        email: util.makeEmail(),
        password: util.makeString(),
        name: util.makeString(),
      };
      request.post('/user/signup').send(test_user).end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.email).to.equal(test_user.email);
        expect(res.body.name).to.equal(test_user.name);
        done();
      });
    });

    it('should not register when name, email or password is null', (done) => {
      const test_user = {
        email: null,
        password: util.makeString(),
        name: util.makeString(),
      };
      request.post('/user/signup').send(test_user).end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
    });

    it('should not register with same email', (done) => {
      const test_user = {
        email: util.makeEmail(),
        password: util.makeString(),
        name: util.makeString(),
      };
      request.post('/user/signup').send(test_user).end((err, res) => {
        request.post('/user/signup').send(test_user).end((err, res) => {
          expect(res).to.have.status(500);
          done();
        });
      });
    });

    it('should not register with an invalid email', (done) => {
      const test_user = {
        email: `(${util.makeEmail()})`,
        password: util.makeString(),
        name: util.makeString(),
      };
      request.post('/user/signup').send(test_user).end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
    });

    // post '/user/activate'
    it('should fail to activate the registered email with a invalid code', (done) => {
      const emailVerificationCode = util.generateRandomString();
      const test_user = {
        email: util.makeEmail(),
        password: util.makeString(),
        name: util.makeString(),
      };
      request.post('/user/signup').send(test_user).end((err, res) => {
        request.post('/user/activate').send({ code: emailVerificationCode }).end((err, res) => {
          expect(res).to.have.status(500);
          done();
        });
      });
    });

    it('should activate the registered email with a valid code', (done) => {
      let emailVerificationCode;
      const test_user = {
        email: util.makeEmail(),
        password: util.makeString(),
        name: util.makeString(),
      };
      request.post('/user/signup').send(test_user).end((err, res) => {
        emailVerificationCode = res.body.emailVerificationCode;
        request.post('/user/activate').send({ code: emailVerificationCode }).end((err, res1) => {
          expect(res1).to.have.status(200);
          expect(res1.body).to.be.an('object');
          expect(res1.body.emailVerificationCode).to.equal(emailVerificationCode);
          done();
        });
      });
    });

    // post '/user/resendverification'
    it('should send verification mail when emailid is valid', (done) => {
      const test_user = {
        email: util.makeEmail(),
        password: util.makeString(),
        name: util.makeString(),
      };
      request.post('/user/signup').send(test_user).end((err, res) => {
        request.post('/user/resendverification').send({ email: test_user.email }).end((err, res1) => {
          expect(res1).to.have.status(200);
          done();
        });
      });
    });

    it('should not send verification mail when emailid is invalid', (done) => {
      const test_user = {
        email: `(${util.makeEmail()})`,
        password: util.makeString(),
        name: util.makeString(),
      };
      request.post('/user/signup').send(test_user).end((err, res) => {
        request.post('/user/resendverification').send({ email: test_user.email }).end((err, res1) => {
          expect(res1).to.have.status(500);
          done();
        });
      });
    });
  });

  describe('Reset Password', () => {
    let verificationCode;
    const test_user = {
      email: util.makeEmail(),
      password: util.makeString(),
      name: util.makeString(),
    };

    before((done) => {
      request.post('/user/signup').send(test_user).end((err, res) => {
        done();
      });
    });

    // post '/user/ResetPassword'
    it('should not accept reset password request when emailid is invalid', (done) => {
      request.post('/user/ResetPassword').send({
        email: `(${test_user.email})`,
      }).end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
    });

    it('should accept reset password request when emailid is valid', (done) => {
      request.post('/user/ResetPassword').send({ email: test_user.email }).end((err, res) => {
        expect(res).to.have.status(200);
        verificationCode = res.body.emailVerificationCode;
        done();
      });
    });

    // post '/user/updatePassword'
    it('should not reset password if verification code is invalid', (done) => {
      const data = {
        password: util.makeString(),
        code: util.generateRandomString(),
      };
      request.post('/user/updatePassword').send(data).end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
    });

    it('should reset password if verification code is valid', (done) => {
      const data = {
        password: util.makeString(),
        code: verificationCode,
      };
      request.post('/user/updatePassword').send(data).end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.equal('You have changed password successfully!');
        done();
      });
    });
  });

  describe('Login', () => {
    const test_user = {
      email: util.makeEmail(),
      password: util.makeString(),
      name: util.makeString(),
    };

    before((done) => {
      let emailVerificationCode;
      request.post('/user/signup').send(test_user).end((err, res) => {
        emailVerificationCode = res.body.emailVerificationCode;
        request.post('/user/activate').send({ code: emailVerificationCode }).end((err, res1) => {
          done();
        });
      });
    });

    // post '/user/signin'
    it('should not allow to login with invalid credentials', (done) => {
      request.post('/user/signin').send({ email: util.makeEmail(), password: util.makeString() }).end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
    });

    it('should allow to login with valid credentials', (done) => {
      request.post('/user/signin').send({ email: test_user.email, password: test_user.password }).end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.email).to.equal(test_user.email);
        done();
      });
    });

    it('should get access_token when code is provided', (done) => {
      request.post('/user/signin').send({ email: test_user.email, password: test_user.password }).end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.email).to.equal(test_user.email);
        request.post(`/oauth/token?code=${res.body.oauth_code}`).send({ code: res.body.oauth_code }).end((err, resp) => {
          expect(resp).to.have.status(200);
          expect(resp.body.oauth_code);
          done();
        });
      });
    });

    it('should not get access_token when code is not provided', (done) => {
      request.post('/user/signin').send({ email: test_user.email, password: test_user.password }).end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.email).to.equal(test_user.email);
        request.post('/oauth/token').send({}).end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
      });
    });

    it('should not get access_token when code is empty', (done) => {
      request.post('/user/signin').send({ email: test_user.email, password: test_user.password }).end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.email).to.equal(test_user.email);
        request.post('/oauth/token?code=').send({ code: '' }).end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
      });
    });
  });

  describe('User', () => {
    const test_user = {
      email: util.makeEmail(),
      password: util.makeString(),
      name: util.makeString(),
    };

    let Cookie;


    let id;

    before(function (done) {
      this.timeout(0);
      let emailVerificationCode;
      request.post('/user/signup').send(test_user).end((err, res) => {
        emailVerificationCode = res.body.emailVerificationCode;
        request.post('/user/activate').send({ code: emailVerificationCode }).end((err, res1) => {
          request.post('/user/signin').send({ email: test_user.email, password: test_user.password }).end((err, res2) => {
            Cookie = res2.headers['set-cookie'].pop().split(';')[0];
            id = res2.body._id;
            done();
          });
        });
      });
    });

    after((done) => {
      request.post('/user/logout').end((err, res) => {
        done();
      });
    });

    // get '/user'
    it('should return the current loggedin user details', (done) => {
      request.get('/user').set('Cookie', Cookie).end((err, res) => {
        const body = res.body;
        expect(res).to.have.status(200);
        expect(body.user.email).to.equal(test_user.email);
        done();
      });
    });

    // post '/user/list'
    it('should return a list of user by ids', (done) => {
      request.post('/user/list').set('Cookie', Cookie).send({ IdArray: [id] }).end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
    });

    // post '/user/list/bykeyword'
    it('should not return a list of user by keyword', (done) => {
      request.post('/user/list/bykeyword').set('Cookie', Cookie).send({ keyword: util.makeEmail() }).end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.null;
        done();
      });
    });

    it('should return a list of user by keyword', (done) => {
      request.post('/user/list/bykeyword').set('Cookie', Cookie).send({ keyword: test_user.email }).end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body[0].email).to.equal(test_user.email);
        done();
      });
    });

    // put '/user/list/:skip/:limit'
    it('should return a list of user within skip and limit', (done) => {
      const limit = Math.floor(Math.random() * 10 + 15);
      request.put(`/user/list/0/${limit}`).set('Cookie', Cookie).send({ skipUserIds: [] }).end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.length.within(0, limit);
        done();
      });
    });

    it('should return a list of user skipping some userIds', (done) => {
      request.put('/user/list/0/0').set('Cookie', Cookie).send({ skipUserIds: [id] }).end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.not.include({ _id: id });
        done();
      });
    });
  });

  describe('User details update', () => {
    const test_user = {
      email: util.makeEmail(),
      password: util.makeString(),
      name: util.makeString(),
    };
    const newPassword = util.makeString();
    const newName = util.makeString();
    let Cookie;


    let id;

    before(function (done) {
      this.timeout(0);
      let emailVerificationCode;
      request.post('/user/signup').send(test_user).end((err, res) => {
        emailVerificationCode = res.body.emailVerificationCode;
        request.post('/user/activate').send({ code: emailVerificationCode }).end((err, res1) => {
          request.post('/user/signin').send({ email: test_user.email, password: test_user.password }).end((err, res2) => {
            Cookie = res2.headers['set-cookie'].pop().split(';')[0];
            id = res2.body._id;
            done();
          });
        });
      });
    });

    after((done) => {
      request.post('/user/logout').end((err, res) => {
        done();
      });
    });

    // post '/user/update'
    it('should change user password', (done) => {
      const data = {
        name: null,
        oldPassword: test_user.password,
        newPassword,
      };
      request.post('/user/update').set('Cookie', Cookie).send(data).end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.email).to.equal(test_user.email);
        expect(res.body.name).to.equal(test_user.name);
        done();
      });
    });

    it('should change user\'s name', (done) => {
      const data = {
        name: newName,
        oldPassword: null,
        newPassword: null,
      };
      request.post('/user/update').set('Cookie', Cookie).send(data).end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.name).to.equal(newName);
        done();
      });
    });

    it('should change both user\'s name and password', (done) => {
      const data = {
        name: util.makeString(),
        oldPassword: newPassword,
        newPassword: util.makeString(),
      };
      request.post('/user/update').set('Cookie', Cookie).send(data).end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.name).to.equal(data.name);
        done();
      });
    });
  });

  describe('User Activation', () => {
    let otherUserId;
    const other_user = {
      email: util.makeEmail(),
      password: util.makeString(),
      name: util.makeString(),
    };

    before(function (done) {
      this.timeout(0);
      request.post('/user/signup').send(other_user).end((err, res) => {
        const newEmailVerificationCode = res.body.emailVerificationCode;
        request.post('/user/activate').send({ code: newEmailVerificationCode }).end((err, res1) => {
          otherUserId = res1.body._id;
          done();
        });
      });
    });

    afterEach(function (done) {
      this.timeout(0);
      request.post('/user/logout').end((err, res) => {
        done();
      });
    });

    it('does not activate/deactivate the other user when the user is not an admin', function (done) {
      this.timeout(3000);
      let emailVerificationCode;
      const test_user = {
        email: util.makeEmail(),
        password: util.makeString(),
        name: util.makeString(),
      };
      request.post('/user/signup').send(test_user).end((err, res) => {
        emailVerificationCode = res.body.emailVerificationCode;
        request.post('/user/activate').send({ code: emailVerificationCode }).end((err, res1) => {
          request.post('/user/signin').send({ email: test_user.email, password: test_user.password }).end((err, res2) => {
            const Cookie = res2.headers['set-cookie'].pop().split(';')[0];
            const id = res2.body._id;
            request.get(`/user/active/${otherUserId}/${false}`).set('Cookie', Cookie).end((err, res3) => {
              expect(res3).to.have.status(500);
              expect(res3.text).to.equal('You can\'t perform this action!');
              done();
            });
          });
        });
      });
    });

    it('should activate/deactivate other user when the user is an admin', function (done) {
      this.timeout(3000);
      const admin_user = {
        email: util.makeEmail(),
        password: util.makeString(),
        name: util.makeString(),
        isAdmin: true,
      };
      request.post('/user/signup').send(admin_user).end((err, res) => {
        emailVerificationCode = res.body.emailVerificationCode;
        request.post('/user/signin').send({ email: admin_user.email, password: admin_user.password }).end((err, res1) => {
          const adminCookie = res1.headers['set-cookie'].pop().split(';')[0];
          const id = res1.body._id;
          request.get(`/user/active/${otherUserId}/${false}`).set('Cookie', adminCookie).end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.email).to.equal(other_user.email);
            expect(res.body.isActive).to.be.false;
            done();
          });
        });
      });
    });
  });

  describe('User Role', () => {
    let otherUserId;
    const other_user = {
      email: util.makeEmail(),
      password: util.makeString(),
      name: util.makeString(),
    };

    before(function (done) {
      this.timeout(0);
      request.post('/user/signup').send(other_user).end((err, res) => {
        const newEmailVerificationCode = res.body.emailVerificationCode;
        request.post('/user/activate').send({ code: newEmailVerificationCode }).end((err, res1) => {
          otherUserId = res1.body._id;
          done();
        });
      });
    });

    afterEach(function (done) {
      this.timeout(0);
      request.post('/user/logout').end((err, res) => {
        done();
      });
    });

    it('does not change the other users role when the user is not an admin', function (done) {
      this.timeout(3000);
      let emailVerificationCode;
      const test_user = {
        email: util.makeEmail(),
        password: util.makeString(),
        name: util.makeString(),
      };
      request.post('/user/signup').send(test_user).end((err, res) => {
        const emailVerificationCode = res.body.emailVerificationCode;
        request.post('/user/activate').send({ code: emailVerificationCode }).end((err, res1) => {
          request.post('/user/signin').send({ email: test_user.email, password: test_user.password }).end((err, res2) => {
            const Cookie = res2.headers['set-cookie'].pop().split(';')[0];
            const id = res2.body._id;
            request.get(`/user/changerole/${otherUserId}/${true}`).set('Cookie', Cookie).end((err, res3) => {
              expect(res3).to.have.status(500);
              expect(res3.text).to.equal('You can\'t perform this action!');
              done();
            });
          });
        });
      });
    });

    it('should change the other users role when the user is an admin', function (done) {
      this.timeout(3000);
      const admin_user = {
        email: util.makeEmail(),
        password: util.makeString(),
        name: util.makeString(),
        isAdmin: true,
      };
      request.post('/user/signup').send(admin_user).end((err, res) => {
        request.post('/user/signin').send({ email: admin_user.email, password: admin_user.password }).end((err, res1) => {
          const adminCookie = res1.headers['set-cookie'].pop().split(';')[0];
          const id = res1.body._id;
          request.get(`/user/changerole/${otherUserId}/${true}`).set('Cookie', adminCookie).end((err, res2) => {
            expect(res2).to.have.status(200);
            expect(res2.body.email).to.equal(other_user.email);
            done();
          });
        });
      });
    });
  });

  describe('Get admin User', () => {
    let otherUserId;
    const other_user = {
      email: util.makeEmail(),
      password: util.makeString(),
      name: util.makeString(),
    };

    before(function (done) {
      this.timeout(0);
      request.post('/user/signup').send(other_user).end((err, res) => {
        const newEmailVerificationCode = res.body.emailVerificationCode;
        request.post('/user/activate').send({ code: newEmailVerificationCode }).end((err, res1) => {
          otherUserId = res1.body._id;
          done();
        });
      });
    });

    afterEach(function (done) {
      this.timeout(0);
      request.post('/user/logout').end((err, res) => {
        done();
      });
    });

    it('should not return user list by email if the searching user is not admin', function (done) {
      this.timeout(3000);
      let emailVerificationCode;
      const test_user = {
        email: util.makeEmail(),
        password: util.makeString(),
        name: util.makeString(),
      };
      request.post('/user/signup').send(test_user).end((err, res) => {
        const emailVerificationCode = res.body.emailVerificationCode;
        request.post('/user/activate').send({ code: emailVerificationCode }).end((err, res1) => {
          request.post('/user/signin').send({ email: test_user.email, password: test_user.password }).end((err, res2) => {
            const Cookie = res2.headers['set-cookie'].pop().split(';')[0];
            const id = res2.body._id;
            request.post('/user/byadmin').set('Cookie', Cookie).send({ email: other_user.email }).end((err, res3) => {
              expect(res3).to.have.status(500);
              expect(res3.text).to.equal('You can\'t perform this action!');
              done();
            });
          });
        });
      });
    });

    it('should return user list by email if the searching user is an admin', function (done) {
      this.timeout(3000);
      const admin_user = {
        email: util.makeEmail(),
        password: util.makeString(),
        name: util.makeString(),
        isAdmin: true,
      };
      request.post('/user/signup').send(admin_user).end((err, res) => {
        request.post('/user/signin').send({ email: admin_user.email, password: admin_user.password }).end((err, res1) => {
          const adminCookie = res1.headers['set-cookie'].pop().split(';')[0];
          const id = res1.body._id;
          request.post('/user/byadmin').set('Cookie', adminCookie).send({ email: other_user.email }).end((err, res2) => {
            expect(res2).to.have.status(200);
            expect(res2.body.email).to.equal(other_user.email);
            done();
          });
        });
      });
    });
  });
});
