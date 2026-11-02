const moment = require('moment');
const FORMAT = "YYYY_MM";

const chkcontent    = require("../../util/chkcontent")
const h5post        = require("../../util/h5post")

const MSG_CD = {
    1: 3 * 1000,
    2: 60 * 1000,
    3: 60 * 1000
}
/**
 * 聊天 CHAT_CHAT
 * @param client {SocketClient}
 * @param data {{room: string, message: string, msgType: number}}
 * @return {Promise<void>}
 */
exports.main = async function (client, data) {
    const role = client.role;
    const type = data.msgType;
    const lastchattime = client._lastchattime_ || 0;
    const LOCK_TIME = MSG_CD[type] || 10000;
    if (Date.now() - lastchattime < LOCK_TIME) {
        client.emit('CHAT_FAIL', {
            status: false,
            message: 'wait',
            msgType: type,
            wait: (lastchattime + LOCK_TIME) - Date.now()
        });
        return;
    }
    client._lastchattime_ = Date.now();

    // data.room = 'chat_room1....' 聊天房间id
    // data.message = '消息内容', join 时传递房间id
    // 被禁言用户检查
    const mute = await role.isMute();

    if (mute) {
        client.emit('CHAT_FAIL', {
            status: false,
            message: 'mute'
        })
        return;
    }

    assert(data.room, 'chat room empty');
    assert(data.message, 'chat message empty');
    assert(data.message.length < 50 * 1024, 'message to large');
    const chk = await chkcontent(role, 2, data.message);
    assert(chk, "chat invalid string");

    data.from = {
        rid: role.i(),
        name: role.name,
        vip: role.vip,
        headid: role.headid,
        frameid: role.frameid,
        lv: role.level,
        sname: role._gameserv.name,
        titleid:role.titleid,
    }

    data.time = Date.now();
    global.socketRedis.publish(global.socketRedis.CHAT_CHANNEL, data);
    const {room, ...o} = data;
    // 保存聊天内容, 按照 月份来做 索引
    await global.elastic.insertOne('doc', {
        ...o,
        room: data.room,
        time: new Date()
    }, 'chat_' + moment().format(FORMAT)).catch(console.error);

    let other = {
        IP: client.address,
        ip: client.address,
    }
    h5post("chatpost", role, data, other);
}
