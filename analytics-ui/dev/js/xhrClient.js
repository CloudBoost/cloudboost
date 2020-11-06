'use strict';

const Axios = require('axios');
//todo: change this again when doing umiversal rendering
// const baseURL = typeof window !== 'undefined' ? '/api' : 'http://localhost:3000';
import {dashboardAPI, analyticsAPI, accountsURL, cloudBoostAPI} from './config';

export const xhrDashBoardClient = Axios.create({baseURL: dashboardAPI, withCredentials: true});

export const xhrAnalyticsClient = Axios.create({baseURL: analyticsAPI, withCredentials: true});

export const AccountsURL = Axios.create({baseURL: accountsURL, withCredentials: true});

export const xhrCBClient = Axios.create({baseURL: cloudBoostAPI});