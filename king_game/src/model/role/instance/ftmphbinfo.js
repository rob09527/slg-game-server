const timekey = require("../../../util/timekey")

module.exports = exports = async function (ctx) {
    let act = global.ACTIVITY['ftmphb']
    // const dateKey = (new Date()).toISOString().slice(0, 10);
    // const datekey_end = (new Date(act.etime)).toISOString().slice(0, 10);

    const dateKey = timekey().ftmphb.date_today
    const datekey_end = timekey().ftmphb.datekey_end



    let count = global.gameconfig.ftmphb[2][0].times
    let add = false
    console.log(ctx.role.ftmphb)
    if (!ctx.role.ftmphb || ctx.role.ftmphb[`${datekey_end}-end`] == undefined) {
        add = true
        let create = {}
        create[dateKey] = 0
        create[`${datekey_end}-end`] = 0
        await ctx.dao.role.updateOne({ _id: ctx.role.rid }, {
            $set: { ftmphb: create }
        });
        ctx.role.ftmphb = create
        //赛季更新 重置道具数量
        const count = ctx.role.getItems(30181).count;
        let items = [{ GSID: 30181, COUNT: count }]
        ctx.role.castItemsNoSave(items);
    }

    if (ctx.role.ftmphb[dateKey] == undefined) {
        ctx.role.ftmphb[dateKey] = 0
        await ctx.dao.role.updateOne({ _id: ctx.role.rid }, {
            $set: { ftmphb: ctx.role.ftmphb }
        });
        add = true
    }

    if (add) {
        let items = [{ GSID: 30181, COUNT: count }]
        ctx.role.addItemsNoSave(items);
        await ctx.role.save();
    }

}