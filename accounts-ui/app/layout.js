import React from 'react';
import axios from 'axios'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import injectTapEventPlugin from 'react-tap-event-plugin';
import CircularProgress from 'material-ui/CircularProgress';
import cookie from 'react-cookie'
//injectTapEventPlugin();

class Layout extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: true,
      isLoading:true
    }
  }
  componentWillMount() {

    axios.defaults.withCredentials = true
    axios.get(USER_SERVICE_URL + '/user').then((res) => {
      if (res.data) {
        // user already logged in
        cookie.save('userId', res.data.user._id, {
          path: '/',
          domain: SERVER_DOMAIN
        });
        cookie.save('userFullname', res.data.user.name, {
          path: '/',
          domain: SERVER_DOMAIN
        });
        cookie.save('email', res.data.user.email, {
          path: '/',
          domain: SERVER_DOMAIN
        });
        cookie.save('createdAt', res.data.user.createdAt, {
          path: '/',
          domain: SERVER_DOMAIN
        });
        this.setState({isLoading:false})
        if (this.props.location.query.redirect_uri) {
          window.location.href = DASHBOARD_URL + "/oauthaccess?code=" + res.data.user.oauth_code + "&redirect_uri=" + this.props.location.query.redirect_uri + "&client_id=78345213";
        } else {
          window.location.href = DASHBOARD_URL;
        }
      }
    }, (err) => {
      this.setState({ isLoggedIn: false,isLoading: false })
    })
    axios.get(USER_SERVICE_URL + '/server/isNewServer').then((res) => {
      if (res.data) {
        // changes this to server root/#/newserver
        window.location.href = ACCOUNTS_URL + '/newserver'
      }
    }, (err) => {

    })
  }
  render() {
    let visibility = this.state.isLoggedIn ? 'hidden' : 'visible'

    let layout=null;
    if (!this.state.isLoading) {
      document.getElementById("initialLoader").style.display = 'none';
      layout = <div style={{ visibility: visibility }} key={this.props.location.pathname}>
        {
          React.cloneElement(this.props.children)
        }
      </div>
    }
    return (

      <MuiThemeProvider muiTheme={getMuiTheme(null, { userAgent: 'all' })}>
        <ReactCSSTransitionGroup
          transitionName="pagetransition"
          transitionEnterTimeout={300}
          transitionLeaveTimeout={300}
        >
          {layout}

        </ReactCSSTransitionGroup>
      </MuiThemeProvider>

    );
  }
}

export default Layout