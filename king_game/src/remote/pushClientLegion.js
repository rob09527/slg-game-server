'use strict'
const SocketAction = require("../socket/socket.action");
/**
 * 推某军团玩家
 * @param legionid {string}
 * @param data {object}
 * @param action? {string}
 */
module.exports = async function (legionid, data, action = SocketAction.O_PUSH) {

    Object.values(CLIENT_POOL).filter((client) => client.role.legion === legionid).forEach(client => {
        client.emit(action, data);
    });
}
