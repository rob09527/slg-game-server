
'use strict'

const $ = require('lodash');

module.exports = async ctx => {
    let {
        type: is_confirm,
        arr = [],
    } = ctx.request.body;
    is_confirm = +is_confirm;
    ctx.assert(arr.length > 0, 'no piece');
    const {
        LEVEL,
    } = global.gameconfig.zhenbao_roll_exchange;
    let output = arr
        .map(({ gsid: PIECEID, count }) => {
            const zbId = (+PIECEID) - 1000;
            const zb_config = global.gameconfig.zhenbao_item[zbId];
            if (!zb_config) return;
            const {
                QUALITY,
            } = zb_config;
            if(!LEVEL[QUALITY - 4]) return;
            return LEVEL[QUALITY - 4].map(({ GSID, COUNT: EACH_COUNT }) => ({
                GSID,
                COUNT: EACH_COUNT * count,
            }))
        })
        .filter(Boolean);
    output = $.flattenDeep(output).arrange();
    ctx.body = {
        items: output,
    }
    if (is_confirm) {
        ctx.role.castItemsNoSave(arr);
        ctx.role.addItemsNoSave(output);
        await ctx.role.save();
    }
}