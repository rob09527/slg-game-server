'use strict'

const ms = require('ms');
const DELAY_INTERVAL = ms('7d');// 结束时间
const chunk = require('../util/array_chunk');
const _ = require('lodash');

// 定时器
exports.name = "巅峰赛海选赛";

let endDay;
exports.cron = async function () {
    let cron = global.dao.topking.finishtime();
    endDay = cron + DELAY_INTERVAL;
    // 判断是否是在冠军赛期间
    if (cron < Date.now() && Date.now() < endDay) {
        // 海选赛周六20
        cron = '0 20 * * 6';
    } else {
        cron = undefined;
    }
    return cron;
}

/**
 * @return {Promise<void>}
 */
exports.main = async function () {

    // 判断当前时间是否已经过期
    if (Date.now() > endDay) {
        console.error('TOPKINGPVP SEA BATTLE NO IN THIS TIME');
        return
    }
    let __time = process.hrtime();
    // 取出当前的最大的进度,只有0进度才能在这个定时执行
    let maxprogress = await global.dao.topking.find({}, { progress: 1 }).sort({ progress: -1 }).limit(1);
    if (maxprogress.length > 0 && maxprogress[0].progress != 0) {
        console.error('当前progress在sea赛制不能执行,progress', maxprogress[0].progress);
        return;
    }
    // 冠军赛的战区分组标记
    let gmarklist = await global.dao.topkingservergroup.distinct('areamark');
    for (let areamark of gmarklist) {
        // 获取所在组所有服务器编号
        let $in = await global.dao.topkingservergroup.find({ areamark });
        $in = $in.map(({ servid }) => servid);
        console.log('$in==>', $in);
        let roleList = await global.dao.topking.find({ servid: { $in } }, { servid: 1, uid: 1, seanum: 1, c_battleset: 1, mark: 1, bsetpower: 1 });
        console.log('$roleList==>', roleList.length);
        let seagroup = [];
        for (let j = 0; j < 64; j++) {
            let group = []
            for (let i = 0; i < roleList.length; i++) {
                if (roleList[i].seanum == j) {
                    group.push(roleList[i]);
                }
            }
            // 放入海选赛数组
            if (group.length > 0) seagroup.push(group);
        }
        let seaRecord = {};// 存每个组的挑战记录
        let standing = {}; // 存站位
        console.log('seagroup.length', seagroup.length);
        // 已经筛选出来64组人,开始战斗
        for (let k = 0; k < seagroup.length; k++) {
            let rolelist = seagroup[k];
            console.log('rolelist', rolelist.length);
            // 如果对战阵容只有一个人则直接晋级
            if (rolelist.length == 1) {
                console.log('队伍只有一个人晋级了', rolelist)
                let cond = {
                    servid: rolelist[0].servid,
                    uid: rolelist[0].uid
                };
                let udp = {
                    $set: {
                        'progress': 1,
                        'update': Date.now(),
                        'cleanwinscore': 0,
                        'seawin': 0,
                        'sealose': 0
                    }

                }
                let result = await global.dao.topking.updateOne(cond, udp);
                console.log('rolelist_result', result)
                continue;
            }
            let score_list = {};// 存所有人的得的净胜分
            let recordArr = [];// 所有的挑战记录
            let standingArr = [];// 存站位
            let winArr = {} // 所有人胜利次数
            let loseArr = {}; // 所有人失败次数
            for (let i = 0; i < rolelist.length; i++) {
                let role = rolelist[i];
                for (let j = i + 1; j < rolelist.length; j++) {
                    let target = rolelist[j];
                    // 发起战斗请求
                    let requestData = await global.dao.topking.seaBattle({ role, target });
                    let role_score, target_score, videolist, version;
                    if (requestData.error) {
                        // 报错
                        console.log('requestData', requestData.error)
                        console.log('role', role);
                        console.log('target', target);
                        // 按照战力大小,阵容战斗力高的获胜
                        if (role.bsetpower > target.bsetpower) {
                            role_score = 3;
                            target_score = 0;
                        } else {
                            role_score = 0;
                            target_score = 3;
                        }
                        // 录像id调为异常。
                        videolist = 'fade';
                        version = 0;
                    } else {
                        // 没有报错
                        ({ role_score, target_score, videolist, version } = requestData);
                    }
                    console.log('role_score-->', role_score, 'target_score-->', target_score)
                    // 处理回来的数据
                    if (role_score - target_score > 0) {
                        score_list[role.mark] = score_list[role.mark] || 0;
                        score_list[role.mark] += role_score - target_score;
                        // 记录自身胜利次数
                        winArr[role.mark] = winArr[role.mark] || 0;
                        winArr[role.mark] += 1;
                        // 记录对手输场
                        loseArr[target.mark] = loseArr[target.mark] || 0;
                        loseArr[target.mark] += 1;
                    } else {
                        score_list[target.mark] = score_list[target.mark] || 0;
                        score_list[target.mark] += target_score - role_score;
                        // 记录对手胜利次数
                        winArr[target.mark] = winArr[target.mark] || 0;
                        winArr[target.mark] += 1;
                        // 记录自身输场
                        loseArr[role.mark] = loseArr[role.mark] || 0;
                        loseArr[role.mark] += 1;
                    }
                    console.log('pvp打完')

                    // 拼接数据插入挑战记录
                    let param = {
                        uid: role.uid,
                        servid: role.servid,
                        lmark: role.mark,
                        targeid: target.uid,
                        tservid: target.servid,
                        tmark: target.mark,
                        vedioid: requestData.vid,
                        rscore: role_score,
                        tscore: target_score
                    }
                    recordArr.push(param);
                    standingArr.push(`${role.mark}_${target.mark}`)
                }
            }
            let topmark = 0; // 获得晋级的人
            // 胜场多的优先晋级
            let c_win_list = Object.values(winArr).sort((a, b) => b - a);
            console.log('c_win_list', c_win_list);
            if (c_win_list[0] == c_win_list[1]) {
                // 胜场相同,取出分胜场相同的玩家,判断净胜分
                let win_score_users = Object.keys(winArr).filter((user) => {
                    return winArr[user] == c_win_list[0];
                });
                // 判断胜场相同的玩家,净胜分排名先后
                let score_users = win_score_users.map((user) => score_list[user]).sort((a, b) => b - a);
                // 取净胜分相同的玩家。
                let same_score_userlist = win_score_users.filter((user) => {
                    return score_list[user] == score_users[0];
                });
                // 取净胜分最多的玩家
                topmark = same_score_userlist[0];
                console.log('winArr', winArr);
                console.log('score_list', score_list);
                console.log('score_users', score_users);
                console.log('win_score_users', win_score_users);
                console.log('same_score_userlist', same_score_userlist);
                console.log('取净胜分最高的', topmark);
                if (same_score_userlist.length > 1 && score_list[same_score_userlist[0]] == score_list[same_score_userlist[1]]) {
                    //
                    let power_list = [];
                    // 净胜分相等,则判断阵容战斗力
                    for (let user of same_score_userlist) {
                        let userInfo = roleList.find((role) => role.mark == user);
                        if (userInfo) {
                            power_list.append(userInfo);
                        }
                    }
                    if (power_list.length > 0) {
                        power_list.sort((a, b) => b.bsetpower - a.bsetpower);
                        console.log('power_list', power_list);
                        // 取阵容战力最强的
                        topmark = power_list[0].mark;
                        console.log('取阵容战斗力最高的', topmark)
                    }
                }

            } else {
                // 胜场最多的玩家晋级
                topmark = Object.keys(winArr).find((user) => {
                    return winArr[user] == c_win_list[0];
                });
                console.log('胜场多的晋级', topmark)
            }
            // 保存玩家的净胜分
            for (let h = 0; h < rolelist.length; h++) {
                let role = rolelist[h];
                // 玩家的净胜分
                let score = score_list[role.mark] || 0;
                // 海选赛胜利次数
                let wincount = winArr[role.mark] || 0;
                // 海选赛失败次数
                let losecount = loseArr[role.mark] || 0;
                let cond = {
                    servid: role.servid,
                    uid: role.uid
                };
                let udp = {
                    $set: {
                        'update': Date.now(),
                        'cleanwinscore': score,
                        'isout': Date.now(),
                        'seawin': wincount,
                        'sealose': losecount
                    }
                }
                if (topmark == role.mark) {
                    // 晋级
                    udp = {
                        $set: {
                            'progress': 1,
                            'update': Date.now(),
                            'cleanwinscore': score,
                            'seawin': wincount,
                            'sealose': losecount
                        }
                    }
                }
                await global.dao.topking.updateOne(cond, udp);
            }
            // 把整组的挑战记录和挑战站位保存
            seaRecord[k] = recordArr;
            standing[k] = standingArr;

        }
        // 保存挑战记录
        await global.dao.topkingrecord.create({
            standing,
            record: seaRecord,
            areamark,
            format: 'sea',
            round: 1, // 第一轮,
            finish: Date.now() // 完成
        })
        console.log('开始发淘汰邮件了')
        // 发邮件,海选淘汰
        let outList = await global.dao.topking.find({ servid: { $in }, isout: { $exists: true }, progress: 0 }, { servid: 1, uid: 1 });

        if (outList.length > 0) {
            let insertArr = [];
            for (let list of outList) {
                insertArr.push({ uid: list.uid, servid: list.servid, rewardtype: "SEA" });
            }
            if (insertArr.length > 0) global.dao.topkingmail.insertMany(insertArr);
        }

        console.log('开始进行小组赛分组ing')
        // 继续分组,分组的时候先取出来排序再分组
        let nextList = await global.dao.topking.find({ servid: { $in }, isout: { $exists: false }, progress: 1 }, { servid: 1, uid: 1, mark: 1 });
        let nextuidList = nextList.map(({ mark }) => mark);
        // 随机分组
        nextuidList = _.shuffle(nextuidList);
        // 划分8组
        nextuidList = chunk(nextuidList, 8);
        console.log('小组赛8组名单-->', nextuidList)
        // 标记分组玩家所述的key
        for (let k = 0; k < nextuidList.length; k++) {
            for (let h = 0; h < nextuidList[k].length; h++) {
                let role_mark = nextuidList[k][h];
                if (!role_mark) continue;
                // 找到这个uid 对应的 servid
                let roleInfo = nextList.find(({ mark }) => mark == role_mark);
                if (!roleInfo) continue;
                let king = await global.dao.topking.findOne({ servid: roleInfo.servid, uid: roleInfo.uid });
                king.groupnum = k;
                king.markModified('groupnum')
                await king.save();
            }
        }
        let standings = {};
        let record = {};
        // 记录小组赛的站位信息
        for (let i = 0; i < nextuidList.length; i++) {
            let groupArr = chunk(nextuidList[i], 2);
            let dataArr = [];
            let arr = [];
            // 整理数据
            for (let j = 0; j < groupArr.length; j++) {
                let infos = groupArr[j];
                arr.push(infos.join('_'));
                // 拼接成 ['1_2','3_4','5_6'] 结构
                // 把0和1下标的玩家找出来
                let role1 = nextList.find(({ mark }) => mark == infos[0]);
                let role2 = nextList.find(({ mark }) => mark == infos[1]);
                dataArr.push({
                    uid: role1.uid,
                    servid: role1.servid,
                    lmark: role1.mark,
                    tuid: role2.uid,
                    tservid: role2.servid,
                    tmark: role2.mark
                })
            }
            // 放入站位对象里
            standings[i] = standings[i] || [];
            standings[i].push(arr);
            // 放入挑战记录对象里
            record[i] = record[i] || [];
            record[i].push(dataArr);
        }
        // 保存小组赛站位记录
        await global.dao.topkingrecord.create({
            record,
            standing: standings,
            areamark,
            format: 'group'
        });
    }

}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
