
'use strict'
/**
 * this._leaveTeam = 1 则表示退出队伍,
 * this._replaceTeam = guid 表示替换对应guid的武将上阵
 * @type {exports}
 */
module.exports = exports = async function () {
    let change = false;
    let changeTeam ;
    for (let key in this.battleset){
        if(this._leaveTeam || this._replaceTeam){ // 退出队伍,或替换武将
            let  thePos ;
            if(!this._role.battlearr[key] || !this._role.battlearr[key].team){
                // 阵容数据不同步
                changeTeam = changeTeam || {}; // 删除掉数据保证同步
                const guid = this._id.toString();
                changeTeam[guid] = changeTeam[guid] || {con: {_id: guid}, update: {$unset: {}}};
                changeTeam[guid].update.$unset[`battleset.${key}`] = 1;
                continue;
            }
            for (let pos of Object.keys(this._role.battlearr[key].team)) {
                if(this._role.battlearr[key].team[pos] === this._id.toString()){
                    thePos = pos;
                    break;
                }
            }
            if(thePos){
                changeTeam = changeTeam || {}; // 避免循环 update 整合一次更新
                const guid = this._id.toString();
                changeTeam[guid] = changeTeam[guid] || {con: {_id: guid}, update: {$unset: {}}};
                changeTeam[guid].update.$unset[`battleset.${key}`] = 1;
                if(this._leaveTeam){
                    delete this._role.battlearr[key].team[thePos];
                } else {
                    const rguid = this._replaceTeam;
                    this._role.battlearr[key].team[thePos] = rguid;
                    changeTeam[rguid] = changeTeam[rguid] || {con: {_id: rguid}, update: {$set: {}}};
                    changeTeam[rguid].update.$set[`battleset.${key}`] = thePos;
                }
                this._role.markModified('battlearr');
            }
        }
        await this._role.updateBattleSetPower(key);
        if (key === 'teampvp' && this._role.teamid) { // async update
            this.db.models.pvpteam.findOne({_id: this._role.teamid}).then(team =>{
                if (team) return team.updatePower();
            }).catch(console.error)
        }
        change = true
    }
    if(changeTeam){
        for (let k in changeTeam) {
            const one = changeTeam[k];
            await this.db.models.general.updateOne( one.con, one.update);
        }
    }
    change && await this._role.save();
}
