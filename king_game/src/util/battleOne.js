const bs = require('../util/battleseason');
/**
 * 打一场战斗
 * @param left
 * @param right
 * @param type
 * @return {Promise<void>}
 */
module.exports = async function (left, right, type = 'legionpvp') {

    assert(left && typeof left === 'object', 'invalid left');
    assert(right && typeof right === 'object', 'invalid right');

    if (left.specialbuff && left.specialbuff.length > 0) { // 如果队伍有特殊buf
        Object.values(left.team).forEach(g => {
            g.specialbuff = left.specialbuff;
        })
    }

    if (right.specialbuff && right.specialbuff.length > 0) { // 如果队伍有特殊buf
        Object.values(right.team).forEach(g => {
            g.specialbuff = right.specialbuff;
        })
    }

    let {season, pos} = bs();
    const battle = new global.dao.c_battle({
        rid: '',
        type,
        player: left,
        enemy: right,
        season: {
            left: left._role ? left._role.level : 1,
            right: right._role ? right._role.level : 1
        }
    });
    battle.save = () => {
    }; // 替换 save 方法，不保存到本服
    battle.season.season = season;
    battle.season.pos = pos;
    await battle.cal();
    return {
        season: battle.season,
        seed: battle.seed,
        result: battle.result
    };
}
