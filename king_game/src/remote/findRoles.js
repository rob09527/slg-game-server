'use strict'

/**
 * 查询角色(proxy 调用)
 */
module.exports = async function (opt) {
    const role = await global.dao.role.findOne(opt, {
        uid: 1,
        rname: 1,
        rno: 1,
        hide: 1,
        iconid: 1,
        headid: 1,
        sex: 1,
        servid: 1,
        update: 1,
        channel: 1,
        bundle:1,
        platform: 1,
        cdkeys: 1,
    });
    return {
        rid: role._id,
        uid: role.uid,
        rno: role.rno,
        iconid: role.iconid,
        headid: role.headid,
        sex: role.sex,
        name: role.name,
        level: role.level,
        vip: role.vip,
        servid: +role.servid,
        channel: role.channel,
        bundle: role.bundle,
        platform: role.platform,
        update: role.update,
        cdkeys: role.cdkeys
    }
}
