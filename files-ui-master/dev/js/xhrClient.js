/**
 * Created by Darkstar on 11/30/2016.
 */

'use strict';

const Axios = require('axios');
//todo: change this again when doing umiversal rendering
// const baseURL = typeof window !== 'undefined' ? '/api' : 'http://localhost:3000';
import {dashboardAPI, analyticsAPI, accountsAPI, cloudBoostAPI} from './config';

export const xhrDashBoardClient = Axios.create({baseURL: dashboardAPI, withCredentials: true});

export const xhrAnalyticsClient = Axios.create({baseURL: analyticsAPI, withCredentials: true});

export const xhrAccountsClient = Axios.create({baseURL: accountsAPI, withCredentials: true});

export const xhrCBClient = Axios.create({baseURL: cloudBoostAPI});
