const { Model } = require('objection');

class Mission extends Model {

  static tableName() {
    return 'missions';
  }

  static get useLimitInFirst() {
    return true;
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          readOnly: true
        },
        userId: {
          type: 'integer'
        },
        fileId: {
          type: 'string',
          required: true,
          maxLength: 128
        },
        status: {
          type: 'string',
          required: true,
          enum: ['downloading', 'error', 'finished']
        },
        oriUrl: {
          type: 'string',
          required: true,
          maxLength: 1024
        },
        url: {
          type: 'string',
          required: true,
          maxLength: 1024
        },
        type: {
          type: 'string',
          required: true,
          maxLength: 1000
        },
        filename: {
          type: 'string',
          required: true,
          maxLength: 500
        },
        filesize: {
          type: 'integer',
          required: true
        },
        progress: {
          type: 'integer',
          required: true
        },
        message: {
          type: 'string',
          maxLength: 500
        }
      }
    };
  }

  /**
   * @param {String} userId
   * @param {String} oriUrl
   * @param {String} url
   * @param {String} type
   * @param {String} filename
   * @returns {String}
   */
  static async create(userId, oriUrl, url, type, filename) {
    const fileId = `${userId}-${String(Math.random()).substring(2, 8)}-${(new Date()).getTime()}`;
    return await this.query().insert({
      userId,
      fileId,
      oriUrl,
      url,
      status: 'downloading',
      type,
      filename,
      filesize: 0,
      progress: 0
    });
  }

  /**
   * @param {String} userId
   * @param {Object} [filter={}]
   */
  static async getMissions(userId, filter={}) {
    let query = this.query()
      .select('fileId', 'url', 'type', 'filename', 'filesize', 'progress', 'status', 'message');
    if (filter.status) query.where('status', filter.status);
    if (filter.filename) query.where('filename', 'like', `%${filter.filename}%`);
    return await query.where({userId});
  }

  /**
   * @param {String} fileId
   * @param {String} userId
   */
  static async getMission(fileId, userId) {
    return await this.query()
      .select('fileId', 'url', 'type', 'filename', 'filesize', 'progress', 'status')
      .findOne({fileId, userId});
  }

  /**
   * @param {Number} filesize
   */
  async updateFilesize(filesize) {
    return await Mission.query().patch({filesize}).findOne({fileId: this.fileId});
  }

  /**
   * @param {Integer} progress
   */
  async updateProgress(progress) {
    return await Mission.query().patch({progress}).findOne({fileId: this.fileId});
  }

  /**
   * @param {Integer} filesize
   */
  async complete(filesize) {
    return await Mission.query().patch({
      status: 'finished',
      progress: filesize,
    }).findOne({fileId: this.fileId});
  }

  /**
   * @param {String} message
   */
  async error(message) {
    return await Mission.query().patch({
      status: 'error',
      message,
    }).findOne({fileId: this.fileId});
  }

  async remove() {
    return await Mission.query().findOne({fileId: this.fileId}).del()
  }

}

module.exports = Mission;
