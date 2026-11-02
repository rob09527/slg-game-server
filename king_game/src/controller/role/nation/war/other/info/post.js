
'use strict'
// 国战-其他服务器的详细信息
module.exports = exports = async (ctx, next) => {
    let { areamark } = ctx.request.body;
    ctx.assert(areamark, 'invalid areamark');
    const otherInfo = async (opt) => {
        let { areamark } = opt;
        ctx.assert(areamark, 'invalid areamrk');
        // 跨服组下的服务器信息
        let serversInfo = await ctx.dao.nationwar_serverinfo.findOne(
            { areamark },
            {
                areamark: 1,
                servid: 1,
                groupmark: 1,
                servers: 1,
                standings: 1,
                name: 1,
                icon: 1,
                maxhp: 1,
                nowhp: 1,
                isout: 1,
                front: 1,
                back: 1,
                pre: 1,
                position: 1,
                kingname: 1
            })

        return {
            serversInfo
        };
    }

    // 缓存5分钟
    let needdata = await global.services.WangpvpService.find("nation:war_other_info:" + `${areamark}`);
    if (!needdata || Object.keys(needdata).length == 0) {
        needdata = {};
        // 没有国战信息
        // 把自己的服务器上传上去。
        let info = await otherInfo({ areamark });
        // 处理数据
        if (info.serversInfo) {
            let data = info.serversInfo;
            data = data.toObject();
            needdata.team = {};
            let frontarr = [0, 0];
            if (Object.keys(data.front).length >= 2) {
                frontarr[0] = Object.keys(data.front.left).length;
                frontarr[1] = Object.keys(data.front.right).length;
            }
            data.front = frontarr;
            let backarr = [0, 0];
            if (Object.keys(data.back).length >= 2) {
                backarr[0] = Object.keys(data.back.left).length;
                backarr[1] = Object.keys(data.back.right).length;

            }
            data.back = backarr;
            let prearr = [0];
            if (data.pre.length > 0) {
                prearr[0] = data.pre.length;
            }
            data.pre = prearr;

            needdata.team = {
                front: data.front,
                back: data.back,
                pre: data.pre
            }
            needdata.nowhp = data.nowhp;
            needdata.maxhp = data.maxhp;
            needdata.areamark = data.areamark;
            needdata.servid = data.servid;
            needdata.icon = data.icon;
            needdata.name = data.name;
            let standings = data.standings;
            let palaces = [];
            if (standings && standings.length > 0) {
                for (let rid of standings) {
                    let role = await ctx.dao.role.getOtherInfoAndBattleSet({ rid: rid }, 'nationwar');
                    if (!role) continue;
                    palaces.push(role);
                }

            }
            // 8个王信息
            needdata.palace = palaces
        }
        await global.services.WangpvpService.set("nation:war_other_info:" + `${areamark}`, needdata, 10 * 60);
    }

    ctx.body = needdata;
}