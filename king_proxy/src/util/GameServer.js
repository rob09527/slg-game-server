'use strict'
const WebSocket = require('ws');
const crypto = require('crypto');


/**
 * 游戏服实例对象
 * @type {GameServer}
 */
module.exports = class GameServer {
    LISTENERS = {} // 注册的监听
    host;
    port;
    is_ssl; // 是否 带证书节点
    connection;
    online = {}
    online_count = 0; // 该实例在线人数
    remote; // 游戏服远程函数代理,用于执行游戏服的远程函数， 例：const res = await gserv.remote.demo(1,2);

    constructor(connection) {
        this.connection = connection;
        connection.on("message", (str) => {
            // 收到信息触发     接收 //

            try {
                const messageObj = GameServer.parseSocketPack(str);
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

        connection.on("close", (code, reason) => {
            // 断开连接触发 //
            console.log("game server instance closed", code, reason, new Date().format());
            delete global.gameservs[`${this.host}:${this.port}`]; // 游戏实例退出，删除注册信息
            delete global.fightservs[`${this.host}:${this.port}`];
        })
        connection.on("error", function (err) {
            // 出错触发 //
            console.error("client connection err", new Date().format(), err)
        });
        let _self = this;
        const FN = async function (...params) {
            return new Promise(((resolve, reject) => {
                const fnname = this;
                const msgid = Date.now() + Math.random() + fnname;
                _self.emit('EXEC', {
                    fn_name: fnname, // 函数名
                    params: params
                }, msgid);
                _self.on(msgid, (data) => {
                    _self.removeListener(msgid);
                    if (data.error) {
                        return reject(data.error);
                    }
                    return resolve(data.result);
                })
            }))
        };
        // 封装远程函数代理
        this.remote = new Proxy({}, {
            get(target, p, receiver) {
                return FN.bind(p);
            }
        });

        this.on('ONLINE_CHANGE', (data) => {
            if (data.tokenInfo) {
                let platform = data.tokenInfo.platform
                let serverid = data.tokenInfo.servid
                let channel = data.tokenInfo.sdkInfo.channel

                if (!this.online[serverid]) {
                    this.online[serverid] = {}
                }
                if (!this.online[serverid][channel]) {
                    this.online[serverid][channel] = { ios: 0, android: 0, h5: 0, wechatgame: 0, log: [], cz: 0, cztime: 0 }
                }

                try {
                    let onlinedata = this.online[serverid][channel]
                    let sum = onlinedata.ios + onlinedata.android + onlinedata.h5
                    let cz = data.count - sum
                    if (cz > this.online[serverid][channel].cz && cz != 1) {
                        this.online[serverid][channel].cz = cz
                        this.online[serverid][channel].time = Date.now()
                        let info = {
                            ios: onlinedata.ios,
                            android: onlinedata.android,
                            h5: onlinedata.h5,
                            count: data.count,
                            time: new Date()
                        }
                        if (this.online[serverid][channel].log.length < 20) {
                            this.online[serverid][channel].log.push(info)
                        }
                    }
                } catch (error) {
                    console.error(error)
                }

                if (data.type == 1) {
                    this.online[serverid][channel][platform] += 1
                } else if (this.online[serverid][channel][platform] > 0 && data.type == 2) {
                    this.online[serverid][channel][platform] -= 1
                }
            }

            this.online_count = data.count; // 在线人数++
            global.gametimer && global.gametimer.emit('INSTANCE_CHANGE', { // 通知 gametimer 实例，在线人数变更，方便推送管理后台
                online_count: data.count,
                host: this.host,
                port: this.port
            })
        });

        // 监听远程函数调用,分发函数调用
        this.on('EXEC', async (data) => {
            const params = data.params || [];
            try {
                const res = await global.remote[data.fn_name](...params);
                this.emit(data.msgid, { result: res });
            } catch (e) {
                this.emit(data.msgid, { error: e.message || e });
                console.error(e);
            }
        })
    }


    /**
     * 发送给客户端数据
     * @param action {string}
     * @param data {any}
     * @param msgid {string?}
     */
    emit(action, data, msgid = "") {
        // 发送 数据 //
        this.connection.send(GameServer.makeSocketPack(action, data, msgid));
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
        this.connection.close();
    }

    /**
     * 获取游戏实例
     * @param ip {string} //内网ip
     * @param host {string} 外网地址
     * @param port {port}
     * @param key {string} // 游戏服生成的随机 key
     * @param t {number} // 游戏服join时的时间戳
     * @param is_ssl {number} // 是否 wss协议节点
     * @return {Promise<GameServer>}
     */
    static initInstance(ip, host, port, key, t, is_ssl = 0) {
        const serv = `${is_ssl ? 'wss' : 'ws'}://${ip}:${port}`;

        const sign = crypto.createHash('md5').update(`ws://${host}:${port}${key}${t}`).digest('hex');

        return new Promise(((resolve, reject) => {
            const ws = new WebSocket(`${serv}?sign=${sign}`, { rejectUnauthorized: false }); // 加入参数签名，避免任意客户端都能加入内核链接权限

            ws.on("error", function (err) {
                // 出错触发 //
                console.error("game server link err", serv, new Date().format(), err);
                return reject(err);
            });

            ws.on('open', () => {
                console.log('game server instance link success', serv, new Date().format());
                const gserv = new GameServer(ws);
                gserv.is_ssl = is_ssl;
                gserv.host = host;
                gserv.port = port;
                return resolve(gserv);
            });

        }))

    }

    static parseSocketPack(data) {
        return JSON.parse(data);
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
}
