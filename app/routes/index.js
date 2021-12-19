'use strict';

const express = require('express');
const router = express.Router();
const createHttpError = require('http-errors');
const helper = require('../services/helper');

router.use(helper.prepareLocalsMiddleware);

router.use('/auth', require('./auth'));

router.use('*', require('./download'));

router.all('*', (req, res, next) => next(createHttpError(404, 'Page Not Found')));

// error handler
router.use((error, req, res, next) => {
  console.error(`URL: ${req.url}\n`, error);
  const errNo = error.statusCode || 500;
  return res.status(errNo).send(error.message);
});

module.exports = router;