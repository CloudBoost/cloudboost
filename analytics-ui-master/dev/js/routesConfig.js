import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './components/App';
import Segmentation from './components/segmentation';
import Funnel from './components/funnel';
import LiveView from './components/liveview';
import CreateFunnel from './components/funnel/create';
import EditFunnel from './components/funnel/edit';
import PageNotFound from './components/pageNotFound/index'


if (__isHosted) {
    window.ANALYTICS_BASE_URL = '/analytics/'
} else {
    window.ANALYTICS_BASE_URL = '/'
}

export default (
    <div>
        
        <Route path={ ANALYTICS_BASE_URL + ":appId" } component={App}>
            <IndexRoute component={Segmentation} />
            <Route path='funnel' component={Funnel}></Route>
            <Route path='segmentation' component={Segmentation}></Route>
            <Route path='live' component={LiveView}></Route>
            <Route path='createFunnel' component={CreateFunnel}></Route>
            <Route path='editFunnel' component={EditFunnel}></Route>
            <Route path="*" component={PageNotFound} />
        </Route>
        <Route path={ ANALYTICS_BASE_URL } component={App} />

    </div>
);
