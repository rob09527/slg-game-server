'use strict'
const SocketAction = require("../socket/socket.action");
/**
 * 推全服
 * @param groupid {number} // 推某个合服组的全服
 * @param data {object}
 * @param action? {string}
 */
module.exports = async function (groupid, data, action = SocketAction.O_PUSH) {
    groupid = +groupid; // number化
    Object.values(CLIENT_POOL).filter((client) => client.role._gameserv.groupid === groupid).forEach(client => {
        client.emit(action, data);
    });
}
