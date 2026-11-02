'use strict'
const SocketAction = require("../socket/socket.action");
/**
 * 批量推给某个玩家
 * @param batchData {[{rid: string, data: any, action?: string}]}
 */
module.exports = async function (batchData) {
    if (!Array.isArray(batchData)) {
        return;
    }
    for (const {rid, data, action = SocketAction.O_PUSH} of batchData) {
        CLIENT_POOL[rid] && CLIENT_POOL[rid].emit(action, data);
    }

}
