/**
 * Created by Darkstar on 11/30/2016.
 */

import React from 'react';
import { Route, IndexRoute } from 'react-router';

// custom comps
import App from './components/app';
import AppSelected from './components/appSelected';
import Dashboardproject from './components/dashboardproject/dashboardproject';
import TablesPage from './components/tables/tablesPage';
import Profile from './components/profile/profile';
import Payment from './components/profile/payment';
import Settings from './components/settings/settings';
import Admin from './components/admin/admin';
import PageNotFound from './components/pageNotFound/index';
import OAuth from './components/settings/oauth';
import FilesPage from './components/files-ui/filesPage';
import FilesBody from './components/files-ui/mainbody';

window.DASHBOARD_BASE_URL = '/';

export default (
  <Route path={'/'} component={App}>
    <IndexRoute component={Dashboardproject} />
    <Route path='admin' component={Admin} />
    <Route path='oauthaccess' component={OAuth} />
    <Route path='profile' component={Profile} />
    <Route path='payment' component={Payment} />
    <Route path=':appId' component={AppSelected}>
      <IndexRoute component={TablesPage} />
      <Route path='tables' component={TablesPage} />
      <Route path='files' component={FilesPage} >
        <IndexRoute component={FilesBody} />
        <Route path='*' component={FilesBody} />
      </Route>
      <Route path='settings' component={Settings} />
    </Route>
    <Route path='*' component={PageNotFound} />
  </Route>
);
