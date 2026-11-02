'use strict';
const moment = require('moment');

// 新远征
module.exports = exports = async (ctx, next) => {
    const {force} = ctx.request.body;
    let maze = ctx.maze;
    const {FREE_TIME = 3, REFRESH_FEE = 50, REFRESH_FEE_GSID = 38005} = global.gameconfig.nmaze.CONFIG;
    if (!maze || maze.next_refresh_time < Date.now()) {
        if(maze) {
            await maze.remove();
        }
        maze = new ctx.dao.nmaze({
            rid: ctx.role.i()
        });
        maze._role = ctx.role;
        const n = moment();
        n.add(1, 'days');
        maze.next_refresh_time = n.startOf('days').valueOf();
        await maze.refreshTarget();
        await maze.save();



    } else {
        maze._role = ctx.role;
    }
    let castitems;
    if (force) { // 强制刷新
        await maze.refreshTarget();
        maze.refresh_times++;
        if (maze.refresh_times > FREE_TIME) {
            castitems = [{GSID: +REFRESH_FEE_GSID, COUNT: REFRESH_FEE}];
            // 有消耗
            ctx.role.castItemsNoSave(castitems);
            await ctx.role.save();
        }
        await maze.save();
    }
    const cfg = global.gameconfig.nmaze.MAP[maze.mapid -1];

    ctx.body = {
        ispass: maze.ispass, // 是否通关。没有下一关配置则表示通关
        refresh_times: maze.refresh_times,
        next_refresh_time: maze.next_refresh_time,
        star: maze.star, // 当前累计星星数量
        mapid: maze.mapid,   // 当前关卡
        bosslist: maze.target,
        boxreward: maze.boxreward,
        cardbag: maze.selcards,
        cardlist: maze.cardlist,
        starrewards: maze.starrewards,
        map: cfg && cfg.MAP,
        config: global.gameconfig.nmaze.CLIENT_CONFIG,
        castitems
    }
};
