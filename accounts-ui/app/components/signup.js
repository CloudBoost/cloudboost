import React, { Component } from 'react'
import axios from 'axios'
import CircularProgress from 'material-ui/CircularProgress'
import FormHeader from './signup/formHeader';
import User from './signup/user';
import Payment from "./signup/payment";
import Company from './signup/company';
import FormFooter from './signup/formFooter';
import cookie from 'react-cookie';
import _ from 'lodash';

class Signup extends Component {
  constructor() {
    super()
    this.state = {
      planId: null,
      buyPlan: false,
      annual: false,
      toggleApp: true,
      appName: "",
      selectedPlan: "",
      errorMessage: "",
      success: false,
      progress: false,
      isUserSubmitted: false,
      togglePaymentForm: false,
      toggleCompanyForm: false,
      isCardCharged: false,
      resendEmail: false,
      userDetails: {},
      companyDetails: {},
      paymentDetails: {},
      formPage: 1
    }
  }

  componentWillMount() {
    let buyPlan = true;
    let planId = this.props.location.query.plan || 8;
    const annual =  this.props.location.query.type == 'year'

    if(this.props.location.query.invited){
      buyPlan = false
    }

    planId = parseInt(planId)

    this.setState({
      buyPlan,
      planId,
      annual
    })
  }

  componentDidMount() {
    if (__isBrowser) document.title = "CloudBoost | Sign Up"
    if (!__isDevelopment) {
      /****Tracking*********/
      mixpanel.track('Portal:Visited SignUp Page', { "Visited": "Visited Sign Up page in portal!" });
      /****End of Tracking*****/
    }
  }

  getUserDetails(userDetails) {
    this.state.isUserSubmitted = userDetails.isUserSubmitted
    this.state.userDetails = userDetails
    this.state.togglePaymentForm = userDetails.togglePaymentForm
    this.state.toggleCompanyForm = userDetails.toggleCompanyForm
    this.setState(this.state)
    this.setNextPage()
  }

  getPaymentDetails(paymentDetails) {
    this.state.paymentDetails = paymentDetails
    this.state.appName = paymentDetails.appDetails.appName
    this.state.couponCode = paymentDetails.appDetails.couponCode
    this.state.toggleApp = paymentDetails.toggleApp
    this.state.errorMessage = paymentDetails.errorMessage
    this.state.togglePaymentForm = paymentDetails.togglePaymentForm
    this.state.toggleCompanyForm = paymentDetails.toggleCompanyForm
    this.state.isCardCharged = paymentDetails.isCardCharged;
    this.state.progress = false;
    this.setState(this.state)
    this.setNextPage()
  }

  getCompanyDetails(companyDetails) {
    this.state.companyDetails = companyDetails
    this.setState(this.state)
    let SERVICE_URL = ''

    let postData = {
      name: this.state.userDetails.name,
      email: this.state.userDetails.email,
      password: this.state.userDetails.password,
      isAdmin: false
    }

    if (this.state.userDetails.isCustomDomain) {
      postData.phoneNumber = this.state.companyDetails.phone
      postData.companyName = this.state.companyDetails.companyName
      postData.companySize = this.state.companyDetails.companySize
      postData.jobRole = this.state.companyDetails.jobRole
      postData.reference = this.state.companyDetails.reference

      if (this.state.buyPlan) {
        postData.appName = this.state.appName
        postData.couponCode = this.state.couponCode
        postData.token = this.state.paymentDetails.cardDetails.token
        postData.planId = this.state.planId
        postData.annual = this.state.annual
        postData.billingAddr = {
          name: this.state.paymentDetails.cardDetails.cardName,
          addrLine1: this.state.paymentDetails.cardDetails.addrLine1,
          addrLine2: this.state.paymentDetails.cardDetails.addrLine2,
          city: this.state.paymentDetails.cardDetails.city,
          state: this.state.paymentDetails.cardDetails.state,
          zipCode: this.state.paymentDetails.cardDetails.zipCode,
          country: this.state.paymentDetails.cardDetails.country,
        }

        SERVICE_URL = USER_SERVICE_URL + '/user/register'
      } else {
        SERVICE_URL = USER_SERVICE_URL + '/user/signup'
      }
    } else {
      SERVICE_URL = USER_SERVICE_URL + '/user/signup'
    }
    this.signup(SERVICE_URL, postData)
  }

  setNextPage(){
    const { buyPlan, formPage } = this.state;
    const nextPage = buyPlan ? formPage + 1 : formPage + 2;
    this.setState({
      formPage: nextPage
    })
  }

  setProgress(which) {
    this.state.progress = which
    this.setState(this.state);
  }

  setCardProgress(which) {
    this.state.progress = true;
    this.setState(this.state);
  }

  signup(SERVICE_URL, postData) {
    this.setProgress(true);
    const stripeResponseHandler = (status, response) => {
      if (response.error) {
          this.state.errorMessage = response.error.message;
      } else {
          this.state.paymentDetails.cardDetails.token = response.id
      }
    }
    axios.post(SERVICE_URL, postData)
          .then((data) => {
            if (!__isDevelopment) {
              /****Tracking*********/
              mixpanel.alias(this.state.userDetails.email);

              if (this.state.isCustomDomain) {
                mixpanel.people.set({
                  "Name": this.state.userDetails.name,
                  "$email": this.state.userDetails.email,
                  "CompanyName": this.state.companyDetails.companyName,
                  "CompanySize": this.state.companyDetails.companySize,
                  "PhoneNumber": this.state.companyDetails.phone,
                  "JobRole": this.state.companyDetails.jobRole,
                  "reference": this.state.companyDetails.reference
                });


                mixpanel.register({
                  "Name": this.state.userDetails.name,
                  "Email": this.state.userDetails.email,
                  "CompanyName": this.state.companyDetails.companyName,
                  "CompanySize": this.state.companyDetails.companySize,
                  "PhoneNumber": this.state.companyDetails.phone,
                  "JobRole": this.state.companyDetails.jobRole,
                  "reference": this.state.companyDetails.reference
                });

                mixpanel.track('Signup', {
                  "Name": this.state.userDetails.name,
                  "Email": this.state.userDetails.email,
                  "CompanyName": this.state.companyDetails.companyName,
                  "CompanySize": this.state.companyDetails.companySize,
                  "PhoneNumber": this.state.companyDetails.phone,
                  "JobRole": this.state.companyDetails.jobRole,
                  "reference": this.state.companyDetails.reference
                });
              } else {
                mixpanel.people.set({
                  "Name": this.state.userDetails.name,
                  "$email": this.state.userDetails.email
                });
                //mixpanel.identify(data._id);

                mixpanel.register({
                  "Name": this.state.userDetails.name,
                  "Email": this.state.userDetails.email
                });

                mixpanel.track('Signup', {
                  "Name": this.state.userDetails.name,
                  "Email": this.state.userDetails.email
                });
              }
              /****End of Tracking*****/
            }

            // this.setProgress(false)
            this.state.userDetails.password = ''
            this.state.userDetails.name = ''
            this.state.toggleCompanyForm = false
            this.state.success = true;
            this.state.errorMessage = ''
            cookie.save('userId', data.data._id, { path: '/', domain: SERVER_DOMAIN });
            cookie.save('userFullname', data.data.name, { path: '/', domain: SERVER_DOMAIN });
            cookie.save('email', data.data.email, { path: '/', domain: SERVER_DOMAIN });
            cookie.save('createdAt', data.data.createdAt, { path: '/', domain: SERVER_DOMAIN });
            window.location.href = DASHBOARD_URL;
          }, (err) => {
            this.setProgress(false)
            this.state.success = false
            Stripe.createToken({
              name: this.state.paymentDetails.cardDetails.cardName,
              number: this.state.paymentDetails.cardDetails.cardNumber.replace(/\s+/, ""),
              exp_month: this.state.paymentDetails.cardDetails.expMonth,
              exp_year: this.state.paymentDetails.cardDetails.expYear,
              cvc: this.state.paymentDetails.cardDetails.cardCVV.replace(/\s+/, "")
            }, stripeResponseHandler)
            let errMsg = '';
            if (err.response == undefined) {
              // Server can't be reached
              errMsg = "Oops, we couldn't connect to the server. Please try again later."
              this.state.toggleCompanyForm = true
            } else if(err.response.status) {
              // Error caused by the server
              const serverErr = err.response.data

              if(typeof serverErr === 'object' && serverErr !== null && serverErr.hasOwnProperty('code')) {
                errMsg = 'We could not charge your card. Please confirm CVV number from your card or you may have insufficient balance.'
                this.state.isCardCharged = false
                this.state.toggleApp = false;
                this.state.togglePaymentForm = true
                this.state.toggleCompanyForm = false
              } else {
                errMsg = serverErr
                this.state.isUserSubmitted = false
                this.state.toggleCompanyForm = false
              }
            } else {
              // Unknown error
              this.state.isUserSubmitted = false
              this.state.toggleCompanyForm = false
              errMsg = "There was an error please try again later."
            }
            this.state.errorMessage = errMsg
            this.setState(this.state)
          });

    if (!__isDevelopment) {
      /****Tracking*********/
      mixpanel.track('Portal:Clicked SignUp Button', { "Clicked": "SignUp Button in portal!" });
      /****End of Tracking*****/
    }
  }

  render() {
    return (
      <div>
        <div className={this.state.progress ? 'loader' : 'hide'}>
          <CircularProgress color="#4E8EF7" size={50} thickness={6} />
        </div>
        <div id="login" className={this.state.progress ? 'hide' : ''}>
            <FormHeader errorMessage={this.state.errorMessage}
                          toggleCompanyForm={this.state.toggleCompanyForm}
                          togglePaymentForm={this.state.togglePaymentForm}
                          success={this.state.success}
                          email={this.state.userDetails.email}
                          planId={this.state.planId}
                          buyPlan={this.state.buyPlan} />

            <div id="loginbox">
              { this.state.formPage === 1 && <User buyPlan={this.state.buyPlan}
                    isUserSubmitted={this.state.isUserSubmitted}
                    isCardCharged={this.state.isCardCharged}
                    setUserDetails={this.getUserDetails.bind(this)} />
              }

              { this.state.buyPlan && this.state.formPage === 2 && 
                  <Payment setCardProgress={this.setCardProgress.bind(this)} 
                          toggleApp={this.state.toggleApp} 
                          planId={this.state.planId} 
                          annual={this.state.annual} 
                          isCardCharged={this.state.isCardCharged} 
                          togglePaymentForm={this.state.togglePaymentForm} 
                          setPaymentDetails={this.getPaymentDetails.bind(this)} />
              }

              { this.state.toggleCompanyForm && this.state.formPage === 3 &&
                  <Company setCompanyDetails={this.getCompanyDetails.bind(this)}
                        userDetails={this.state.userDetails}
                        cardDetails={this.state.cardDetails}
                        progress={this.state.progress}
                        toggleCompanyForm={this.state.toggleCompanyForm}
                        signup={this.signup} />
              }
            </div>

            <FormFooter success={this.state.success} togglePaymentForm={this.state.togglePaymentForm}/>
          </div>
      </div>
    )
  }
}

export default Signup