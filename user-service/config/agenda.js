const Agenda = require('agenda');
const mongoConnectionString = require('../helpers/mongoString')();

module.exports = new Agenda({ db: { address: mongoConnectionString } });
