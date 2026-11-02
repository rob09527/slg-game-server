'use strict'

// 创建新服
module.exports = exports = async function (ctx, next) {

    const {servid, sno, name, groupid, room, start, area_name, filter, area_id} = ctx.request.body;

    ctx.assert(!isNaN(servid), '无效服务ID');

    ctx.assert(!isNaN(groupid), '无效合服组ID');

    ctx.assert(!isNaN(sno), '无效服务器编号');
    ctx.assert(name, '请输入服务器名称');
    ctx.assert(start, '请设置服务器开服时间');

    const gameModel = global.dao.gameserver;
    const o = await gameModel.findOne({servid: +servid})
    ctx.assert(!o, '服务器ID已经被占用');

    let filter_info;

    if (!Array.isArray(filter)) {
        filter_info = filter ? [filter] : [];
    } else {
        filter_info = filter;
    }

    const r = await gameModel.create({
        servid: +servid,
        name,
        groupid: +groupid,
        room: +room || 0,
        start: new Date(start).getTime(),
        sno: +sno,
        info: {
            filter: filter_info
        },
        area: {
            name: area_name,
            id: area_id
        },
        create: Date.now(),
        status: 1 // 默认是开服状态， 0 表示维护
    })
    ctx.body = r;
}



