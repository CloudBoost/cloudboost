import React, { Component } from 'react'
import axios from 'axios'

class FormHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      success: false,
      resendEmail: false,
      buyPlan: false,
      selectedPlan: 'invalid',
      email: '',
      toggleCompanyForm: false,
      togglePaymentForm: false,
      errorMessage: ''
    }
  }

  componentWillMount() {

    if (this.props.planId === 1 || this.props.planId === null) {
      this.setState({selectedPlan: "free"})
    }

    if (this.props.planId == 2) {
      this.setState({selectedPlan: "launch"})
    }

    if (this.props.planId == 3) {
      this.setState({selectedPlan: "scale"})
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.success !== nextProps.success) {
      this.setState({ success: nextProps.success })
      // window.scrollTo(0, 0)
    }

    if (this.state.errorMessage !== nextProps.errorMessage) {
      this.setState({ errorMessage: nextProps.errorMessage })
      // window.scrollTo(0, 0)
    }

    if (this.state.togglePaymentForm !== nextProps.togglePaymentForm) {
      this.setState({ togglePaymentForm: nextProps.togglePaymentForm })
    }

    if (this.state.toggleCompanyForm !== nextProps.toggleCompanyForm) {
      this.setState({ toggleCompanyForm: nextProps.toggleCompanyForm })
    }

    if (this.state.email !== nextProps.email) {
      this.setState({ email: nextProps.email })
    }

    if (this.state.buyPlan !== nextProps.buyPlan) {
      this.setState({ buyPlan: nextProps.buyPlan })
    }
    
    if (this.state.planId !== nextProps.planId) {
      this.setState({ planId: nextProps.planId })
    }
  }

  resend() {
    const postData = {
      email: this.state.email
    }
    axios.post(`${USER_SERVICE_URL}/user/resendverification`, postData)
    this.setState({ resendEmail: true })
  }

  render() {
    return (
      <div>
        <div id="image">
          <img className="logo" src="public/assets/images/CbLogoIcon.png" />
        </div>
        <div id="headLine" className={this.state.success ? 'hide' : ''}>
          <h3>One account. For all of CloudBoost.</h3>
        </div>
        {/* <div id="headLine" className={this.state.success ? 'hide' : ''}>
          <h3 className={this.state.togglePaymentForm ? 'tacenter bfont' : 'hide'}>App name and payment details.</h3>
        </div> */}
        <div id="box" className={this.state.success? 'hide' : ''}>          
          <h5 className={this.state.selectedPlan === 'free' ? 'tacenter bfont' : 'hide'}>Sign up free, no card required.</h5>
        </div>       

        <div id="box" className={!this.state.success ? 'hide' : ''}>
          <h5 className={this.state.resendEmail ? "hide" : "tacenter bfont"}>We have sent you the verification email. Please make sure you check spam.</h5>
          <h5 className={this.state.resendEmail ? "tacenter bfont" : "hide"}>Verification email sent again.</h5>
          <h5 className="tacenter">
            <span className={this.state.resendEmail ? "hide" : "forgotpw"} onClick={this.resend.bind(this)} style={{ cursor: 'pointer' }}>Did not get it? Send verification email again.</span>
            <span className={this.state.resendEmail ? "forgotpw" : "hide"} onClick={this.resend.bind(this)} style={{ cursor: 'pointer' }}>Resend again?</span>
          </h5>
        </div>
        <h5 className="tacenter red">{this.state.errorMessage}</h5>
      </div>
    )
  }
}

export default FormHeader
