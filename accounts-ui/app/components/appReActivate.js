import React from 'react';
import {Link, browserHistory} from 'react-router'
import axios from 'axios'
import CircularProgress from 'material-ui/CircularProgress'

class Reset extends React.Component {
    constructor() {
        super()
        this.state = {
            appActivated: false,
            error: false
        }
    }
    componentDidMount() {
        if(__isBrowser) document.title = "CloudBoost | Activate"
        if (!__isDevelopment) {
            /****Tracking*********/
            mixpanel.track('Portal:Visited ForgotPassword Page', {"Visited": "Visited ForgotPassword page in portal!"});
            /****End of Tracking*****/
        }
        let postData = {}
        let appId = window.location.pathname.split('/')[2];
        axios.post(USER_SERVICE_URL + "/app/active/" + appId, postData).then(function(data) {
            this.state.appActivated = true;
            this.state.appname = data.data;
            this.setState(this.state);
            setTimeout(function() {
                browserHistory.replace('/');
            }, 5000);
        }.bind(this), function(err) {
            this.state.error = true;
            this.setState(this.state);

        }.bind(this))
        if (!__isDevelopment) {
            /****Tracking*********/
            mixpanel.track('activate-app', {"app-data": appId});
            /****End of Tracking*****/
        }
    }

    render() {
        return (
            <div>

                <div id="login">
                    <div id="image">
                        <img className="logo" src="public/assets/images/CbLogoIcon.png"/>
                        <div className={this.state.appActivated || this.state.error
                            ? 'hide'
                            : ''}><CircularProgress color="#4E8EF7" size={50} thickness={6}/>
                        </div>
                    </div>
                    <div id="headLine" className={this.state.appActivated
                        ? ''
                        : 'hide'}>
                        <h3 className="tacenter hfont">Your app {this.state.appname}
                            &nbsp;is now activated.</h3>
                        <h5 className="tacenter bfont">Your app is now in active state and will NOT be deleted automatically. Please make sure you use your app regularly to avoid being marked as inactive.</h5>

                    </div>
                    <div id="headLine" className={this.state.error
                        ? ''
                        : 'hide'}>
                        <h3 className="tacenter hfont">
                            Unable to activate your app.</h3>
                        <h5 className="tacenter bfont">We’re sorry, we cannot activate your app at this time. We request you to please contact us at &nbsp;
                            <a href="mailto:support@cloudboost.io">
                                support@cloudboost.io
                            </a>
                            &nbsp;
                        </h5>

                    </div>
                </div>
            </div>
        );
    }
}

export default Reset;;
