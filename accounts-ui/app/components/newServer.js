import React from 'react';
import { Link } from 'react-router'
import axios from 'axios'
import cookie from 'react-cookie'
import CircularProgress from 'material-ui/CircularProgress'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import DOMAIN_LIST from './domains'

class NewServer extends React.Component {
  constructor() {
    super()
    this.state = {
      errorMessage: '',
      name: '',
      email: '',
      password: '',
      progress: false,
      isCustomDomain: false,
      companyName: '',
      companySize: '1-10',
      phoneNumber: '',
      reference: '',
      jobRole: 'executive',
    }
  }
  componentWillMount() {
    if (__isBrowser) document.title = "CloudBoost | New Server"
    axios.get(USER_SERVICE_URL + '/server/isNewServer').then((res) => {
      if (!res.data) {
        window.location.href = '/#/login'
      }
    });
  }
  signUp(e) {
    if (e.preventDefault) {
      e.preventDefault()
    }

    this.setProgress(true)
    let postData = { email: this.state.email, password: this.state.password, name: this.state.name, isAdmin: true }
    axios.post(USER_SERVICE_URL + "/user/signup", postData).then(function (data) {

      //moxpanel track
      let payload = { "Name": this.state.name,"Email": this.state.email,"CompanyName": this.state.companyName,"CompanySize": this.state.companySize,"PhoneNumber": this.state.phoneNumber,"JobRole": this.state.jobRole,"reference":this.state.reference}
      mixpanel.track('NEW SERVER', payload);

      // post to slack webhook , make chages here for updating webhook
      axios({
          url:"https://hooks.slack.com/services/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",
          method: 'post',
          withCredentials: false,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          data:{
              text:JSON.stringify(payload).replace("{","").replace("}","").replace(",","\n").replace(",","\n").replace(",","\n").replace(",","\n").replace(",","\n").replace(",","\n").replace(",","\n")
          }
      })

      // set cookies for login
      cookie.save('userId', data.data._id, { path: '/', domain: SERVER_DOMAIN });
      cookie.save('userFullname', data.data.name, { path: '/', domain: SERVER_DOMAIN });
      cookie.save('email', data.data.email, { path: '/', domain: SERVER_DOMAIN });
      cookie.save('createdAt', data.data.createdAt, { path: '/', domain: SERVER_DOMAIN });
      window.location.href = DASHBOARD_URL;
    }.bind(this), function (err) {
      this.setProgress(false)
      this.state.isCustomDomain = false;
      this.state.email = '';
      this.state['errorMessage'] = 'User with same credentials exists, Please try again.'
      if (err.response == undefined) {
        this.state['errorMessage'] = "Sorry, we currently cannot process your request, please try again later."
      }
      this.setState(this.state)
    }.bind(this))
  }
  validateEmail(e) {
    e.preventDefault()
    let domain = this.state.email.replace(/.*@/, "")
    let isCustomDomain = DOMAIN_LIST.indexOf(domain) === -1
    if (isCustomDomain) {
      this.setState({ isCustomDomain: isCustomDomain })
    } else this.signUp(e)
  }
  changeHandler(which, e) {
    this.state[which] = e.target.value
    this.setState(this.state)
  }
  setProgress(which) {
    this.state.progress = which
    this.setState(this.state)
  }
  render() {
    document.getElementById("initialLoader").style.display = 'none';
    return (
      <MuiThemeProvider>
        <div>
          <div className={this.state.progress ? 'loader' : 'hide'}>
            <CircularProgress color="#4E8EF7" size={50} thickness={6} />
          </div>
          <div id="login" className={!this.state.progress ? '' : 'hide'}>
            <div id="image">
              <img className="logo" src="public/assets/images/CbLogoIcon.png" />
            </div>
            <div id="headLine">
              <h3 className="tacenter hfont">Setup your CloudBoost Server.</h3>
            </div>
            <div id="box">
              <h5 className={!this.state.isCustomDomain ? 'tacenter bfont' : 'hide'}>Create an admin account to get started.</h5>
              <h5 className={this.state.isCustomDomain ? 'tacenter bfont' : 'hide'}>One last step.</h5>
            </div>
            <div className="loginbox">
              <h5 className="tacenter red">{this.state.errorMessage}</h5>
              <form onSubmit={this.validateEmail.bind(this)} className={!this.state.isCustomDomain ? '' : 'hide'}>
                <input type="text" value={this.state.name} onChange={this.changeHandler.bind(this, 'name')} className="loginInput from-control" placeholder="Full Name" required />
                <input type="email" value={this.state.email} onChange={this.changeHandler.bind(this, 'email')} className="loginInput from-control" placeholder="Email" required />
                <input type="password" value={this.state.password} onChange={this.changeHandler.bind(this, 'password')} className="loginInput from-control" placeholder="Password" required />
                <button className="loginbtn" type="submit"> Setup Server</button>
              </form>
              <form onSubmit={this.signUp.bind(this)} className={this.state.isCustomDomain ? '' : 'hide'}>
                <input type="text" value={this.state.companyName} onChange={this.changeHandler.bind(this, 'companyName')} className="loginInput from-control" placeholder="Company Name" required />
                <input type="text" value={this.state.phoneNumber} onChange={this.changeHandler.bind(this, 'phoneNumber')} className="loginInput from-control" placeholder="Phone Number" required />
                <select className="companysize" required value={this.state.companySize} onChange={this.changeHandler.bind(this, 'companySize')}>
                  <option value="1-10">Company Size - 1-10</option>
                  <option value="11-50">Company Size - 11-50</option>
                  <option value="50-200">Company Size - 50-200</option>
                  <option value="200-1000">Company Size - 200-1000</option>
                  <option value="1000+">Company Size - 1000+</option>
                </select>
                <select className="companysize" required value={this.state.jobRole} onChange={this.changeHandler.bind(this, 'jobRole')}>
                  <option value="executive">Job Role - Executive</option>
                  <option value="vp">Job Role - VP</option>
                  <option value="projectManager">Job Role - Project Manager</option>
                  <option value="developer">Job Role - Developer</option>
                </select>
                <input type="text" value={this.state.reference} onChange={this.changeHandler.bind(this, 'reference')} className="loginInput from-control" placeholder="How did you hear about us ?" required />
                <button className="loginbtn" type="submit"> Finish Setup </button>
              </form>
            </div>
            <div className="loginbox twotop">
              <h5 className="tacenter bfont fs13">By creating an account, you agree with the <a href="https://cloudboost.io/terms" target="_blank" className="forgotpw">Terms and Conditions </a>.</h5>
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default NewServer;