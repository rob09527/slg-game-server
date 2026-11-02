'use strict'
// king_game 端口启动成功过后执行
module.exports = async function () {
    await require('./timer')(); // 初始化定时器
    await require('./repair')(); // 数据修复
}
