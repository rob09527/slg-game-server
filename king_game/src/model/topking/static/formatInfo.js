'use strict'


const ms = require('ms');


const nextOpenBattleTime = (cron, progress) => {
    console.log('cron', cron);
    // 周五0点开始
    let time = {
        "0": cron + ms('1d') + ms('20h'),// 海选 周六20点
        "1": cron + ms('2d') + ms('20h'), // 小组1 
        "2": cron + ms('2d') + ms('21h'), // 小组2
        "3": cron + ms('3d') + ms('20h'), // 小组3
        "4": cron + ms('4d') + ms('20h'), // 冠军1
        "5": cron + ms('5d') + ms('20h'), // 冠军2
        "6": cron + ms('6d') + ms('20h')   // 冠军3
    }
    return time[progress];
}
/**
 * 查巅峰之战相关信息
 * @return {Promise<*|*>}
 */
module.exports = async function (servid, uid, warzone) {
    const cron = this.finishtime();
    let round = 0; // 即将开打的轮数
    let currtype = 1; // 1海选赛 2小组赛 3冠军赛
    let locktime; // 锁阵容时间;
    let time;    // 下次开战时间；
    let needstop; // 该字段有值则不给玩家进页面
    // 获取所在组所有服务器编号
    let $in = await global.dao.topkingservergroup.find({ areamark: warzone });
    $in = $in.map(({ servid }) => servid);
    // 取当前冠军赛最大的进度,用来判断下次挑战时间
    let maxprogress = await global.dao.topking.find({ servid: { $in } }, { progress: 1 }).sort({ progress: -1 }).limit(1);
    if (maxprogress.length == 0 || (maxprogress.length > 0 && maxprogress[0].progress == 7)) {
        time = -1;// 表示没有下一场战斗时间
        locktime = -1; // 也是没有下一场锁阵容时间
    } else if (maxprogress.length > 0 && maxprogress[0].progress != 7) {
        time = nextOpenBattleTime(cron, maxprogress[0].progress);
        locktime = time - ms('30m');
    }

    //区分游客与非游客
    let type = await global.dao.topking.findOne({ servid, uid });
    let seadata = [];
    // 查我海选组信息
    if (type && type.seanum >= 0) {
        // 表示有海选信息,查我所在组的成员信息
        let seauserlist = await global.dao.topking.find({ seanum: type.seanum, servid: { $in } });
        for (let user of seauserlist) {
            let obj = {
                uid: user.uid,
                servid: user.servid,
                score: user.cleanwinscore,
                win: user.seawin,
                lose: user.sealose
            }
            seadata.push(obj);
        }
    }
    // 查小组赛记录
    let groupdata = [];
    let groupInfo = await global.dao.topkingrecord.findOne({ format: "group", areamark: warzone }, { standing: 1, record: 1, finish: 1, round: 1 });

    if (groupInfo) {
        round = Math.min(groupInfo.round + 1, 3);
        currtype = 2;
        // 竞猜记录
        let lotteryrecord = await global.dao.lottery.find({ progress: { $in: [1, 2, 3] }, servid, uid, expire: { $exists: 0 }, iswin: { $exists: 1 } }, { battlemark: 1, iswin: 1 });
        for (let group in groupInfo.record) {
            let grecord = groupInfo.record[group]; // 小组赛组别的记录
            let players = []; // 找出本小组所有玩家
            for (let player of grecord[0]) {
                let obj = {
                    uid: player.uid,
                    servid: player.servid,
                    mark: player.lmark
                };
                let obj2 = {
                    uid: player.tuid,
                    servid: player.tservid,
                    mark: player.tmark
                }
                // 查询竞猜记录
                for (let record of lotteryrecord) {
                    let [left, right] = record.battlemark.split('_');
                    if (record.iswin) {
                        // 支持左边
                        if (player.lmark == left) {
                            obj.support = 1;
                        } else if (player.tmark == left) {
                            obj2.support = 1;

                        }
                    } else {
                        // 支持右边
                        if (player.lmark == right) {
                            obj.support = 1;
                        } else if (player.tmark == right) {
                            obj2.support = 1;
                        }

                    }
                }

                players.push(obj, obj2);
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
    }
    // 查冠军赛记录
    let kingdata = [];
    let kingInfo = await global.dao.topkingrecord.findOne({ format: "king", areamark: warzone }, { standing: 1, record: 1, finish: 1, round: 1 });
    if (kingInfo) {
        round = Math.min(kingInfo.round + 1, 3);
        currtype = 3;
        let lotteryrecord = await global.dao.lottery.find({ progress: { $in: [4, 5, 6] }, servid, uid, expire: { $exists: 0 }, iswin: { $exists: 1 } }, { battlemark: 1, iswin: 1 });
        let grecord = kingInfo.record[0]; // 冠军赛组别的记录
        let players = []; // 找出本小组所有玩家
        for (let player of grecord[0]) {
            let obj = {
                uid: player.uid,
                servid: player.servid,
                mark: player.lmark
            };
            let obj2 = {
                uid: player.tuid,
                servid: player.tservid,
                mark: player.tmark
            }
            // 查询竞猜记录
            for (let record of lotteryrecord) {
                let [left, right] = record.battlemark.split('_');
                if (record.iswin) {
                    // 支持左边
                    if (player.lmark == left) {
                        obj.support = 1;
                    } else if (player.tmark == left) {
                        obj2.support = 1;

                    }
                } else {
                    // 支持右边
                    if (player.lmark == right) {
                        obj.support = 1;
                    } else if (player.tmark == right) {
                        obj2.support = 1;
                    }
                }

            }
            players.push(obj, obj2);
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

    }
    // 如果round = 0;// 说明还没有记录,还在准备海选赛期间
    if (round == 0) round++;

    return {
        round,
        currtype,
        kingdata,
        groupdata,
        seadata,
        type: type ? 1 : 0,
        time,
        locktime,
        needstop
    }

}
