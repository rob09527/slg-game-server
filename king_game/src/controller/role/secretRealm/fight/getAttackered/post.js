'use strict';

const incrAndExpire = require("../../../../../util/incrAndExpire");

//信息下发给客户端

module.exports = async (ctx) => {
    const { servid, rno } = ctx.role;

    const userlist = await global.dao.wdjzattacker.aggregate([
        {
            $match: {
                servid: String(servid),
                rno: { $ne: rno } // 新增排除当前用户rno的条件 
            }
        },
        { $sample: { size: 10 } }
    ]);
    let users = []
    for (let x of userlist) {
        let _role = await ctx.dao.role.findOne({ _id: x.rid })
        const player = await _role.getBattleSet('normal');

        const secretRealmRole = await global.dao.secretRealmRole.findOne({ rid: x.rid });
        let tmp = await addroleinfo(_role)
        x.spiritId = _role.spiritId
        let data = { ...tmp, spiritId: secretRealmRole.spiritId, rid: x.rid, player: player }
        users.push(data)
    }

    let data = {
        frequency: await incrAndExpire(ctx.role.rid, true),
        total: global.gameconfig.secretRealmWdjz[1][0].PKLIMITNUM,
        userlist: users
    }
    ctx.body = data;
};


async function addroleinfo(_role, rids) {

    let nolegion
    let nobest
    let list = []
    let rid = _role._id.toString()

    let key = 'rname';
    if (rid.length == 24) key = '_id';
    let tmp = _role.avatarInfo();
    // 最强10武将(可选)
    if (!nobest) tmp.bestgeneral = await _role.getBestGeneralList();
    // 获取军团信息(可选)
    if (!nolegion && _role.legion) {
        let legion = await global.dao.legion.findOne({ _id: _role.legion }, { name: 1 });
        if (legion) {
            tmp.legion = {
                id: _role.legion,
                name: legion.name,
            }
        }
    }
    // 同组服
    let batllearr = [];
    for (let i = 1; i <= 3; i++) {
        let bset = await _role.getBattleSet(`defense${i}`);
        batllearr.push(bset);
    };
    tmp.battlesetlist = batllearr



    return tmp
}