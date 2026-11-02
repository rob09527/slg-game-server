exports.name = '道具增减';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    let {uid, servid, gsid, count, time} = body;
    const res = await this.remote.agent_prop_add({uid: uid, servid: +servid}, gsid, count,'GM_SEND',time);

    return res;
};

