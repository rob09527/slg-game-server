const {Schema} = require('mongoose');
module.exports = function (connMap) {
    const conn = connMap['main']; // 获取对应配置的链接

    const MSchema = new Schema({
        admin_id: {
            type: String,
            require: 1,
            index: 1,
        },
        action: {
            type: String,
            require: 1
        },
        status: { // 0 正常 ，1 删除
            type: Number,
            default: 0,
        },
    });
    MSchema.index({
        admin_id: 1,
        action: -1
    }, {
        unique: 1,
        background: 1,
    });
    return conn.model('AdminAction', MSchema, 'AdminAction');
}
