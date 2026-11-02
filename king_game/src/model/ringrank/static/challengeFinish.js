
'use strict'
const assert = require("assert");

// 国战擂台-战斗结束
/**
 *
 * @param opt {left:{},right:{},videolist}
 */
module.exports = exports = async function (opt) {
    // battleOne
    const {
        left: leftRole, right: rightRole,
        videolist,
        version,
        ret
    } = opt
    const groupmark = await global.dao.nationwar_serverinfo.findMarkByServid(leftRole.servid);
    const leftRank = await global.dao.ringrank.findOne({
        rid: leftRole.rid,
        "role.servid": leftRole.servid,
        groupmark
    });

    assert(leftRank, 'left lock'); // 挑战方正在接受其他人挑战，锁定

    let leftAfterRank = leftRank.rank; // 变更后的名次

    const rightRank = await global.dao.ringrank.findOne({
        rid: rightRole.rid,
        "role.servid": rightRole.servid,
        groupmark
    });

    assert(rightRank, 'right lock'); // 防守方正在接受其他人挑战，锁定

    let rightAfterRank = rightRank.rank; // 变更后的名次

    try {

        // 最后胜利的一方为胜利方
        let winner = ret === 'win' ? leftRole : rightRole;

        let change = 0;

        // 如果挑战方胜利 才进行 排名变更操作
        if (winner.rid === leftRole.rid) {
            if (leftRole.rid === '600a32172e013050d9a15fdf') {
                console.log('TRING res is win')
            }
            if (leftRank.rank > rightRank.rank) {

                await leftRank.settlementHonor(); // 结算荣耀
                await rightRank.settlementHonor(); // 结算荣耀

                change = leftRank.rank - rightRank.rank;

                // 因为 rank 字段是 唯一键， 所以互换时，得先把其中一对的 rank 改为别值
                const _r = await global.dao.ringrank.updateOne({ _id: rightRank._id }, { $set: { rank: Date.now() + Math.random() } });

                // 有且只有 挑战方名次高于 防守方，才进行名次互换
                const l = await global.dao.ringrank.updateOne({
                    _id: leftRank._id
                }, {
                    $set: { rank: rightRank.rank }
                });

                leftAfterRank = rightRank.rank; // 记录变更后的名次

                const r = await global.dao.ringrank.updateOne({
                    _id: rightRank._id
                }, {
                    $set: { rank: leftRank.rank }
                });
                rightAfterRank = leftRank.rank; // 记录变更后的名次

                // r.nModified
            }
        }
        const rightRoleInfo = rightRank.role;
        const leftRoleInfo = leftRank.role;
        const myVideo = await global.dao.video.create({
            type: 'ring',
            video: JSON.stringify(videolist),
            version,
            left: leftRole.rid,
            right: rightRole.rid,
            mark: `${winner.rid === leftRole.rid ? 'win' : 'lose'}.0.0.0.active.${rightRoleInfo.name}.${rightRoleInfo.power}.${rightRoleInfo.level}.${rightRoleInfo.iconid}.${rightRoleInfo.frameid}`,
            r_mark: `${winner.rid === leftRole.rid ? 'lose' : 'win'}.0.0.0.positive.${leftRoleInfo.name}.${leftRoleInfo.power}.${leftRoleInfo.level}.${leftRoleInfo.iconid}.${leftRoleInfo.frameid}`
        });

        let report = await global.dao.ringhistory.create({
            left: {  // 挑战方
                rid: leftRole.rid,
                servid: leftRole.servid,
                rank: leftAfterRank, // 挑战结束过后的名次
                change: change, // 名次变更, +1, -10, 0  正数表示名次提升，负数名次增加, 0 保持
            },
            right: { // 防守方
                rid: rightRole.rid,
                servid: rightRole.servid,
                rank: rightAfterRank, // 挑战结束过后的名次
                change: -change, // 名次变更, +1, -10, 0  正数表示名次提升，负数名次增加, 0 保持
            },
            win: winner.rid === leftRole.rid ? 1 : 0,
            videoid: myVideo._id + "", // 录像地址(3场比赛
        });
        // 挑战过后的荣誉值提升速度,和现有荣誉值
        report.left._honor_rate = global.dao.ringrank.getHonorRate(leftAfterRank);
        report.right._honor_rate = global.dao.ringrank.getHonorRate(rightAfterRank);

        if (change) { // 如果名次有变更，返回结算过后的荣誉值池子数量
            report.left._honor_pool = leftRank.honor_pool;
            report.right._honor_pool = rightRank.honor_pool;
            // 推送防守方名次变更
            global.pushClient(rightRole.rid, {
                type: 'ring-pvp',
                content: report.right})
        }
        // 释放锁
        await global.dao.ringrank.updateMany({ _id: { $in: [leftRank._id, rightRank._id] } }, { $set: { lock: 0 } });
        return report;
    } catch (e) {
        // 出现异常也要 释放锁
        await global.dao.ringrank.updateMany({ _id: { $in: [leftRank._id, rightRank._id] } }, { $set: { lock: 0 } }).catch(console.error);
        throw e; // 把异常原样抛出去
    }
}
