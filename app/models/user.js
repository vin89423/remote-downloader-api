const { Model } = require('objection');

class User extends Model {

  static tableName() {
    return 'users';
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
        username: {
          type: 'string',
          required: true,
          maxLength: 255
        },
        password: {
          type: 'string',
          required: true,
          maxLength: 255
        }
      }
    };
  }

  /**
   * @param {String} username
   * @param {String} password
   */
  static async auth(username, password) {
    return this.query().select('id', 'username').findOne({username, password});
  }

}

module.exports = User;
