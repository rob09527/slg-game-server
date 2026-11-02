'use strict';
const moment = require('moment');

// 新远征
module.exports = exports = async (ctx, next) => {
    assert(ctx.maze, "not find");
    let maze = ctx.maze;
    const {REFRESH_FEE_GSID = 38005, BUY_COST = 100} = global.gameconfig.nmaze.CONFIG;
    const {CLIENT_CONFIG} = global.gameconfig.nmaze;
    let num = 0;
    for (let i = 0; i < CLIENT_CONFIG.STAR.length; ++i) {
        if(maze.star >= CLIENT_CONFIG.STAR[i]){
            num = i + 1;
        }
    }
    assert(num == maze.starrewards.length, "star rewards");
    assert(ctx.role.getProp(90236) < global.gameconfig.vip.SEIZE[ctx.role.vip], "buy limit");

    let castitems = [{GSID: +REFRESH_FEE_GSID, COUNT: BUY_COST}];
    ctx.role.castItemsNoSave(castitems, {main: 'nmaze', sec: 'buy'});
    ctx.role.addItemsNoSave({gsid:90236,count:1})
    await ctx.role.save();

    // 重置新远征
    await maze.remove();
    maze = new ctx.dao.nmaze({
        rid: ctx.role.i()
    });
    maze._role = ctx.role;
    const n = moment();
    n.add(1, 'days');
    maze.next_refresh_time = n.startOf('days').valueOf();
    await maze.refreshTarget();
    await maze.save();
    
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
        config: CLIENT_CONFIG,
        castitems
    }
};
