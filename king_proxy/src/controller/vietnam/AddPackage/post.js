const businessCode = require("../../../util/businessCode");
const _ = require('lodash');
const stateconfig = {
    'pending': 1,
    'success': 2,
    'refuse': 3,
    'giveup': 4

}
async function PropCheck(body) {
    let {
        packageid,
        price,
        items,
    } = body;
    try {
        let ok = items.length !== 0 ?? true

        items.forEach(element => {
            if (!element.gsid || !element.count) {
                ok = false
            }
            if (element.count < 1) {
                ok = false
            }
        });

        if (!ok) {
            return false
        }
        let gameservs = Object.values(global.gameservs)
        const game = gameservs[_.random(0, gameservs.length - 1)];
        let itemsChinese = await game.remote.getGameConfig("admin_chinese_props_api");
        if (!itemsChinese) {
            itemsChinese = []
        }
        let chineseitems = []
        let check = []
        items.forEach(item => {
            let itemChinese = itemsChinese.find(itemChinese => item.gsid == itemChinese.gsid)
            if (itemChinese) {
                itemChinese['count'] = item.count
                chineseitems.push(itemChinese)
            } else {
                check.push(item.gsid)
            }
        });

        let insertdata = {
            packageid,
            price,
            items,
            chineseitems: chineseitems,
            check: check,
            state: 1
        }
        return insertdata
    } catch (error) {
        console.error(error)
        throw ('Unable to execute your parameter command')
    }

}

module.exports = exports = async function (ctx, next) {
    let {
        packageid,
        price,
        items,
        action
    } = ctx.request.body;
    let insertdata = await PropCheck(ctx.request.body)
    let packageinfo = await ctx.dao.websaleconfig.findOne({ packageid });


    if (!insertdata) {
        ctx.body = { ...businessCode.illegal_parameters, data: packageinfo }
        return;
    }

    if (insertdata.check && insertdata.check.length >= 1) {
        ctx.body = { ...businessCode.illegal_gsid, data: insertdata.check }
        return;
    }

    if (packageinfo) {
        if (packageinfo.state == stateconfig.success) {
            ctx.body = { ...businessCode.packages_exit, data: packageinfo }
            return;
        }
        if (packageinfo.state == stateconfig.refuse) {
            ctx.body = { ...businessCode.packages_rejected, data: packageinfo }
            return;
        }

        if (packageinfo.state == stateconfig.giveup) {
            ctx.body = { ...businessCode.packages_giveup, data: packageinfo }
            return;
        }
        if (packageinfo.state == stateconfig.pending && action != 'revise') {
            ctx.body = { ...businessCode.packages_exit_pending, data: packageinfo }
            return;
        }
        if (packageinfo.state == stateconfig.pending && action === 'revise') {
            await ctx.dao.websaleconfig.deleteOne({ packageid });
            await ctx.dao.websaleconfig.create(insertdata);
            ctx.body = { ...businessCode.success, data: insertdata }
            return
        }
    }

    await ctx.dao.websaleconfig.create(insertdata);
    ctx.body = { ...businessCode.success, data: insertdata }
    return

}
