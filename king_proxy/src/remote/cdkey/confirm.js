const moment = require('moment');

module.exports = async function (cdkey, uid, servid, rid) {

    // 打印日志
    let now = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(`CDKEYUSE ${uid} ${servid} ${rid} ${cdkey} ${now}`);
    if (cdkey.remain < 0) return true;	// 无限次数无需更新

    const cond = {
        key: cdkey.key,
        remain: {
            $gte: 1,	// 剩余次数大于1
        }
    }
    const udp = {
        $inc: {
            remain: -1,	// 次数减少1
        }
    }
    const ret = await global.dao.cdkey.findOneAndUpdate(cond, udp);
    return ret;
}
