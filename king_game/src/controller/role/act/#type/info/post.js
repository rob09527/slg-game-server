
'use strict'

/**
 * 活动配置信息查询，以及完成进度信息查询
 *
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {

    const res =   ctx.activity.base(ctx.role) ;


    ctx.body = {
        ...res,
        info: ctx.progressInfo
    };
}
