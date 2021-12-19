'use strict';

const path = require('path');
const AbortController = require('abort-controller');
const fetch = require('node-fetch');
const config = require('../../config');
const createHttpError = require('http-errors');
const userAgents = config.userAgents;

module.exports = async (req) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => { controller.abort() }, 5000);
  try {
    const response = await fetch(req.body.url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
      }
    });
    const contentType = response.headers.get('content-type');
    if (!contentType) {
      throw createHttpError(404, "Cannot find remote file.");
    }
    return {
      url: req.body.url,
      filename: req.body.filename || path.basename(req.body.url),
      contentType,
      contentLength: parseInt(response.headers.get('content-length') || 0)
    };
  } catch (err) {
    throw createHttpError(500, 'Connect url timeout');
  } finally {
    clearTimeout(timeout);
  }
}