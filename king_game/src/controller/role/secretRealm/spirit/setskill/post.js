'use strict';

//精灵技能升级
module.exports = async (ctx) => {
    let { skillSequence } = ctx.request.body;
    const secretRealmRole = ctx.secretRealmRole
    let check = 0;
    skillSequence.forEach(becheckid => {
        for (let id in secretRealmRole.spirit) {
            let reuslt = secretRealmRole.spirit[id].skill.find(checkid => becheckid == checkid
            )
            if (reuslt || becheckid == 0) {
                check++
                break;
            }

        }
    })
    let seatconfig = global.gameconfig.secretRealmjl[6].find(e => e.ID == secretRealmRole.spiritId)
    if (!seatconfig) {
        throw new Error(`Invalid seatconfig${id}`);
    }

    if (check !== skillSequence.length || seatconfig.MOUNTPLACE != skillSequence.length) {
        ctx.body = "invalid data"
        return
    }


    let insert = {}
    insert[`skillSequence`] = skillSequence
    await global.dao.secretRealmRole.updateOne({ rid: ctx.role.rid }, insert);
    ctx.body = "success"
    return
};
