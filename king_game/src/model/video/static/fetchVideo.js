'use strict'

/**
 *
 * @param opt {object}
 * @param limit {number}
 */
module.exports = exports = async function (opt, limit = 3, myid) {

    let videos = await this.find(opt).sort({ _id: -1 }).limit(limit).exec();
    let rolelist = await global.dao.role.find({ _id: { $in: videos.map(item => item.rid) } });
    let roleMap = {};
    rolelist.forEach(r => roleMap[r.i()] = r);
    // 找出玩家的战力排行
    let videoList = [];
    for (let { video, time, rid, version = 202004081623, _id } of videos) {
        let role = roleMap[rid];
        let { power, frameid, rname: name, friends, headid } = await role.base();
        let friend = 0;
        if (friends.includes(myid)) friend = 1;
        videoList.push({
            power, frameid, name, friend,
            video, time, videoid: _id, version,
            headid
        })
    }
    return videoList;
}
