/**
 * 一个调用远程函数的demo: DEMO_REMOTE ，
 * @param client {SocketClient}
 * @param data {any}
 * @return {Promise<void>}
 */
exports.main = async function (client, data) {
    const role = client.role;
    console.log('uid', role.uid, 'submit data', data);
    // 示例: 执行所有游戏实例远程函数: const arrRes = await global.remote.demo(1,2); // 返回各个游戏实例结果集(结果是数组
    //  执行PROXY的 远程函数: const res = await global.remote.proxy_demo(1,2);
    //   执行TIMER的远程函数: const res = await global.remote.agent_demo('arg1', 'arg2');

    const r = await global.remote[data.fn_name](data.arg1, data.arg2);
    console.log('demo res', r);
}
