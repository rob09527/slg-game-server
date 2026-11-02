const tg = require('../textgetter');
const _type = require('../../model/role/common/type');
const moment = require('moment');
const zhdpoint = require('../../util/event/point');

module.exports = {
    XYGX: async function () {
        // 幸运观星结束后清理观星缓存
        await global.dao.c_spin.updateMany({}, { $set: { refresh: 1 } });
        console.error(`SCHEDULEREF XYGX START CLEAN DONE`, new Date().toLocaleString())
    },
    HYDT: async() => {
        // 刷新鸿运当头
        console.error('SCHEDULEREF HYDTINIT START', new Date().toLocaleString());
        zhdpoint("HYDTINIT", 'HYDT', Date.now()).catch(console.error);
    }
}
