'use strict'

/**
 *  重新打某一场军团战
 */
module.exports = async function (pvpDate, legion) {
    if (!pvpDate) {
        throw 'miss pvpDate'
    }

    if (!legion) {
        throw 'miss legion'
    }
    await require('king_game/src/schedule/legionpvpfight').main({pvpDate, legion}).catch(console.error);
    return 'OK';
}
