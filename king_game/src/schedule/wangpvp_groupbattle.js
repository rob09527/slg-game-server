
/*
 
 国王战-小组赛
 64-32-16-8。
 保存录像
*/

'use strict'

const moment = require('moment');
const tg = require('./../util/textgetter');
const _ = require('lodash');
exports.name = "王战-小组赛战斗";
exports.cron = "0,05,08 19 * * 5";// 每周五19点开始 0分 5分 8分执行一次

exports.main = async function () {

    // 开服时间
    const serv_groups = await global.dao.gameserver.fetchServers();
    for (const group of serv_groups) {
        const groupid = group._id;
        let startTime = moment(`${group.start}`).add(2, 'day').valueOf();
        let friday = moment().isoWeekday(5).startOf('days').valueOf();
        let time;
        // if (Date.now() > startTime) {
        //     if (moment().startOf('days').valueOf() <= friday) {
        //         // 周五日期
        //         time = friday;
        //     }
        // } else {
        //     // 开服时间是这两天内
        //     if (startTime <= friday) {
        //         time = friday;
        //     }
        // }
        // if (!time) {
        //     console.log(`WANGPVP GROUP NO OPEN,SERVER START TIME`, new Date(group.start).format());
        //     continue;
        // }
        const wangpvprankConfig = global.gameconfig.wangpvprank;
        // 取出当前的最大的进度,只有1-3进度才能在这个定时执行
        let maxprogress = await global.dao.wangpvp.find({ groupid }, { progress: 1, groupid: 1 }).sort({ progress: -1 }).limit(1);
        console.log('maxprogress',maxprogress)
        if (maxprogress.length == 0) {
            console.log('WANGPVP GROUP NO DATA', groupid, maxprogress.length);
            continue;
        }
        if (maxprogress.length > 0 && ![1, 2, 3].includes(maxprogress[0].progress)) {
            console.log('WANGPVP GROUP 当前progress在group赛制不能执行,progress', groupid, maxprogress[0].progress);
            continue;
        }
        // 进度
        let progress = maxprogress[0].progress;// 64强进度
        // 判断在整个国王战-小组赛的进度,progress在小组赛初始值为1,可以根据小组赛轮数+1,记录整个冠军赛的进度
        progress = progress + 1;// 晋级后的进度
        // 获取战区里面的站位挑战记录
        let groupInfo = await global.dao.wangpvprecord.findOne({ groupid, format: 'group' }, { record: 1, round: 1, finish: 1, standing: 1 });
        // 有finish字段表示已经打完。说明已经打完小组赛了
        if (!groupInfo || (groupInfo && groupInfo.finish)) {
            console.log('WANGPVP GROUP 国王战-小组赛已结束', groupid);
            continue;
        };
        // 根据轮数取出对阵的阵容,开始计算
        let challengeGroup = groupInfo.record;
        let challengeStanding = groupInfo.standing;
        // 计算每个组
        for (let standing in challengeGroup) {
            let challengArr = challengeGroup[standing];
            if (!challengArr) continue;
            // 这一小组的这个轮次
            let innerArr = challengArr[groupInfo.round];
            // 如果有vedioid 说明已经挑战过了。跳过
            let vedios = innerArr.map(({ vedioid }) => vedioid).filter(g => g);
            if (vedios.length != 0) continue;
            // 存下一个挑战站位
            let nextstanding = [];
            for (let arr of innerArr) {
                console.log('arr', arr);
                // arr {lmark:1,lrid:5jjjj,'trid',tmark:2}
                let role = await global.dao.role.findOne({ _id: arr.lrid });
                let trole = await global.dao.role.findOne({ _id: arr.trid });
                let player = await role.avatarInfo();
                let target = await trole.avatarInfo();
                // 发起方
                player.bslist = [];
                for (let i = 1; i <= 3; i++) {
                    let bs_mark = `wangpvp${i}`;
                    if (!role.battlearr[bs_mark]) continue;
                    let bs = await role.getBattleSet(bs_mark);
                    bs.index = i - 1;
                    player.bslist.push(bs);
                }
                //如果这里player.bslist 为空则给他设置防守阵容
                if (player.bslist.length == 0) {
                    console.log('player,取pvpdef,阵容了');
                    let player_pvpdef = await role.getBattleSet('pvpdef');
                    if (Object.keys(player_pvpdef.team).length == 0) {
                        console.log('player,取normal,阵容了');
                        let player_normal = await role.getBattleSet('normal');
                        player.bslist.push(player_normal);
                    } else {
                        player.bslist.push(player_pvpdef);
                    }
                }

                // 右边
                target.bslist = [];
                for (let i = 1; i <= 3; i++) {
                    let bs_mark = `wangpvp${i}`;
                    if (!trole.battlearr[bs_mark]) continue;
                    let bs = await trole.getBattleSet(bs_mark);
                    bs.index = i - 1;
                    target.bslist.push(bs);
                }
                //如果这里target.bslist 为空则给他设置防守阵容
                if (target.bslist.length == 0) {
                    console.log('target,取pvpdef,阵容了');
                    let target_pvpdef = await trole.getBattleSet('pvpdef');
                    if (Object.keys(target_pvpdef.team).length == 0) {
                        console.log('target,取normal,阵容了');
                        let target_normal = await trole.getBattleSet('normal');
                        target.bslist.push(target_normal);
                    } else {
                        target.bslist.push(target_pvpdef);
                    }
                }
                // 发起战斗请求
                let mark = {
                    targetid: trole._id,
                }
                let battle = new global.dao.c_battle({
                    rid: role._id,
                    type: 'wangpvp',
                    player,
                    enemy: target,
                    mark: JSON.stringify(mark),
                })
                battle.season.left = player.level;
                battle.season.right = target.level;
                await battle.save();
                let videolist, win, version
                try {
                    ({
                        videolist,
                        version,
                        win
                    } = await battle.calmulti());
                } catch (log) {
                    console.log(`WANGPVP log ,战斗异常,${groupid},battleid:${battle._id}`, log);
                    let rbsetpower = 0;
                    let tbsetpower = 0;
                    for (let i = 1; i <= 3; i++) {
                        rbsetpower += role._powerbattleset[`wangpvp${i}`] || 0;
                        tbsetpower += trole._powerbattleset[`wangpvp${i}`] || 0;
                    }
                    // 如果王战没有阵容,又失败了。根据防守阵容战斗力判断输赢
                    if (rbsetpower == 0) rbsetpower = role._powerbattleset[`pvpdef`] || 0;
                    if (tbsetpower == 0) tbsetpower = trole._powerbattleset[`pvpdef`] || 0;
                    if (rbsetpower > tbsetpower) {
                        win = 'win';
                    } else {
                        win = 'lose'
                    }
                    videolist = 'fade';
                    version = 0;
                }

                // 保存录像格式
                let myVideo = await global.dao.video.create({
                    type: 'wangpvp',
                    video: JSON.stringify(videolist),
                    version
                })
                let vid = myVideo._id.toString();
                // 挑战结果
                arr.result = win;
                arr.vedioid = vid;

                if (win == 'win') {
                    // 修改左边玩家的进度
                    let cond = {
                        rid: role._id
                    };
                    let udp = {
                        $set: {
                            progress,
                            'update': Date.now()
                        }
                    }
                    // 修改右边玩家的进度
                    let cond1 = {
                        rid: trole._id
                    }
                    let udp1 = {
                        $set: {
                            isout: Date.now(),
                            'update': Date.now()
                        }
                    }
                    await global.dao.wangpvp.updateOne(cond, udp);
                    await global.dao.wangpvp.updateOne(cond1, udp1);
                    // 把玩家的mark记录下来
                    nextstanding.push(arr.lmark);
                } else {
                    // 对手晋级
                    // 修改左边玩家的进度
                    let cond = {
                        rid: role._id
                    };
                    let udp = {
                        $set: {
                            isout: Date.now(),
                            'update': Date.now()
                        }
                    }
                    // 修改右边玩家的进度
                    let cond1 = {
                        rid: trole._id
                    }
                    let udp1 = {
                        $set: {
                            progress,
                            'update': Date.now()
                        }
                    }
                    await global.dao.wangpvp.updateOne(cond, udp);
                    await global.dao.wangpvp.updateOne(cond1, udp1);
                    nextstanding.push(arr.tmark);
                }
                console.log(`pvp打完-->${arr.lmark},${arr.tmark}`)
            }
            // 更新本次挑战记录
            challengArr[groupInfo.round] = innerArr;
            challengeGroup[standing] = challengArr;
            let nextArr = [];
            console.log('nextstanding', nextstanding)
            // 判断晋级人数,不等于2位则除以2分组
            if (nextstanding.length != 2 && nextstanding.length % 2 == 0) {
                nextArr = _.chunk(nextstanding, nextstanding.length / 2);
                nextArr = nextArr.map(arr => arr.join('_'));
            } else if (nextstanding.length == 2) {
                // 等于2
                nextArr = [nextstanding.join('_')];
            } else if (nextstanding.length == 1) {
                // 小组冠军
                nextArr = nextstanding;
            }
            console.log('下一轮挑战站位', nextArr);
            //保存下个轮次挑战站位
            challengeStanding[standing].push(nextArr);
            // 保存下个轮次挑战记录(无vedioid),拼接数据
            if (nextstanding.length != 1) {
                // 整理数据
                let dataArr = [];
                for (let j = 0; j < nextArr.length; j++) {
                    let infos = nextArr[j].split('_');
                    console.log('infos', infos);
                    // 把0和1下标的玩家找出来
                    let role = await global.dao.wangpvp.findOne({ mark: infos[0], groupid });
                    let target = await global.dao.wangpvp.findOne({ mark: infos[1], groupid });
                    dataArr.push({
                        lrid: role.rid,
                        lmark: role.mark,
                        trid: target.rid,
                        tmark: target.mark
                    })
                }
                // 下一场战斗
                challengeGroup[standing].push(dataArr);
            }
        }
        let udpRecord = {
            $set: {
                record: challengeGroup,
                standing: challengeStanding,
                update: Date.now(),
                round: groupInfo.round + 1
            }
        };
        // 如果结束了小组赛则设置为完成
        if (progress == 4) {
            udpRecord['$set']['finish'] = Date.now();
        }
        // 更新小组赛信息
        await global.dao.wangpvprecord.updateOne({ groupid, format: 'group' }, udpRecord);
        // 给淘汰的玩家发送奖励邮件
        // 发邮件,小组
        let outList = await global.dao.wangpvp.find({ groupid, isout: { $exists: true }, progress: progress - 1 }, { rid: 1 });
        if (outList.length > 0) {
            let insertArr = [];
            for (let list of outList) {
                let obj = {
                    rid: list.rid,
                    title: tg(`WANGPVP_GROUP_${progress - 1}T`),
                    content: tg(`WANGPVP_GROUP_${progress - 1}C`),
                    rewards: wangpvprankConfig[`GROUP_${progress - 1}`],
                    model: "wangpvp",
                    finish: 0, // 初始化为0
                }
                insertArr.push(obj);
            }
            if (insertArr.length > 0) global.dao.dealymail.insertMany(insertArr);
        }

        // 小组赛赛程结束则插入冠军赛的挑战信息
        if (progress == 4) {
            // 继续分组,分组的时候先取出来排序再分组
            let nextList = await global.dao.wangpvp.find({ groupid, isout: { $exists: false }, progress: 4 }, { rid: 1, mark: 1 });
            let nextuidList = nextList.map(({ mark }) => mark);
            nextuidList = _.shuffle(nextuidList); // 默认从小到大
            // 划分1组
            nextuidList = _.chunk(nextuidList, 2);
            let standings = {};
            let record = {};
            let dataArr = [];
            let standingarr = [];
            // 记录小组赛的站位信息
            for (let i = 0; i < nextuidList.length; i++) {
                let infos = nextuidList[i];
                let groupArr = nextuidList[i].join('_');
                // 整理数据
                standingarr.push(groupArr);
                // 把0和1下标的玩家找出来
                let role1 = nextList.find(({ mark }) => mark == infos[0]);
                let role2 = nextList.find(({ mark }) => mark == infos[1]);
                dataArr.push({
                    lrid: role1.rid,
                    lmark: role1.mark,
                    trid: role2.rid,
                    tmark: role2.mark
                })

            };
            // 放入站位对象里
            standings[0] = standings[0] || [];
            standings[0].push(standingarr);
            // 放入挑战记录对象里
            record[0] = record[0] || [];
            record[0].push(dataArr)
            // 保存小组赛站位记录
            await global.dao.wangpvprecord.create({
                record,
                standing: standings,
                format: 'king',
                groupid
            });
        }
    }
}
exports.check = async function () {
    return true;
}