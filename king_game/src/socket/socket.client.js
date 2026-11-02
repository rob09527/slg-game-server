const authMiddleware = require("../middleware/auth.middleware");
const SocketAction = require("./socket.action");
const ClientPool = require("./client.pool");
const whisper = require('../../util/algorithm_whisper')(global.config.CIPHER.ALGORITHM, global.config.CIPHER.KEY, global.config.CIPHER.IV);
const sendError = require('../util/khlog/sendByRobot').sendError;

/**
 * 包装客户端对象
 * @type {SocketClient}
 */
module.exports = class SocketClient {
    client;
    role; // 玩家对象信息
    address; // 客户端地址
    LISTENERS = {};
    /**
     *
     * @param client
     * @param role
     * @param recon? 是否重新链接
     */
    constructor(client, role, recon) {
        this._last_ping_ = Date.now();
        this.logineTime = this._last_ping_;
        this.client = client;
        this.address = client.ip;
        this.role = role;
        this.check = {};
        client.on("message", (str) => {
            // 收到信息触发     接收 //
            if (!str) {
                console.log('GET EMPTY MESSAGE ', this.role && this.role.uid);
                return;
            }
            try {
                // console.log('GET MESSAGE ', str);
                const messageObj = SocketClient.parseSocketPack(str, this.client.cipher);
                if (!messageObj.action) {
                    return;
                }
                messageObj.data = messageObj.data || {};
                messageObj.data.msgid = messageObj.msgid || messageObj.data.msgid; // 兼容最外层传递 msgid 的情况
                this.LISTENERS[messageObj.action] && this.LISTENERS[messageObj.action](messageObj.data || {});
            } catch (e) {
                console.error('invalid socket message', str, e);
            }
        })

        client.on("close", (code, reason) => {
            // 断开连接触发 //
            console.log("client connection closed", this.role.uid, this.role.rno, code, reason, new Date().format());
            ClientPool.offline(this);
        })
        client.on("error", (err) => {
            // 出错触发 //
            console.error("client connection err", this.role.uid, this.role.rno, new Date().format(), err)
        });

        for (const actionName in global.ACTIONS) {
            // 注册所有actions
            this.on(actionName, async (data) => {
                await global.ACTIONS[actionName].main(this, data).catch(err => {
                    // 有报错直接推给客户端，这样可以省去在action 内部单独写 push, 写好 assert 就行
                    this.emit(SocketAction.ERROR, {error: err.message || err});
                    sendError(actionName, err);
                    console.error('ACTION_DOING_ERROR', new Date().format(), this.role && this.role.uid, err);
                });
            });
        }
        // 后续可以放到第一次心跳过后记录上线
        ClientPool.online(this, !!recon).catch(err => {
            sendError('LOGIN', err);
            console.error(err);
            client.close(4400, err.message || err);
        });
    }

    /**
     * 发送给客户端数据
     * @param action {string}
     * @param data {any}
     * @param msgid {string?}
     */
    emit(action, data, msgid = "") {
        // 发送 数据 //
        const callbackdata = SocketClient.makeSocketPack(action, data, msgid, this.client.cipher);
        callbackdata.length > 65535 && console.error('SOCKET DATA LENGTH LIMIT', this.role.rno, action); // 数据过长警告
        this.client.send(callbackdata);
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
    disconnect(code = 4101, reason = "") {
        this.client.close(code, reason);
    }

    /**
     * 构造 socket 数据包(后续可能用其他的数据序列化和特殊加密方式，可以重写该方法)
     * @param action {string}
     * @param data {any}
     * @param msgid {any}
     * @param cipher {boolean} 是否需要加密
     * @return {string}
     */
    static makeSocketPack(action, data, msgid = undefined, cipher = true) {
        const pack = JSON.stringify({
            action,
            data,
            msgid
        });
        if (!cipher) {
            return pack;
        }
        return whisper.encrypt(pack);
    }

    /**
     * 解析 socket 数据包(后续可能用其他的数据序列化和特殊加密方式，可以重写该方法)
     * @param data
     * @param cipher {boolean} 是否经过加密
     * @return { {action: string, data: any}}
     */
    static parseSocketPack(data, cipher = true) {
        if (cipher) {
            data = whisper.decrypt(data);
        }
        return JSON.parse(data);
    }

    /**
     * 初始化一个实例
     * @param client {}
     * @param query {{uid: string, token: string, servid: number, d: string}}
     * @return {Promise<SocketClient>}
     */
    static async initInstance(client, query) {

        try {
            client.cipher = !!query.d; // 没有加密提交，则无需加密
            if (query.d) { // 和客户端协议的规则， 登录上传的数据 加密提交
                query = JSON.parse(whisper.decrypt(decodeURIComponent(query.d)));
            }
            console.log('CLIENT LINK ', client.ip, query.uid, new Date().format());
            // 进行token 验证
            const role = await authMiddleware.call(this, query.token, query.uid, query.servid);
            return new SocketClient(client, role, query.recon);
        } catch (err) {
            console.error('CLIENT LINK ERROR', err);
            // 登录验证不通过
            client.close(4400, err.message || err);
            return null;
        }
    }
}

