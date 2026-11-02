const {Schema} = require('mongoose');
/**
 * 语句模版
 * @param connMap
 * @return {*}
 */
module.exports = function (connMap) {
    const conn = connMap['main']; //

    const MSchema = new Schema({
        author: String,
        author_id: String,
        data: String, //
        title: String, //
    }, {
        timestamps: {createdAt: 'create_at', updatedAt: 'update_at'},
    });

    return conn.model('ExecTemplate', MSchema, 'ExecTemplate');
}
