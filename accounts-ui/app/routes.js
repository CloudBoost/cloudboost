import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import React from 'react';

//components
import Login from './components/login.js';
import Signup from './components/signup.js';
import Reset from './components/reset.js';
import ChangePassword from './components/changePassword.js';
import NewServer from './components/newServer.js';
import AppReActivate from './components/appReActivate.js';
import Layout from './layout.js';
import NotFound from './NotFound.js';



if (__isBrowser) {
    window.LOGIN_URL = '/login'
    window.SIGNUP_URL = '/signup'
    window.RESET_URL = '/reset'
} else {
    global.LOGIN_URL = '/login'
    global.SIGNUP_URL = '/signup'
    global.RESET_URL = '/reset'
}


const routes = (
    <Route>
        <Route path="/" component={Layout}>
            <IndexRoute component={Login} />
            <Route path="login" component={Login} />
            <Route path="reset" component={Reset} />
            <Route path="signup" component={Signup} />
            <Route path="changepassword" component={ChangePassword} />
            <Route path="reactivate/:appId" component={AppReActivate} />
        </Route>
        <Route path="/newserver" component={NewServer}></Route>
        <Route path="*" component={NotFound}></Route>
    </Route>
)

export default routes
