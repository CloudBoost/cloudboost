import {combineReducers} from 'redux';
import allEvents from './allEvents';
import eventsPage from './eventsPage'
import groupedEvents from './groupedEvents'
import app from './app'
import user from './user'
import beacons from './beacons'
import notifications from './notifications'
import loader from './loading'
import filter from './filterEvents'
import funnels from './funnels'

const allReducers = combineReducers({
    allEvents,
    eventsPage,
    groupedEvents,
    app,
    user,
    beacons,
    notifications,
    loader,
    filter,
    funnels
});

export default allReducers
