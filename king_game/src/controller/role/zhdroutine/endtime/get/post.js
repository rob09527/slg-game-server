'use strict';
const moment = require('moment');
const debug = require('debug')('zhdroutine');

module.exports = exports = async function (ctx, next) {
    const {
        SPECIAL_XS, // 该列表下的活动不显示新手周配置
    } = global.gameconfig.zhd_special_xs;


    //modify 2023-01-08 角色新手期已经被改成了3年，SPECIAL_XS从逻辑来说已经无用，所有活动都应该配置在里面，暂时还保留着
    debug({ SPECIAL_XS });
    const r = {};
    const IS_NEW_ROLE = ctx.role.isXS();
    debug({ uid: ctx.role.uid, servid: ctx.role.servid, IS_NEW_ROLE });
    for (let k in ACTIVITY) {
        let act = ACTIVITY[k];
        debug({ k, act })
        if (IS_NEW_ROLE) {
            // 跳过非新手活动返回 和 非创角活动 (duration > 0 是创角活动
            debug({ dr: !act.duration, sp: !SPECIAL_XS[k.toUpperCase()], sp_raw: SPECIAL_XS[k.toUpperCase()], k_up: k.toUpperCase() })
            //不是新手活动  不是创角活动 不是特殊新手
            if (!k.startsWith('xs_') && !ACTIVITY[k].duration && !SPECIAL_XS[k.toUpperCase()]) {
                continue;
            }
            if (k.startsWith('xs_') && !ctx.role.isXS(k)) continue;
            //新手期间 常规活动对应的新手周活动如果没有在开放周那么此次常规活动不会对新手开放，因此常规活动对应的新手周活动在新手活动表里面，那么将不会对新手开放
            if (!k.startsWith('xs_') && !ctx.role.isXSCanOpenAct(k)) continue;
            debug({ k, s: 1 })
            k = k.replace('xs_', ''); // 标记去掉 xs_前缀，保证前端逻辑复用

        } else {
            if (k.startsWith('xs_')) {  // 跳过新手活动返回
                continue;
            }
        }

        const { params, ...out } = act.base(ctx.role);
        r[k.toUpperCase()] = out;
    }

    ctx.body = r;
};
