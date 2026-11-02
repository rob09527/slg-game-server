'use strict'
const SocketAction = require("../socket/socket.action");
/**
 * 推给某个玩家
 * @param rid
 * @param data {object}
 * @param action? {string}
 */
module.exports = async function (rid, data, action = SocketAction.O_PUSH) {
    CLIENT_POOL[rid] && CLIENT_POOL[rid].emit(action, data);
}
