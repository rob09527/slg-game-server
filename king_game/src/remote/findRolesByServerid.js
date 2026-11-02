'use strict'

module.exports = async function (servid, page) {
    let limit = 500

    let offset = limit * (page - 1)
    let maxcount = await global.dao.role.find({ servid }).count()
    let maxpage = Math.ceil(maxcount / limit)
    const roles = await global.dao.role.find({ servid }, {
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
        legionName: 1,
        uid: 1,
        legion: 1,
        create: 1,
    }).sort({ create: -1 }).limit(limit).skip(offset)
    return roles.map(role => {
        return {
            maxpage: maxpage,
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
            legion: role.legion,
            legionName: role.legionName,
            create: role.create,
        }
    })
}
