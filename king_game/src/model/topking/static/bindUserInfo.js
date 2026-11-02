'use strict'

/**
 * 绑定用户信息 巅峰赛专用
 * @param p{ {uid: string, servid: number}}
 * @return {Promise<*|*>}
 */
module.exports = async function (p) {
    const role = await global.dao.role.findOne({servid: +p.servid, uid: p.uid}, {frameid:1,imageid:1,rno:1,iconid: 1, headid: 1, rname: 1, legion: 1, _power: 1, 'hide.38001': 1, 'hide.38003': 1,sex: 1 });
    p.iconid = role.iconid;
    p.headid = role.headid;
    p.frameid = role.frameid;
    p.imageid = role.imageid;
    p.rname = role.name;
    p.level = role.level;
    p.lname = await role.lname();
    p.rno = role.rno;
    p.rid = role.rid;
    p.vip = role.vip;
    p.sex = role.sex;
    p.rid = role._id.toString();
    return p;
}
