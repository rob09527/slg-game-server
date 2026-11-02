const tg = require('../../../util/textgetter');
const _type = require('../common/type');
const moment = require("moment");
module.exports = async function(mode , zhdconfig) {
    const up = mode.toUpperCase();
    const {
        EXCHANGE_COINS,
        MARK, MARKNAME,
        EVENTNAME,
        CLEAR_MARKS = [], // 只是清理的标记，不换算奖励
        COIN_GSID = 38006
    } = zhdconfig;
    const markType = _type(MARK);
    let cond = {
        [`${markType}.${MARK}`]: {
            $exists: 1,
        }
    }
    const {
        SPECIAL_XS,	
    } = global.gameconfig.zhd_special_xs;
    if (!SPECIAL_XS[up]){
        // 不是特殊新手活动则校验是否是新手保护期
        cond.create = {
            $lte: moment().add(-global.gameconfig.others.NEW_ROLE_DAYS, 'days').startOf('days').valueOf()
        }
    }
    let cursor = global.dao.role.find(cond, { [`${markType}`]: 1 }).cursor();
    let role;
    let mails = [];
    while (role = await cursor.next()) {
        let jfcount = role.getItems(MARK).count;
        let reward = [];
        // 邮件发放剩余积分兑换后的铜币
        if (jfcount > 0) {
            let count = jfcount * EXCHANGE_COINS;
            reward.push({ gsid: COIN_GSID, count })
        }
        if (reward.length == 0) continue;
        mails.push({
            type: 2,
            rid: role._id,
            title: tg('GJSD_RETURN_T', EVENTNAME),
            content: tg('GJSD_RETURN_C', EVENTNAME, MARKNAME),
            reward,
        })
        if (mails.length > 1000) {
            await global.dao.mail.insertMany(mails);
            mails.splice(0, mails.length);
        }
    }
    if (mails.length) {
        global.dao.mail.insertMany(mails).catch(console.error);
    }
    // 清空标记
    let set = { $unset: { [mode]: 1, [`${markType}.${MARK}`]: 1 } };
    for (const m of CLEAR_MARKS) { // 清理特殊标记
        const t = _type(m);
        set.$unset[`${t}.${m}`] = 1;
    }
    global.dao.role.updateMany({}, set).catch(console.error);
    console.error(`SCHEDULEREF ${up} END`, new Date().toLocaleString());
}
