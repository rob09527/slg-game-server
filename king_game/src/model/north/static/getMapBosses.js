'use strict';


// 获取当前关卡的 boss列表
module.exports = async function (groupid) {

    // 查出最高关卡的6个怪
    let bossList = await this.find({groupid }).sort({mapid: -1}).limit(6);
    const currentMapid = bossList[0] ? bossList[0].mapid : -1;
    const now = Date.now();
    if(bossList.length) {
        assert(bossList[0].expireAt >= now, 'not start'); // boss 过期了
    }
    // bossList = bossList.filter(b => (!b.etime || b.etime > now) ); // 逃跑的boss 也返回
    const noKillBossList = bossList.filter(b => (!b.kill && (!b.etime || b.etime > now))  );
    if (noKillBossList.length === 0){
        const {MAP} = global.gameconfig.north_fight;
        const nextMapId = currentMapid + 1;
        const cfg = MAP[nextMapId]; //
        if (!cfg){ // 返回空表示通关了
            return [];
        }
        bossList = await this.createBoss(nextMapId, groupid);
    } else {
        bossList = bossList.filter(b => b.mapid === bossList[0].mapid); // 过滤掉不是当前关卡的boss
    }
    return bossList;
};
