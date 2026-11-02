'use strict'
const assert = require("assert");
const tg = require('king_game/src/util/textgetter');
module.exports = async function (roleinfo, items, reason = 'GM_SEND') {
    const role = await global.dao.role.findOne(roleinfo);
    assert(role, 'err role');
    const mails = [];

    mails.push({
        rid: role.id,
        type: 2,
        title: tg("SHOPSUCCESS"),
        content: tg("SHOPSUCCESSCONTEXT"),
        reward: items,
    });
    await global.dao.mail.insertMany(mails);

    return 'ok';
}
