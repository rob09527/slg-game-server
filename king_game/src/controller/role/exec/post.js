'use strict';
const secretTask = require("../../../model/secretRealmRole/instance/secretTask");
const { hitHere } = require("../../../util/weektarget");

module.exports = exports = async (ctx, next) => {
    /* exid 兑换规则, times 兑换次数, batch 批量兑换, ignore 批量兑换时是否忽略兑换条件不满足的 */
    let { exid, times, batch, ignore } = ctx.request.body;
    if (exid && exid.indexOf('official_upgrade') != -1) {
        //秘境主线任务打点
        await secretTask(ctx, 99558, 1)
    }
    ctx.hook.pre(undefined, exid);
    const check = batch && Array.isArray(batch) ? batch[0].exid : exid;
    ctx.role._path_ += '#' + (Array.isArray(batch) ? batch.map(b => `${b.exid}*${b.times}`).join(',') : `${exid}*${times}`);
    if (ctx.role.legion && check && check.startsWith('legion_')) { //  如果角色有军团信息,查询军团信息，方便兑换规则支持军团数据的条件判断
        // ps 前提 兑换规则要以 legion_ 开头的才会检测军团信息,避免影响之前兑换规则的效率
        ctx.role._legion = await ctx.dao.legion.findOne({ _id: ctx.role.legion });
        const rid = ctx.role.i();
        const owner = ctx.role._legion._members.find(o => o.rid === rid);
        ctx.role._legion._mypos = owner && owner.pos; // 得到个人职位
    }
    if (batch && Array.isArray(batch)) { // 批量兑换
        let items = [];
        let castitems = [];
        let items_bymail = [];
        const report = {};
        for (const one of batch) {
            let res;
            try {
                if (ignore) { // 如果忽略不满足条件的，需要提前判断 FROM是否足够
                    const rule = global.execrules[one.exid];
                    if (rule.FROM) {
                        for (let it of rule.FROM) {
                            ctx.assert(it.COUNT <= ctx.role.getProp(it.GSID), 'fail');
                        }
                    }
                }
                res = ctx.khexec(ctx.role, one.exid, one.times);
                items.push(...(res.items || []));
                castitems.push(...(res.castitems || []));
                items_bymail.push(...(res.items_bymail || []));
                report[one.exid] = 'success';
            } catch (e) {
                if (ignore) {
                    report[one.exid] = 'fail';
                } else {
                    throw e;
                }
            }
        }
        ctx.body = { items, castitems, items_bymail, report };
    } else {
        ctx.body = ctx.khexec(ctx.role, exid, times);
    }
    if (ctx.body.items_bymail.length > 0) {
        // todo send items by mail
    }
    // 新七日目标，官衔等级
    const lv = ctx.role.getItems(38004).count;
    hitHere(ctx.role, 98680, lv);

    ctx.body.newg = ctx.role.newg ? ctx.role.newg.map(g => g.base()) : [];
    ctx.body.newbook = ctx.role.newbook ? ctx.role.newbook : [];
    ctx.body.newsoulstone = ctx.role.newsoulstone ? ctx.role.newsoulstone : [];
    await ctx.role.save();
};
