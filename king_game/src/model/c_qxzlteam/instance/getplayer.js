'use strict'

module.exports = exports = async function () {
    let team = [];
    for (let {rid, help} of this.fellows) {
        const role = await this.db.models.role.findOne({_id:rid});
        if (!role) continue;
        let fellow = {
            rid,
            help,
            rname: role.name,
            level: role.level,
            frameid: role.frameid,
            headid: role.headid,
            _power: (await role.getBattleSet('qxzldef')).power,
        };
        team.push(fellow);
    }
    
    return team;
}