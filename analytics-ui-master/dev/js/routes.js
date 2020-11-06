import React from 'react';
import {Provider} from 'react-redux';
import {Router, browserHistory} from "react-router";
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import createLogger from 'redux-logger';

// custom configs impprts
import reducers from './reducers';
import routesConfig from './routesConfig';

class Routes extends React.Component {
    constructor(props) {
        super(props)
    }
    componentWillMount() {}
    getStoreProvider() {
        const logger = createLogger();
        return createStore(reducers, applyMiddleware(thunk, promise, logger));
    }
    render() {
        return (
            <Provider store={this.getStoreProvider()}>
                <Router history={browserHistory}>
                    {routesConfig}
                </Router>
            </Provider>
        );
    }
}

export default Routes;
