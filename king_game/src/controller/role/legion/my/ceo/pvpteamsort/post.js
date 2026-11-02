'use strict';

const CAMPS = ['top', 'mid', 'down'];
const moment = require('moment');

// 军团战整容顺序调整
module.exports = exports = async (ctx, next) => {


    const legionId = ctx.role.legion;

    const {MATCH} = global.gameconfig.legionpvp.CONFIG;
    // 下面逻辑是找出当期 的期号, 期号是匹配日当天的
    let now = new Date();
    let DAY = MATCH.split(' ').pop().split(',');
    while (!DAY.includes(now.getDay().toString())) {
        now.setDate(now.getDate() - 1);
    }
    const {  camp, index0, index1} = ctx.request.body;
    const pvpDate = moment(now).format('YYYY-MM-DD');


    const legionteam = await ctx.dao.legionpvpteam.findOne({legion: legionId, pvpDate});
    ctx.assert(legionteam, 'cant change'); // 快照没有完成，还不能调整出战顺序
    ctx.assert(CAMPS.includes(camp), 'invalid camp');
    const team = legionteam.team;

    ctx.assert(team[camp], 'no camp team');

    const t0 = team[camp][index0];
    const t1 = team[camp][index1];
    team[camp][index0] = t1;
    team[camp][index1] = t0;
    legionteam.markModified('team');
    await legionteam.save();
    ctx.body = {
        message: "OK"
    };
};
