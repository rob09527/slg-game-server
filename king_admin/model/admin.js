const {Schema} = require('mongoose');
module.exports = function (connMap) {
    const conn = connMap['main']; // 获取对应配置的链接

    const MSchema = new Schema({
        name: {
            type: String,
            unique: true
        },
        email: {
            type: String,
            unique: true
        },
        group:  String,
        password_error_history: {
            error_count: {
                type: Number,
                default: 0
            },
            last_time: Date
        },
        password: {
            type: String,
            require: true,
        },
        status: { // 0 正常 ，1 删除
            type: Number,
            default: 0,
        },
    }, {
        timestamps: { createdAt: 'create_at', updatedAt: 'update_at' },
    });
    return conn.model('Admin', MSchema, 'Admin');
}
