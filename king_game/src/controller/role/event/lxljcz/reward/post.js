'use strict'

module.exports = async function (ctx, next) {
    const { index } = ctx.request.body;
    const { ITEMS, FULL } = ctx.config;
    ctx.assert(index >= 0, 'invalid index'+index);
    let record = ctx.role[ctx.lxljcz];
    let one;
    if (index < ITEMS.length) {
        one = record.task[index];
    }
    else {
        one = record.all;
    }
    ctx.assert(one,"indexd invaild"+index);
    ctx.assert(!one.got, 'already reward');
    let items = [];

    if (index < ITEMS.length) {
        ctx.assert(one.num >= ITEMS[index].NUM, 'not enough');
        items = ctx.lowerGsid(ITEMS[index].ITEMS);
    }
    else {
        let tasklen = record.task.length == ITEMS.length;
        ctx.assert(tasklen,"not enough")

        let len = ITEMS.length - 1;
        let finish = record.task[len].num >= ITEMS[len].NUM;
        ctx.assert(finish,"not enough")
        items = ctx.lowerGsid(FULL.ITEMS);
    }

    one.got = 1;
    if (index < ITEMS.length) {
        ctx.role[ctx.lxljcz].task[index] = one;
    }
    else {
        ctx.role[ctx.lxljcz].all = one;
    }

    ctx.role.markModified(`${ctx.lxljcz}`);

    ctx.role.addItemsNoSave(items);
    ctx.save = true;
    ctx.body = {
        items,
    };
}