
/**
 * 一个心跳事件，客户端定时发布心跳，服务器做出返回（客户端方便判断链接是否依然有效
 * @param client {SocketClient}
 * @param data {any}
 * @return {Promise<void>}
 */
exports.main = async function (client, data) {
    client._last_ping_ = data.t;
    client.emit('PONG', data)
}
