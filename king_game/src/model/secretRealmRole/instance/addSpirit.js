const acquireLock = require("../../../util/acquireLock");
const deleteLock = require("../../../util/deleteLock");
/**
 * 为用户添加一个秘境精灵
 * @param {*} rid 
 * @param {*} id 
 */
module.exports = async function (rid, id) {
    let key = `${rid}-addSpirit`
    try {
        let result = await acquireLock(key, 500)
        if (!result) {
            throw new Error('lock operateSecretProps');
        }
        let spiritconfig = global.gameconfig.secretRealmjl[3].find(e =>
            e.ID == id
        )
        if (!spiritconfig) {
            throw new Error(`Invalid sprite file configuration${id}`);
        }

        // 从数据库中查询secretRealmRole
        const secretRealmRole = await global.dao.secretRealmRole.findOne({ rid });
        if (!secretRealmRole) {
            throw new Error('Secret realm role not found');
        }

        let spirit = secretRealmRole.spirit
        if (spirit[id]) {
            throw new Error('spirit already exist');
        }
        let insert = {}

        let qualityConfig = global.gameconfig.secretRealmjl[4].find(e => e.ID == id)
        let skillconfig = global.gameconfig.secretRealmjl[5].find(e => e.ID == id)
        if (!skillconfig) {
            throw new Error(`Invalid seatconfig${id}`);
        }
        let skill = []
        for (let x = 0; x < 10; x++) {
            skillconfig[`SKILL${x}`] ? skill.push(skillconfig[`SKILL${x}`]) : 0
        }
        insert[`spirit.${spiritconfig.ID}`] = {
            quality: qualityConfig.MAXQUA,
            skill: skill,
        }


        await global.dao.secretRealmRole.updateOne({ rid }, { $set: insert }, { upsert: true });

    } finally {
        await deleteLock(key)
    }

};


