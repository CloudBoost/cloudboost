'use strict';
import { dashboardAPI } from '../../config';

const Axios = require('axios');

export const xhrClient = Axios.create({ baseURL: dashboardAPI, withCredentials: true });
