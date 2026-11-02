'use strict';
// 武将排行榜
/**
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {

    let params = {
        general: {
            gsid: ctx.general.gsid
        }
    };

    // 已开服的服务器开始上报武将信息到common
    if (ctx.role._gameserv.groupstart < Date.now()) {
        params = {
            general: ctx.general.base(),
            role: {
                rid: ctx.role.i(),
                rname: ctx.role.rname,
                sex: ctx.role.sex,
                level: ctx.role.level,
                frameid: ctx.role.frameid,
                vip: ctx.role.vip,
                iconid: ctx.role.iconid,
                servid: ctx.role.servid,
                uid: ctx.role.uid,
            },
        }
    }

    if (params.role) {
        await ctx.dao.generalrank.rankUpdate(params.general, params.role);
    }
    const areaId = ctx.role._gameserv.area.id;

    const gname = global.gameconfig.generalname[params.general.gsid];
    const servers = await global.dao.gameserver.find({ 'area.id': areaId }); // 只查同区的武将排行榜
    const list = await ctx.dao.generalrank.find({ gname, 'role.servid': { $in: servers.map(s => s.servid) } }).sort({ power: -1 }).limit(100);

    const sGroup = {};
    for (const s of servers) {
        sGroup[s.servid] = s.name;
    }

    const localList = params.role ? (await ctx.dao.generalrank.find({ gname, 'role.servid': params.role.servid }).sort({ power: -1 }).limit(20)) : [];
    let global_self = {}, local_self = {};
    let transRole = (item) => {
        if (item && Object.keys(item).length > 0) {
            let { _id, __v, ...o } = item.toJSON();
            o.role.servname = sGroup[o.role.servid];
            return o
        }
        return {};
    }
    if (params.general.guid) {
        global_self = await ctx.dao.generalrank.findOne({ gname, guid: params.general.guid, 'role.servid': { $in: servers.map(s => s.servid) } });
        global_self = transRole(global_self);
        if (global_self && Object.keys(global_self).length > 0) {
            let self_power = global_self.power;
            global_self.rank = await ctx.dao.generalrank.find({ gname, power: { $gt: self_power }, 'role.servid': { $in: servers.map(s => s.servid) } }).count() + 1;
        }
        local_self = params.role ? await ctx.dao.generalrank.findOne({ gname, guid: params.general.guid, 'role.servid': params.role.servid }) : {};
        local_self = transRole(local_self);
        if (local_self && Object.keys(local_self).length > 0) {
            let self_power = local_self.power;
            local_self.rank = await ctx.dao.generalrank.find({ gname, power: { $gt: self_power }, 'role.servid': params.role.servid }).count() + 1;
        }
    }
    ctx.body = {
        global_server: list.map(item => { let { _id, __v, ...o } = item.toJSON(); o.role.servname = sGroup[o.role.servid]; return o }),
        local_server: localList.map(item => { let { _id, __v, ...o } = item.toJSON(); o.role.servname = sGroup[o.role.servid]; return o }),
        local_self,
        global_self
    };
};
