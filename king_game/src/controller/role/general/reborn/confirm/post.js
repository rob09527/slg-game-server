'use strict'
const moment = require('moment');
// 武将重生-确定
module.exports = exports = async function (ctx, next) {
    let { guid } = ctx.request.body;
    let rebornConfig = global.gameconfig.generalreborn[`STAR${ctx.star}`];
    ctx.assert(rebornConfig, 'rebornConfig err');
    // 扣除需要消耗的道具
    ctx.role.castItemsNoSave(rebornConfig.COST, { main: 'general', sec: 'reborn' });
    // 保存日志
    let logs = {};
    logs[guid] = [ctx.general.gsid, ctx.general.level, ctx.general.class];

    let g = global.gameconfig.general[ctx.general.gsid];
    // 返还的材料
    let items = [].concat(ctx.general.material('REBORN'));
    let additems = []; // 直接增加的
    additems.append(items);
    let awake_treasure = ctx.general.treasure;
    // 获取觉醒宝物,并移除武将标记
    if (awake_treasure && awake_treasure.length === 24) {
        awake_treasure = await ctx.dao.awake_treasure.findOne({ _id: awake_treasure });
        await awake_treasure.updateOne({ $unset: { general: 1 } });
    } 
    // 返回觉醒武将数据
    if (awake_treasure && typeof awake_treasure === 'object') {
        awake_treasure = await awake_treasure.base();
        // 前端显示兼容
        awake_treasure.GSID = awake_treasure.gsid;
        awake_treasure.count = 1;
        items.push(awake_treasure);
    }
    // 返回兵书
    for (let b of ctx.general.book) {
        b = await ctx.dao.book.findOne({ _id: b });
        if (!b) continue;
        await b.updateOne({ $unset: { general: 1 } });
        b = await b.base();
        b.count = 1;	// 前端显示兼容
        items.push(b);
    }
    // 返回魂石
    for (let s of ctx.general.stone) {
        s = await ctx.dao.soulstone.findOne({ _id: s });
        if (!s) continue;
        await s.updateOne({ $unset: { general: 1 } });
        s = await s.base();
        s.count = 1;	// 前端显示兼容
        items.push(s);
    }

    // 返回印记
    if(ctx.general.signet){
    for (let s of ctx.general.signet) {
        s = await ctx.dao.signet.findOne({ _id: s });
        if (!s) continue;
        await s.updateOne({ $unset: { general: 1 } });
        s = await s.base();
        s.count = 1;	// 前端显示兼容
        items.push(s);
    }
    }
    
    // 返回新坐骑
    const {SET_ON} = global.gameconfig.horsesetting;
    for(let i = 0; i < SET_ON; ++i ){
        let horseguid = ctx.general.horse.guids[i]
        if(horseguid){
            let horse = await ctx.dao.horse.findOne({_id: horseguid});
            if(horse){
                horse.owner = '';
                horse.pos = -1;
				await horse.updateOne({$set: {owner: '', pos: -1}});
				horse = await horse.base();
				horse.count = 1;	// 前端显示兼容
				items.push(horse);
            }
        }
    }

    // 返回灵宠
    let petguid = ctx.general.pet.guid;
    if(petguid){
        let pet = await ctx.dao.pet.findOne({_id: petguid});
        if(pet){
            pet.owner = '';
			await pet.updateOne({$set: {owner: ''}});
			pet = await pet.base();
			pet.count = 1;	// 前端显示兼容
			items.push(pet);
        }
    }

    // 读配置表判断返还武将数量
    let starGeneralNum = global.gameconfig.generalbacknum[`STAR${ctx.star}`];
    ctx.assert(starGeneralNum, 'genral num config err')
    // 读返还武将配置表,筛选出本阵营的武将
    let generalbackList = global.gameconfig.generalback.filter((general) => {
        return general.CAMP == g.CAMP;
    });
    // 随机返还武将星级
    let startArr = [5, 6, 9, 10];
    for (let star of startArr) {
        // 统计星级武将数量
        let generalList = generalbackList.filter((general) => {
            return general.STAR == star;
        });
        ctx.assert(generalList.length > 0, 'generalList err');
        let num = starGeneralNum[`STAR${star}_RANK`];
        if (!num) {
            num === undefined && console.warn('star_rank config err')
            continue;
        }
        //放入指定星级数量武将
        while (num > 0) {
            let item = generalList[ctx.random.between(0, generalList.length - 1)];
            ctx.assert(item, 'general index err');
            items.push({ GSID: item.GSID, COUNT: 1, dontmark: 1 });
            additems.push({ GSID: item.GSID, COUNT: 1, dontmark: 1 })
            num--
        }
    }
    let self_general_num = starGeneralNum[`STAR5_SELF`];
    // 获取本体武将gsid
    let self_gsid = global.gameconfig.generalself[ctx.general.gsid];
    ctx.assert(self_gsid, 'no self gsid');
    // 本体武将增加
    // 公共方法暂不接受武将GSID使用COUNT
    for (let i = 0; i < self_general_num; i++) {
        items.push({ GSID: self_gsid.SELF_5, COUNT: 1, dontmark: 1 });
        additems.push({ GSID: self_gsid.SELF_5, COUNT: 1, dontmark: 1 })
    }
    // 增加物品增加
    ctx.role.addItemsNoSave(additems, { main: 'general', sec: 'reborn' });
    // 移除这个武将的排行信息
    ctx.dao.generalrank.removeRank([
        {
            guid,
            gsid: ctx.general.gsid,
            level: 1
        }
    ]);
    // 移除重生的武将
    await ctx.dao.general.remove({ _id: guid });
    let gen = ctx.role.destiny.general.find(value=>value && value.guid == guid);
    if (gen) {
        delete gen.guid;
        ctx.role.markModified('destiny.general');
    }
    
    await ctx.role.save();
    ctx.general = undefined;
    ctx.body = {
        items,
        castitems: rebornConfig.COST
    };
    // 日志打印
    if (logs[guid]) {
        let time = moment().format('YYYY-MM-DD HH:mm:ss');
        let [gsid, level, _class] = logs[guid];
        console.log('GENERAL', 'REBORN', ctx.role.uid, guid, gsid, _class, level, time);
        // 额外打印武将消耗日志，方便后台查询
        console.log(ctx.role.uid, ctx.role.rno, ctx.role.servid, 'CST', gsid, 1, time);
    }
}
