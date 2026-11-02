
'use strict'
const assert = require("assert");
// 获取记录
/**
 *
 * 
 */
module.exports = exports = async function (opt) {
    const { servid, rid, type } = opt; // type 默认查询所有记录，1查询挑战记录，2查询防守记录
    const match = {};
    if (!type) {
        match.$or = [{
            "left.rid": rid,
        }, {
            "right.rid": rid
        }];
    } else if (type === 1) {
        match['left.rid'] = rid;
    } else if (type === 2) {
        match['right.rid'] = rid;
    }
    const history = await global.dao.ringhistory.find(match).sort({ _id: -1 }).limit(10);
    const items = [];
    const opponentIds = [];
    for (const item of history) {
        const opponent = item.left.rid === rid ? item.right : item.left;
        const owner = item.left.rid === rid ? item.left : item.right;
        const type = item.left.rid === rid ? 1 : 2; // 1 表示挑战， 2 表示防守
        const win = type === 1 ? (!!item.win) : !item.win; // 防守方的状态和表里存储的状态相反
        items.push({
            opponent,
            type,
            win,
            owner,
            create: item.create,
            videolist: item.videoid
        });
        opponentIds.push(opponent.rid);
    }
    const opponents = await global.dao.ringrank.find({ rid: { $in: opponentIds } });
    const opponentMap = {};
    opponents.forEach(a => opponentMap[a.rid] = a.role);
    items.forEach(item => {
        const rid = item.opponent.rid;
        item.opponent = opponentMap[rid] || {};
        item.opponent.rid = rid;
    });

    return items;
}
