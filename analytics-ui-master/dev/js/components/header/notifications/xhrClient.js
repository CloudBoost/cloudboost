'use strict';

const Axios = require('axios');

export const xhrClient = Axios.create({baseURL: USER_SERVICE_URL, withCredentials: true});
