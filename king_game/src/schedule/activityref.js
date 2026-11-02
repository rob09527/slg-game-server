'use strict'


// 定时器
exports.name = "月度目标刷新"; //
const cursorUtil = require("../util/cursor")
const tg = require('./../util/textgetter');
// 定时器语句
exports.cron = "55 23 * * *";

exports.force_on_time = true; // 强制准时，设置为 true时，定时器到点时直接执行，而不是添加到任务队列中等待执行（默认 false

function _mail_attr(...vals) {
	const t_title = ['NACTIVITY_TITLE'].append(vals);
	const t_content = ['NACTIVITY_CONTENT'].append(vals);
	return {
		type: 2,
		rid: this._id,
		title: tg.apply(null, t_title),
		content: tg.apply(null, t_content),
	}
}

exports.main = async function () {
    const config = global.gameconfig.refreshactivity;
    if (!config) return;
    const needRefreshIds = [];
    const needRefreshRnos = [];
    const mails = [];
    await cursorUtil(    global.dao.role.find({}, { _id: 1, create: 1, rno: 1 }), async (role)=> {
        const start = new Date(role.create).setHours(23, 59, 59, 999);
        const today = new Date().setHours(23, 59, 59, 999);
        let del = (today - start) / (24 * 60 * 60 * 1000);
        del = Math.floor(del) + 1;
        if(del % 30 !== 0) {
            return;
        }
        needRefreshIds.push(role._id);
        needRefreshRnos.push(role.rno);
    });

    
    await cursorUtil(global.dao.role.find({ _id: { $in: needRefreshIds } }), async (role) => {
        for (let value of ['pvp', 'affairs', 'exped', 'fuben']) {
            let config = global.gameconfig['nactivity' + value];
            if (!config) return
            config.forEach(row => {
                if (role.getProp(row.RMARK) <= 0 && role.getProp(row.PROCESS) >= row.NUM) {
                    const m_name = global.gameconfig.text['NACTIVITY_NAME_' + value.toUpperCase()];
                    let info = _mail_attr.call(role, m_name, row.NAME);
                    info.reward = row.ITEMS;
                    mails.push(info);
                }
            })
            if (mails.length >= 1000) {
                await global.dao.mail.insertMany(mails);
                mails.splice(0, mails.length);
            }
        }

        for (const row of global.gameconfig.factivity) {
            if (!row.CHK) continue;
            const flag = row.CHK.every(item => {
                if (typeof item !== 'object') item = { GSID: item, COUNT: 1 };
                return role.getProp(item.GSID) >= item.COUNT;
            })
            if (!flag) continue;
            if (role.getProp(row.RMARK.N) == 0) {
                let info = _mail_attr.call(role);
                info.title = tg('YDKHACTIVITY_TITLE');
                info.content = tg('YDKHACTIVITY_N_CONTENT', row.NAME);
                info.reward = row.ITEMS.N;
                mails.push(info);
            }
            if (role.getProp(row.RMARK.S) == 0 && role.special.yd) {
                let info = _mail_attr.call(role);
                info.title = tg('YDKHACTIVITY_TITLE');
                info.content = tg('YDKHACTIVITY_S_CONTENT', row.NAME);
                info.reward = row.ITEMS.S;
                mails.push(info);
            }
        }

        if (mails.length > 0) {
            await global.dao.mail.insertMany(mails);
            mails.splice(0, mails.length);
        }
    });

    const $unset = {};
    const $set = {};
    for (const info of config) {
        if (!info.COUNT) {
            $unset['others.' + info.GSID] = "";
        } else {
            $set['others.' + info.GSID] = { count: info.COUNT };
        }
    }
    $set['special.yd'] = 0;

    await global.dao.role.updateMany({ _id: { $in: needRefreshIds } }, { $unset, $set })
        .then(r => {
            // 打印刷过月度的玩家的短号
            console.error("SCHEDULEREF activityref REFED", needRefreshRnos.length, JSON.stringify(needRefreshRnos), r);

        }) // 标记红点 @author awko
        .then(_ => global.dao.remind.updateMany({ rid: { $in: needRefreshIds } }, { $set: { 'remind.ydhd_ydhd': 1 } }).catch(console.error)
        );
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
