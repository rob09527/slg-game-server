
'use strict'
// 获取竞猜信息接口
const moment = require('moment');
const ms = require('ms');

module.exports = exports = async (ctx, next) => {
    ctx.body = {}
    let support;
    let kingInfo = [];
    // 查冠军赛记录
    kingInfo = await ctx.dao.wangpvprecord.findOne({ groupid: ctx.role._gameserv.groupid, format: "king" }, { standing: 1, record: 1, finish: 1, round: 1 });
    let players = []; // 找出本小组所有玩家
    if (kingInfo) {
        let grecord = kingInfo.record[0]; // 冠军赛组别的记录
        // 查玩家是否有竞猜记录
        let betinfo = await ctx.dao.wangpvpguess.findOne({ rid: ctx.role._id }, { mark: 1 });
        // 所有竞猜的总数
        let bets = await ctx.dao.wangpvpguess.find({ groupid: ctx.role._gameserv.groupid }, { mark: 1 });
        // 查玩家是否是参赛选手
        let wang8 = await ctx.dao.wangpvp.find({ groupid: ctx.role._gameserv.groupid, progress: { $in: [4, 5, 6, 7] } }, { rid: 1, mark: 1, groupnum: 1, isout: 1, progress: 1 });
        let roleIds = wang8.map(({ rid }) => rid);
        let roles = await ctx.dao.role.find({ _id: { $in: roleIds } });
        // 计算各个比例的人数
        let numbers = {};
        for (let bet of bets) {
            numbers[bet.mark] = numbers[bet.mark] || 0;
            numbers[bet.mark] += 1
        }

        // 继续竞猜消耗
        for (let player of grecord[0]) {
            let role1 = roles.find(({ _id }) => _id.toString() == player.lrid);
            let lplayer = await role1.avatarInfo();
            lplayer.mark = player.lmark;
            lplayer.servid = role1.servid;
            let lplayer_wanginfo = wang8.find(({ mark }) => mark == player.lmark);
            // 是否被淘汰了
            lplayer.eliminate = lplayer_wanginfo.isout ? true : false;
            let role2 = roles.find(({ _id }) => _id.toString() == player.trid);
            let tplayer = await role2.avatarInfo();
            tplayer.mark = player.tmark;
            tplayer.servid = role2.servid;
            let tplayer_wanginfo = wang8.find(({ mark }) => mark == player.tmark);
            // 是否被淘汰了
            tplayer.eliminate = tplayer_wanginfo.isout ? true : false;
            // 判断玩家是否有竞猜
            if (betinfo && betinfo.mark == lplayer.mark) {
                lplayer.support = true;
            } else if (betinfo && betinfo.mark == tplayer.mark) {
                tplayer.support = true;
            }
            // 竞猜消耗
            lplayer.pay = ctx.wangguesspay;
            tplayer.pay = ctx.wangguesspay;
            // 支持率
            lplayer.supportrate = bets.length > 0 && numbers[lplayer.mark] > 0 ? (parseInt(numbers[lplayer.mark]) / bets.length).toFixed(2) : 0;
            tplayer.supportrate = bets.length > 0 && numbers[tplayer.mark] > 0 ? (parseInt(numbers[tplayer.mark]) / bets.length).toFixed(2) : 0;
            players.push(lplayer, tplayer);
        }
        // 竞猜信息下标
        if (betinfo) {
            support = players.findIndex(({ mark }) => mark == betinfo.mark);
        }
    }

    ctx.body = {
        kingdata: players,
        support
    };
}
