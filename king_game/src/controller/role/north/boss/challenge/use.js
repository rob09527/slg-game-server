'use strict';
const parseCron = require('../../../../../util/parse_cron');

module.exports = exports = async (ctx, next) => {

    await next();
    const groupid = ctx.role._gameserv.groupid;

    ctx.body.damge = ctx.all_damge;
    ctx.times = ctx.times || 1;

    const team = ctx.team;
    const {CONFIG: {CAST_VIT = 1}} = global.gameconfig.north_fight;
    const allCast = CAST_VIT * ctx.times;
    ctx.assert(team.vit >= allCast, 'vit limit');


    let out = [];
    for (let i = 0; i < ctx.times; i++) {
        const _items = ctx.config.CREWARDS.map(function (item) {
            return {
                GSID: item.GSID,
                COUNT: ctx.random.between(item.CCOUNT[0], item.CCOUNT[1]),
            };
        });
        out.push(..._items);
    }
    out = out.arrange();
    ctx.role.addItemsNoSave(out, {main: 'north', sec: 'boss'});

    ctx.body.items = out;
    // 更新伤害排行榜
    const upd = {
        $inc: {
            totaldamge: ctx.all_damge,
        },
        groupid
    };
    if (ctx.config.BOSSHP <= ctx.boss.totaldamge) {
        // 击杀奖励 是所有参与玩家领取，无效针对某一个玩家
        // upd.$push = {
        //     killrewards: ctx.config.REWARDS,
        // };

        ctx.boss.kill = Date.now();
        ctx.body.kill = 1;
        console.log('NORTH BOSS KILLED', ctx.role.rno, ctx.boss.mapid, ctx.boss.bossid, ctx.boss.auction);
        // 拍卖品掉落
        if (ctx.boss.auction) {
            // 计算得到 下次拍卖的开始时间
            const r = parseCron(global.gameconfig.auction.NORTH.START, global.gameconfig.auction.NORTH.KEEP_TIME * 1000);
            // 创建拍卖品
            const auction = await ctx.dao.auction.createAuction('north', {
                pool: [{POOL: ctx.boss.auction, COUNT: 1}],
                bounceList: [],
                COUNT: 1,
                start: r.NEXT_START_TIME,
                groupid
            });
            console.log('NORTH BOSS AUCTION', auction);
            ctx.body.auction = auction;
        }
    }

    await ctx.dao.north_rank.updateOne({rid: ctx.role.i(), state: false}, upd, {upsert: true});
    await ctx.role.save();
    const teamUpd = {$inc: {vit: -allCast}};
    // 如果 是最大体力扣除，把此刻作为体力计算的起点
    if (ctx.team.vit === global.gameconfig.north_fight.CONFIG.MAX_VIT){
        teamUpd.$set = {
            lastVitTime : Date.now()
        }
    }
    await ctx.dao.north_team.updateOne({_id: ctx.team._id}, teamUpd);
    ctx.boss.markModified('lastdamge.' + ctx.role._id);
    await ctx.boss.save();

};
