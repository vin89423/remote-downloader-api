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
  startDownload: async (mission, downloadFolder) => {
    const file = fs.createWriteStream(`${downloadFolder}${mission.fileId}.file`);
    let downloaded = 0;
    let writeProgress = true;

    fetch(mission.url, {
      headers: {
        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
      }
    }).then((response) => {
      response.body.pipe(file);
      response.body.on('data', (chunk) => {
        downloaded += chunk.length;
        if (writeProgress) {
          mission.updateProgress(downloaded);
          console.log(`${mission.url} downloading ${downloaded}/${mission.filesize}`);
          writeProgress = false;
          setTimeout(() => { writeProgress = true }, 3000);
        }
      })
      response.body.on('end', () => {
        mission.complete();
        console.log(`${mission.url} downlaod completed`);
      });
      response.body.on('error', (err) => {
        mission.updateStatus('error');
        console.error(err);
      });
    });
  }
};