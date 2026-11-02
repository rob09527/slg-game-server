const sendError = require('../util/khlog/sendByRobot').sendError;
const apilock = require('../util/apilock');
/**
 * API 类 功能函数捕获
 * @param err
 */
module.exports = function (err) {
    const {lock} = this.request;
    if (lock) apilock.unLock(this.request.lock).catch(console.error);
    if (!err) return;
    // 错误警告机器人
    sendError(this.path || '', err)

    this.body = {
        error: err.message
    };
    console.error(new Date().format(), this.role && this.role.uid, err);
}
