
const bConfig = require('./battle_config');

var GetConfig = function(configname){
    return bConfig.GetBattleConfig(configname)
}

/**
 * @title 陷阱战斗
 */
class TrapUnit{
    constructor(objtrap, data, battle, bTools) {
        this.bTools = bTools
        this.battle = battle;
        this.land = data._land;
        this.born = data.born

        this.steps = 0;
        this.m_currTriggerNum = 0;
        this.instrucThic = {}
        this.skillHitArr = []
        //服务器数据
        this.skillID = objtrap.skillid
        this.id = objtrap.id

        this.gridX = data.x
        this.gridY = data.y
        
        let vec2 = this.getGridRealPos(this.gridX, this.gridY)
        this.x = vec2.x
        this.y = vec2.y

        this.bdead = false

        let cfg = GetConfig("dbTrapSkill")
        if(!cfg[this.skillID]){
            return
        }
        this.m_trapcfg = gUtils.deepClone(cfg[this.skillID])
        if(this.m_trapcfg && !this.m_trapcfg.canwalk == 0){
            //0是不可以走的
            this.battle.SetCantWalkGrid({x:this.gridX, y:this.gridY})
        }
    }
    getGridRealPos(gridX, gridY){
        return bConfig.gridPosArr[gridX][gridY]
    }
    /**
     * @intro do some logic by every step
     */
    doLogicOneStep () {
        this.steps++;
        this._doCheckSkill();
        this._doCurrSkill();
        this._doClearHitArr()
    }  
  
    saveStepInfo () {
       
    }

    GetEnemyInPos(){
        let bfieldarr = this.battle.bFieldArr;
        if(bfieldarr[this.gridX] && bfieldarr[this.gridX][this.gridY]) {
            let unit = bfieldarr[this.gridX][this.gridY].nowUnit
            if(unit && unit.nowTeam != this.land){
                return unit
            }
        }
        return null
    }

    pushThicDeal (steps, ptype, addinfo) {
        if(!this.instrucThic[steps]) this.instrucThic[steps] = [];
        this.instrucThic[steps].push({type: ptype, info: addinfo});
    }

    isDead(){
        return this.bdead
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
    _checkUnitOK(unit){
        if(!unit || unit.isDead() || unit.isInvicible() || unit.Invisible){
            return false
        }
        return true
    }

    doEnemyHit(data){
        //角色伤害结算
        let unit = data.unit
        if(!this._checkUnitOK(unit)){
            return
        }
        let hurminfo = {crit: 0, hurm: data.info.hurmval, hurmtype:data.info.hurmtype, crit: 0, ptype: "skill"};
        let beforehp = unit.battleInfo.hp 
        unit.doLogicHurt(hurminfo, null, true);
        let endhp = unit.battleInfo.hp 
        this._showDebugLog(this.steps, this.land, " ===> trap normalhit", endhp - beforehp)

        this.bdead = true
    }

    doEnemyEffect(data){
        let sinfo = data.info
        let unit = data.unit
        if(!this._checkUnitOK(unit)){
            return
        }
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

                unit.pushOneBuff(sinfo.e_buff[j].buffid, sinfo.e_buff[j].ttime * 60, add, null);
                this._showDebugLog(this.steps, this.land, this.skillID,{x:this.gridX, y:this.gridY}, " 添加buff:", sinfo.e_buff[j].buffid, " 到目标", unit.gsid,unit.born, unit.nowTeam)
            }
        }
    }

    _doCheckSkill(){
        //已经触发了
        if(this.m_currTriggerNum >= 1){
            return
        }
        //配置找不到
        if(!this.m_trapcfg){
            return
        }
        let unit = this.GetEnemyInPos()
        if(!unit){
            return
        }
        this.m_currTriggerNum ++;
        let sinfo = this.m_trapcfg
        //普通伤害
        if(sinfo.hurmtype && sinfo.hurmval) {
            //伤害值
            this._showDebugLog(this.steps,{x:this.gridX, y:this.gridY}, " ==>add steps:", this.steps + 15, this.steps + 40)
            //只处理普通伤害
            this.skillHitArr.push({"show":false, "unit":unit, info:sinfo})

            this.pushThicDeal(this.steps + 15, "pushhit", {unit: unit, info: sinfo});
            this.pushThicDeal(this.steps + 40, "enemy", {unit: unit, info: sinfo});
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
        // console.log.apply(console, arguments)
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

module.exports = TrapUnit;