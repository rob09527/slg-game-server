'use strict';

// 军团战信息
module.exports = exports = async (ctx, next) => {


    const { startPvpDate, limit} = ctx.request.body;

    const legionId = ctx.role.legion;

    const opt = {legion: legionId, report: {$exists: true}};
    if (startPvpDate) {
        opt.pvpDate = {$lt: startPvpDate};
    }

    const history = await ctx.dao.legionpvp.find(opt).sort({_id: -1}).limit(+limit || 20);
    // 一次查询所有对战历史的对手军团id,过滤轮空
    const opponentIds = history.map(h => h.legion.find(a => a !== legionId)).filter(Boolean);

    const opponents = await ctx.dao.legion.find({_id: {$in: opponentIds}}, {servid: 1, name: 1,level: 1, pvpscore: 1, flag: 1}).limit(opponentIds.length);
    const mapForOpponent = {};
    for (const op of opponents) {
        mapForOpponent[op._id] = op;
    }
    const items = history.map(h => {
        const tmp = {};
        const opid = h.legion.find(a => a !== legionId);
        const opponent = mapForOpponent[opid];
        if (opponent) {
            opponent.legion = opponent._id;
            opponent.__v = undefined;
        }
        tmp.opponent = opponent;
        tmp.pvpDate = h.pvpDate;
        const ctype = h.report._legion_.left === legionId ? 'left' : 'right';
        tmp.addScore = h.report.pvpscore ? h.report.pvpscore[ctype] : 0;
        tmp.isWin = h.report.winner ? (h.report.winner === ctype ? 1 : -1 ): 0;
        return tmp;
    })

    ctx.body = {
        history: items
    }
};
