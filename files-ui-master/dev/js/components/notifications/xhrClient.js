'use strict';

const Axios = require('axios');
import {dashboardAPI} from '../../config';

export const xhrClient = Axios.create({baseURL: dashboardAPI, withCredentials: true});
