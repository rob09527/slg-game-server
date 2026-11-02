

const textgetter = require('./../util/textgetter');
const assert = require('assert');
const moment = require('moment')
// 定时器
exports.name = "新手抽将-抽将奖励"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句 每日的4点
exports.cron = "0 30 4 * * *";
// exports.cron = "*/10 * * * * *"; //测试

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    let mails = [];

    const createMail = (config, rid, rank, score) => {
        // console.log("createMail",rid, rank, score)
        for (let i = 0; i < config.length; i++) {
            let obj = config[i]
            if (rank <= obj.MAX && score >= obj.SCORE) {
                mails.push({
                    rid, type: 2, reward: obj.REWARD,
                    title: textgetter('XSCJ_CJJL_T'),
                    content: textgetter('XSCJ_CJJL_C', rank),
                });
                break; 
            }
        }
    }

    let nowDay = moment(Date.now()).startOf('days').valueOf();
	const servs = await global.dao.gameserver.getServers();
	for (let serv of servs) {
        let start = moment(serv.start).startOf('days').valueOf();
        // for (const k in global.gameconfig.panda) {
            let k = 'XSCJ'
            let config = global.gameconfig.panda[k]
            for (let i = 0; i < config.length; i++) {
                let obj = config[i];
                // if (obj.mode > 0){
                    let endDay = start + (parseInt(obj.etime)-1) * 24 * 3600 * 1000;
                    if (endDay == nowDay) {
                        let config_xscj = global.gameconfig.xscj.find(value=>value.ID == obj.id);
                        if (config_xscj){
                            let max = config_xscj.REWARD[config_xscj.REWARD.length-1].MAX;
                            let rank = "panda-xscj" + obj.arg + obj.id;
                            let rankService = new global.services.RankService(rank, serv.groupid);
                            let list = await rankService.rank(1, max);
                            let roles = list.map(({ id }) => id);
                            roles = await global.dao.role.find({ _id: { $in: roles } });
                            const tmp = {};
                            roles.forEach(one => {
                                tmp[one._id.toString()] = one.i();
                            })
                            list.map(({ id, rank, score }) => {
                                let rid = tmp[id];
                                createMail(config_xscj.REWARD, rid, rank, score);
                            })
                            // 删除本期排行榜
                            rankService.clear();
                        }
                    }
                // }
            }
        // }
    }

    // 邮件方式发放奖励
    if (mails.length > 0){
        await global.dao.mail.insertMany(mails);
    }
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}