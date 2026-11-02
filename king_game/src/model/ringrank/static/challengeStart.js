
'use strict'
const assert = require("assert");
const LOCK_TIME = 2 * 60 * 1000; // 默认锁定时长 2分钟

// 国战擂台-战斗开始
/**
 *
 * @param opt {left:{},right:{}}
 */
module.exports = exports = async function (opt) {

    // battleOne
    const { left: leftRole, right: rightRole } = opt
    const NOW = Date.now();
    const groupmark = await global.dao.nationwar_serverinfo.findMarkByServid(leftRole.servid);
    const leftRank = await global.dao.ringrank.findOneAndUpdate({
        rid: leftRole.rid,
        "role.servid": leftRole.servid,
        groupmark,
        lock: {
            $lt: NOW
        }
    }, {
        $set: { // 加锁
            lock: NOW + LOCK_TIME
        }
    });
    assert(leftRank, 'left lock'); // 挑战方正在接受其他人挑战，锁定
    assert(!leftRank.state, 'ring finished'); // 结束擂台挑战
    const rightRank = await global.dao.ringrank.findOneAndUpdate({
        rid: rightRole.rid,
        "role.servid": rightRole.servid,
        groupmark,
        lock: {
            $lt: NOW
        }
    }, {
        $set: { // 加锁
            lock: NOW + LOCK_TIME
        }
    });
    if (!rightRank) { // 释放自己的锁
        await global.dao.ringrank.updateOne({ _id: leftRank._id }, { $set: { lock: 0 } }).catch(console.error);
    }
    assert(rightRank, 'right lock'); // 防守方正在接受其他人挑战，锁定

    try {

        let rightBattleset = await rightRank.getBset();

        const target = {
            bslist: rightBattleset,
            rname: rightRank.role.name,
            level: rightRank.role.level,
            iconid: rightRank.role.headid,
            servid: rightRank.role.servid,
            robot_id: rightRank.robot_id,
            rid: rightRank.rid
        }

        return {
            target
        }
    } catch (e) {
        // 出现异常也要 释放锁
        await global.dao.ringrank.updateMany({ _id: { $in: [leftRank._id, rightRank._id] } }, { $set: { lock: 0 } }).catch(console.error);
        throw e; // 把异常原样抛出去
    }

}
