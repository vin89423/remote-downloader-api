'use strict';

const fs = require('fs');
const express = require('express');
const router = express.Router();
const createHttpError = require('http-errors');
const config = require('../../config');
const downloader = require('../services/downloader');
const Mission = require('../models/mission');

// Ensure user is logged in
router.use(async (req, res, next) => {
  if (req.session.user) req.user = req.session.user;
  if (! req.user) return next(createHttpError(403, 'Forbidden'));

  req.downloadPath = `${config.DOWNLOAD_FOLDER}${req.user.username}/`;
  await downloader.ensureDownloadFolder(req.downloadPath);

  next();
});

// Get download list
router.get('/', async (req, res, next) => {
  try {
    let status = req.query.status || null,
      filename = req.query.filename || null;
    const missions = await Mission.getMissions(req.user.id, {
      status,
      filename
    });
    const result = missions.map(mission => ({...mission}));
    return res.status(200).json({cnt: result.length, list: result});
  } catch (error) {
    next(error);
  }
});

// Add new mission
router.post('/', async (req, res, next) => {
  try {
    if (!req.body.url) throw createHttpError(400, 'Bad Request');

    const { url, filename, contentType } = await downloader.plugInParser(req);
    const mission = await Mission.create(req.user.id, req.body.url, url, contentType, filename);

    // start download mission in background
    downloader.startDownload(mission, req.downloadPath);

    return res.status(200).json({
      fileId: mission.fileId,
      url: mission.url,
      filename: mission.filename,
      type: mission.type
    });
  } catch (error) {
    next(error);
  }
});

// remove all downloaded files
router.delete('/', async (req, res, next) => {
  try {
    const missions = await Mission.getMissions(req.user.id);
    await Promise.all(missions.map(async mission => {
      const filename = `${req.downloadPath}${mission.fileId}.file`;
      if (fs.existsSync(filename))
        fs.unlink(filename, (err) => { if (err) console.error(err) });
      await mission.remove();
    }));
    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

// remove specify downloaded file
router.delete('/:fileId', async (req, res, next) => {
  try {
    if (! req.params.fileId) throw createHttpError(400, 'Bad Request');

    const mission = await Mission.getMission(req.params.fileId, req.user.id);
    if (mission) {
      const filename = `${req.downloadPath}${mission.fileId}.file`;
      if (fs.existsSync(filename))
        fs.unlink(filename, (err) => { if (err) console.error(err) });
      await mission.remove();
    }

    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

// Get downloaded file
router.get('/download/:fileId', async (req, res, next) => {
  try {
    if (!req.params.fileId) throw createHttpError(400, 'Bad Request');

    const mission = await Mission.getMission(req.params.fileId, req.user.id);
    if (! mission) throw createHttpError(404, 'Page Not Found');

    res.setHeader('Content-type', mission.type);
    res.setHeader('Content-disposition', `attachment; filename=${mission.filename}`);
    var filestream = fs.createReadStream(`${req.downloadPath}${mission.fileId}.file`);
    return filestream.pipe(res);
  } catch (error) {
    next(error);
  }
});

// Get downloaded files packed
router.get('/download-all', async (req, res, next) => {
  try {
    const missions = await Mission.getMissions(req.user.id);
    if (!missions) throw createHttpError(404, 'No Mission Found');

    res.setHeader('Content-type', 'application/octet-stream');
    res.setHeader('Content-disposition', `attachment; filename=pack-${(new Date()).getTime()}.zip`);

    const archiver = require('archiver');
    const archive = archiver('zip');

    archive.on('error', (err) => {
      throw err;
    });
    archive.pipe(res);

    await Promise.all(missions.map(async mission => {
      const filename = `${req.downloadPath}${mission.fileId}.file`;
      archive.append(fs.createReadStream(filename), { name: mission.filename });
    }));

    archive.finalize();
  } catch (error) {
    next(error);
  }
});

module.exports = router;