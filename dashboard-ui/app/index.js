'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import Routes from './routes';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { blue500 } from 'material-ui/styles/colors';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';

require('./styles/index.scss');

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

// todo: useragent is hardcoded temporariy, user routerContext to get instead or state props
const muiTheme = getMuiTheme({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.82 Safari/537.36',
  palette: {
    primary1Color: blue500,
    primary2Color: blue500,
    accent1Color: blue500,
    pickerHeaderColor: blue500
  }
});

window.onload = () => {
  ReactDOM.render(
    <MuiThemeProvider muiTheme={muiTheme}><Routes /></MuiThemeProvider>, document.getElementById('app'));
};
