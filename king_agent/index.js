const child_process = require('child_process');
const path = require("path");

const [, , configpath] = process.argv;
process.env.IS_TIMER = 1; // 声明是定时器进程, 这样启动的游戏服不会分配用户链接

const config = require(path.resolve(configpath));

if (!config.GAMEPATH) {
    throw Error('MISS GAMEPATH');
}
const gamepath = path.resolve(config.GAMEPATH);

// 先同步，避免 link king_game出错
child_process.exec(`npm link`, { // 把king_game link 到服务器全局node_module中
    cwd: gamepath
});
child_process.execSync(`npm link king_game`, { // 链接全局module king_game
    cwd: __dirname
});
let _PROXY_SERVER;

Object.defineProperty(global, 'PROXY_SERVER', { // 通过重写 set,方法来实现 重写PROXY链接 的 EXEC 事件
    set(PROXY) {
        // 监听 dao 初始化的时候
        _PROXY_SERVER = PROXY;
        if (!PROXY) return;
        // 监听远程进程调用函数
        PROXY.on('EXEC', async (data) => {
            const fn_name = data.fn_name;
            const params = data.params || [];
            const msgid = data.msgid;
            // console.log('REMOTE TIMER EXEC FN', fn_name, msgid, ...params);
            try {
                const r = await require('./src/remote/' + fn_name)(...params); // ，指向本 remote目录
                PROXY.emit(msgid, {result: r});
            } catch (e) {
                PROXY.emit(msgid, {error: e.message || e});
                console.error(e);
            }
        });

        PROXY.on("INSTANCE_CHANGE", async (data) => { // 游戏实例变更（包括在线人数 cpu ，等信息
            pushAllAdmin('INSTANCE_CHANGE', data); // 推送所有管理后台客户端
        })

        console.log('REWRITE PROXY');
    },
    get() {
        return _PROXY_SERVER;
    }
})
const SocketAdmin = require('./src/socket/socket.admin');
global._handle_after_start_ = require('./src/after.start');
global.ADMIN_POOLS = []; // 管理端的长链接
global._handle_connection_ = (client, query) => {
    if (query.admin) {
        // 管理员链接
        SocketAdmin.initInstance(client, query);
        return true; // 打断链接往下分发
    }
    return false;
}

/**
 * 推送给全部管理端链接
 * @param action {string}
 * @param data {any}
 */
global.pushAllAdmin = (action, data) => {
    for (const adminClient of global.ADMIN_POOLS) {
        adminClient.emit(action, data);
    }
}
// 引入游戏服代码
require('king_game'); // 如果 改了 king_game 项目package.json 下的 name节点，这个名字应当同步修改
