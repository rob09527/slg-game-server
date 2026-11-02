const {Schema} = require('mongoose');
// 部门权限细化 配置表
module.exports = function (connMap) {
    const conn = connMap['main']; // 获取对应配置的链接

    const MSchema = new Schema({
        group:  {
            type: String,
            unique: true
        },
        serv: { // 管理服务器 servid 范围
            min: Number,
            max: Number
        },
        channel: [String], // 管理的包id  gameid ,注意，不是渠道，而是 gameid
        status: { // 0 正常 ，1 删除
            type: Number,
            default: 0,
        },
    }, {
        timestamps: { createdAt: 'create_at', updatedAt: 'update_at' },
    });
    return conn.model('AdminGroupAuth', MSchema, 'AdminGroupAuth');
}
