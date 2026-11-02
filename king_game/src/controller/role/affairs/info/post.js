'use strict'

require('rx-apiwheel');
/**
 * 赏金任务信息
 * @type {exports}
 * @author awko
 *
 */
module.exports = exports = async ctx => {
    const result = {};
    if (ctx.affairs) {
        const lastFreshDate = new Date(ctx.affairs.refresh);
        const now = new Date();
        if (now.getFullYear() !== lastFreshDate.getFullYear() ||
            now.getMonth() !== lastFreshDate.getMonth() ||
            now.getDate() !== lastFreshDate.getDate()
        ) {
            // 进行内政刷新
            await ctx.affairs.renew(true);
        }

    } else {
        // 第一次直接初始化内政
        ctx.affairs = new ctx.dao.affairs({rid: ctx.role._id});
        await ctx.affairs.renew(ctx.role);
    }

    result.mlist = ctx.affairs.missions;
    result.flist = ctx.affairs.friendsMissions ;
    const ownerId = ctx.role.i();
    const rids = [ownerId, ...(ctx.role.friends || [])]

    // 查询 boss列表,包括好友的 boss 列表
    result.blist = await ctx.dao.fboss.fetchBosses(rids, ownerId);

    // 下面关联好友信息
    const friendsRelated = new Set();
    result.blist = result.blist.map(bs => {
        friendsRelated.add(bs.rid);
        bs.roles && bs.roles.forEach(_ => friendsRelated.add(_.rid))
        return bs.base();
    });
    result.flist.forEach(item => item.friends && item.friends.forEach(a => friendsRelated.add(a)));
    const friendMap = {};
    // 一次查询 关联好友信息
    const frd = await ctx.dao.role.find({_id: {$in: [...friendsRelated]}}, {
        _id: 1, iconid: 1, headid: 1, frameid: 1,
        rno: 1, rname: 1, _power: 1, update: 1,
        "hide.38001": 1,
    }).limit(friendsRelated.size);
    frd.forEach(friend => friendMap[friend._id.toString()] = {
        id: friend._id.toString(),
        iconid: friend.iconid,
        headid: friend.headid,
        frameid: friend.frameid,
        rname: friend.name,
        level: friend.level,
        power: friend._power,
        lasttime: friend.update,
    });
    const fconfig = global.gameconfig.affairs_f || [];
    const fconfigMap = {};
    fconfig.forEach(c => fconfigMap[c.ID] = c);
    result.flist.forEach(item => {
        item.friends && (item.friends = item.friends.map(f => friendMap[f] || {}));
        item.power = fconfigMap[item.id] && fconfigMap[item.id].POWER;
        item.explorehour = fconfigMap[item.id] && fconfigMap[item.id].HOUR;
    });
    const bossConfig = global.gameconfig.battlefboss;
    result.blist.forEach(item => {
        item.role = friendMap[item.rid]; // 关联boss主人信息
        item.lastdamage = 0;
        item.bset = bossConfig[item.id];
        const cfg = global.gameconfig.fboss[item.id]|| {RACTIVE: [], RKILL: [], RCHALLENGE: []};
        item.active_rewards =  cfg.RACTIVE;
        item.kill_rewards =  cfg.RKILL;
        item.challenge_rewards =  cfg.RCHALLENGE;

        // 关联boss击杀信息
        item.roles && (item.roles = item.roles.map(r => {
            if (r.rid === ownerId) { // 击杀信息等于自己
                item.lastdamage = r.lastdamges; // 把自己最后的伤害赋值
                item.team = r.team; // 队伍信息返回
            }
            return {
                ...r,
                team: undefined,
                ...(friendMap[r.rid] || {})
            }
        }))
    });
    ctx.body = result;
}
