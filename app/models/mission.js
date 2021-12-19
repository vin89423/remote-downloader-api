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
          enum: ['downloading', 'cancel', 'error', 'finished']
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
        }
      }
    };
  }

  /**
   * @param {String} userId
   * @param {String} url
   * @param {String} type
   * @param {String} filename
   * @param {Integer} filesize
   * @returns {String}
   */
  static async create(userId, url, type, filename, filesize) {
    const fileId = `${userId}-${String(Math.random()).substring(2, 8)}-${(new Date()).getTime()}`;
    return await this.query().insert({
      userId,
      fileId,
      url,
      status: 'downloading',
      type,
      filename,
      filesize,
      progress: 0
    });
  }

  /**
   * @param {String} userId
   * @param {String} [status=null]
   */
  static async getMissions(userId, status=null) {
    let query = this.query()
      .select('fileId', 'url', 'type', 'filename', 'filesize', 'progress', 'status');
    if (status !== null) query.where({status});
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
   * @param {String} status
   */
  async updateStatus(status) {
    return await Mission.query().patch({status}).findOne({fileId: this.fileId});
  }

  /**
   * @param {Integer} progress
   */
  async updateProgress(progress) {
    return await Mission.query().patch({progress}).findOne({fileId: this.fileId});
  }

  /**
   * @param {Integer} progress
   */
  async complete() {
    return await Mission.query().patch({
      status: 'finished',
      progress: this.filesize,
    }).findOne({fileId: this.fileId});
  }

  async remove() {
    return await Mission.query().findOne({fileId: this.fileId}).del()
  }

}

module.exports = Mission;
