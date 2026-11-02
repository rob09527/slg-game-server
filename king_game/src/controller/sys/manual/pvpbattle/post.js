'use strict';
const bs = require( '../../../../util/battleseason');



// common 战斗计算
module.exports = exports = async function (ctx, next) {
    const {
        left,
        right,
        type = 'legionpvp'
    } = ctx.request.body;
    ctx.assert(left && typeof left === 'object', 'invalid left');
    ctx.assert(right && typeof right === 'object', 'invalid right');

    if(left.specialbuff && left.specialbuff.length > 0){ // 如果队伍有特殊buf
        Object.values(left.team).forEach(g => {
            g.specialbuff = left.specialbuff;
        })
    }

    if(right.specialbuff && right.specialbuff.length > 0){ // 如果队伍有特殊buf
        Object.values(right.team).forEach(g => {
            g.specialbuff = right.specialbuff;
        })
    }

    let {season, pos} = bs();
    const battle = new ctx.dao.c_battle({
        rid: '',
        type,
        player:  left,
        enemy: right,
        season: {
            left: left._role ?  left._role.level : 1,
            right: right._role ?  right._role.level : 1
        }
    });
    battle.save = ()=>{}; // 替换 save 方法，不保存到本服
    battle.season.season = season;
    battle.season.pos = pos;
    await battle.cal();
    ctx.body = {
        season: battle.season,
        seed: battle.seed,
        result: battle.result
    };
};
