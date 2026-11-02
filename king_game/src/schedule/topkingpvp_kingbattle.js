'use strict'

const ms = require('ms');
const DELAY_INTERVAL = ms('7d');// 结束时间
const chunk = require('../util/array_chunk');

// 定时器
exports.name = "巅峰赛冠军赛";

let endDay;
exports.cron = async function () {
    let cron = global.dao.topking.finishtime();
    endDay = cron + DELAY_INTERVAL;
    // 判断是否是在冠军赛期间
    if (cron < Date.now() && Date.now() < endDay) {
        // 冠军赛
        cron = '0 20 * * 2,3,4';
    } else {
        cron = undefined;
    }
    return cron;
}

/**
 * @return {Promise<void>}
 */
exports.main = async function () {


    // 判断日期是否在执行区间
    if (Date.now() > endDay) {
        console.error('TOPKINGPVP FETCHBATTLESET NO IN THIS TIME');
        return;
    }

    // 冠军赛的战区分组标记
    let gmarklist = await global.dao.topkingservergroup.distinct('areamark');
    // 取出当前的最大的进度,只有4-6进度才能在这个定时执行
    let maxprogress = await global.dao.topking.find({}, { progress: 1 }).sort({ progress: -1 }).limit(1);
    if (!maxprogress.length) {
        console.error('当前progress 为空,king');
        return ;
    }else if (maxprogress.length > 0 && ![4, 5, 6].includes(maxprogress[0].progress)) {
        console.error('当前progress在group赛制不能执行,progress', maxprogress[0].progress);
        return;
    }
    // 进度
    let progress = maxprogress[0].progress;// 64强进度
    // 判断在整个冠军赛的进度,progress在冠军赛初始值为1,可以根据冠军赛轮数+1,记录整个冠军赛的进度
    progress = progress + 1;// 晋级后的进度
    for (let areamark of gmarklist) {
        // 获取所在组所有服务器编号
        let $in = await global.dao.topkingservergroup.find({ areamark });
        $in = $in.map(({ servid }) => servid);
        console.log('$in==>', $in);

        // 获取战区里面的站位挑战记录
        let kingInfo = await global.dao.topkingrecord.findOne({ areamark, format: 'king' }, { record: 1, round: 1, finish: 1, standing: 1 });
        // 有finish字段表示已经打完。说明已经打完冠军赛了
        if (!kingInfo || (kingInfo && kingInfo.finish)) continue;
        // 根据轮数取出对阵的阵容,开始计算
        let challengeGroup = kingInfo.record;
        let challengeStanding = kingInfo.standing;
        // 计算每个组
        for (let standing in challengeGroup) {
            let challengArr = challengeGroup[standing];
            if (!challengArr) continue;
            // 这一小组的这个轮次
            let innerArr = challengArr[kingInfo.round];
            // 如果有vedioid 说明已经挑战过了。跳过
            let vedios = innerArr.map(({ vedioid }) => vedioid).filter(g => g);
            if (vedios.length != 0) continue;
            // 存下一个挑战站位
            let nextstanding = [];
            for (let arr of innerArr) {
                console.log('arr', arr);
                // arr {'uid':xxx,'servid':1001,lmark:1,'tuid':'xxx','tsid':'1001',tmark:2}
                let role = await global.dao.topking.findOne({ uid: arr.uid, servid: arr.servid });
                let target = await global.dao.topking.findOne({ uid: arr.tuid, servid: arr.tservid });
                // 发起战斗请求
                let requestData = await global.dao.topking.battle({ role, target });
                let win, videolist, version;
                if (requestData.error) {
                    // 报错了,按照阵容战力,阵容战力高的为胜利方
                    console.log(requestData.error);
                    console.log('role', role);
                    console.log('target', target);
                    if (role.bsetpower > target.bsetpower) {
                        win = 'win';
                    } else {
                        win = 'lose'
                    }
                    videolist = 'fade';
                    version = 0;
                } else {
                    // 没报错
                    ({ win, videolist, version } = requestData);
                }

                // 挑战结果
                arr.result = win;
                arr.vedioid = requestData.vid;
                if (win == 'win') {
                    // 修改左边玩家的进度
                    let cond = {
                        servid: arr.servid,
                        uid: arr.uid,
                    };
                    let udp = {
                        $set: {
                            progress,
                            'update': Date.now()
                        }
                    }
                    // 修改右边玩家的进度
                    let cond1 = {
                        servid: arr.tservid,
                        uid: arr.tuid,

                    }
                    let udp1 = {
                        $set: {
                            isout: Date.now(),
                            'update': Date.now()
                        }
                    }
                    await global.dao.topking.updateOne(cond, udp);
                    await global.dao.topking.updateOne(cond1, udp1);
                    // 把玩家的mark记录下来
                    nextstanding.push(arr.lmark);
                } else {
                    // 对手晋级
                    // 修改左边玩家的进度
                    let cond = {
                        servid: arr.servid,
                        uid: arr.uid,
                    };
                    let udp = {
                        $set: {
                            isout: Date.now(),
                            'update': Date.now()
                        }
                    }
                    // 修改右边玩家的进度
                    let cond1 = {
                        servid: arr.tservid,
                        uid: arr.tuid,
                    }
                    let udp1 = {
                        $set: {
                            progress,
                            'update': Date.now()
                        }
                    }
                    await global.dao.topking.updateOne(cond, udp);
                    await global.dao.topking.updateOne(cond1, udp1);
                    nextstanding.push(arr.tmark);
                }
                console.log(`pvp打完-->role.mark:${role.mark};target.mark:${target.mark}`)
                // 竞猜结算(异步)
                let battlemark = role.mark + '_' + target.mark;
                // 结算发放奖励
                //  更新场次战斗结果
                let udpRet = global.dao.lotterybattle.updateResult.bind(global.dao.lotterybattle, battlemark, win, arr.vedioid);
                //  根据场次发放奖励对应竞猜单
                let balance = global.dao.lottery.balance.bind(global.dao.lottery, battlemark);
                Promise.resolve().then(udpRet).then(balance).catch(console.error);
            }
            // 更新本次挑战记录
            challengArr[kingInfo.round] = innerArr;
            challengeGroup[standing] = challengArr;
            let nextArr = [];
            // 判断晋级人数,不等于2位则除以2分组
            if (nextstanding.length != 2 && nextstanding.length % 2 == 0) {
                nextArr = chunk(nextstanding, nextstanding.length / 2);
                nextArr = nextArr.map(arr => arr.join('_'));
            } else if (nextstanding.length == 2) {
                // 等于2
                nextArr = [nextstanding.join('_')];
            } else if (nextstanding.length == 1) {
                // 记录最后的获胜者
                nextArr = nextstanding;
            }
            //保存下个轮次挑战站位
            challengeStanding[standing].push(nextArr);
            console.log('challengeStanding', challengeStanding);
            // 保存下个轮次挑战记录(无vedioid),拼接数据
            if (nextstanding.length != 1) {
                // 整理数据
                let dataArr = [];
                for (let j = 0; j < nextArr.length; j++) {
                    let infos = nextArr[j].split('_');
                    // 把0和1下标的玩家找出来
                    let role = await global.dao.topking.findOne({ mark: infos[0] });
                    let target = await global.dao.topking.findOne({ mark: infos[1] });
                    dataArr.push({
                        uid: role.uid,
                        servid: role.servid,
                        lmark: role.mark,
                        tuid: target.uid,
                        tservid: target.servid,
                        tmark: target.mark
                    })
                }
                // 下一场战斗
                challengeGroup[standing].push(dataArr);
            }
        }
        console.log('challengeStanding2', challengeStanding);
        let udpRecord = {
            $set: {
                record: challengeGroup,
                standing: challengeStanding,
                update: Date.now(),
                round: kingInfo.round + 1
            }
        };
        // 如果结束了冠军赛则设置为完成
        if (progress == 7) {
            udpRecord['$set']['finish'] = Date.now();
        }
        // 更新冠军赛信息
        await global.dao.topkingrecord.updateOne({ format: 'king', areamark }, udpRecord);
        // 给淘汰的玩家发送奖励邮件
        // 发邮件,冠军赛
        let outList = await global.dao.topking.find({ servid: { $in }, isout: { $exists: true }, progress: progress - 1 }, { servid: 1, uid: 1 });
        if (outList.length > 0) {
            let insertArr = [];
            for (let list of outList) {
                insertArr.push({ uid: list.uid, servid: list.servid, rewardtype: `KING_${progress - 1}` });
            }
            if (insertArr.length > 0) global.dao.topkingmail.insertMany(insertArr);
        }
        // 给冠军发送邮件奖励
        if (progress == 7) {
            // 发邮件,冠军
            let outList = await global.dao.topking.find({ servid: { $in }, progress }, { servid: 1, uid: 1 });
            if (outList.length > 0) {
                let insertArr = [];
                for (let list of outList) {
                    insertArr.push({ uid: list.uid, servid: list.servid, rewardtype: `KING_${progress}` });
                    // 赛季结束后把玩家的isout字段设为有值
                    await global.dao.topking.updateOne({ uid: list.uid, servid: list.servid }, { $set: { isout: Date.now() } });
                }
                if (insertArr.length > 0) global.dao.topkingmail.insertMany(insertArr);
            }
        }
    }
    // 所有竞猜券设置过期
    global.dao.lottery.expireAll().catch(console.error);

}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
