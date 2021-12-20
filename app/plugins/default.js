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
    let response = null,
      tryUrl = req.body.url;

    do {
      response = await fetch(tryUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
        }
      });
      tryUrl = response.url;
    } while(response.redirected);

    if (response === null) throw createHttpError(404, "Cannot find remote file.");

    let contentType = response.headers.get('content-type');
    if (!contentType) throw createHttpError(404, "Cannot find remote file.");
    contentType = String(contentType.split(';')[0]).trim();

    return {
      url: response.url,
      filename: req.body.filename || path.basename(response.url),
      contentType,
      contentLength: parseInt(response.headers.get('content-length') || 0)
    };
  } catch (err) {
    throw createHttpError(500, 'Connect url timeout');
  } finally {
    clearTimeout(timeout);
  }
}