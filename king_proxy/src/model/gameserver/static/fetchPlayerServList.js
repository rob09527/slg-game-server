/**
 * 根据策略返回玩家可以看到的服务器列表
 * @param opts {{uid: string, channel: string, gameid: string|number}}
 */
module.exports = async function (opts) {
    const uid = opts.channel && !opts.uid.startsWith(opts.channel) ? `${opts.channel}${opts.uid}` : opts.uid;
    const now = Date.now();
    // const is_wl = await global.dao.whitelist.iswl(uid, opts.ip);
    const is_wl = global.CACHE.whitelist[uid] || global.CACHE.whitelist[opts.ip];
    // const match = {};
    // if (!is_wl) { // 白名单返回所有的服务器
    //     // match.start = {$lte: now};
    //     if(opts.verify > 0){
    //         match.type = 1;:
    //     }else{
    //         match.type = {$ne : 1}
    //     }
    //     // const key = '' + opts.gameid;
    //     // match['info.filter'] = {$in: ['all', key]};
    // }
    // const list = await this.find(match).sort({start:1});
    const list = is_wl ? global.CACHE.gameserver.list : opts.verify > 0 ? global.CACHE.gameserver.verify : global.CACHE.gameserver.normal;
    const opentime = opts.verify > 0 ? global.CACHE.gameserver.opentime[1] : global.CACHE.gameserver.opentime[0];
    let notice = 0;
    let servers = [];
    for (const k in list) {
        const serv = list[k];
        if (is_wl || now >= serv.start) {// 白名单返回所有的服务器
            let result = serv.base()
            if (result.servid !== 11213) {
                servers.push(serv.base());
            }
        }
    };

    const game = Object.values(global.gameservs)[0]; // 取一个游戏实例
    const roles = await game.remote.findRolesByUid(uid);
    const roleMap = {};
    roles.forEach(role => {
        roleMap[role.servid] = role;
    });


    let auto_open = global.setting.auto_open && global.setting.auto_open == 1 && opts.verify == 0 && opentime > 0 && now >= opentime;
    let not_recommend = true;
    for (let i = global.recommendNum; i < servers.length + global.recommendNum; i++) {
        let serv = servers[i % servers.length];
        serv.role = roleMap[serv.servid];
        serv.lastlogin = serv.role && serv.role.update;

        let auto_num = list[serv.servid].auto_num || global.setting.auto_num;
        let auto_pay = list[serv.servid].auto_pay || global.setting.auto_pay;
        let serverRoleNum = global.serverRoleNum[+serv.servid] || 0;
        let serverPayNum = global.serverPayNum[+serv.servid] || 0;
        if (serv.status) { // 开服状态
            if (serverRoleNum < auto_num && serverPayNum < auto_pay) {
                serv.status = 1; // 设备为流程
            }
            else {
                serv.status = 2; // 设备为饱满
            }
        }
        // 推荐随机未满的服
        if (not_recommend && serverRoleNum < auto_num && serverPayNum < auto_pay) {
            not_recommend = false;
            serv.status = 1;
            serv.recommend = 1;
        }
    }
    //因为运营一些错误的操作。跳过一些id大于1000的错误ID
    let index = 1;
    try {
        for (let x = 1; x < 20; x++) {
            serv = servers[servers.length - x];
            if (serv.servid < 10000) {
                index = x
                break;
            }
        }
    } catch (error) {
        console.error(error)
    }
    try {
        if (not_recommend) {
            if (auto_open) {
                // 自动开服   
                const serv = servers[servers.length - index];
                let name = `${servers.length + 1}${global.setting.auto_name}`
                if (global.config.LANG == 'VN') {
                    name = `${global.setting.auto_name} ${servers.length + 1}`
                }
                const r = await this.create({
                    servid: serv.servid + 1,
                    name: name,
                    groupid: serv.groupid + 1,
                    room: serv.room,
                    start: Date.now(),
                    sno: serv.serv.id + 1,
                    info: {
                        filter: ['all']
                    },
                    area: serv.area,
                    create: Date.now(),
                    status: 1 // 默认是开服状态， 0 表示维护
                });
                const s = r.base();
                s.recommend = 1;
                servers.push(s);
                global.CACHE.gameserver.normal[r.servid] = r;
                global.CACHE.gameserver.list[r.servid] = r;
            }
            else if (servers.length > 0) {
                if (servers[servers.length - 1].status) { // 开服状态， 最后一个服改成   status = 1
                    servers[servers.length - 1].status = 1;
                }
                servers[servers.length - 1].recommend = 1; // 最后一个服设置为推荐
            }
            else {
                notice = 1;
            }
        }
        else {
            // 递增推荐服起点
            global.recommendNum++;
            if (global.recommendNum == servers.length) {
                global.recommendNum = 0;
            }
        }
    } catch (error) {
        console.error('自动开服索引错误', error)
        await gameserver()
    }

    return { serverlist: servers, opentime: opentime, notice: notice };
}


const gameserver = async function () {
    try {
        let gameserver = await global.dao.gameserver.find().sort({ _id: -1 });
        global.CACHE.gameserver = { list: {}, normal: {}, verify: {}, opentime: [0, 0] };
        for (let v of gameserver) {
            if (v.type == 1) {
                global.CACHE.gameserver.verify[v.servid] = v;
                if (global.CACHE.gameserver.opentime[1] == 0 || global.CACHE.gameserver.opentime[1] > v.start) {
                    global.CACHE.gameserver.opentime[1] = v.start;
                }
            }
            else {
                global.CACHE.gameserver.normal[v.servid] = v;
                if (global.CACHE.gameserver.opentime[0] == 0 || global.CACHE.gameserver.opentime[0] > v.start) {
                    global.CACHE.gameserver.opentime[0] = v.start;
                }
            }
            global.CACHE.gameserver.list[v.servid] = v;
        }
    } catch (error) {
        console.error("error", '更新缓存', error)
    }

}
