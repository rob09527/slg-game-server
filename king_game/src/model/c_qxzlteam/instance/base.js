'use strict'

module.exports = exports = async function () {
	let tmp = this.toJSON();

    tmp.team = await this.getplayer();

    let config = tmp.type == 2?global.gameconfig.qxzlgroupcopy : global.gameconfig.qxzlhidecopy;
    tmp.up = config.UP[tmp.fellows.length];
    delete tmp.fellows;
    delete tmp.challenge;
    delete tmp.challengetime;
    delete tmp.challengerid;
    delete tmp.challengerid;

    return tmp;
}