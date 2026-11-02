// 活动设置

'use strict';

const zhdpoint = require("../../../../../util/event/point");

module.exports = exports = async function (ctx, next) {
    let {
        type,
        start = Date.now(),
        etime = 0,
        params = {},
        name,
        ...otherProps
    } = ctx.request.body;
    ctx.assert(type, 'miss type');
    if(!name) name = type;
    let act = await dao.activity.findOne({type});
    if (!act) {
        // 没有就创建该活动
        act = new dao.activity({
            type,
            start,
            etime,
            params,
            name,
            ...otherProps,
        });
    } else {
        act.start = start;
        act.etime = etime;
        act.params = params;
        act.name = name;
        Object.assign(act, otherProps);
    }

    await act.save();
    zhdpoint("HYDTINIT", type, start).catch(console.error);
    ctx.body = act;
};
