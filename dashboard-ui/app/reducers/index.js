import { combineReducers } from 'redux';
import apps, { events, channels } from './apps';
import user from './user';
import userList from './userList';
import manageApp from './manageApp';
import cache from './cache';
import queue from './queue';
import analytics from './analytics';
import settings from './settings';
import loader from './loader';
import cards from './cards';
import beacons from './beacons';
import notifications from './notifications';
import drawer from './drawer';
import { reducer as formReducer } from 'redux-form';
import { filesUIReducers } from './files-ui/index';

const todoApp = combineReducers({
  ...filesUIReducers,
  apps,
  events,
  channels,
  drawer,
  user,
  userList,
  manageApp,
  analytics,
  cache,
  queue,
  cards,
  loader,
  settings,
  notifications,
  form: formReducer,
  beacons
});

export default todoApp;
