'use strict';

//打boss
module.exports = async (ctx) => {
    const { id } = ctx.request.body;

    const secretRealmRole = ctx.secretRealmRole

    if (secretRealmRole.boss[id]) {
        throw new Error(`You have already killed Boos`);
    }

    const result = global.gameconfig.secretRealmGz[3].find(e => e.ID == id);
    if (!result) {
        throw new Error(`No configuration found for ID: ${id}`);
    }
    if (result.item[0].gsid == 0) {
        throw new Error(`No configuration item`);
    }

    const items = result.item;
    ctx.role.addItemsNoSave(items);

    await ctx.role.save();
    let insert = {}
    insert[`boss.${id}`] = 1
    await global.dao.secretRealmRole.updateOne({ rid: ctx.role.rid }, { $set: insert });

    ctx.body = {
        items
    };
};
