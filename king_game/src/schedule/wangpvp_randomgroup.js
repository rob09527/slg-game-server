
/*
 
 国王战
 分组
*/

'use strict'

const moment = require('moment');
const _ = require('lodash');
// 定时器
exports.name = "王战-挑战站位分组";
// 定时器语句
exports.cron = "0 12 * * 5"; // 周5，12点分组。

exports.main = async function () {

    // 开服时间
    const serv_groups = await global.dao.gameserver.fetchServers();

    for (const group of serv_groups) {
        const groupid = group._id;
        // let startTime = moment(`${group.start}`).add(2, 'day').valueOf();
        // let friday = moment().isoWeekday(5).startOf('days').valueOf();
        // let time;
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
        // 取出来进行分组
        let wangs = await global.dao.wangpvp.find({ groupid, groupnum: { $exists: 0 } }, { mark: 1, rid: 1 }).sort({ mark: 1 });
        if (wangs.length < 64) {
            console.log('WANGPVP RANDOMGROUP NO  64 DATA ', groupid, wangs.length);
            continue
        }
        let marks = wangs.map(({ mark }) => mark);
        // 1-8名各一组。
        // 身下的玩家每8个人随机放入一个组;
        let isfirst = true;
        let grouplist = [];
        while (marks.length > 0) {
            // 划分8组
            let groupmarks = marks.splice(0, 8);
            // 不是第一次,则随机分组
            if (!isfirst) {
                groupmarks = _.shuffle(groupmarks);
            }
            for (let i = 0; i < groupmarks.length; i++) {
                grouplist[i] = grouplist[i] || [];
                grouplist[i].push(groupmarks[i]);
            }
            // 第一次平均分
            if (isfirst) isfirst = false;
        }
        // 更新玩家的groupnum
        for (let k = 0; k < grouplist.length; k++) {
            console.log(`grouplist${k},${grouplist[k].length}`)
            for (let h = 0; h < grouplist[k].length; h++) {
                let mark = grouplist[k][h];
                if (!mark) continue;
                let wang = await global.dao.wangpvp.findOne({ groupid, mark });
                // 小组赛的组别
                wang.groupnum = k;
                wang.markModified('groupnum');
                await wang.save();
            }
        }

        let standings = {};
        let record = {};
        // 记录小组赛的站位信息
        for (let i = 0; i < grouplist.length; i++) {
            // 再进行一次随机
            grouplist[i] = _.shuffle(grouplist[i]);
            let groupArr = _.chunk(grouplist[i], 2);
            let dataArr = [];
            let arr = [];
            // 整理数据
            for (let j = 0; j < groupArr.length; j++) {
                let infos = groupArr[j];
                arr.push(infos.join('_'));
                // 拼接成 ['1_2','3_4','5_6'] 结构
                // 把0和1下标的玩家找出来
                let role1 = wangs.find(({ mark }) => mark == infos[0]);
                let role2 = wangs.find(({ mark }) => mark == infos[1]);
                dataArr.push({
                    lrid: role1.rid,
                    lmark: role1.mark,
                    trid: role2.rid,
                    tmark: role2.mark
                })
            }
            // 放入站位对象里
            standings[i] = standings[i] || [];
            standings[i].push(arr);
            // 放入挑战记录对象里
            record[i] = record[i] || [];
            record[i].push(dataArr);
        };
        // 保存小组赛站位记录
        await global.dao.wangpvprecord.create({
            record,
            standing: standings,
            format: 'group',
            groupid
        });
    }
}
exports.check = async function () {
    return true;
}