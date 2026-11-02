
const bConfig = require('./battle_config');

var GetConfig = function(configname){
    return bConfig.GetBattleConfig(configname)
}

/**
 * @title 陷阱战斗
 */
class ChariotUnit{
    constructor(objchariot, data, battle, bTools) {
        this.bTools = bTools
        this.battle = battle;
        this.land = data._land;
        this.born = data.born

        this.steps = 0;
        this.m_currFrameCDCount = 0;
        this.instrucThic = {}
        this.id = objchariot.id
        //服务器数据
        this.skillID = objchariot.skillid

        this.x = this.land == "left" ? 100:500
        this.y = this.land == "left" ? 100:500
        this.skillHitArr = []

        let cfg = GetConfig("dbChariotSkill")
        if(!cfg[this.skillID]){
            return
        }
        this.m_chariotcfg = gUtils.deepClone(cfg[this.skillID])
        if(this.m_chariotcfg){
            this.cdTimeFrame = Math.floor(this.m_chariotcfg.cdtime * 60)
        }

    }
    isDead(){
        return false
    }
    /**
     * @intro do some logic by every step
     */
    doLogicOneStep () {
        this.steps++;
        this.m_currFrameCDCount ++;
        this._doCheckSkill();
        this._doCurrSkill();
        this._doClearHitArr();
    }  
  
    saveStepInfo () {
       
    }

    GetEnemyArr(){
        let allAliveEnemyArr = [];
        let tarr = this.battle.leftUnitArr.concat(this.battle.rightUnitArr);

        for(let i = 0; i < tarr.length; ++i) {
            let ele = tarr[i];
            if(!ele.isDead() && ele.nowTeam != this.land){
                allAliveEnemyArr.push(ele)
            }
        }
        //所有敌人 乱序一次
        var enemyarr = []
        var rarr = this.bTools.getRandomArr(0, allAliveEnemyArr.length - 1, allAliveEnemyArr.length);

        for(let i = 0; i < rarr.length; ++i) {
            enemyarr.push(allAliveEnemyArr[rarr[i]]);

        }
        //优先攻击排序
        let enemyarr2 = []
        let tmpdata = {}
        for(let j=0; j<this.m_chariotcfg.pre_occu.length; j++){
            let occu = this.m_chariotcfg.pre_occu[j]
            for(let mm=0;mm<enemyarr.length;mm++){
                if(!tmpdata[mm] && enemyarr[mm] && enemyarr[mm].isOccu && enemyarr[mm].isOccu(occu)){
                    tmpdata[mm] = true
                    enemyarr2.push(enemyarr[mm])
                }
            }
        }

        //敌人筛选
        let result = []
        let maxNum = this.m_chariotcfg.target_num
        for(let k=0;k<enemyarr.length,k<maxNum;k++){
            result.push(enemyarr[k])
        }
        return result;
    }

    pushThicDeal (steps, ptype, addinfo) {
        if(!this.instrucThic[steps]) this.instrucThic[steps] = [];
        this.instrucThic[steps].push({type: ptype, info: addinfo});
    }

    _doCurrSkill(){
        let arr = this.instrucThic[this.steps]
        if(!arr){
            return
        }
        for(var i=0;i<arr.length; i++){
            switch(arr[i].type) {
                case "pushhit":
                    this.doEnemyHit(arr[i].info);
                    break;
                case "enemy":  
                    this.doEnemyEffect(arr[i].info);
                    break;
            }
        }
    }

    doEnemyHit(data){
        //角色伤害结算
        let arrunit = data.arrunit
        for(var i=0; i<arrunit.length; i++){
            let unit = arrunit[i]
            if(!this._checkUnitOK(unit)){
                continue
            }
            let hurminfo = {crit: 0, hurm: data.info.hurmval, hurmtype:data.info.hurmtype, crit: 0, ptype: "skill"};
            let beforehp = unit.battleInfo.hp 
            unit.doLogicHurt(hurminfo, null, true);
            let endhp = unit.battleInfo.hp 
            this._showDebugLog(this.steps, this.land, " ===>chariot normalhit", endhp - beforehp)
        }
    }

    doEnemyEffect(data){
        let sinfo = data.info
        let arrunit = data.arrunit

        if(sinfo.e_buff && sinfo.e_buff.length > 0) {
            for(let j = 0; j < sinfo.e_buff.length; ++j) {
                if(this.bTools.getRandom() > sinfo.e_buff[j].prob / 100) continue;
                let add = null;

                if(sinfo.e_buff[j].num){
                    switch(sinfo.e_buff[j].buffid){
                        case "b470211":{
                            add = this.getHurmInfo(2,sinfo.e_buff[j].num);
                        };break;
                         case "b470212":{
                            let arrtar = this.getTargetByType(2);
                            arrtar = arrtar.sortByType("atk", "dec");
                            let hurm = 0;
                            if(arrtar.length > 0) {
                                hurm = arrtar[0].getNowAttri("atk") * sinfo.e_buff[j].num / 100;
                            }
                            add = this.getHurmInfo(2,hurm);
                        };break;
                        default:add = sinfo.e_buff[j].num;break;
                    }
                } 

                for(var i=0; i<arrunit.length; i++){
                    let unit = arrunit[i]
                    if(!this._checkUnitOK(unit)){
                        continue
                    }
                    unit.pushOneBuff(sinfo.e_buff[j].buffid, sinfo.e_buff[j].ttime * 60, add, null);
                    this._showDebugLog(this.steps, this.land, this.skillID, " 添加chariotbuff:", sinfo.e_buff[j].buffid, " 到目标", unit.gsid,unit.born, unit.nowTeam)
                }
            }
        }
    }

    _checkUnitOK(unit){
        if(!unit || unit.isDead() || unit.isInvicible() || unit.Invisible){
            return false
        }
        return true
    }

    _doCheckSkill(){
        //配置找不到
        if(!this.m_chariotcfg){
            return
        }

        if(this.m_currFrameCDCount < this.cdTimeFrame){
            return
        }
        this.m_currFrameCDCount = 0;

        let arr = this.GetEnemyArr()
        if(arr.length == 0){
            return
        }
        let sinfo = this.m_chariotcfg
        //普通伤害 buff等
        if(sinfo.hurmtype && sinfo.hurmval) {
            //伤害值
            this._showDebugLog(this.steps, this.land, " ==>add chariot steps:", this.steps + 15, this.steps + 40)

            for(var i=0;i<arr.length; i++){
                this.skillHitArr.push({"show":false, "unit":arr[i], info:sinfo})
            }

            this.pushThicDeal(this.steps + 15, "pushhit", {arrunit: arr, info: sinfo});
            this.pushThicDeal(this.steps + 40, "enemy", {arrunit: arr, info: sinfo});
        }
    }
    _doClearHitArr(){
        for(var i=this.skillHitArr.length - 1;i>=0; i--){
            if(this.skillHitArr[i].show){
                this.skillHitArr.splice(i, 1)
            }
        }
    }
    _showDebugLog(){
        console.log.apply(console, arguments)
    }

    getHurmInfo (hurmtype,hurm) {
        let hinfo = {};
        hinfo.hurmtype = Number(hurmtype);
        hinfo.attval = hurm;
        hinfo.extra = 0;
        hinfo.pcr = 0;
        hinfo.vcr = 1;
        hinfo.tinc = 0;
        hinfo.inc = 0;
        return hinfo;
    }
}

module.exports = ChariotUnit;