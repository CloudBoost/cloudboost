/**
 * Created by Darkstar on 11/30/2016.
 */
'use strict';

const React = require('react');
const ReactRouter = require('react-router');
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import reduxThunk from 'redux-thunk';
import promise from 'redux-promise';
import createLogger from 'redux-logger';

import { Router, Route, IndexRoute, hashHistory, browserHistory } from "react-router";

// custom configs impprts
import reducers from './reducers';
import { xhrDashBoardClient } from './xhrClient';
import { accountsURL } from './config';

import App from './components/App';
import MainBody from './containers/mainbody';


class Routes extends React.Component {

    constructor(props) {
        super(props);
        this.state = { loaded: false, user: {} };
    }

    componentWillMount() {
        xhrDashBoardClient.get('/user')
            .then(response => this.setState({ user: response.data, loaded: true }))
            .catch(error => {
                // debugger
                console.log(error);
                window.location = accountsURL;
            });
    }

    getStoreProvider() {
        
        const middlewares = [reduxThunk, promise];

        // Only adding logger middleware in development enviroment. 
        const enviroment = window.NODE_ENV;
        
        if (enviroment === "development"){
            const logger = createLogger();
            middlewares.push(logger);
        }

        const createStoreWithMiddleware = composeWithDevTools(applyMiddleware(...middlewares))(createStore);
        return createStoreWithMiddleware(reducers, {
            user: { isLogggedIn: true, ...this.state.user }
        });
    }

    render() {


        window.FILES_BASE_URL = '/'
        

        let app = "";
        if (this.state.loaded) {
            document.getElementById("initialLoader").style.display = 'none';
            app = <Provider store={this.getStoreProvider()}>
                <div>
                    <Router history={browserHistory}>

                        <Route path={ FILES_BASE_URL } component={App}>
                            <Route path=":appId" component={MainBody} />
                            <Route path=":appId/*" component={MainBody} />
                            <IndexRoute component={MainBody} />
                        </Route>

                    </Router>
                </div>
            </Provider>
        }
        return (
            <div> {app} </div>
        );
    }
}

export default Routes;
