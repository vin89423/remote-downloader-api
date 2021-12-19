'use strict';

const config = require('../config');
const express = require('express');
const app = express();

// Set trust proxy
app.set('trust proxy', config.TRUST_PROXY);

// serve static files
app.use(express.static('public/', { etag: false }));

// connect to database
const knexConfig = require('../db/knex-config.js');
const knex = require('knex')(knexConfig.general);
const { Model } = require('objection');
Model.knex(knex);

// session
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const sessionKnex = require('knex')(knexConfig.session);
app.use(session({
  secret: config.SESSION_SECRET,
  store: new KnexSessionStore({ knex: sessionKnex }),
  resave: true,
  saveUninitialized: true
}));

// express parse body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());

// route
app.use(require('./routes'));

// export
module.exports = app;









