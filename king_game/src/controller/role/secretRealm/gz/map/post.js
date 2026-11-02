'use strict';

//客户端在进入一个新地图的时候 一定要请求此消息
module.exports = async (ctx) => {
    const { mapid, gis } = ctx.request.body;
    const secretRealmRole = await global.dao.secretRealmRole.findOne({ rid: ctx.role.rid });

    let insert = {
        gis: gis,
        mapid: mapid > secretRealmRole.mapid ? mapid : secretRealmRole.mapid
    }
    if (!gis) {
        delete insert.gis
    }
    await global.dao.secretRealmRole.updateOne({ rid: ctx.role.rid }, { $set: insert });

    ctx.body = "success"

};
