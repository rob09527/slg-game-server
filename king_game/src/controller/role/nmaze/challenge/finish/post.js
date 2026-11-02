'use strict'
const {hitHere} = require("../../../../../util/weektarget");
const {fpool} = require('../../../../../util/random');

module.exports = exports = async (ctx) => {

    let {battleid} = ctx.request.body;
    let battle = await ctx.dao.c_battle.findOne({_id: battleid});
    ctx.assert(battle, 'invalid battleid');
    const star = battle.enemy.star;
    await battle.cal();
    ctx.body = {result: battle.result};

    // 每日挑战次数
    ctx.role.addItemsNoSave({gsid:90615,count:1})
    // 战斗结算
    if (ctx.body.result.ret === 'win') {

        const battle = ctx.maze.battleRewards(star);
        ctx.body.items = battle; // 挑战奖励
        ctx.maze.star += star;
        ctx.role.addItemsNoSave(battle);
        // 新增标记-记录累计获得星星数量
        ctx.role.addItemsNoSave({gsid:90608,count:star})
        // 新增标记-记录累计获得星星数量-月度任务
        ctx.role.addItemsNoSave({gsid:90609,count:star})
        // 每日挑战胜利次数
        ctx.role.addItemsNoSave({gsid:90614,count:1})
        // 通关第一层记
        ctx.role.addItemsNoSave({ gsid: 90463, count: 1 }, { main: 'maze', sec: 'add mark' });
        // 事件标记-记录远征击败怪物数量
        ctx.role.dispatchEvent('EVENT_MAZE' , 1 , {type: 'nmaze_chapter', mapid:ctx.maze.mapid });
        await global.dao.warorder.point(ctx.role, 90572);  // 卧龙战令-终极任务-远征击杀怪物
        await ctx.role.missionInvoke('MAZE_CHALLENGE_WIN');

        ctx.body.boxreward = ctx.maze.mapboxRewards();
        ctx.maze.boxreward = ctx.body.boxreward;
        if(!ctx.maze.boxreward){ // 没有 箱子，则出卡片
            ctx.body.cardlist = ctx.maze.randomCards();
            ctx.maze.cardlist = ctx.body.cardlist;
        }
        if (global.gameconfig.nmaze.MAP[ctx.maze.mapid]) { // 拥有下一关
            ctx.maze.mapid++;
            await ctx.maze.refreshTarget(); // 刷新对手

        } else {
            ctx.maze.ispass = 1;
            // 最后一关,发放商品
            let shop_cache = await ctx.dao.c_shop.findOne({rid: ctx.role._id, type: 'maze'});
            if(!shop_cache) {
                shop_cache = new ctx.dao.c_shop({rid: ctx.role._id, type: 'maze'});
            }
            shop_cache.refresh = Date.now();
            await shop_cache.refreshGoods(ctx.role, true);
        }

        await ctx.maze.save();
    }
    await ctx.role.save();
    if (ctx.body.result.ret === 'win') await ctx.role.zhenbaoMissionInvoke({missionName: 'NMAZE_STAR', count: star});
}
