
'use strict'
const mazeConfig = global.gameconfig.mazechapter;
// 开始战斗
module.exports = exports = async (ctx, next) => {
    // 判断类型
    let { type, pos, row = -1 } = ctx.request.body;
    ctx.assert(type >= 0 && type <= 4, 'invalid type');
    ctx.assert(pos >= 0 && pos <= 2, 'invalid pos');
    if (row != -1) ctx.assert(row == ctx.nowchapter.row + 1, 'pos err');

    let monster = ctx.nowchapter.nodes[ctx.nowchapter.row + 1][pos];
    // 判断是否有前往
    ctx.assert(monster && monster.state == 1, 'node no select');
    // 判断该节点是否已完成
    ctx.assert(monster && !monster.finish, 'has finish');
    // 判断type类型
    let _type = monster.pvp ? 'mazepvp' : 'maze';
    // 取出阵容
    let player = await ctx.role.getBattleSet('maze');
    // 判断阵容是否为空
    ctx.assert(Object.keys(player.team).length > 0, 'invalid player');

    for (const guid in ctx.mazeInfo.gcache) {
        const info = ctx.mazeInfo.gcache[guid];
        for (const pos in player.team) {
            const general = player.team[pos];
            if (general.guid !== guid) continue;
            general.hppercent = info.hp;
            general.nowmp = info.mp;
        }
    }
    // 存入specailbuf
    for (let [pos, general] of Object.entries(player.team)) {
        general.specialbuff = [ctx.mazeInfo.specialbuf];
        player.team[pos] = general;
    }
    //let lcards = await ctx.mazecards.fetchcards({ gateid: ctx.nowchapter.gateid, type: 'maze' });
    let battle = new ctx.dao.c_battle({
        rid: ctx.role._id,
        type: _type,
        player,
        mark: [pos, type].join('_')
    });
    // 取出层系数
    let config = mazeConfig.find(node => node.ID == ctx.nowchapter.gateid);
    ctx.assert(config, 'maze config err');
    let bset = _type == 'mazepvp' ? monster.bset : monster.bset.team

    // monster.cache去除hppercent
    for (let pos in monster.cache) {
        delete monster.cache[pos].hppercent;
    }
    let right;
    if (_type == 'mazepvp') {
        // pvp敌方的血量
        for (const pos in bset.team) {
            if (!right) right = bset.team[pos].level;
            // 新远征(迷宫),传入剩余血量与剩余蓝量
            if (monster.cache && typeof monster.cache[pos] === 'object') {
                bset.team[pos].nowhp = monster.cache[pos].hp;
                bset.team[pos].nowmp = monster.cache[pos].mp;
            }
        }
    }

    // 传入层增长系数、步增长系数、vip战斗因子、步长
    await battle.createEnemy(bset, monster.cache, ctx.role.vipbattlefactor, ctx.levelfactor);
    if (right) battle.season.right = right;
    await battle.save();
    ctx.body =  battle.base()
}
