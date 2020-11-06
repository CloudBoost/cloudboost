const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const winston = require('winston');

const templates = {
  'create.xml': fs.readFileSync(path.join(__dirname, 'azure-xml-responses', 'create.xml'), 'utf8'),
  'createFail.xml': fs.readFileSync(path.join(__dirname, 'azure-xml-responses', 'createFail.xml'), 'utf8'),
  'getResource.xml': fs.readFileSync(path.join(__dirname, 'azure-xml-responses', 'getResource.xml'), 'utf8'),
  'getSingleResource.xml': fs.readFileSync(path.join(__dirname, 'azure-xml-responses', 'getSingleResource.xml'), 'utf8'),
  'getCloudService.xml': fs.readFileSync(path.join(__dirname, 'azure-xml-responses', 'getCloudService.xml'), 'utf8'),
  'getListofSecrets.xml': fs.readFileSync(path.join(__dirname, 'azure-xml-responses', 'getListofSecrets.xml'), 'utf8'),
  'updateCommunicationPreference.xml': fs.readFileSync(
    path.join(__dirname, 'azure-xml-responses', 'updateCommunicationPreference.xml'),
    'utf8',
  ),
  'sso.xml': fs.readFileSync(path.join(__dirname, 'azure-xml-responses', 'sso.xml'), 'utf8'),
};

function loadTemplate(file, data) {
  return ejs.render(templates[file], data);
}

function slugify(text) {
  return text.replace(/[^\w]/g, '-').toLowerCase();
}

function _request(method, url, data) {
  axios({
    method, // 'post'
    url, // '/user/12345'
    data, // {firstName:'Ritish',lastName:'Gumber'}
  });
}

function isUrlValid(data) {
  try {
    const obj = URL.parse(data);
    if (!obj.protocol || !obj.hostname) return false;
    return true;
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    return false;
  }
}

module.exports = {
  slugify,
  loadTemplate,
  _request,
  getNestedValue: (pth, object) => {
    const _path = Array.isArray(pth) ? pth : path.split('.');
    // eslint-disable-next-line no-confusing-arrow
    return _path.reduce((acc, curr) => acc && acc[curr] ? acc[curr] : undefined, object);
  },
  isUrlValid
};
