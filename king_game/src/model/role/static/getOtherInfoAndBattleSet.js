'use strict'
/**
 *  查询他人基本信息+阵容， 参数 rid 或 uid + servid
 * @param params {{rid?: string,uid?: string, servid?: number}}
 * @param type {string} kingpvp | normal | .... 阵容类型 , 不传递不查询阵容
 * @param mode {string}    if (mode === 'reson') {	// 共鸣模式(王者用)
 * @return {Promise<*|*>}
 */
module.exports = async function (params, type, mode = undefined) {
    const match = {};
    if (params.uid && !params.servid) {
        // 设置了 uid为设置 servid 抛出异常，避免使用者粗心
        throw new Error('MUST SET servid');
    } else if (params.uid) {
        match.uid = params.uid;
        match.servid = +params.servid;
    } else if (params.rid) {
        match._id = params.rid;
    } else {
        throw new Error('MISS PARAMS');
    }


    let role = await this.findOne(match, { act: 0, deviceid: 0, mood: 0, cdkeys: 0, special: 0, friends: 0 });
    assert(role, 'role err');

    const tmp = {};
    tmp.uid = role.uid;
    tmp.servid = role.servid;
    tmp.iconid = role.iconid;
    tmp.frameid = role.frameid;
    tmp.imageid = role.imageid;
    tmp.headid = role.headid;
    tmp.rname = role.name;
    tmp.military_level = role.military_level;
    tmp.power = await role.getBattlePower(type);
    tmp.level = role.level;
    tmp.lname = await role.lname();
    tmp.rno = role.rno;
    tmp.rid = role._id;
    let getBattleSet = async (type) => {
        let list;
        if (type === 'kingpvp') {
            list = [];
            for (let i = 1; i <= 3; i++) {
                if (!role.battlearr[`kingpvp${i}`]) continue;
                list.push(await role.getBattleSet(`kingpvp${i}`, mode));
            }
        } else if (type === 'wangpvp') {
            list = [];
            for (let i = 1; i <= 3; i++) {
                if (!role.battlearr[`wangpvp${i}`]) continue;
                list.push(await role.getBattleSet(`wangpvp${i}`, mode));
            }
        } else if (type === 'topkingpvp') {
            list = [];
            for (let i = 1; i <= 3; i++) {
                if (!role.battlearr[`topkingpvp${i}`]) continue;
                list.push(await role.getBattleSet(`topkingpvp${i}`, mode));
            }
        } else if (type === 'ringpvp') { // 国战擂台
            list = [];
            for (let i = 1; i <= 3; i++) {
                if (!role.battlearr[`ringpvp${i}`]) continue;
                list.push(await role.getBattleSet(`ringpvp${i}`, mode));
            }
        } else if (type === 'nationwar') {
            let list = {};
            tmp.teampower = {};
            for (let i = 1; i <= 3; i++) {
                if (!role.battlearr[`nationwar${i}`]) continue;
                list[i] = await role.getBattleSet(`nationwar${i}`, mode);
                tmp.teampower[i] = role._powerbattleset[`nationwar${i}`] || 0;
            }
            return list;
        } else if (type) {
            list = await role.getBattleSet(type, mode);
        }
        return list;
    }
    tmp.battleset = await getBattleSet(type);
    return tmp;
}
