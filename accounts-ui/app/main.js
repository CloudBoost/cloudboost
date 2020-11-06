import ReactDOM from 'react-dom';
import React from 'react';
import { Router, browserHistory } from 'react-router'
import routes from './routes.js'


ReactDOM.render((
	<Router history={browserHistory}>
		{ routes }
	</Router>
), document.getElementById('main'));

