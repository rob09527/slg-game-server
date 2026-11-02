

const textgetter = require('./../util/textgetter');
const assert = require('assert');
const moment = require('moment')
// 定时器
exports.name = "奇门幻阵结算"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句 每日的0点
exports.cron = async function () {
    let dbInfo = await global.dao.fantasy.findOne();
    if (!dbInfo) {
        dbInfo = await global.dao.fantasy.createBoss(); // 创建第一个boss
    }
    const { BOSS, CONFIG } = global.gameconfig.fantasy;
    if (!BOSS || !CONFIG) {
        console.error('<---- [FANTASY] boss or config error')
        return null;
    }
    const { HOURS: hours } = BOSS[dbInfo.bossidx];
    let addHours = ((+hours || 72) - (CONFIG.GAP || 1) + 0.1).toString();  // 再延期6分钟结算发奖
    let runTime = moment(dbInfo.startAt).add(+addHours, 'h').valueOf();
    console.log('<---- [FANTASY] reward runTime =', runTime, addHours)
    return runTime < Date.now() ? Date.now() + 100 : runTime; // 如果执行的时间小于当前时间
};

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    const { BOSS } = global.gameconfig.fantasy;

    const createMail = (role_rank, rid, config) => {
        for (const info of config) {
            if (info.MAXRANK <= role_rank) continue;
            mails.push({
                rid, type: 2, reward: info.ITEMS,
                title: textgetter('FANTASY_T'),
                content: textgetter('FANTASY_C', role_rank + 1),
            });
            break;
        }
    }

    const curInfo = await global.dao.fantasy.findOne();
    assert(curInfo, 'config error');

    // 刷新fantasy_start定时任务
    await global.remote.agent_retimer('fantasy_start');

    // 是否已发奖
    assert(!curInfo.isSend, 'already send mail');

    const { BOSSID: bossid, RANK_REWARD: rwdConfig, HOURS: hours } = BOSS[curInfo.bossidx];
    assert(+bossid == +curInfo.bossid, 'bossid not match');
    assert(rwdConfig, 'reward config error');

    //  需要按照服务器分组id
    const serv_groups = await global.dao.topkingservergroup.aggregate([
        {
            $group: {
                _id: '$areamark',
                servers: {
                    $push: "$servid"
                }
            }
        }
    ]);
    let mails = [];
    // 增加默认跨服组(处理不在跨服组内的区服，相同区服编号的在一起排名)
    let areaList = await global.dao.gameserver.aggregate([
        {
            $group: {
                _id: '$area.id',
            } 
        }
    ]);
    let existAreaId = {}; // 是否存在相同的area.id(数据类型不同)
    areaList.map(elem => {
        if(!elem || !elem._id || existAreaId[elem._id]) return;
        existAreaId[elem._id] = 1;
        serv_groups.push({ _id: 'default' + elem._id })
    })

    for (let group of serv_groups) {
        //let servers = group.servers;
        let areamark = group._id;  // 区组编号
        // mails = [];
        let fantasyBosses = await global.dao.fantasyboss.find({
            areamark,
            lastdamge: { $gt: 0 }
        }).select({ rid: 1, bossid: 1, lastdamge: 1, update: 1 }).sort({ lastdamge: -1, update: 1 });
        if (fantasyBosses.length < 1) continue;

        for (let i = 0; i < fantasyBosses.length; i++) {
            const info = fantasyBosses[i];
            createMail(i, info.rid, rwdConfig);
        }

    }
    // 邮件方式发放奖励
    await global.dao.mail.insertMany(mails);

    // 标记已发奖
    await global.dao.fantasy.updateOne({ _id: curInfo._id }, { $set: { isSend: 1 } });

    // 删除本期玩家挑战记录
    await global.dao.fantasyboss.deleteMany();
    // 删除本期排行榜
    await global.services.RankService.clearPatten('fantasy', '*');
    // 删除战斗录像
    await global.dao.video.deleteMany({ type: 'fantasyboss' });

}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}