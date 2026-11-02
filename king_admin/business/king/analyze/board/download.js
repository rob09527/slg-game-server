// 渠道 | 新增角色 | 活跃角色 | 付费角色 | 总付费金额 | 新增付费金额 | 总付费率 | 新增付费率 | 活跃角色ARPU | 活跃付费角色ARPU | 新增角色ARPU | 新增付费角色ARPU

const moment = require('moment');
exports.name = '看版导出';
exports.type = 'I';
// 需要 重新开发
exports.exec = async function (body, query, ctx) {

    const channels = await this.db.mongo.channels.getChannel(ctx.adminRole, this.channel_group);

    const data = [];
    for (const c of channels) {
        let activeCount = 0,
            addPayCount = 0,
            addPayTotal = 0,
            orderCount = 0,
            orderTotalPrice = 0,
            payCount = 0,
            registerCount = 0;
        const r = await this.business[`${this.channel_group}-role-analyze-board-data`]({
            servid: null,
            channel: c.name,
            coupon: body.coupon
        }, {}, ctx);

        activeCount += (r.activeCount || 0);
        addPayCount += (r.addPayCount || 0);
        addPayTotal += (r.addPayTotal || 0);
        orderCount += (r.orderCount || 0);
        orderTotalPrice += (r.orderTotalPrice || 0);
        payCount += (r.payCount || 0);
        registerCount += (r.registerCount || 0);

        data.push([
            c.name, registerCount, activeCount, payCount, orderTotalPrice,
            addPayTotal, (payCount / (activeCount||1) * 100).toFixed(2) + "%",
            (addPayCount / (registerCount||1) * 100).toFixed(2) + "%",
            (orderTotalPrice / (activeCount||1)).toFixed(2),
            (orderTotalPrice / (payCount||1)).toFixed(2),
            (addPayTotal / (registerCount||1)).toFixed(2),
            (addPayTotal / (addPayCount||1)).toFixed(2)
        ])
    }
    let csv = `渠道,新增角色,活跃角色,付费角色,总付费金额,新增付费金额,总付费率,新增付费率,活跃角色ARPU,活跃付费角色ARPU,新增角色ARPU,新增付费角色ARPU`;
    for (const item of data) {
        csv+= "\r\n" + item.join(",");
    }
    ctx.set('Content-Disposition', `attachment;filename=${encodeURIComponent("看板统计" + moment().format("MMDDHHmmss") + '.csv')}`);
    ctx.set('content-type', `*/*`);
    ctx.body = csv;
};

