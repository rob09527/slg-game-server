const {ObjectId} = require("mongodb");
exports.name = '角色禁言操作';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const {hour = 24} = body;
    let uid = body.uid;
    let servid = body.servid;

    if (query.unforbid) {
        return await this.remote.agent_unmute_role({uid, servid: +servid}); //
    }


    if (body.from) {
        const roles = await this.service.game.collection('roles');
        const role = await roles.findOne({_id: ObjectId(body.from.rid)}, {uid: 1, servid: 1});
        if (!role) {
            throw '角色可能已经被删除';
        }
        uid = role.uid;
        servid = role.servid;
    }
    const mute = await this.remote.agent_ismute({uid, servid: +servid});

    if (mute) {
        throw '该角色已经被禁言';
    }
    return await this.remote.agent_mute_role({uid, servid: +servid}, (Number(hour) || 24) * 3600); //

};

