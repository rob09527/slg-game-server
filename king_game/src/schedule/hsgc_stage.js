const moment = require('moment')
// 定时器
exports.name = "幻兽攻城-计算刷怪时间"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句 每一小时执行一次
exports.cron = "2 0 * * * *";

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    let config = global.gameconfig.panda.HSGC;
    if (!config) {
        throw new Error('no date')
    };
    let date = new Date();
    let nowHoure = date.getHours();
	let now = date.getTime();
    let hsgcConfig = global.gameconfig["hsgc"];
    if (!hsgcConfig) {
        throw new Error('miss hsgcConfig');
    }
    let {FRESH:fresh, RATE:rates} = hsgcConfig.config;
    let stageRewards = hsgcConfig.stageReward;

    let saveArr = [];
	const servs = await global.dao.gameserver.find({},{_id:0, servid:1, start:1});
    const hsgcList = await global.dao.hsgc.find();
    let start = 0;
	for (let serv of servs) {
        let hsgcInfo = hsgcList.find(value=>value.servid == serv.servid);
        if (!hsgcInfo) {
            continue;
        }
        start = moment(serv.start).startOf('days').valueOf();
        let obj = config.find(value=>{
            let etime1 = start + (parseInt(value.start)-1) * 24 * 3600 * 1000;
            let etime2 = start + (parseInt(value.etime)-1) * 24 * 3600 * 1000;
            return now < etime2 && now > etime1;
        })
        if (!obj || obj.id != hsgcInfo.id) {
            if (hsgcInfo.stage != 1 || hsgcInfo.score || hsgcInfo.hour || hsgcInfo.monster_stage || hsgcInfo.id || (obj && obj.id != hsgcInfo.id) || hsgcInfo.addStage) {
                hsgcInfo.stage = 1;
                hsgcInfo.score = hsgcInfo.hour = hsgcInfo.monster_stage = 0;
                hsgcInfo.id = obj ? obj.id : 0;
                hsgcInfo.addStage = false;
                saveArr.push(hsgcInfo.save());
            }
            continue;
        }
        if (nowHoure == 23 && !hsgcInfo.addStage) {
            let info = stageRewards[hsgcInfo.stage + 1];
            if (info) {
                let stageScore = stageRewards[hsgcInfo.stage].SCORE
                let score = info.SCORE -  stageScore;
                if (hsgcInfo.score - stageScore < score * rates) {
                    hsgcInfo.score = info.SCORE;
                    hsgcInfo.stage++;
                    hsgcInfo.addStage = true;
                }
            }
        }
        else if (nowHoure == 0 && hsgcInfo.addStage) {
            hsgcInfo.addStage = false;
        }
        if (hsgcInfo.hour >= fresh - 1) {
            hsgcInfo.hour = 0;
            hsgcInfo.monster_stage++;
        }
        else {
            hsgcInfo.hour++;
        }
        saveArr.push(hsgcInfo.save());
    }
    await Promise.all(saveArr);
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}