
'use strict'
const assert = require("assert");
// 获取擂台敌人
/**
 *
 * @param role {{}} // 角色基础信息
 */
module.exports = exports = async function (opt) {

    const _randomOpponent = async function (groupmark, rid, match, count = 1) {
        const opp = await global.dao.ringrank.aggregate([
            {
                $match: {
                    groupmark,
                    rid: { $ne: rid },
                    // lock: false, // 是否查询未被锁定对手，取消该逻辑
                    ...match
                }
            },
            { $sample: { size: count } }
        ]);
        return opp;
    }
    let { role } = opt;
    // battleOne
    const owner = await global.dao.ringrank.findOne({ rid: role.rid, 'role.servid': role.servid });
    const groupmark = await global.dao.nationwar_serverinfo.findMarkByServid(role.servid);
    const randomOpponent = _randomOpponent.bind(this, groupmark);
    // 得到自己名次信息
    assert(owner, 'no rank'); // 需要先报名

    assert(!owner.state, 'ring finished'); // 结束擂台挑战
    const rid = owner.rid;

    const opponents = [];

    // 根据自己名次 随机对手
    if (owner.rank > 20) {

        let opp = await randomOpponent(rid, {
            rank: { $gte: owner.rank - 20, $lte: owner.rank - 16 }
        });
        opponents.push(...opp);

        opp = await randomOpponent(rid, {
            rank: { $gte: owner.rank - 15, $lte: owner.rank - 5 }
        }, 2);

        opponents.push(...opp);

    } else if (owner.rank > 5) {
        let opp = await randomOpponent(rid, {
            rank: { $lte: owner.rank - 1 }
        }, 3);
        opponents.push(...opp);

    } else { // 前 5 匹配规则

        let opp = await randomOpponent(rid, {
            $and: [
                { rank: { $gte: 1, $lte: 5 } },
                { rank: { $ne: owner.rank } }
            ]
        }, 3);
        opponents.push(...opp);
    }
    // 最终 按名次排序
    opponents.sort((a, b) => a.rank - b.rank);
    const out = await Promise.all(opponents.map(async (o) => {
        const _o = new global.dao.ringrank(o);
        const bslist = await _o.getBset();
        return {
            ...o,
            bslist,
            honor_rate: global.dao.ringrank.getHonorRate(o.rank)
        }
    }));
    return {
        opponents: out,
    }
}
