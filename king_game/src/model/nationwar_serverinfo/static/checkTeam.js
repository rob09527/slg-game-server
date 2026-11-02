
'use strict'

// 检查队伍是否出场;
module.exports = async function (areamark, set, index, posindex) {
    let info = await this.findOne({ areamark }, { [set]: 1, infield: 1 });
    info = info.toObject();
    if (!info) return false;
    let teamList = info[set];
    if (!teamList) return false;
    let t_info = teamList[index][posindex]
    if (!t_info) return false
    // 找到队伍,判断出战是否有这个队伍
    let teaminfo = teamList[index].splice(posindex, 1);
    console.log('NATIONWAR_CHECKTEAM_TEAMINFO',teaminfo,new Date().toLocaleString())
    if (teaminfo && teaminfo.length == 0) return false;
    teaminfo = teaminfo[0];
    let infileds = info.infield;
    for (let way in infileds) {
        let inner = infileds[way];
        for (let data in inner) {
            let userList = inner[data];
            if (typeof userList == 'number') continue;
            for (let user of userList) {
                console.log('NATIONWAR_CHECKTEAM',user.servid,teaminfo.servid,user.uid,teaminfo.uid,user.teamid,teaminfo.teamid,new Date().toLocaleString())
                if (user.servid == teaminfo.servid && user.uid == teaminfo.uid && user.teamid == teaminfo.teamid){ 
                    return false;
                }
            }
        }
    }
    return true;
}
