const crypto = require('crypto');

/**
 * 包装客户端对象
 * @type {SocketAdmin}
 */
module.exports = class SocketAdmin {
    client;
    role; // 玩家对象信息
    address; // 客户端地址
    LISTENERS = {};

    constructor(client) {
        this.client = client;
        this.address = client.ip;
        client.on("message", (str) => {
            // 收到信息触发     接收 //
            if (!str) {
                console.log('GET EMPTY MESSAGE ', this.role && this.role.uid);
                return;
            }
            try {

                const messageObj = SocketAdmin.parseSocketPack(str);
                console.log('GET MESSAGE ', str);
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
            console.log("client connection closed", code, reason, new Date().format());
            global.ADMIN_POOLS.splice(global.ADMIN_POOLS.indexOf(this), 1);
        })
        client.on("error", (err) => {
            // 出错触发 //
            console.error("client connection err", new Date().format(), err)
        });
        global.ADMIN_POOLS.push(this);
    }

    /**
     * 发送给客户端数据
     * @param action {string}
     * @param data {any}
     * @param msgid {string?}
     */
    emit(action, data, msgid = "") {
        // 发送 数据 //
        const callbackdata = SocketAdmin.makeSocketPack(action, data, msgid);
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
    disconnect() {
        this.client.close();
    }

    /**
     * 构造 socket 数据包(后续可能用其他的数据序列化和特殊加密方式，可以重写该方法)
     * @param action {string}
     * @param data {any}
     * @param msgid {any}
     * @return {string}
     */
    static makeSocketPack(action, data, msgid = undefined) {
        const pack = JSON.stringify({
            action,
            data,
            msgid
        });
        return pack;
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
     * @param query {{uid: string, token: string, servid: number, d: string}}
     * @return {Promise<SocketAdmin>}
     */
    static async initInstance(client, query) {

        try {
            console.log('CLIENT LINK ', client.ip, query.adminid, query.admin);
            if (!verifyToken(query.admin, client.ip, query.adminid)) {
                client.close(4400, 'token error');
                return null;
            }
            return new SocketAdmin(client);
        } catch (err) {
            console.error('CLIENT LINK ERROR', err);
            client.send(SocketAdmin.makeSocketPack('ERROR', {error: err.message || err}, ''));
            // 登录验证不通过
            client.close();
            return null;
        }
    }
}


const TOKEN_SALT = "CBD_!@#";
const TOKEN_IV = Buffer.alloc(16, 0); // 初始化向量。
const TOKEN_ALGORITHM = 'aes-192-cbc';
/**
 * 验证管理后台管理员的 token, 该段逻辑必须和 king-admin/config/config.default 下的同名函数逻辑一致，否则解析不开
 * @param token {string} // 后台 token
 * @param ip {string} // 客户端ip
 * @param adminId {{ string }}
 * @return {boolean}
 */
const verifyToken = (token, ip, adminId) => {
    try {
        const key = crypto.scryptSync(ip, TOKEN_SALT, 24);
        const decipher = crypto.createDecipheriv(TOKEN_ALGORITHM, key, TOKEN_IV);
        let decoded = decipher.update(token, 'hex', 'utf8');
        decoded += decipher.final('utf8');
        const [aid] = decoded.split("||");
        return aid == adminId;
    } catch (e) {
        return false;
    }
}
