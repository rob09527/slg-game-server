
'use strict'

const { hitHere } = require("../../../../../../../../util/weektarget");

// 战斗完成
module.exports = exports = async (ctx, next) => {
    let { battleid } = ctx.request.body;
    let battle = await ctx.dao.c_battle.findOne({ _id: battleid });
    ctx.assert(battle, 'invalid battleid');

    await battle.cal();
    let ret = battle.result;
    // 节点下标位置和类型
    let [nodePos, type] = battle.mark.split('_');

    ctx.body = { result: ret };
    let gcache = ctx.mazeInfo.gcache || {};
    // save player hppercent and mp
    for (const pos in ret.lper) {
        let { guid } = battle.player.team[pos];
        gcache[guid] = gcache[guid] || {};
        gcache[guid].hp = parseInt(ret.lper[pos]);
    }
    for (const pos in ret.lmp) {
        let { guid } = battle.player.team[pos];
        gcache[guid] = gcache[guid] || {};
        gcache[guid].mp = ret.lmp[pos] || 0;
    }

    let node = ctx.nowchapter.nodes[ctx.nowchapter.row + 1][nodePos];
    // save targets hppercentand mp
    if (ret.ret != 'win') {
        ctx.assert(node, 'invliad node');
        // 自身的血量和蓝量设为0,也有超时输了的情况
        for (let pos in ret.lper) {
            let { guid } = battle.player.team[pos];
            gcache[guid] = gcache[guid] || {};
            gcache[guid].hp = 0;
            gcache[guid].mp = 0;
        }
        node.cache = node.cache || {};
        for (const pos in ret.rhp) {
            node.cache[pos] = node.cache[pos] || {};
            node.cache[pos].hp = ret.rhp[pos];
        }
        // 存hppercent
        for (const pos in ret.rper) {
            node.cache[pos] = node.cache[pos] || {};
            node.cache[pos].hppercent = ret.rper[pos];
        }
        for (const pos in ret.rmp) {
            node.cache[pos] = node.cache[pos] || {};
            node.cache[pos].mp = ret.rmp[pos];
        }
    }
    ctx.mazeInfo.gcache = gcache;
    ctx.mazeInfo.markModified('gcache');
    ctx.body.damge = ret.rlosthp // 伤害值
    type = parseInt(type);
    // 战斗胜利事件或者是（类型4神秘洞窟事件,不论输赢只战斗一次）
    if (ret.ret === 'win') {
        ctx.role.addItemsNoSave(node.boxitems, { main: 'maze', sec: 'challenge finish' });
        ctx.role.missionInvoke('MAZE_CHALLENGE_WIN');
        ctx.body.kill = 1;// 击杀
        ctx.body.rewards = node.boxitems; // 奖励
        let types = [0, 1, 2];
        if (types.includes(type)) {
         //   node.cardlist = await ctx.mazecards.randomcard({ cardsNum: 3, eventnum: type });
            node.cardlist = [1,2,3]; // 假数据
        }
        // 翻牌奖励
        if (type == 2) {
            node.fanpairewards = await ctx.role.fanPai('maze');
            let tmp = node.fanpairewards.filter(item => !!item.real);
            let rewards = tmp.map(({ GSID, COUNT }) => {
                return { GSID, COUNT }
            });
            ctx.role.addItemsNoSave(rewards, { main: 'maze', sec: 'challenge finish' });
        }

        // 类型3还会获得招降武将的奖励
        if (type == 3) {
            // 获得招募武将,设置类型
            await global.dao.tempgeneral.updateOne({ _id: node.generalinfo._id }, { $set: { type: 'maze' } });
            node.finish = Date.now();
        }
        // 只要不是事件4类型的战斗,战斗胜利则移动到该节点
        if (type != 4) {
            ctx.nowchapter.row++;
            ctx.nowchapter.pos = nodePos;
            ctx.nowchapter.nodes[ctx.nowchapter.row][nodePos] = node;
        }
        // 胜利后计算卡牌所需的数据,如胜利场数等
        // let cardbag = await ctx.mazecards.addcardparam({ type: 'maze' });
        let cardbag = [1,2,3]; // 移除卡牌造假数据
        ctx.mazecards.cardbag = cardbag;
        ctx.mazecards.markModified('cardbag');
        await ctx.mazecards.save();
    }
    // 类型4战斗结束则把节点设置为完成
    if (type == 4) {
        ctx.nowchapter.row++;
        ctx.nowchapter.pos = nodePos;
        node.finish = Date.now();
        ctx.nowchapter.nodes[ctx.nowchapter.row][nodePos] = node;
    }
    // 输了节点+1保存
    if (ret.ret === 'lose' && type != 4) {
        ctx.nowchapter.nodes[ctx.nowchapter.row + 1][nodePos] = node;
        // 特殊卡牌,本场使用一次的卡牌需要重新设置值
        // let cardbag = [...ctx.mazecards.cardbag];
        // for (let card of cardbag) {
        //     if (!!card.setparam) {
        //         card.param = [0];
        //     }
        // }
        // ctx.mazecards.cardbag = cardbag;
        // ctx.mazecards.markModified('cardbag');
        // await ctx.mazecards.save();
    }
    ctx.nowchapter.markModified('nodes');
    // 七日目标-击杀远征怪物数量
    hitHere(ctx.role, 94203, 1, true);
    if (ret.ret === 'win'){
        ctx.role.dispatchEvent('EVENT_MAZE' , 1 , {type: 'chapter', row: ctx.nowchapter.row});
        await global.dao.warorder.point(ctx.role, 90572);  // 卧龙战令-终极任务-远征击杀怪物
    }
    await ctx.role.save();
    await ctx.mazeInfo.save();
    await ctx.nowchapter.save();
    // 查询临时武将列表
    let tempgeneral = await ctx.dao.tempgeneral.find({ rid: ctx.role._id, type: "maze" });
    // 返回玩家的武将详情
    // 查封地加成数据
    let building = await ctx.dao.newmanor.findOne({ rid: ctx.role._id });
    if (building) ctx.role.manorbuildingBuf = await building.buildingBuf();
    tempgeneral = tempgeneral.map((g) => {
        g._role = ctx.role;
        return g.base();
    });
    // 返回节点信息
    ctx.body.node = node;
    ctx.body.gcache = gcache;
    ctx.body.tempgeneral = tempgeneral;
}
