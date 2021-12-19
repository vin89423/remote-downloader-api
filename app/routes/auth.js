'use strict';

const express = require('express');
const router = express.Router();
const createHttpError = require('http-errors');
const User = require('../models/user');

// Auth user
router.post('/', async (req, res, next) => {
  try {
    if (!req.body.username || !req.body.password) {
      throw createHttpError(400, 'Bad Request');
    }
    const authUser = await User.auth(req.body.username, req.body.password);
    if (!authUser) {
      throw createHttpError(403, 'Invalid password or user not exist');
    }

    // Create session
    req.session.user = authUser;

    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.get('/logout', async (req, res, next) => {
  try {
    if (req.session.user) delete req.session.user;
    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;