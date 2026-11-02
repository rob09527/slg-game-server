
const bConfig = require('./battle_config');

var GetConfig = function(configname){
    return bConfig.GetBattleConfig(configname)
}

var eventFunc = {
    "A": "BackByEnemyHit",
    "B": "BackByDoSkill"
}

/**
 * @title 神兽单位
 * @intro 神兽单位 释放主动技能等 
 */
class ThicUnit{
    constructor(objThic, land, battle, bTools) {
        this.bTools = bTools
        
        this.mp = 0;
        this.steps = 0;
        this.reqMap = new Map();
        this.instrucThic = {};
        this.tid = objThic.tid;
        this.class = objThic.class;
        this.level = objThic.level;
        // 是否只收到效果 而不造成伤害
        this.isOnlyEff = objThic.onlyeff;
        this.pskill = [0,0,0,0];
        for(let i = 0; i < objThic.pskill.length; ++i) {
            this.pskill[i] = objThic.pskill[i];
        }
        this.battle = battle;
        this.land = land;

        this.m_objTalent = {};
        let talentskill = objThic.talentskill || [];
        if(talentskill.length > 0) {
            for(let i = 0; i < talentskill.length; ++i) {
                let id = talentskill[i];
                let arr = gUtils.deepClone(GetConfig("dbThicTalent")[id]);
                if(!arr) return;
                for(let i = 0; i < arr.length; ++i) {
                    this.pushSkillTalent(arr[i]);
                }
            }
        }
    }

    onEvent (ev) {
        this.reqMap.set(ev, eventFunc[ev]);
    }

    emitEvent(ev, ...args) {
        let func = this.reqMap.get(ev);
        if(!func) return;
        this[func](...args);
    }

    /**
     * @intro is can do skill 
     */
    isCanDoSkill () {
        if(this.mp < 100) return false;
        this.mp = 0;
        this.doSkill();
    }

    doSkill () {
        let tid = this.tid;                    //  神兽id
        let cls = this.class;                  // 神兽阶级
        let lv = this.level;
        let tinfo = app.db.getMythicalById(tid);        
        let skillid = tinfo.SKILL[cls - 1];
        if(!skillid) return;
        let sarr = GetConfig("dbThicSkill")[skillid];    
        if(!sarr) return;
        let sinfo = sarr[lv - 1];
        if(!sinfo) return;

        this.doskillid = skillid;
        this.emitEvent("B");

        if(sinfo.etarget) {
            let enemyarr = [];
            let alive = this.getTargetByType(1);
            if(alive.length > 0) {
                var rarr = this.bTools.getRandomArr(0, alive.length - 1, sinfo.etarget);
                for(let i = 0; i < rarr.length; ++i) {
                    enemyarr.push(alive[rarr[i]]);
                }
                this.pushThicDeal(this.steps + 15, "pushhit", {tarr: enemyarr, id: skillid});
                this.pushThicDeal(this.steps + 40, "enemy", {tarr: enemyarr, info: sinfo});
            }
        }
        if(sinfo.starget) {
            let friendarr = [];
            let alive = this.getTargetByType(2);
            if(alive.length > 0) {
                if(!sinfo.hpmin) {
                    var rarr = this.bTools.getRandomArr(0, alive.length - 1, sinfo.starget);
                    for(let i = 0; i < rarr.length; ++i) {
                        friendarr.push(alive[rarr[i]]);
                    }
                }else {
                    let nodead = [];
                    nodead = alive.sortByType("hp", "inc");
                    for(let i = 0; i < nodead.length && i < sinfo.starget; ++i) {
                        friendarr.push(nodead[i]);
                    }
                }
            }
            this.pushThicDeal(this.steps + 40, "friend", {tarr: friendarr, info: sinfo, id: skillid});
        }
    }

    /**
     * @intro do some logic by every step
     */
    doLogicOneStep () {
        this.steps++;
        this.resetDataOneStep();
        this.updateState();
        this.checkThicDeal();
    }  

    /**
     * @intro do reset data of by every step
     */
    resetDataOneStep () {
        this.doskillid = 0;
        this.totalhurm = 0;
    }

    /**
     * @intro do some state logic by every step 
     */
    updateState () {
        this.updateMpAdd();
        if(this.isCanDoSkill()) {
            this.doSkill(); 
        }
    }

    /**
     * @intro auto add mp by every step
     */
    updateMpAdd () {
        if(this.steps % 60 == 0) {          // every sec get 10mp
            this.addMagic(10);  
        } 
    }

    /**
     * @intro push some opts of future 
     * @param {*} steps 
     * @param {*} ptype    "enemy"  or "friend"
     * @param {*} addinfo    opts with some info
     */
    pushThicDeal (steps, ptype, addinfo) {
        if(!this.instrucThic[steps]) this.instrucThic[steps] = [];
        this.instrucThic[steps].push({type: ptype, info: addinfo});
    }

    /**
     * @intro check is anything to do by every step 
     */
    checkThicDeal () {
        if(!this.instrucThic[this.steps]) return;
        let actions = this.instrucThic[this.steps];
        for(let i = 0; i < actions.length; ++i) {
            switch(actions[i].type) {
                case "pushhit":
                    this.doEnemyHit(actions[i].info);
                    break;
                case "enemy":  
                    this.doEnemyThic(actions[i].info);
                    break;
                case "friend":
                    this.doFriendThic(actions[i].info);
                    break;
            }
        }
    }

    /**
     * @intro do enemy hit for hit show
     */
    doEnemyHit (objInfo) {
        let tarr = objInfo.tarr;
        for(let i = 0; i < tarr.length; ++i) {
            tarr[i].skillHitArr.push(objInfo.id);
        }
    }    

    /**
     * @intro do real logic of enemy hit
     */
    doEnemyThic (objInfo) {
        let tarr = objInfo.tarr;
        let sinfo = objInfo.info;
        this.totalhurm = 0;
        for(let i = 0; i < tarr.length; ++i) {
            let hurminfo = this.getHurmInfo(sinfo.hurmtype,sinfo.hurmval);
            this.emitEvent("A", tarr[i], hurminfo);
            if(!this.isOnlyEff) {
                this.totalhurm += tarr[i].getCalHurm(null, hurminfo, "skill").hurm;
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

                    tarr[i].pushOneBuff(sinfo.e_buff[j].buffid, sinfo.e_buff[j].ttime * 60, add, null);
                }
            }
            if(sinfo.s_special && sinfo.s_special.length > 0) {
                for( let j = 0; j < sinfo.s_special.length; ++j) {
                    let special = sinfo.s_special[j];
                    switch(special.type) {
                        case 1:     // 驱散
                            for(let k = 0; k < special.params[0]; ++k) {
                                tarr[i].clearBuff(1,2);
                            }
                            break;
                        case 2:     // 扣蓝
                            tarr[i].addMagic(-special.params[0]);
                            break;
                        case 3:{    // 额外最高攻击力武将百分比伤害
                                let arrtar = this.getTargetByType(2);
                                arrtar = arrtar.sortByType("atk", "dec");
                                let hurm = 0;
                                if(arrtar.length > 0) {
                                    hurm = arrtar[0].getNowAttri("atk") * special.params[1] / 100;
                                }
                                let hinfo = this.getHurmInfo(special.params[0],hurm);
                                this.totalhurm += tarr[i].getCalHurm(null, hinfo, "skill").hurm;
                            }break;
                    }
                }
            }
        }
    }

    /**
     * @intro do real logic of friend opt
     */
    doFriendThic (objInfo) {
        let tarr = objInfo.tarr;
        let sinfo = objInfo.info;
        for(let i = 0; i < tarr.length; ++i) {
            if(sinfo.s_buff && sinfo.s_buff.length > 0) {
                for(let j = 0; j < sinfo.s_buff.length; ++j) {
                    if(this.bTools.getRandom() > sinfo.s_buff[j].prob / 100) continue;
                    let add = null;
                    if(sinfo.s_buff[j].num){
                        switch(sinfo.s_buff[j].buffid){
                            case "b470313":{
                                 let arrtar = this.getTargetByType(2);
                                 arrtar = arrtar.sortByType("atk", "dec");
                                if(arrtar.length > 0) {
                                    add = arrtar[0].getNowAttri("atk") * sinfo.s_buff[j].num / 100;
                                }
                            };break;
                            default:add = sinfo.s_buff[j].num;break;
                        }
                    } 
                    tarr[i].pushOneBuff(sinfo.s_buff[j].buffid, sinfo.s_buff[j].ttime * 60, add, null);
                }
            }
        }
    }

    /**
     * @param {*} mp  the increment of mp
     */
    addMagic (mp) {
        this.mp = Math.min(100, this.mp + mp);
        this.mp = Math.max(0, this.mp);
    }

    /**
     * @intro get target arr
     * @param {*} target 1 or 2 or 3  1 - enemy   2 - friend  3 - all
     */
    getTargetByType (target) {
        let result = [];
        let tarr = this.battle.leftUnitArr.concat(this.battle.rightUnitArr);

        for(let i = 0; i < tarr.length; ++i) {
            let ele = tarr[i];
            if(!ele.isDead() && ((target === 1 && ele.nowTeam != this.land) || 
                   (target === 2 && ele.nowTeam === this.land) || 
                   (target === 3))
                   ){
                        if(!(ele.nowTeam != this.land && (ele.Invisible || ele.isInvicible() || ele.getBuffNumByType("fangzhu") > 1)))
                        result.push(ele);
                    }
        }
        return result;
    }   

    /**
     * @intro push one talent
     */
    pushSkillTalent (arr, src) {
        if(!arr || !arr.length) return;
        let tp = arr[0].substr(0,1);
        if(!this.m_objTalent[tp]) {
            this.m_objTalent[tp] = [];
            this.onEvent(tp);
        }
        if(src) arr.splice(arr.length - 1, 0, src);
        this.m_objTalent[tp].push(arr);
    }

    /**
     * @intro enemyhit emit some thing 
     */
    BackByEnemyHit (target, hurminfo) {
        // 统计这个过程中额外造成的伤害
        this.m_objTalent["A"].forEach(ele => {
            switch(ele[0]) {
                case "A001": {     //  附加我方攻击力最高武将150的法术伤害
                        let tarr = this.getTargetByType(2);
                        tarr = tarr.sortByType("atk", "dec");
                        let hurm = 0;
                        if(tarr.length > 0) {
                            hurm = tarr[0].getNowAttri("atk") * ele[1] / 100;
                        }
                        let hinfo = this.getHurmInfo(ele[2],hurm);
                        this.totalhurm += target.getCalHurm(null, hinfo, "skill").hurm;
                    }
                    break;
                case "A002": {     //  伤害类型属性替换
                        hurminfo[ele[1]] += ele[2] / 100;
                    }
                    break;
            }
        });
    }

    /**
     * @intro back at the time of doskill
     */
    BackByDoSkill () {
        this.m_objTalent["B"].forEach(ele => {
            switch(ele[0]) {
                case "B001": {  // 给所有存活队友加buff
                        let tarr = this.getTargetByType(2);
                        for(let i = 0; i < tarr.length; ++i) {
                            tarr[i].pushOneBuff(ele[1], ele[2] * 60, null, this);
                        }
                    }
                    break;
                case "B002": {
                        let tarr = this.getTargetByType(2);
                        for(let i = 0; i < tarr.length; ++i) {
                            tarr[i].addMagic(ele[1]);
                        }
                    }
            }
    
        });

    }


    saveStepInfo () {
        if(!this.battle.GetIsDoUIThing()) return;
        let thicinfo = {};
        thicinfo.mp = this.mp;
        if(this.doskillid) thicinfo.skillid = this.doskillid;
        if(this.totalhurm) {
            thicinfo.totalhurm = this.totalhurm;
            // console.log(this.land, this.totalhurm);
        }
        this.battle.saveThicInfo(thicinfo, this.land);
    }   

    //
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

module.exports = ThicUnit;