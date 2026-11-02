
'use strict'
// 武将重生-预览
module.exports = exports = async function (ctx, next) {

    // 返还的材料
    let items = [].concat(ctx.general.material('REBORN'));
    // 返回觉醒宝物数据
    if (ctx.general.treasure && ctx.general.treasure.length === 24) {
        let awake_treasure = await ctx.dao.awake_treasure.findOne({ _id: ctx.general.treasure });
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
        b = await b.base();
        b.count = 1;	// 前端显示兼容
        items.push(b);
    }
    // 返回魂石
    for (let s of ctx.general.stone) {
        let _s = await ctx.dao.soulstone.findOne({ _id: s });
        if (!_s) continue;
        _s = await _s.base();
        _s.count = 1;	// 前端显示兼容
        items.push(_s);
    }

    // 返回印记
    if(ctx.general.signet){
        for (let s of ctx.general.signet) {
            let _s = await ctx.dao.signet.findOne({ _id: s });
            if (!_s) continue;
            _s = await _s.base();
            _s.count = 1;	// 前端显示兼容
            items.push(_s);
        }
    }
   
    // 返回新坐骑
    const {SET_ON} = global.gameconfig.horsesetting;
    for(let i = 0; i < SET_ON; ++i ){
        let guid = ctx.general.horse.guids[i]
        if(guid){
            let horse = await ctx.role.findHorses(guid);
            if(horse){
                horse = await horse.base();
                horse.count = 1;	// 前端显示兼容
                items.push(horse);
            }
        }
    }
    // 返回灵宠
    if(ctx.general.pet.guid){
        let pet = await ctx.role.findPets(ctx.general.pet.guid);
        if(pet){
            pet = await pet.base();
            pet.count = 1;	// 前端显示兼容
            items.push(pet);
        }
    }

    // 读配置表判断返还武将数量
    let {
        // 本体武将数量
        STAR5_SELF: star5_self,
        // 5星同阵营武将数量
        STAR5_RANK: star5_rank,
        // 6星同阵营武将数量
        STAR6_RANK: star6_rank,
        // 9星同阵营武将数量
        STAR9_RANK: star9_rank,
        // 10星同阵营武将数量
        STAR10_RANK: star10_rank
    } = global.gameconfig.generalbacknum[`STAR${ctx.star}`];
    // 读取本体gsid
    let star5_selfgsid = global.gameconfig.generalself[ctx.general.gsid].SELF_5;
    ctx.assert(star5_selfgsid, 'star5 self err');
    // 组武将预览数据给客户端
    let general = [
        {
            gsid: star5_selfgsid,
            count: star5_self
        },
        {
            star: 5,
            count: star5_rank
        },
        {
            star: 6,
            count: star6_rank
        },
        {
            star: 9,
            count: star9_rank
        }
    ]
    if(star10_rank){
        general.push({
            star: 10,
            count: star10_rank
        })
    }
    ctx.body = {
        items,
        general
    };
}