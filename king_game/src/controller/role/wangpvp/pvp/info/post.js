
'use strict'
// 获取国王赛的信息
const moment = require('moment');
const ms = require('ms');

module.exports = exports = async (ctx, next) => {
    ctx.body = {};
    let kingdata = [];
    let groupdata = [];
    // 查玩家是否是参赛选手

    // 缓存5分钟
    let wangs = await global.services.WangpvpService.find("wangpvp:pvp:" + ctx.role._gameserv.groupid);
    if (!wangs || Object.keys(wangs).length == 0) {
        wangs = await ctx.dao.wangpvp.find({ groupid: ctx.role._gameserv.groupid }, { rid: 1, mark: 1, groupnum: 1, isout: 1, progress: 1 });
        await global.services.WangpvpService.set("wangpvp:pvp:" + ctx.role._gameserv.groupid, wangs, 5 * 60);
    }

    let type = wangs.find(({ rid }) => rid == ctx.role._id);
    let roleIds = wangs.map(({ rid }) => rid);
    let roles = await ctx.dao.role.find({ _id: { $in: roleIds } }, {
        iconid: 1,
        frameid: 1,
        imageid: 1,
        headid: 1,
        level: 1,
        set: 1,
        servid: 1,
        hide: 1,
        others: 1,
        battlearr: 1,
        _powerbattleset: 1,
        mythical: 1,
        rname: 1
    });
    let time, needstop // time 下次开战时间 needstop 有该值则不给玩家进入国王战
    let round = 0; // 即将开打的轮数
    let currtype = 1; // 1小组赛 2冠军赛
    // 取当前国王战大的进度,用来判断下次挑战时间
    if (ctx.wangprogress) {
        time = nextopentime(ctx.wangprogress, ctx.role._gameserv.groupstart);
    } else {
        // 没有开过服,则提示下次开战的时间
        time = nextopentime(1, ctx.role._gameserv.groupstart);
    }
    // 获取小组赛记录

    let groupInfo = await global.services.WangpvpService.find("wangpvp:groupInfo:" + ctx.role._gameserv.groupid);
    if (!groupInfo || Object.keys(groupInfo).length == 0) {
        groupInfo = await ctx.dao.wangpvprecord.findOne({ groupid: ctx.role._gameserv.groupid, format: "group" }, { standing: 1, record: 1, finish: 1, round: 1 });
        await global.services.WangpvpService.set("wangpvp:groupInfo:" + ctx.role._gameserv.groupid, groupInfo, 5 * 60);
    }

    if (groupInfo) {
        round = Math.min(groupInfo.round + 1, 3);
        currtype = 1;
        groupdata = await global.services.WangpvpService.find("wangpvp:groupdata:" + ctx.role._gameserv.groupid);
        if (!groupdata || Object.keys(groupdata).length == 0) {
            groupdata = [];
            for (let group in groupInfo.record) {
                let grecord = groupInfo.record[group]; // 小组赛组别的记录
                let players = []; // 找出本小组所有玩家
                for (let player of grecord[0]) {
                    let role1 = roles.find(({ _id }) => _id.toString() == player.lrid);
                    let lplayer = await role1.avatarInfo();
                    lplayer.mark = player.lmark;
                    lplayer.servid = role1.servid;
                    lplayer.lname = await role1.lname();
                    let role2 = roles.find(({ _id }) => _id.toString() == player.trid);
                    let tplayer = await role2.avatarInfo();
                    tplayer.mark = player.tmark;
                    tplayer.servid = role2.servid;
                    tplayer.lname = await role2.lname();
                    players.push(lplayer, tplayer);
                }
                let vediolist = [];
                // 找出本组所有的录像记录
                for (let vedios of grecord) {
                    let list = [];
                    for (let v of vedios) {
                        if (v.vedioid) list.push(v.vedioid);
                    }
                    if (list.length > 0) vediolist.push(list);
                }
                // 站位记录
                let record = groupInfo.standing[group];
                // 组合起返回前端的数据
                let data = {
                    players,
                    record,
                    vediolist
                };
                groupdata.push(data);
            }
            await global.services.WangpvpService.set("wangpvp:groupdata:" + ctx.role._gameserv.groupid, groupdata, 5 * 60);
        }
    }
    // 查冠军赛记录
    let kingInfo = await global.services.WangpvpService.find("wangpvp:kingInfo:" + ctx.role._gameserv.groupid);
    if (!kingInfo || Object.keys(kingInfo).length == 0) {
        kingInfo = await ctx.dao.wangpvprecord.findOne({ groupid: ctx.role._gameserv.groupid, format: "king" }, { standing: 1, record: 1, finish: 1, round: 1 });
        await global.services.WangpvpService.set("wangpvp:kingInfo:" + ctx.role._gameserv.groupid, kingInfo, 5 * 60);
    }

    if (kingInfo) {
        round = Math.min(kingInfo.round + 1, 3);
        currtype = 2;
        let grecord = kingInfo.record[0]; // 冠军赛组别的记录
        let players = []; // 找出本小组所有玩家
        // 查玩家是否有竞猜记录
        kingdata = await global.services.WangpvpService.find("wangpvp:kingdata:" + ctx.role._id);
        if (!kingdata || Object.keys(kingdata).length == 0) {
            kingdata = [];
            let betinfo = await ctx.dao.wangpvpguess.findOne({ rid: ctx.role._id }, { mark: 1 });
            for (let player of grecord[0]) {
                let role1 = roles.find(({ _id }) => _id.toString() == player.lrid);
                let lplayer = await role1.avatarInfo();
                lplayer.mark = player.lmark;
                lplayer.servid = role1.servid;
                lplayer.lname = await role1.lname();
                lplayer.bsetpower = await role1.getBattlePower('wangpvp');
                if (lplayer.bsetpower == 0) lplayer.bsetpower = await role1.getBattlePower('pvpdef');
                let role2 = roles.find(({ _id }) => _id.toString() == player.trid);
                let tplayer = await role2.avatarInfo();
                tplayer.mark = player.tmark;
                tplayer.servid = role2.servid;
                tplayer.lname = await role2.lname();
                tplayer.bsetpower = await role2.getBattlePower('wangpvp');
                if (tplayer.bsetpower == 0) tplayer.bsetpower = await role2.getBattlePower('pvpdef');
                // 判断玩家是否有竞猜
                if (betinfo && betinfo.mark == lplayer.mark) {
                    lplayer.support = true;
                } else if (betinfo && betinfo.mark == tplayer.mark) {
                    tplayer.support = true;
                }
                players.push(lplayer, tplayer);
            }
            let vediolist = [];
            // 找出本组所有的录像记录
            for (let vedios of grecord) {
                let list = [];
                for (let v of vedios) {
                    if (v.vedioid) list.push(v.vedioid);
                }
                if (list.length > 0) vediolist.push(list);
            }
            // 站位记录
            let record = kingInfo.standing[0];
            // 组合起返回前端的数据
            let data = {
                players,
                record,
                vediolist
            };
            kingdata.push(data);
            await global.services.WangpvpService.set("wangpvp:kingdata:" + ctx.role._id, kingdata, 5 * 60);
        }

    }


    ctx.body = {
        kingdata,
        groupdata,
        type: type ? 1 : 0,
        currtype,
        round,
        time,
        needstop
    };
}

let nextopentime = (progress, groupstart) => {
    // 开服时间
    let startTime = moment(groupstart).add(2, 'days').valueOf();
    // 判断当前时间是否过了周四,没有过周四则本周四开打
    let friday = moment().isoWeekday(5).startOf('days').valueOf();
    let time;
    if (Date.now() > startTime) {
        if (moment().startOf('days').valueOf() <= friday) {
            // 周五日期
            time = friday;
        } else {
            // 下周五日期
            time = moment().isoWeekday(5).add(1, 'weeks').startOf('days').valueOf();
        }
    } else {
        // 开服时间是这两天内
        if (startTime <= friday) {
            time = friday;
        } else {
            // 开服时间在本周,则下周打
            time = moment().isoWeekday(5).add(1, 'weeks').startOf('days').valueOf();
        }
    }

    let needtime = {
        "1": time + ms('19h'),// 三个时间调为一致
        "2": time + ms('19h'),//三个时间调为一致
        "3": time + ms('19h'),//三个时间调为一致
        "4": time + ms('20h') + ms('30m'), // 8强时间
        "5": time + ms('20h') + ms('50m'),  // 4强时间
        "6": time + ms('21h') + ms('30m'),  // 决赛时间
        "7": time + ms('19h') // 下一轮开场时间
    }
    return needtime[progress];
}
