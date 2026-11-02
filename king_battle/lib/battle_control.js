//所有单场战斗的实例 都只能用这个禁止其他地方使用random
const bTools  = require('./b_tools');
const bConfig  = require('./battle_config');
const ThicUnit  = require('./thical_unit');
const groundUnit  = require('./ground_unit');
const TrapUnit  = require('./trap_unit');
const ChariotUnit  = require('./chariot_unit');

const BaseUnit = require("./base_unit")

var GetConfig = function(configname){
    return bConfig.GetBattleConfig(configname) || {}
}

var GetBaseUnit = function(){
    return BaseUnit
}

var SKILLLOCK = [1,1,2,3,3,4,4];

/** 对base_unit数组排序
 * @param {根据类型值排序} type:"hp","atk"...
 * @param {排序顺序} order:"inc"--升序 "dec"--降序 
 * @param {只排多少数量} num: 1、2、3 - 排出指定数量即可  空为全排
 */

Array.prototype.sortByType  = function(type, order, num) {
    if (this.length <= 0) {return this;}
    let arr = [];
    arr[0] = this[0];
    for(let i = 1; i < this.length; ++i){
        let j = 0;
        for(;j < arr.length; ++j){
            if ("hp" == type) {
                if ("inc" == order) {
                    if(this[i].battleInfo.hp/this[i].initInfo.hp < arr[j].battleInfo.hp/arr[j].initInfo.hp) {break;}
                }else {
                    if(this[i].battleInfo.hp/this[i].initInfo.hp > arr[j].battleInfo.hp/arr[j].initInfo.hp) {break;}
                }
            }else {
                if ("inc" == order) {
                    if(type == "hpval"){
                        if(this[i].battleInfo["hp"] < arr[j].battleInfo["hp"]) {break;}
                    }else{
                        if(this[i].getNowAttri(type) < arr[j].battleInfo[type]) {break;}
                    }
                }else {
                    if(type == "hpval"){
                        if(this[i].battleInfo["hp"] > arr[j].battleInfo["hp"]) {break;}
                    }else{
                        if(this[i].getNowAttri(type) > arr[j].battleInfo[type]) {break;}
                    }
                }
            }
        }
        for(let k = arr.length - 1; k >= j; --k){
            arr[k+1] = arr[k];
        }
        arr[j] = this[i];
        if(num && arr.length >= num) break;
    }
    return arr;
}

class battleControl{
    constructor() {
        this.bFieldArr     = [];  

        this.leftUnitArr   = [];
        this.rightUnitArr  = [];

        this.leftGsidArr   = [];
        this.rightGsidArr  = [];

        this.effUnitArr    = [];

        this.leftInfo      = {};
        this.rightInfo     = {}; 

        //陷阱
        this.leftTrapArr   = [];
        this.rightTrapArr   = [];

        //战车
        this.leftChariotArr   = [];
        this.rightChariotArr   = [];


        for(let i = 0; i < 21; ++i) this.leftGsidArr[i]  = null;
        for(let i = 0; i < 21; ++i) this.rightGsidArr[i] = null;
        // app.bteam

        this.leftOccuMap = {};
        this.rightOccuMap = {};
        
        this.steps = 0;
        this.leftStepInfo  = {};
        this.rightStepInfo = {};
        this.effStepInfo   = {};
        this.effId = 0;

        // 锦囊技能 用
        this.leftSkill = [];                // 存放需要计时(有cd)释放的技能
        this.leftCdArr = [];
        this.leftCdReset = [];
        this.rightSkill = [];
        this.rightCdArr = [];
        this.rightCdReset = [];
    
        // 被动技能 触发式 或者初始化属性等技能
        this.leftSkillBack = {};
        this.rightSkillBack = {};


        // 神兽主动技能用
        this.instrucThic = {};
        this.leftThicMp = 0;
        this.leftThicCd = 999;   // 暂时不用
        this.rightThicMp = 0;
        this.rightThicCd = 999;  
        this.leftThicStep = {};
        this.rightThicStep = {};

        this.cantwalkArr = {}
        //战斗控制
        this.ispause = false;
        this.bDoUIThings = false;

        this.initFieldData();
        this.bTools = new bTools()
        
        GetBaseUnit().eventGlobal.clear();
    }

    //设置某个格子不能走
    SetCantWalkGrid(tabV2){
        let key = tabV2.x + "_" + tabV2.y
        this.cantwalkArr[key] = true
    }

    IsCanWalkGrid(x,y){
        let key = x + "_" + y
        return !this.cantwalkArr[key]
    }

    GetBTools(){
        return this.bTools
    }

    setBattleTime (nRound) {
        this.battleRound = nRound || 3600;
    }
    //暂停/恢复
    setPause(bpause){
        this.ispause = bpause
    }
    //是否大招暂停
    isBigSkillPause(){
        return this.ispause
    }

    getBigSkillAttackers(){
        var skillings = []
        for(var i=0; i<this.leftUnitArr.length; i++){
            var unit = this.leftUnitArr[i]
            if(unit && unit.isBigSkillPausing()){
                skillings.push(unit)
            }
        }
        //是否检查敌方
        if(this.isRightBigSkillPause()){
            for(var i=0; i<this.rightUnitArr.length; i++){
                var unit = this.rightUnitArr[i]
                if(unit && unit.isBigSkillPausing()){
                    skillings.push(unit)
                }
            }
        }
        return skillings
    }

    getBigSkillTargets(){
        var skillingtargets = []
        for(var i=0; i<this.leftUnitArr.length; i++){
            var unit = this.leftUnitArr[i]
            if(unit && unit.isBigSkillPausing()){
                var targets = unit.getbigskilltargets()
                if(targets){
                    for(var j=0; j<targets.length; j++){
                        skillingtargets.push(targets[j])
                    }
                }
            }
        }
        //是否检查敌方
        if(this.isRightBigSkillPause()){
            for(var i=0; i<this.rightUnitArr.length; i++){
                var unit = this.rightUnitArr[i]
                if(unit && unit.isBigSkillPausing()){
                    var targets = unit.getbigskilltargets()
                    if(targets){
                        for(var j=0; j<targets.length; j++){
                            skillingtargets.push(targets[j])
                        }                    
                    }
                }
            }
        }
        return skillingtargets
    }

    //敌方是否暂停
    isRightBigSkillPause(){
        return false
    }

    setPlayerInfo (objteam, land) {
        if(land == "left") {
            for(let i = 0; i < 21; ++i) this.leftGsidArr[i]  = null;
            this.leftInfo = {};
        }else{
            for(let i = 0; i < 21; ++i) this.rightGsidArr[i] = null;
            this.rightInfo = {};
        }
        for(let k in objteam) {
            let info = objteam[k];
            if(!info) continue;
            let param = {gsid: info.gsid, level: info.level, class: info.class, guid: info.guid, power: info.power};
            if(info.hppercent || info.hppercent == 0) {
                if(info.hppercent <= 0) continue;
                param.hp = info.hppercent;
            }
            if(info.nowmp || info.nowmp == 0) {
                param.nowmp = info.nowmp;
            }
            if(info.hpcover) {
                param.hpcover = info.hpcover;
            }
            if(info.nowhp || info.nowhp == 0) {
                if(info.nowhp <= 0) continue;
                param.nowhp = info.nowhp;
            }
            if(info.skin) param.skin = info.skin;
            if(info.specialskilllv) param.specialskilllv = info.specialskilllv;
            if(info.exclusive) param.eskill = info.exclusive.skill || [];
            if(info.horse){
                let temp = []
                for(var i = 0; i < info.horse.length; i++){
                    let horse = info.horse[i];
                    if(horse) {
                        temp = [...temp, ...horse.skill];
                    }
                }
                // 坐骑技能去除重复
                param.eskill = temp.filter((o,idx) => { return temp.indexOf(o) == idx});
            }
            if(info.pet){
                param.eskill = param.eskill || [];
                for(let lvl in info.pet.skills){
                    param.eskill.push(info.pet.skills[lvl]);
                }
            }
            if(info.treasure) {
                if(typeof(info.treasure) == "object") {
                    param.treasure = info.treasure.gsid;
                }else{
                    param.treasure = info.treasure;
                }
            } 
            if(info.specialbuff) param.specialbuff = info.specialbuff;
            if(info.exclusive_equip) {
                param.exclusive_equip = info.exclusive_equip;
                param.skill = info.skill;
            }
            // param.talent = info.talent || [0,0,0,0,0,0];
            param.soul = info.soul || [0,0,0,0];
            param.beastsoul = info.beastsoul || [];
            if(info.occusuitskill) param.occusuitskill = info.occusuitskill;
            if(info.bookskill) param.bookskill = info.bookskill;
            if(info.talentskill) param.talentskill = info.talentskill;    // 职业天赋技能
            let baseinfo = app.db.getGBaseByGsid(info.gsid);
            if(land == "left") {
                this.leftGsidArr[Number(k)] = param;
                this.leftInfo[Number(k)] = info.property;
                if(baseinfo.OCCU) {
                    this.leftOccuMap[baseinfo.OCCU] = this.leftOccuMap[baseinfo.OCCU] || 0;
                    this.leftOccuMap[baseinfo.OCCU]++;
                }
                if(baseinfo.OCCU2) {
                    this.leftOccuMap[baseinfo.OCCU2] = this.leftOccuMap[baseinfo.OCCU2] || 0;
                    this.leftOccuMap[baseinfo.OCCU2]++;
                }
            }else{
                this.rightGsidArr[Number(k)] = param;
                this.rightInfo[Number(k)] = info.property;
                if(baseinfo.OCCU) {
                    this.rightOccuMap[baseinfo.OCCU] = this.rightOccuMap[baseinfo.OCCU] || 0;
                    this.rightOccuMap[baseinfo.OCCU]++;
                }
                if(baseinfo.OCCU2) {
                    this.rightOccuMap[baseinfo.OCCU2] = this.rightOccuMap[baseinfo.OCCU2] || 0;
                    this.rightOccuMap[baseinfo.OCCU2]++;
                }
            }
        }
    }

    setThicInfo (objthic, land) {
        if(!objthic || !objthic.tid) return;
        if(land == "left") {
            this.leftThic = new ThicUnit(objthic, land, this, this.GetBTools());
        }else{
            this.rightThic = new ThicUnit(objthic, land, this, this.GetBTools())
        }
    }

    setZhenfa (objZ, land) {
        this[land + "Zhenfa"] = objZ;
        if(!this[land+"Zhenfa"]) this[land+"Zhenfa"] = {};
        // 附加星级
        this[land + "Zhenfa"].star = 0;
        if(this[land + "Zhenfa"].lv) {
            this[land + "Zhenfa"].star = Math.floor(this[land + "Zhenfa"].lv / 5);
        }
    }

    setTrapInfo(objtrap, land){
        // {"2":{}}  //key是所在位置
        objtrap = objtrap || {}
        for(var k in objtrap){
            let info = objtrap[k];
            if(!info) continue;
            if(land == "left"){
                let data = this.ChangeNumToXY(k, "left")
                data._land = land
                data.born = k
                this.leftTrapArr.push(new TrapUnit(info, data,this, this.GetBTools()))
            }else{
                let data = this.ChangeNumToXY(k, "right")
                data._land = land
                data.born = k
                this.rightTrapArr.push(new TrapUnit(info, data,this, this.GetBTools()))
            }
        }
    }

    setChariotInfo(objchariot, land){
        objchariot = objchariot || {}
        for(var k in objchariot){
            let info = objchariot[k];
            if(!info) continue;
            if(land == "left"){
                let data = this.ChangeNumToXY(k, "left")
                data._land = land
                data.born = k
                this.leftChariotArr.push(new ChariotUnit(info, data,this, this.GetBTools()))
            }else{
                let data = this.ChangeNumToXY(k, "right")
                data._land = land
                data.born = k
                this.rightChariotArr.push(new ChariotUnit(info, data,this, this.GetBTools()))
            }
        }
    }

    // 主线征战
    setVideoBattle () {
        this.setPlayerInfo(app.replayData.left.battleset.team, "left");
        this.setThicInfo(app.replayData.left.battleset.mythic, "left");
        this.setZhenfa(app.replayData.left.battleset.zhenfa, "left");

        this.setPlayerInfo(app.replayData.right.battleset.team, "right");
        this.setThicInfo(app.replayData.right.battleset.mythic, "right");
        this.setZhenfa(app.replayData.right.battleset.zhenfa, "right");
    }

    // 测试战斗 
    setTestBattle () {
        this.leftInfo = {};
        this.rightInfo = {};
    }

    setSeasonInfo (seasonInfo) {
        this.seasonInfo = seasonInfo;
    }

    initFieldData () {
        let xnum = bConfig.gridWidth;
        let ynum = bConfig.gridHeight;
        this.posArr = bConfig.gridPosArr;
        for(let i = 0; i < xnum; ++i) {
            this.bFieldArr[i] = [];
            for(let j = 0; j < ynum; ++j) {
                if(bConfig.gridPosArr[i][j]){
                    this.bFieldArr[i][j] = {
                        x:i,
                        y:j,
                        num:1
                    };
                }
            }
        }
    }

    getUnitBaseInfo (obj, land) {
        let result = gUtils.deepClone(obj);
        result.skills = [];
        result.gskills = [];
        result.pickAttr = {};        // 阵法属性使用
        let tmpclass  = obj.class || 0;
        let baseinfo = app.db.getGBaseByGsid(obj.gsid);
        result.model = baseinfo.MODEL;
        result.camp = baseinfo.CAMP;
        result.occu = baseinfo.OCCU;
        result.occu2 = baseinfo.OCCU2;
        result.star = baseinfo.STAR;
        if(obj.skin) {
            result.skin = obj.skin;
        }
        
        let specialskilllv = obj.specialskilllv || 0;
        if(!obj.exclusive_equip) {
            for(let i = 0; i < baseinfo.SKILL.length; ++i) {
                if(i >= SKILLLOCK[tmpclass]) continue;
                let skillid = baseinfo.SKILL[i] + (i < specialskilllv ? 1 : 0);
                result.skills.push(skillid);
                result.gskills.push(skillid);
            }
        }else{
            for(let i = 0; i < obj.skill.length; ++i) {
                result.skills.push(obj.skill[i]);
                result.gskills.push(obj.skill[i]);
            }
        }

        if(obj.eskill) {
            for(let i = 0; i < obj.eskill.length; ++i) {
                result.skills.push(obj.eskill[i]);
            }
        }
        if(obj.treasure) {
            let tinfo = app.db.getTBaseByGsid(obj.treasure);
            if(tinfo){
                for(let i = 0; i < tinfo.SKILL.length; ++i) {
                    result.skills.push(tinfo.SKILL[i]);
                }
            }
        }
        if(obj.soul) {
            for(let i = 0; i < obj.soul.length; ++i) {
                if(obj.soul[i] > 0) result.skills.push(obj.soul[i]);
            }
        }
        if(obj.beastsoul) {
            for(let i = 0; i < obj.beastsoul.length; ++i) {
                if(obj.beastsoul[i] > 0) result.skills.push(obj.beastsoul[i]);
            }
        }
        if(obj.occusuitskill && obj.occusuitskill.length > 0) {
            for(let i = 0; i < obj.occusuitskill.length; ++i) {
                if(obj.occusuitskill[i] > 0) result.skills.push(obj.occusuitskill[i]);
            }
        } 
        if(obj.bookskill && obj.bookskill.length > 0) {
            for(let i = 0; i < obj.bookskill.length; ++i) {
                if(obj.bookskill[i] > 0) result.skills.push(obj.bookskill[i]);
            }
        }
        // 插入职业天赋技能
        if(obj.talentskill && obj.talentskill.length > 0) {
            for(let i = 0; i < obj.talentskill.length; ++i) {
                if(obj.talentskill[i] > 0) result.skills.push(obj.talentskill[i]);
            }
        }
        // 插入阵法
        if(this[land + "Zhenfa"] && this[land + "Zhenfa"].id) {
            // 得到解锁阵眼的数量 查看位置是否在阵眼
            let zhenfa = this[land + "Zhenfa"];
            let azhenfa = this[(land == "left" ? "right" : "left") + "Zhenfa"] || {id: 0};
            if(zhenfa.pickAttr) {
                let ratio = 1;
                 // 判断是否被克制
                if(bConfig.getStateSrcforAgainst(zhenfa.id, azhenfa.id) == 2) ratio = 0.5
                for(let k in zhenfa.pickAttr) {
                    result.pickAttr[k] = zhenfa.pickAttr[k] * ratio;
                }
            }
            let maxInx = Math.min(zhenfa.star, 2);
            let pos = [];
            for(let i = 0; i < maxInx; ++i) {
                pos.push(zhenfa.pos[i]);
            }
            if(pos.indexOf(obj.born) >= 0) {
                result.skills.push(zhenfa.skillID);
            }
        }
        if(obj.specialbuff) {
            result.specialbuff = obj.specialbuff;
        }
        return result;
    }

    // 数组添加方法  addFuncTools
    addFuncToUnitArr () {
        this.leftUnitArr.sortByType = sortByType;
        this.rightUnitArr.sortByTpe = sortByType;
    }


    /** 锦囊处理 start*/ 
    setCardInfo (land, card) {
        if(!card || card.length <= 0) return;
        if(!this[land + "Ground"]) {
            this[land + "Ground"] = new groundUnit();
            this[land + "Ground"].init(land, this, card, this.GetBTools());
        }
    }
    /** 锦囊处理 end */

    initLeftUnitData () {
        this.leftFetterGsid = [];
        for(let i = 0; i < 21; ++i) {
            if(this.leftGsidArr[i]) {
                let posV2 = this.ChangeNumToXY(i, "left")
                let xpos = posV2.x;
                let ypos = posV2.y;

                let info = gUtils.deepClone(this.leftGsidArr[i]);
                info.team = "left";
                info.born = i;
                info.index = this.leftUnitArr.length;
                if(!this.createUnit(this.getUnitBaseInfo(info, "left"), this.leftInfo[i], this.steps, xpos, ypos)) continue;
                this.leftFetterGsid.push(this.leftGsidArr[i].gsid);
            }
        }
    }

    ChangeNumToXY(num, land){
        num = Number(num)
        let x = num%7;
        let y = Math.floor(num/7);

        if("right" == land){
             //1,3,5,7 走4开始
            y = x%2 == 1 ? 4 + y : 3+y
        }else if(land == "left"){
            //最左侧为
            y = 2 - y
        }
        return {x:x, y:y}
    }

    initRightUnitData () {
        this.rightFetterGsid = [];
        for(let i = 0; i < 21; ++i) {
            if(this.rightGsidArr[i]) {
                let posV2 = this.ChangeNumToXY(i, "right")
                let xpos = posV2.x;
                let ypos = posV2.y;

                let info = gUtils.deepClone(this.rightGsidArr[i]);
                info.team = "right";
                info.born = i;

                info.index = this.rightUnitArr.length;
                if(!this.createUnit(this.getUnitBaseInfo(info, "right"), this.rightInfo[i], this.steps, xpos, ypos)) continue;
                this.rightFetterGsid.push(this.rightGsidArr[i].gsid);
            }
        }
    }

    createUnit (cinfo, pinfo, steps, xpos, ypos, separa) {
        // let baseinfo = app.db.getGBaseByGsid(cinfo.gsid);
        let mname = cinfo.model;
        let unitInfo = GetConfig("dbRoleInfo")[mname];
        const Unit = GetBaseUnit()[mname] || GetBaseUnit()["BaseUnit"];
        if(!unitInfo) return false;
        if(!Unit) return false;
        let oneunit = new Unit();
        cinfo.battle = this;
        if(cinfo.hp == 0) return false; 
        if(!oneunit.initUnit(cinfo, pinfo, steps, this.GetIsDoUIThing(), this.GetBTools())) return false;
        let vec = this.posArr[xpos][ypos];
        oneunit.setPosition(vec.x, vec.y);
        oneunit.initFieldPos(xpos, ypos);
        this.bFieldArr[xpos][ypos].nowUnit = oneunit;
        if(cinfo.team == "left") this.leftUnitArr.push(oneunit);
        else this.rightUnitArr.push(oneunit);
        if(separa) {
            oneunit.initSeparaInfo(separa);
            for(let i = 0; i < this.leftUnitArr.length; ++i) {
                this.leftUnitArr[i].refreshPosMap();
            }
            for(let i = 0; i < this.rightUnitArr.length; ++i) {
                this.rightUnitArr[i].refreshPosMap();
            }
        }
        return true;
    }

    initUnitBaseData () {
        let lfetter = app.getFettersByGsidArr(this.leftFetterGsid);
        let rfetter = app.getFettersByGsidArr(this.rightFetterGsid);
        for(let i = 0; i < this.leftUnitArr.length; ++i) {
            this.leftUnitArr[i].refreshPosMap();
            this.leftUnitArr[i].initFetter(lfetter, rfetter);
            this.leftUnitArr[i].initThicBack();
            this.leftUnitArr[i].initSeason();
            this.leftUnitArr[i].initBaseData();
        }
        for(let i = 0; i < this.rightUnitArr.length; ++i) {
            this.rightUnitArr[i].refreshPosMap();
            this.rightUnitArr[i].initFetter(rfetter, lfetter);
            this.rightUnitArr[i].initThicBack();
            this.rightUnitArr[i].initSeason();
            this.rightUnitArr[i].initBaseData();
        }
        
        if(this.leftGround) {
            this.leftGround.setCardSkill();
            this.leftGround.start();
        }
        if(this.rightGround) {
            this.rightGround.setCardSkill();
            this.rightGround.start();
        }
    }

    addLeftMp (num) {
        if(this.leftThic) {
            this.leftThic.addMagic(num);
        }
    }

    addRightMp (num) {
        if(this.rightThic) {
            this.rightThic.addMagic(num);
        }
    }

    saveThicInfo (info, land) {
        if(land == "left") this.leftThicStep[this.steps] = info;
        else this.rightThicStep[this.steps] = info;
    }

    /**  神兽技能实现部分 end */

    /** 接受单位的信息反馈 */
    getOptByUnit(type, param) {
        let actFunc = {
            "skillchange": "oneSkillChange",
            "doskill": "oneDoSkill",
            "dohurt": "oneByHurt",
            "onedie": "oneDie",
        }
        if(this[actFunc[type]]) this[actFunc[type]](param);
    }

    // 是否替换技能
    oneSkillChange (param) {
        if(this.leftGround) {
            this.leftGround.BackBySkillChange(param.land, param.gsid, param.skills);
        }
    }

    // 某人释放了主动技能
    oneDoSkill (unit) {
        if(this.leftGround) {
            if(unit.initTeam == "left") this.leftGround.BackByFskill(unit);
            else this.leftGround.BackByEskill(unit);
        }
    }

    oneByHurt (unit) {
        if(this.leftGround) {
            if(unit.initTeam == "left") this.leftGround.BackByFhurt(unit);
            else this.leftGround.BackByEhurt(unit);
        }
    }

    oneDie (unit) {
        for(let i = 0; i < this.leftUnitArr.length; ++i) {
            this.leftUnitArr[i].getPeopleDie(unit);
        }
        for(let i = 0; i < this.rightUnitArr.length; ++i) {
            this.rightUnitArr[i].getPeopleDie(unit);
        }
        if(this.leftGround && unit.initTeam == "left") this.leftGround.getFriendDie(unit);

    }

    /**** */

    getEffId (){
        let id = this.effId;
        this.effId++;
        return id;
    }

    SetIsDoUIThings(able){
        this.bDoUIThings = able
    }

    GetIsDoUIThing(){
        return this.bDoUIThings
    }

    saveStepInfo (index, pinfo, land) {
        if(!this.GetIsDoUIThing()) return;
        if(!this.leftStepInfo[this.steps])  this.leftStepInfo[this.steps]  = {};
        if(!this.rightStepInfo[this.steps]) this.rightStepInfo[this.steps] = {};
        if(land == "left")  this.leftStepInfo[this.steps][index]  = pinfo;
        if(land == "right") this.rightStepInfo[this.steps][index] = pinfo;
    }

    saveEffStepInfo (id, pinfo) {
        if(!this.GetIsDoUIThing()) return;
        if(!this.effStepInfo[this.steps]) this.effStepInfo[this.steps] = {};
        this.effStepInfo[this.steps][id] = pinfo;
    }

    isOver() {
        if(this.steps > this.battleRound) {
            this._result = "lose";return true;
        }
        let leftAlive  = false;
        let rightAlive = false;

        for(let i = 0; i < this.leftUnitArr.length; ++i) {
            if(!this.leftUnitArr[i].isDead() && (!isNaN(this.leftUnitArr[i].born) || this.leftUnitArr[i].born[0] == "u")) {
                leftAlive = true;
                break;
            }
        }

        for(let i = 0; i < this.rightUnitArr.length; ++i) {
            if(!this.rightUnitArr[i].isDead() && (!isNaN(this.rightUnitArr[i].born) || this.rightUnitArr[i].born[0] == "u")) {
                rightAlive = true;
                break;
            }
        }

        if(leftAlive && !rightAlive) { 
            // console.log("左边赢了"); 
            this._result = "win"; 
            return true;
        }
        if(!leftAlive && rightAlive) { 
            // console.log("右边赢了"); 
            this._result = "lose"; 
            return true;
        }
        if(!leftAlive && !rightAlive) { 
            // console.log("平局"); 
            this._result = "lose"; 
            return true;
        }
        return false;
    }

    getBattleData () {
        let report = {left: [], right: []};

        for(let i = 0; i < this.leftUnitArr.length; ++i) {
            let p = this.leftUnitArr[i];
            if(isNaN(p.born)) continue;
            let obj = {gsid: p.gsid, hurm: Math.floor(p.hurmVal), heal: Math.floor(p.healVal), def: Math.floor(p.defVal), level: p._level, class: p._class, hp: p.battleInfo.hp};
            if(p._skin) obj.skin = p._skin;
            report.left.push(obj);
        }

        for(let i = 0; i < this.rightUnitArr.length; ++i) {
            let p = this.rightUnitArr[i];
            if(isNaN(p.born)) continue;
            let obj = {gsid: p.gsid, hurm: Math.floor(p.hurmVal), heal: Math.floor(p.healVal), def: Math.floor(p.defVal), level: p._level, class: p._class, hp: p.battleInfo.hp};
            if(p._skin) obj.skin = p._skin;
            report.right.push(obj);
        }
        return report;
    }

    //暂停时间
    doLogicCalcuTime(dt){
        for(let i = 0; i < this.leftUnitArr.length; ++i) {
            this.leftUnitArr[i].doLogicCalcuTime(dt);
        }

        for(let i = 0; i < this.rightUnitArr.length; ++i) {
            this.rightUnitArr[i].doLogicCalcuTime(dt);
        }
    }

    updateOneStep () {
        if(this.steps > 0) {
            for(let i = 0; i < this.leftUnitArr.length; ++i) {
                this.leftUnitArr[i].doResetClientShow();
                this.leftUnitArr[i].doResetData();
            }
    
            for(let i = 0; i < this.rightUnitArr.length; ++i) {
                this.rightUnitArr[i].doResetClientShow();
                this.rightUnitArr[i].doResetData();
            }
        }
        this.steps++;

        if(this.leftGround) this.leftGround.update();
        if(this.rightGround) this.rightGround.update();
                
        //陷阱战车检查
        // console.log(this.leftTrapArr)
        for(let i = 0; i < this.leftTrapArr.length; ++i) {
            this.leftTrapArr[i] && this.leftTrapArr[i].doLogicOneStep();
        }
        for(let i = 0; i < this.rightTrapArr.length; ++i) {
            this.rightTrapArr[i] && this.rightTrapArr[i].doLogicOneStep();
        }
        for(let i = 0; i < this.leftChariotArr.length; ++i) {
            this.leftChariotArr[i] && this.leftChariotArr[i].doLogicOneStep();
        }
        for(let i = 0; i < this.rightChariotArr.length; ++i) {
            this.rightChariotArr[i] && this.rightChariotArr[i].doLogicOneStep();
        }
        //陷阱检查

        var tmparr  = [];
        var llen = this.leftUnitArr.length;
        var rlen = this.rightUnitArr.length;
        for(let i = 0; i < llen; ++i) tmparr.push(i);
        for(let i = llen; i < llen + rlen; ++i) tmparr.push(i);
        
        this.bTools.getDisOrderIndex(tmparr);
        
        //角色buff计算
        for(let i = 0; i < this.leftUnitArr.length; ++i) {
            this.leftUnitArr[i].updateBuffAura();
            this.leftUnitArr[i].updateDebuffAura();
        }
        for(let i = 0; i < this.rightUnitArr.length; ++i) {
            this.rightUnitArr[i].updateBuffAura();
            this.rightUnitArr[i].updateDebuffAura();
        }

        //乱序出手
        for(let i = 0; i < tmparr.length; ++i) {
            if(tmparr[i] < llen) this.leftUnitArr[tmparr[i]].doLogicCalcu();
            else this.rightUnitArr[tmparr[i] - llen].doLogicCalcu();
        }
        //死亡检查
        for(let i = this.effUnitArr.length - 1; i >= 0; --i) {
            if(this.effUnitArr[i].updateState() == "over") {
                this.effUnitArr[i].destroy();
                this.effUnitArr.splice(i,1);
            }
        }

        //神兵技能
        if(this.leftThic) this.leftThic.doLogicOneStep();
        if(this.rightThic) this.rightThic.doLogicOneStep();

        //角色信息记录
        for(let i = 0; i < this.leftUnitArr.length; ++i) {
            this.leftUnitArr[i].saveStepInfo();
        }
        for(let i = 0; i < this.rightUnitArr.length; ++i) {
            this.rightUnitArr[i].saveStepInfo();
        }

        for(let i = 0; i < this.effUnitArr.length; ++i) {
            this.effUnitArr[i].saveEffStepInfo();
        }

        //神兵信息记录
        if(this.leftThic) this.leftThic.saveStepInfo();
        if(this.rightThic) this.rightThic.saveStepInfo();

        //陷阱 战车记录
        for(let i = 0; i < this.leftTrapArr.length; ++i) {
            this.leftTrapArr[i] && this.leftTrapArr[i].saveStepInfo();
        }
        for(let i = 0; i < this.rightTrapArr.length; ++i) {
            this.rightTrapArr[i] && this.rightTrapArr[i].saveStepInfo();
        }
        for(let i = 0; i < this.leftChariotArr.length; ++i) {
            this.leftChariotArr[i] && this.leftChariotArr[i].saveStepInfo();
        }
        for(let i = 0; i < this.rightChariotArr.length; ++i) {
            this.rightChariotArr[i] && this.rightChariotArr[i].saveStepInfo();
        }
        //

        if(this.isOver()) {
            console.log(this.steps);

            if(this.leftGround) this.leftGround.end();
            if(this.rightGround) this.rightGround.end();
            return true;
        }
        return false;
    }

    destroy () {
        this.leftUnitArr.forEach(ele => {
            ele.destroy();
        });
        this.rightUnitArr.forEach(ele => {
            ele.destroy();
        });
        delete this;
    }
}

module.exports = battleControl;