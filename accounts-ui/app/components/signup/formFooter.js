import React, { Component } from 'react'
import { Link } from 'react-router'

class FormFooter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      success: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.success !== nextProps.success) {
      let { success } = nextProps
      this.setState({ success })
    }

    if (this.state.togglePaymentForm !== nextProps.togglePaymentForm) {
      let { togglePaymentForm } = nextProps
      this.setState({ togglePaymentForm })
    }
  }

  render() {
    return (
      <div className={!this.state.success ? 'loginbox twotop' : 'hide'}>
        <div>
          <h5 className="tacenter bfont fs13">By creating an account, you agree with the <a href="https://cloudboost.io/terms" target="_blank" className="forgotpw">Terms and Conditions </a>.</h5>
        </div>
        <div>
          <h5 className="tacenter">Already have an account? <Link to={LOGIN_URL}><span className="forgotpw">Log in. </span></Link></h5>
        </div>
      </div>
    )
  }
}

export default FormFooter
