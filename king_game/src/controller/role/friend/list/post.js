'use strict';
let moment = require('moment')
// 好友列表
module.exports = exports = async function (ctx, next) {
    // ctx.role
    let returnData = await global.services.FriendService.find("friend:"+ctx.role._id.toString());
    if(returnData && Object.keys(returnData).length) return  ctx.body = returnData;
    returnData = {}; // 返回客户端数据
    let time = Math.ceil((moment().endOf('day') .valueOf() - moment().valueOf()) / 1000);
    const {DAILYPSEND, DAILYPRECE} = global.gameconfig.others.FRIEND;
    returnData.maxcount = global.gameconfig.others.FRIEND.MAXFRIENDNUM;// 好友上限数量,暂时默认50
    returnData.arrfriend = [];
    returnData.dailypsend = DAILYPSEND;
    returnData.dailyprece = DAILYPRECE;
    let obj = {};
    let friend = '';
    const friends = await ctx.dao.role.find({_id: {$in: ctx.role.friends}}, {
        others: 0, props: 0, act: 0, special: 0,
    });
    const frids = friends.map(f => f._id.toString());
    // 删除不存在的好友(合服导致)
    if(frids.length < ctx.role.friends.length) {
        for(let i = 0; i < ctx.role.friends.length; i++) {
            if(!frids.includes(ctx.role.friends[i])) {
                ctx.role.friends.splice(i, 1);
                i--;
            }
        }
        await ctx.role.save();
    }
    //TODO fpoint 缓存 5分钟
    let psendmap = await global.services.FriendService.find("psendmap:"+ctx.role._id.toString());
    if(!psendmap || Object.keys(psendmap).length == 0) {
        psendmap = {};
        let psend = await ctx.dao.fpoint.find({rid: ctx.role._id.toString(), to: {$in: frids}}, {to: 1});
        psend.forEach(p => {
            psendmap[p.to] = p;
        });
        await global.services.FriendService.set("psendmap:"+ctx.role._id.toString(),psendmap,time);
    }
    let preceivemap =await global.services.FriendService.find("preceivemap:"+ctx.role._id.toString());
    if(!preceivemap || Object.keys(preceivemap).length == 0) {
        preceivemap = {};
        let preceive = await ctx.dao.fpoint.find({rid: {$in: frids},to: ctx.role._id.toString(),take: {$exists: false}},{rid: 1})
        preceive.forEach(p => {
            preceivemap[p.rid] = p;
        });
        await global.services.FriendService.set("preceivemap:"+ctx.role._id.toString(),preceivemap,time);
    }
    // const bindResult = await Promise.all([
    //     ctx.dao.fpoint.find({rid: ctx.role._id, to: {$in: frids}}, {to: 1}),
    //     ctx.dao.fpoint.find({
    //     rid: {$in: frids},
    //     to: ctx.role._id,
    //     take: {$exists: false},
    // }, {rid: 1})]);
    // const psend = bindResult[0];
    // psend.forEach(p => {
    //     psendmap[p.to] = p;
    // });
    // const preceive = bindResult[1];
    // preceive.forEach(p => {
    //     preceivemap[p.rid] = p;
    // });
    // 遍历该玩家的好友信息
    for (let i = 0; i < friends.length; i++) {
        obj = {};
        friend = friends[i];
        obj.iconid = friend.iconid;
        obj.vip = friend.vip;
        obj.set = friend.set;
        obj.headid = friend.headid;
        obj.frameid = friend.frameid;
        obj.rname = friend.name;
        obj.level = friend.level;
        obj.power = friend._power;
        obj.lasttime = friend.update;
        obj.isonline = friend.isonline; // @author awko 是否在线逻辑提出
        obj.id = friend._id.toString();
        obj.pstatus = {
            send: 0,
            receive: 0,
        };

        if (!psendmap[obj.id]) {
            obj.pstatus.send = 1;
        }
        if (preceivemap[obj.id]) {
            obj.pstatus.receive = 1;
        }
        // const boss = await ctx.dao.fboss.fetchBoss(friend._id);
        // if (boss) {
        //     const {bossid} = boss;
        //     const boss_config = global.gameconfig.fboss[bossid];
        //     if (boss_config) {
        //         obj.bosstime = boss.start + boss_config.MIN * 60 * 1000; // boss自动消失的时间戳
        //     }
        // }
        returnData.arrfriend.push(obj);
    }
    // 排序
    // 玩家最后登录时间排在最前面,在线玩家按照等级先后排序

    let sortArr = returnData.arrfriend;
    sortArr.sort((a, b) => {
        return b.lasttime - a.lasttime;
    });
    // 取出在线玩家
    let onlineArr = [];
    let offlineArr = [];
    for (let arr of sortArr) {
        if (arr.isonline) {
            // 在线
            onlineArr.push(arr);
        } else {
            offlineArr.push(arr);

        }
    }

    // 在线玩家等级排序
    onlineArr.sort((a, b) => {
        return b.level - a.level;
    });
    // 在线玩家与离线玩家合并
    returnData.arrfriend = onlineArr.concat(offlineArr);

    // TODO returnData
    global.services.FriendService.set("friend:"+ctx.role._id.toString(),returnData,time);
    ctx.body = returnData;
};
