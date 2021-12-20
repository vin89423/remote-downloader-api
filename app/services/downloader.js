'use strict';

const fs = require('fs');
const fetch = require('node-fetch');
const config = require('../../config');

const userAgents = config.userAgents;

module.exports = {
  /**
   * @param {String} downloadFolder
   * @return {Promise<String>}
   */
  ensureDownloadFolder: async (downloadFolder) => {
    return await fs.mkdirSync(downloadFolder, {recursive: true, mode: 0o755});
  },
  /**
   * @typedef parseObject
   * @property {String} url
   * @property {String} filename
   * @property {String} contentType
   *
   * @param {Request} req
   * @return {parseObject}
   */
  plugInParser: async (req) => {
    const reqType = req.body.type || 'default';
    switch (reqType) {
      case 'add-more-type':
        /* add plugin support later */

        break;
      default:
        return await require('../plugins/default')(req);
    }
  },
  /**
   * @param {Mission} mission
   * @param {String} downloadFolder
   */
  startDownload: (mission, downloadFolder) => {
    const file = fs.createWriteStream(`${downloadFolder}${mission.fileId}.file`);
    let urlData = new URL(mission.url),
      downloaded = 0,
      writeProgress = true;

    fetch(mission.url, {
      headers: {
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en',
        'cache-control': 'no-cache',
        'origin': urlData.origin,
        'referer': urlData.origin,
        'user-agent': userAgents[Math.floor(Math.random() * userAgents.length)]
      }
    }).then((response) => {
      console.log(`[${mission.fileId}] Download started`);

      let filesize = parseInt(response.headers.get('content-length') || 0);
      mission.updateFilesize(filesize);

      response.body.pipe(file);
      response.body.on('data', (chunk) => {
        downloaded += chunk.length;
        if (writeProgress) {
          mission.updateProgress(downloaded);
          console.log(`[${mission.fileId}] Downloading ${downloaded}/${filesize} (${parseInt((downloaded/filesize) * 100)}%)`);
          writeProgress = false;
          setTimeout(() => { writeProgress = true }, 3000);
        }
      })
      response.body.on('end', () => {
        mission.complete(filesize);
        console.log(`[${mission.fileId}] Download completed`);
      });
      response.body.on('error', (err) => {
        mission.error(err.message);
        console.log(`[${mission.fileId}] Error occurred, ${err.message}`);
      });
    });
  }
};