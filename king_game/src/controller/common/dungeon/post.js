'use strict'


module.exports = exports = async (ctx, next) => {
    const {
        DUNGEON_REF = {
            "FDISPLAY": [1, 2, 5,6],
            "CRON": "0 1 * * 3,7"
        },
    } = global.gameconfig.dungeon || {};

    ctx.body = {
        open: DUNGEON_REF.FDISPLAY,
    };
}
