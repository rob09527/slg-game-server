const crypto = require('crypto');
const joinProxy = require('../util/join_proxy');
/**
 * 包装和proxy的通信
 * @type {SocketClient}
 */
module.exports = class SocketProxy {
    client;
    LISTENERS = {};

    constructor(client) {
        this.client = client;
        client.on("message", (str) => {
            // 收到信息触发     接收 //
            // console.log('GET PROXY MESSAGE ', str);

            try {

                const messageObj = SocketProxy.parseSocketPack(str);
                if (!messageObj.action) {
                    return;
                }
                messageObj.data = messageObj.data || {};
                messageObj.data.msgid = messageObj.msgid || messageObj.data.msgid; // 兼容最外层传递 msgid 的情况
                this.LISTENERS[messageObj.action] && this.LISTENERS[messageObj.action](messageObj.data || {});
            } catch (e) {
                console.error('invalid socket message', e);
            }
        })

        client.on("close", function (code, reason) {
            // 断开连接触发 //
            console.log("proxy connection closed", code, reason, new Date().format());
            global.PROXY_SERVER = null;
            setTimeout(joinProxy, 1000); // 间隔1秒钟之后在进行尝试加入 proxy
        })
        client.on("error", function (err) {
            // 出错触发 //
            console.error("client connection err", new Date().format(), err)
        });

        // 监听远程进程调用函数
        this.on('EXEC', async (data) => {
            const fn_name = data.fn_name;
            const params = data.params || [];
            const msgid = data.msgid;
            // console.log('REMOTE EXEC FN', fn_name, msgid, ...params);
            try {
                let t = Date.now();
                const r = await require('../remote/' + fn_name)(...params);
                let e = Date.now();
                if (e - t > 20) {
                    console.log('REMOTE EXEC FN', fn_name, msgid, ...params, (e - t) + 'ms', new Date().format());
                }
                this.emit(msgid, { result: r });
            } catch (e) {
                this.emit(msgid, { error: e.message || e });
                console.error(e);
            }
        });
        this.reportOnlineCount(0);
    }

    /**
     * 上报在线人数
     */
    reportOnlineCount(type, tokenInfo) {
        const length = Object.keys(global.CLIENT_POOL).length;
        this.emit('ONLINE_CHANGE', {
            count: length,
            tokenInfo,
            type,
        });
        console.log("ONLINE_CHANGE", type, length)
    }

    /**
     * 发送给客户端数据
     * @param action {string}
     * @param data {any}
     * @param msgid {string?}
     */
    emit(action, data, msgid = "") {
        // 发送 数据 //
        this.client.send(SocketProxy.makeSocketPack(action, data, msgid));
    }

    // 注册监听事件
    on(action, listen) {
        this.LISTENERS[action] = listen;
    }

    // 移除监听事件
    removeListener(action) {
        delete this.LISTENERS[action];
    }

    // 简单封装 关闭客户端链接（方法名和 socket.io一致
    disconnect() {
        this.client.close();
    }

    /**
     * 构造 socket 数据包
     */
    static makeSocketPack(action, data, msgid = "") {
        return JSON.stringify({
            action,
            data,
            msgid
        });
    }

    /**
     * 解析 socket 数据包(后续可能用其他的数据序列化和特殊加密方式，可以重写该方法)
     * @param data
     */
    static parseSocketPack(data) {
        return JSON.parse(data);
    }

    /**
     * 初始化一个实例
     * @param client {}
     * @param query {{sign: string }}
     * @return {Promise<SocketProxy>}
     */
    static async getInstance(client, query) {

        console.log('PROXY LINK ', client.ip, query.sign, new Date().format());

        const t = global._START_T; // 开服向proxy 注册时的时间
        const KEY = process.pid; // 启动实例的 pid 作为 实例 key
        const HOST = global._HOST;
        const PORT = global._PORT;


        const sign = crypto.createHash('md5').update(`ws://${HOST}:${PORT}${KEY}${t}`).digest('hex');
        if (sign !== query.sign) { // 验证签名
            console.error('PROXY LINK ERROR SIGN ERROR', sign);
            client.close();
            return null;
        }

        return new SocketProxy(client);

    }
}

