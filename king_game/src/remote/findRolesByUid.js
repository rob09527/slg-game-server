'use strict'

/**
 * 查询某个uid 所有服务器的角色(proxy 调用
 * @param uid {string}
 * @return [{rid: string, name: string, rno: string, iconid: number, headid: number, sex: number, level: number, vip: number, servid: number}]
 */
module.exports = async function (uid) {
    const roles = await global.dao.role.find({ uid }, {
        rname: 1,
        fid: 1,
        rno: 1,
        hide: 1,
        iconid: 1,
        headid: 1,
        sex: 1,
        servid: 1,
        update: 1,
        _power: 1,
        create: 1,
    });
    return roles.map(role => {
        return {
            rid: role._id,
            rno: role.rno,
            fid: role.fid,
            uid: role.uid,
            iconid: role.iconid,
            headid: role.headid,
            sex: role.sex,
            name: role.name,
            level: role.level,
            vip: role.vip,
            servid: role.servid,
            power: role._power,
            update: role.update,
            create: role.create,
        }
    })
}
