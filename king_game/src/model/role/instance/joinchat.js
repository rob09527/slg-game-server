'use strict';

const moment = require("moment");
const FORMAT = "YYYY_MM";
/**
 *   加入聊天频道
 *   @param is_recon {boolean} 是否时重连，非重连需要推历史聊天

 */
module.exports = exports = function (is_recon = true) {

    const rid = this.i();
    const _rooms_ = [];
    // 加入同服房间
    const servroom = `serv_` + this._gameserv.groupid;
    global.socketRedis.joinRoom(rid, servroom);
    _rooms_.push(servroom);
    // 加入跨服房间
    const crossroom = `cross_` + (this._gameserv.room || 0);
    _rooms_.push(crossroom);
    global.socketRedis.joinRoom(rid, crossroom);
    // 加入跑马灯
    const bulletroom = `bullet_` + this._gameserv.groupid;
    global.socketRedis.joinRoom(rid, bulletroom);
    _rooms_.push(bulletroom);
    // 加入邀请房间
    const inviteroom = `invite_` + (this._gameserv.room || 0);
    global.socketRedis.joinRoom(rid, inviteroom);
    _rooms_.push(inviteroom);

    if (this.legion) { // 军团房间
        const legionroom = `legion_` + this.legion;
        _rooms_.push(legionroom);
        global.socketRedis.joinRoom(rid, legionroom);
    }
    if (!is_recon) {
        // 查询最近历史消息返回客户端
        for (const room of _rooms_) {
            global.elastic.search({
                index: 'chat_' + moment().format(FORMAT),
                type: 'doc',
                body: {
                    query: {
                        constant_score: {
                            filter: {
                                bool: {
                                    must: {
                                        term: {
                                            room: room
                                        }
                                    }
                                }
                            }
                        }
                    },
                    size: 10, //  查询最近10条聊天记录
                    sort: [{time: 'desc'}], // 指定字段 降序
                }
            }).catch(e => {
                if (e.statusCode !== 404) {
                    console.error('find chat history ', e); // 索引不存在异常不输出，404 为索引不存在异常
                }
                return {hits: {hits: []}};
            }).then(res => {
                const messages = res.hits.hits.map(item => item._source);
                CLIENT_POOL[rid] && CLIENT_POOL[rid].emit('CHAT', {room: room, messages: messages});
            });
        }
    }
}
