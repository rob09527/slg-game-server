'use strict'

const moment = require('moment');
const textgetter = require('../../../../util/textgetter');
// const tg = require('../../util/textgetter');
let find = (qxzl, time, role, VAL, type, show, allHelp) => {
    let startTime = time.TYPE == 0 ? moment(role.create).startOf('days').valueOf() : moment(role._gameserv.start).startOf('days').valueOf();
    let endTime = startTime + (parseInt(time.TYPEDAY) - 1) * 24 * 3600 * 1000;
    let now = Date.now();
    let info = { name: time.NAME, val: qxzl.val, allVal: VAL, help: qxzl.help, allHelp, open: time.OPEN, describe: time.DESCRIBE, in: 1, type, level: time.LEVEL, reward: show };
    if (qxzl.count) {
        info.count = qxzl.count;
    }
    if (now < endTime || role.level < time.LEVEL) {
        info.msg = time.TYPE == 0 ? textgetter("HINT_0", time.LEVEL, time.TYPEDAY) : textgetter("HINT_1", time.LEVEL, time.TYPEDAY)
        // info.msg = `等级达到${time.LEVEL}级且${time.TYPE == 0 ? '创角' : '开服'}到第${time.TYPEDAY}天开启`;
        info.in = 0;
        return info;
    }

    if (!time.OPEN) return info;

    let hour = moment().hours();
    info.open = hour >= time.START && hour < time.END ? 1 : 0;
    info.open == 0 && (info.msg = time.POINT);
    return info;
}

let getqxzl = async (rid, type, val, pos, help) => {
    let qxzl = await global.dao.c_qxzl.findOne({ rid, type });
    if (!qxzl) {
        qxzl = new global.dao.c_qxzl({ rid, val, pos, type, help })
    }
    if (moment(qxzl.operatetime).startOf('days').valueOf() != moment(Date.now()).startOf('days').valueOf()) {
        qxzl.val = val;
        qxzl.operatetime = Date.now();
    }
    await qxzl.save();
    return qxzl;
}

module.exports = exports = async (ctx, next) => {
    let rid = ctx.role.i();
    let weekday = moment().weekday();

    let arr = [];
    for (let type = 1; type <= 2; type++) {
        let config = type == 1 ? global.gameconfig.qxzlonecopy : global.gameconfig.qxzlgroupcopy;
        ctx.assert(config, 'config invaild');
        let qxzl = await getqxzl(rid, type, config.VAL, Object.keys(config.LIMIT)[0], config.HELPVAL);
        let allVal = config.VAL;
        qxzl.record.forEach(value => {
            allVal += (value || 0);
        })
        arr.push(find(qxzl, config.TIME[weekday], ctx.role, allVal, type, config.SHOW, config.HELPVAL));
    }

    let config = global.gameconfig.qxzlhidecopy;
    ctx.assert(config, 'config invaild');
    arr.push(find({ val: ctx.role.getProp(config.TICKET), help: 0, count: config.COUNT }, config.TIME[weekday], ctx.role, 0, 3, config.SHOW, 5));

    ctx.body = arr;
}