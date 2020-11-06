import React, { Component } from 'react'
import DOMAIN_LIST from '../domains'

class User extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: "",
      email: "",
      password: "",
      isCustomDomain: false,
      isUserSubmitted: false,
      isCardCharged: false,
      togglePaymentForm: false,
      toggleCompanyForm: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.isUserSubmitted !== nextProps.isUserSubmitted) {
      this.setState({isUserSubmitted: nextProps.isUserSubmitted})
    }

    if (this.state.isCardCharged !== nextProps.isCardCharged) {
      this.setState({isCardCharged: nextProps.isCardCharged})
    }
  }

  changeHandler(which, e) {
    this.state[which] = e.target.value
    this.setState(this.state);
  }

  validateEmail(e) {
    e.preventDefault();    
    
    let domain = this.state.email.replace(/.*@/, "")
    // let isCustomDomain = DOMAIN_LIST.indexOf(domain) === -1
    let isCustomDomain = true // add company details for all Email ids.

    if (isCustomDomain) {
      this.state.isCustomDomain = isCustomDomain

      // Show payment form if buy plan chosen, and card is not charged
      if (this.props.buyPlan && !this.state.isCardCharged) {
        this.state.togglePaymentForm = true
        this.state.toggleCompanyForm = false
      } else {
        this.state.togglePaymentForm = false
        this.state.toggleCompanyForm = true
      }
    }
    
    this.state.isUserSubmitted = true
    this.setState(this.state)
    this.props.setUserDetails(this.state)
  }

  render() {
    return (
      <div>
        <form onSubmit={this.validateEmail.bind(this)} className={this.state.isUserSubmitted ? 'hide' : ''}>
          <input type="text" 
                value={this.state.name} 
                onChange={this.changeHandler.bind(this, 'name')} 
                className="loginInput from-control" 
                id="SignupName"
                placeholder="Full Name" required/>

          <input  type="email" 
                  value={this.state.email} 
                  onChange={this.changeHandler.bind(this, 'email')} 
                  className="loginInput from-control" 
                  id="SignupEmail"
                  placeholder="Email" required />

          <input  type="password" 
                  value={this.state.password} 
                  onChange={this.changeHandler.bind(this, 'password')} 
                  className="loginInput from-control" 
                  id="SignupPassword"
                  placeholder="Password" required />

          <button className="loginbtn" 
                  id="SignupBtn"
                  type="submit"> Sign up for CloudBoost 
          </button>
        </form>
      </div>
    )
  }
}

export default User
