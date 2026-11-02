
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计5星武将个数
 */
module.exports = async function ({ generals }) {
    generals = Array.isArray(generals) ? generals : [generals];
    let num = 0;
    for (let {gsid, GSID, dontmark} of generals) {
        if (dontmark) continue;
        gsid = gsid || GSID;
        const config = global.gameconfig.general[gsid];
        if (!config) continue;
        if (config.STAR !== 5) continue;
        num++;
    }
    if (num < 1) return;
    await chkAndAdd.call(this,{
        zbId: 57260,
        mark: 98437,
        count: num,
        subreason: 'star5g'
    })
}