'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');
const { urlToHttpOptions } = require('url');
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
  startDownload: async (mission, downloadFolder) => {
    const dlUrlProp = urlToHttpOptions(new URL(mission.url));
    const httpx = dlUrlProp.protocol === 'https:' ? https : http;
    const file = fs.createWriteStream(`${downloadFolder}${mission.fileId}.file`);
    let downloaded = 0;
    let writeProgress = true;

    httpx.get({
      ...dlUrlProp,
      headers: {
        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
      }
    }, (response) => {
      response.pipe(file);
      response.on('data', (chunk) => {
        downloaded += chunk.length;
        if (writeProgress) {
          mission.updateProgress(downloaded);
          console.log(`${mission.url} downloading ${downloaded}/${mission.filesize}`);
          writeProgress = false;
          setTimeout(() => { writeProgress = true }, 3000);
        }
      })
      response.on('end', () => {
        mission.complete();
        console.log(`${mission.url} downlaod completed`);
      });
      response.on('error', (err) => {
        mission.updateStatus('error');
        console.error(err);
      });
    });
  }
};