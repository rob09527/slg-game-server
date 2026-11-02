'use strict'
// 服务器端口启动成功过后执行
module.exports = async function () {
    await require('./util/join_proxy')();
    global._handle_after_start_ && global._handle_after_start_(); // 这是交给 king_agent 执行的钩子
}
