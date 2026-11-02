'use strict';

//精灵技能升级
module.exports = async (ctx) => {
    let { id } = ctx.request.body;
    const secretRealmRole = ctx.secretRealmRole
    for (let spiritId in secretRealmRole.spirit) {
        for (let x = 0; x < secretRealmRole.spirit[spiritId].skill.length; x++) {
            let skillid = secretRealmRole.spirit[spiritId].skill[x]
            if (skillid == id) {
                let config = global.gameconfig.secretRealmSkill.find(e => e.id == id)
                if (!config || !config.item || !config.item.count) {
                    throw new Error('skill upgrade error config');
                }
                ctx.role.castItemsNoSave(config.item)
                await ctx.role.save()
                let newskill = id + 1
                secretRealmRole.spirit[spiritId].skill[x] = newskill

                let skillSequence = ctx.secretRealmRole.skillSequence

                const index = skillSequence.indexOf(id);
                if (index !== -1) {
                    skillSequence[index] = newskill;
                }
                let insert = {}
                insert[`skillSequence`] = skillSequence
                insert[`spirit.${spiritId}.skill`] = secretRealmRole.spirit[spiritId].skill
                await global.dao.secretRealmRole.updateOne({ rid: ctx.role.rid }, insert);
                ctx.body = "success"
                return
            }
        }
    }

    ctx.body = "fail"
};
