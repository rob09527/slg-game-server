/**
 * 通过 redis 订阅发布来实现 实例集群间的聊天功能 ( 聊天通信不走 proxy转发, 不占用游戏通道
 * @type {SocketRedis}
 */
module.exports = class SocketRedis {

    CHAR_ROOMS = {}; // 聊天房间
    subscriber;
    CHAT_CHANNEL = "onChat";

    /**
     * @param redis_config {{HOST: string, PORT: number, PASSWORD: string, DB?: number}}
     * @see https://www.npmjs.com/package/redis#PubSub
     */
    constructor(redis_config) {
        const cfg = {};
        for (const k in redis_config) {
            cfg[k.toLowerCase()] = redis_config[k];
        }
        this._cfg = cfg;
        this._connectSubscriber();
        this._connectPublisher();
    }

    _connectSubscriber() {
        this.subscriber = require('redis').createClient(this._cfg);
        this.subscriber.on("error", (error) => {
            console.error('REDIS SUBSCRIBER CLIENT ERROR', error);
            try {
                this.subscriber && this.subscriber.quit();
            } catch (e) {
                console.warn(e);
            }
            setTimeout(() => {
                this._connectSubscriber();// 自动重连
            }, 10000); // 10 秒钟重连
        });


        this.subscriber.on("message", (channel, message) => {
            if (this[channel]) {
                this[channel](message);
            } else {
                console.log("Subscriber received message in channel '" + channel + "': " + message);
            }
        });

        this.subscriber.subscribe(this.CHAT_CHANNEL);
        this.subscriber.on('connect', () => {
            console.log('REDIS SUBSCRIBER CONNECT SUCCESS');
        });
    }

    _connectPublisher() {
        this.publisher = require('redis').createClient(this._cfg);
        this.publisher.on("error", (error) => {
            console.error('REDIS PUBLISHER CLIENT ERROR', error);
            try {
                this.publisher && this.publisher.quit();
            } catch (e) {
                console.warn(e);
            }
            setTimeout(() => {
                this._connectPublisher();// 自动重连
            }, 10000); // 10 秒钟重连
        });
        this.publisher.on('connect', () => {
            console.log('REDIS PUBLISHER CONNECT SUCCESS');
        });

    }

    /**
     * 通过redis发布一个消息
     * @param channelName {string}
     * @param message {string|object}
     */
    publish(channelName, message) {
        if (typeof message === 'object') {
            message = JSON.stringify(message);
        }
        assert(message.length < 50 * 1024, 'message to large');
        this.publisher.publish(channelName, message);
    }

    /**
     * 当收的聊天渠道的消息
     */
    onChat(data) {
        data = JSON.parse(data);
        const room = data.room; //
        if (!global.socketRedis.CHAR_ROOMS[room]) { // 该实例没有此频道数据返回不操作
            return;
        }
        // 过滤掉房间内下线用户后替换
        global.socketRedis.CHAR_ROOMS[room] = global.socketRedis.CHAR_ROOMS[room].filter(rid => {
            if (CLIENT_POOL[rid]) { // 为下线的用户进行消息发送
                CLIENT_POOL[rid].emit('CHAT', data);
            }
            return !!CLIENT_POOL[rid]; // 过滤掉房间内下线
        });
    }

    /**
     * 加入房间
     * @param rid
     * @param roomid
     */
    joinRoom(rid, roomid) {
        this.CHAR_ROOMS[roomid] = this.CHAR_ROOMS[roomid] || [];
        if (!this.CHAR_ROOMS[roomid].includes(rid)) {
            this.CHAR_ROOMS[roomid].push(rid);
        }
    }

    /**
     * 离开房间
     * @param rid
     * @param roomid
     */
    leaveRoom(rid, roomid) {
        this.CHAR_ROOMS[roomid] = this.CHAR_ROOMS[roomid] || [];
        const i = this.CHAR_ROOMS[roomid].indexOf(rid);
        if (i < 0) return;
        this.CHAR_ROOMS[roomid][i] = null;
    }

    /**
     * @param redis_config {{HOST: string, PORT: number, PASSWORD: string, DB?: number}}
     * @see https://www.npmjs.com/package/redis#PubSub
     * @return SocketRedis
     */
    static async getInstance(redis_config) {

        return new SocketRedis(redis_config);
    }
}
