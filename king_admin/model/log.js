const {Schema} = require('mongoose');
module.exports = function (connMap) {
    const conn = connMap['main']; // 获取对应配置的链接

    const MSchema = new Schema({
        adminId: {
            type: String,
            require: true
        },
        adminName: {
            type: String,
        },
        ip:  String,
        action: {
            type: String,
            require: true,
        },
        body:  Object,
        query: Object,
    }, {
        timestamps: { createdAt: 'create_at' },
    });
    return conn.model('Log', MSchema, 'Log');
}
