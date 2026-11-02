const SocketAction = require("./socket.action");
const zhdpoint = require("../util/event/point");
const pandpoint = require("../util/event/panda");
const roleinfoget = require("../controller/role/info/get/post");
const remind = require("../controller/role/remind/post");

module.exports = {
    /**
     * 上线
     * @param socket {SocketClient}
     * @param recon {boolean} 是否重连
     */
    async online(socket, recon) {
        if (CLIENT_POOL[socket.role._id]) { // 如果已经有链接的 先踢掉
            const rid = socket.role._id;
            CLIENT_POOL[rid].disconnect(4103, 'other ip login');
        }
        global.remote.closeClient(socket.role._id, global.PROCESS_KEY, 4103, 'other ip login'); // 提掉其他游戏实例的链接
        try {
            socket['platform'] = socket.role._tokeninfo.platform
            socket['servid'] = socket.role._tokeninfo.servid
            socket['channel'] = socket.role._tokeninfo.channel ? socket.role._tokeninfo.channel : '0'
        } catch (error) {
            console.error(error, "在线统计模块")
        }
        CLIENT_POOL[socket.role._id] = socket;
        // 上报在线人数._tokeninfo
        global.PROXY_SERVER && global.PROXY_SERVER.reportOnlineCount(1, socket.role._tokeninfo);
        const role = socket.role;
        // 加入聊天房间
        role.joinchat(!!recon);
        // 每一次上线
        await pandpoint('EVENT_LOGIN', role);
        role.dispatchEvent('EVENT_LOGIN');
        role.missionInvoke('DENGLU', true);
        if (recon) {
            socket.emit("SUCCESS", {
                IS_NEW: !!role._new_
            }); // 重连也需推送 SUCCESS ,
            return;
        }
        role._path_ = 'login';
        // 非重连的情况 触发登录事件, 和用户信息推送，武将信息推送，红点计算推送

        global.dao.loginlog.createLog(role).catch(console.error); // 创建登录日志
        zhdpoint('LJDL', role);
        const ctx = {
            client: socket,
            role,
            assert: assert,
            NO_PUSH_CHENRAL: true, // 标记 接口不推送武将信息
            dao: global.dao,
            _init_: true,
            _update_: Date.now()
        };

        // 刷新卧龙战令
        await global.dao.warorder.refresh(role);

        await roleinfoget(ctx);
        const roleinfo = ctx.body;
        roleinfo.IS_NEW = !!role._new_; // 是否是刚注册的用户
        socket.emit("SUCCESS", roleinfo); // 推送登录成功，并推送角色信息
        role._path_ = null;
        // 计算并推送第一次红点信息
        const mrole = await global.dao.role.findOne({ _id: role._id }); // 红点函数会覆盖 role 实例方法，所以重新查一个
        mrole._gameserv = role._gameserv;
        mrole._tokeninfo = role._tokeninfo;
        ctx.role = mrole; // 查一个
        ctx.role._path_ = 'remind';
        ctx.zhdpoint = zhdpoint.bind(ctx.role);
        ctx._init_ = false;
        await remind(ctx);
        // const remindInfo = ctx.body;
        // socket.emit("REMIND", remindInfo); // 推送第一次计算的红点信息
        // 查找当前跳转链接配置
        // const filter = { channel: ctx.role.channel };
        // const skipConf = await global.dao.skiplink.findOne(filter, {url:1, isshow:1, bundles:1});
        // if(skipConf) {
        //     let {isshow, url = '', bundles = []} = skipConf;
        //     if(bundles && bundles.length > 1){
        //         // 是否在设置的包名内
        //         isshow = bundles.includes(ctx.role.bundle);
        //     }
        //     socket.emit("O_PUSH", {type:'skiplink', content: { isshow, url }}); // 推送第一次计算的红点信息
        // }
    },

    /**
     * 离线
     * @param socket {SocketClient}
     */
    async offline(socket) {
        let count = socket.role.others["93316"]?.count;
        const rid = socket.role && socket.role._id;
        //这个地方有问题，回去重复数据一些数据。
        await new Promise(function (resolve, reject) {
            socket.role && socket.role.dispatchEvent('EVENT_OFFLINE');
            resolve('成功') // 数据处理完成
        }).then(
            (res) => { console.log(res) },  // 成功
            (err) => { console.log(err) } // 失败
        )
        // socket.role && socket.role.dispatchEvent('EVENT_OFFLINE');
        if (CLIENT_POOL[rid] === socket) {  // 可以实现更多逻辑
            delete CLIENT_POOL[rid];
        }
        // 上报在线人数
        global.PROXY_SERVER && global.PROXY_SERVER.reportOnlineCount(2, socket.role._tokeninfo);
        let zeroday = new Date().setHours(0, 0, 0, 0);
        let today = zeroday == new Date(socket.logineTime).setHours(0, 0, 0, 0);
        !today && (socket.logineTime = zeroday);
        let time = socket._last_ping_ - socket.logineTime;
        if (time > 0) {
            global.dao.role.updateOne({ _id: rid }, { $inc: { "others.90737.count": time } }).then().catch(console.error);
        }
        if (count > 0) {
            await global.dao.role.updateOne({ _id: rid }, { $set: { "others.93316.count": count } }).then().catch(console.error);
        }

        await this.offlineEvent(socket.gameCache, rid)
    },

    async offlineEvent(gameCache, rid) {
        if (gameCache && gameCache.mjxxl) {
            let resut = await global.dao.role.updateOne({ _id: rid }, { mjxxl: gameCache.mjxxl }, { upsert: true })
        }

    }
}
