/**
 * 一个 action 的 demo 示例， 该demo的 action name 为: DEMO_TEST ，(也就是把文件分割符替换为了 _ 符号，再大写
 * @param client {SocketClient}
 * @param data {any}
 * @return {Promise<void>}
 */
exports.main = async function (client, data) {
    const role = client.role;
    console.log('uid', role.uid, 'submit data', data);
    const to = data.to;
    CLIENT_POOL[to] && CLIENT_POOL[to].client.send(JSON.stringify(data.data));
}
