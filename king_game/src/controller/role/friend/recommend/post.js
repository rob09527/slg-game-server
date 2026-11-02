
'use strict'
const { between } = require('./../../../../util/random');
const ObjectId = require("mongoose").Types.ObjectId;
const { roleLevel, roleVip } = require("../../../../util/rolecal");

// 推荐好友列表
module.exports = exports = async function (ctx, next) {
    // 不需要出现的id
    let $nin = ctx.role.friends;
    $nin.push(ctx.role.i());
    $nin = $nin.map(_id => ObjectId(_id));
    //  查找在线玩家,100个在线玩家，去除自己和自己的好友
    let $match = {
        _id: {
            $nin
        },
        'hide.38001.count': {
            $gte: global.gameconfig.roleexp.slice(0,8).reduce((sum, cur) => sum + cur, 0),
        },
        update: {
            $gt: Date.now() - 30 * 60 * 1000,
        },
        rname:{$exists:1},
        servid: {
            $in: ctx.role._gameserv.group_sid_list
        }
    }
    let $sort = {
        update: -1,
    }
    let $limit = 100;
    let $project = {
        iconid: 1, frameid: 1, headid: 1,
        rname: 1, _power: 1, update: 1,
        rno: 1,
        'hide.38001': 1, 'hide.38003': 1,
        'set': 1,
    }
    // 数据采样
    let $sample = {
        size: 10,
    }
    let needArr = await ctx.dao.role.aggregate([
        {$match},
        {$sort},
        {$limit},
        {$sample},
        {$project},
    ]);
    // 整理客户端需要数据

    let user = {};
    let returnData = [];

    for (let info of needArr) {
        // 查玩家的信息
        user = {};
        user.iconid = info.iconid;
        user.frameid = info.frameid;
        user.headid = info.headid;
        user.rname = info.rname;
        user.vip = roleVip(info.hide['38003'] ? info.hide['38003'].count : 0);
        user.set = info.set;
        user.id = info._id;
        user.lasttime = info.update; // 最后在线时间戳
        user.power = info._power;
        user.level = roleLevel(info.hide['38001'] ? info.hide['38001'].count : 0);// 玩家的level
        returnData.push(user);
    }

    ctx.body = returnData;
}
