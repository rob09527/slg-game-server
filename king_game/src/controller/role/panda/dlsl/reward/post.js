
'use strict'
// 登录赏令
module.exports = exports = async function (ctx, next) {
    let file = "panda_dlsl" + ctx.FILEID;
	ctx.assert(global.gameconfig[file] , file + ' not find');
    let config = global.gameconfig[file].server;
    ctx.assert(config, file + ' server not find');

    let { batch } = ctx.request.body;
	let items = [];

    batch.forEach(({ exid, times }) => {
        let [key, index] = exid.split("_");
        let info = config[key];
        ctx.assert(info, "info not find" + key)
        for (let i = 0; i < times; i++) {
            const rule = info[index];
            ctx.assert(rule, "rule not find" + index);
            if (rule.REQUIRE) {
                for (let req of rule.REQUIRE) {
                    let flags = [];
                    const count = ctx.role.getProp(req.GSID);
                    if (typeof req.COUNT === 'number') flags.push(count == req.COUNT);
                    if (typeof req.MINCOUNT === 'number') flags.push(count >= req.MINCOUNT);
                    if (typeof req.MAXCOUNT === 'number') flags.push(count <= req.MAXCOUNT);
                    if (Array.isArray(req.IN)) flags.push(req.IN.includes(count)); // 增加一个包含条件
                    if (typeof req.POS === 'number') flags.push((0x00000001 & (count >> (req.POS - 1))) !== 1);

                    ctx.assert(flags.every(f => f), 'not satisfi');
                }
            }
            if (rule.TO) items = items.append(rule.TO);
        }
    })
    ctx.role.addItemsNoSave(items);
    await ctx.role.save();
    ctx.body = {
        reward: items.arrange(),
        newg: ctx.role.newg ? ctx.role.newg.map(g => g.base()) : [],
        newbook: ctx.role.newbook ? ctx.role.newbook : [],
        newsoulstone: ctx.role.newsoulstone ? ctx.role.newsoulstone : [],
    }
}