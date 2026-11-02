
'use strict'
// 特殊事件接口,使用、消耗[神秘绿洲(type5)，七星灯(type9)，天师左慈(type6),招募武将(type7)]
module.exports = exports = async (ctx, next) => {
    let { type, index, pos, row = -1 } = ctx.request.body;
    let typeList = [5, 6, 7, 9];
    ctx.assert(typeList.includes(type), 'invalid type');
    ctx.assert(pos >= 0 && pos <= 2, 'invalid pos');
    if (row != -1) ctx.assert(row == ctx.nowchapter.row + 1, 'pos err');
    let node;
    if (type != 9) {
        node = ctx.nowchapter.nodes[ctx.nowchapter.row + 1][pos];
        ctx.assert(node, 'invalid node');
        ctx.assert((type != 9 && node.type == type) || (type == 9), 'no type');
    }
    let finish = false;
    switch (type) {
        case 5:
            // 获取武将血量缓存
            let gcache = ctx.mazeInfo.gcache || {};
            for (let g in gcache) {
                let obj = gcache[g] || {};
                // 回复5000血量
                if (obj.hp > 0 && obj.hp < 10000) {
                    obj.hp = Math.min(obj.hp + 5000, 10000);
                }
                gcache[g] = obj;
            }
            ctx.mazeInfo.gcache = gcache;
            ctx.mazeInfo.markModified('gcache');
            await ctx.mazeInfo.save();
            finish = true;
            break;
        case 6:
            let gcacheList = ctx.mazeInfo.gcache;
            let obj = Object.keys(gcacheList).sort((a, b) => gcacheList[a].hp - gcacheList[b].hp);
            for (let ghp in gcacheList) {
                if (ghp == obj[0]) {
                    gcacheList[ghp].hp = 10000;
                }
            }
            ctx.mazeInfo.gcache = gcacheList;
            ctx.mazeInfo.markModified('gcache');
            await ctx.mazeInfo.save();
            finish = true;
            break;
        case 7:
            // index 表示招募的武将下标
            let general = node.generals[index];
            ctx.assert(general, 'invalid index');
            // 选中了武将
            // 更新临时武将的数据,改成type 为'maze'类型,用于显示给玩家
            await global.dao.tempgeneral.updateOne({ _id: general._id }, { $set: { type: 'maze' } });
            node.getgeneral = general.gsid;
            node.generals = []; // 选了武将则把该值辅空
            ctx.nowchapter.nodes[ctx.nowchapter.row + 1][pos] = node;
            finish = true;
            break;
        case 9:
            // 扣七星灯数量 (30103)
            let isfirst = false;
            if (ctx.role.getProp(90529) == 0) {
                isfirst = true;
                // 持有远征赏金阁特权,每轮免费使用一次七星灯
                ctx.role.addItemsNoSave({ gsid: 90529, count: 1 });
                await ctx.role.save();
            } else {
                ctx.role.castItemsNoSave({ gsid: 30103, count: 1 }, { main: 'maze', sec: 'event use' });
                await ctx.role.save();
            }
            let gcachelist = ctx.mazeInfo.gcache;
            // 临时武将添加到上阵阵容的缓存里
            let tempgenerals = await ctx.dao.tempgeneral.find({ rid: ctx.role._id, type: 'maze' }, { _id: 1 });
            for (let g of tempgenerals) {
                gcachelist[g._id] = { hp: 0, mp: 0 };
            }
            const mygeneralMap = await ctx.role.findGenerals();
            for (let mg in mygeneralMap) {
                let g = mygeneralMap[mg];
                if (g.soulbind.level >= 40) gcachelist[g._id] = { hp: 0, mp: 0 };
            }
            for (let gl in gcachelist) {
                gcachelist[gl].hp = 10000;
                gcachelist[gl].mp = 1000;
            }
            if (!isfirst) {
                // 加特殊buf
                // 不是免费使用的七星灯则可以加buff
                const SPECIALBUF = global.gameconfig.others.MAZE.SPECIALBUF;
                let myspbuf = ctx.mazeInfo.specialbuf;
                for (let buf in SPECIALBUF) {
                    myspbuf[buf] = myspbuf[buf] || 0;
                    myspbuf[buf] += SPECIALBUF[buf]
                }
                ctx.mazeInfo.specialbuf = myspbuf;
                ctx.mazeInfo.markModified('specialbuf');
            }
            ctx.mazeInfo.gcache = gcachelist;
            ctx.mazeInfo.markModified('gcache');
            await ctx.mazeInfo.save();
            break;
    }
    // 保存节点
    if (finish) {
        node.state = 1;
        node.finish = Date.now();
        // 改变位置
        ctx.nowchapter.row++;
        ctx.nowchapter.pos = pos;
        ctx.nowchapter.markModified('nodes');
        await ctx.nowchapter.save();
    }
    // 查询临时武将列表
    let tempgeneral = await ctx.dao.tempgeneral.find({ rid: ctx.role._id, type: "maze" });
    // 返回玩家的武将详情
    // 查封地加成数据
    let building = await ctx.dao.newmanor.findOne({ rid: ctx.role._id });
    if (building) ctx.role.manorbuildingBuf = await building.buildingBuf();
    tempgeneral = tempgeneral.map((g) => {
        g._role = ctx.role;
        return g.base()
    });
    ctx.body = {
        gcache: ctx.mazeInfo.gcache,
        tempgeneral
    }
}
