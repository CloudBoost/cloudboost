import React from 'react';
import {Link} from 'react-router'
import axios from 'axios'
import CircularProgress from 'material-ui/CircularProgress'

class Reset extends React.Component {
    constructor() {
        super()
        this.state = {
            errorMessage: '',
            email: '',
            success: false,
            progress: false
        }
    }
    componentDidMount() {
        if(__isBrowser) document.title = "CloudBoost | Forgot Password"
        if (!__isDevelopment) {
            /****Tracking*********/
            mixpanel.track('Portal:Visited ForgotPassword Page', {"Visited": "Visited ForgotPassword page in portal!"});
            /****End of Tracking*****/
        }
    }
    reset(e) {
        e.preventDefault()
        this.setProgress(true)
        let postData = {
            email: this.state.email
        }
        axios.post(USER_SERVICE_URL + "/user/ResetPassword", postData).then(function(data) {
            this.setProgress(false)
            this.state.email = ''
            this.state.success = true;
            this.state['errorMessage'] = ''
            this.setState(this.state)
        }.bind(this), function(err) {
            this.setProgress(false)
            this.state['errorMessage'] = 'We dont have an account with this email. Please try again.'
            if (err.response == undefined) {
                this.state['errorMessage'] = "Sorry, we currently cannot process your request, please try again later."
            }
            this.state.email = ''
            this.setState(this.state)
        }.bind(this))
        if (!__isDevelopment) {
            /****Tracking*********/
            mixpanel.track('Portal:Clicked ResetPassword Button', {"Clicked": "ResetPassword Button in portal!"});
            /****End of Tracking*****/
        }
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
        return (
            <div>
                <div className={this.state.progress
                    ? 'loader'
                    : 'hide'}>
                    <CircularProgress color="#4E8EF7" size={50} thickness={6}/>
                </div>
                <div id="login" className={!this.state.progress
                    ? ''
                    : 'hide'}>
                    <div id="image">
                        <img className="logo" src="public/assets/images/CbLogoIcon.png"/>
                    </div>
                    <div id="headLine" className={!this.state.success
                        ? ''
                        : 'hide'}>
                        <h3 className="tacenter hfont">Reset your password.</h3>
                    </div>
                    <div id="box" className={!this.state.success
                        ? ''
                        : 'hide'}>
                        <h5 className="tacenter bfont">Enter your email and we'll reset the password for you.</h5>
                    </div>
                    <div id="headLine" className={this.state.success
                        ? ''
                        : 'hide'}>
                        <h3 className="tacenter hfont">Reset password email sent.</h3>
                    </div>
                    <div id="box" className={this.state.success
                        ? ''
                        : 'hide'}>
                        <h5 className="tacenter bfont">We've sent you reset password email. Please make sure you check spam.</h5>
                    </div>
                    <div className={!this.state.success
                        ? 'loginbox'
                        : 'hide'}>
                        <h5 className="tacenter red">{this.state.errorMessage}</h5>
                        <form onSubmit={this.reset.bind(this)}>
                            <input type="email" value={this.state.email} onChange={this.changeHandler.bind(this, 'email')} className="loginInput from-control" placeholder="Your Email." disabled={this.state.successReset} required/>
                            <button className="loginbtn" type="submit">
                                Reset Password
                            </button>
                        </form>
                        <Link to={ LOGIN_URL }>
                            <span className="forgotpw fl">Login.</span>
                        </Link>
                        <Link to={ SIGNUP_URL }>
                            <span className="forgotpw fr">
                                <span className="greydonthaveaccnt">Dont have an account? </span>
                                Sign Up.</span>
                        </Link>
                    </div>
                    <div className={this.state.success
                        ? 'loginbox'
                        : 'hide'}>
                        <h5 className="tacenter">Want to login?
                            <Link to={ LOGIN_URL }>
                                <span className="forgotpw">Log in.
                                </span>
                            </Link>
                        </h5>
                    </div>
                </div>
            </div>
        );
    }
}

export default Reset;
