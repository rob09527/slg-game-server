/**
 * 场地单位
 */

const bConfig = require('./battle_config');

var GetConfig = function(configname){
    return bConfig.GetBattleConfig(configname)
}

const multi = ["hp", "atk", "def", "mdef"];
 
class groundUnit {
    constructor () {
        this.m_objSkillBack = {};       // 阵容固定好之后上阵人数后
        this.m_objSkillBackPre = {};    // 无需根据阵容变化每次重置 

        this.backCd = {};
        this.steps = 0;

        this.flagPool = {};             // 标记记录池

        // this.updateFuncArr = [];   // 将确定需要每步做的方法名放在此处
    }

    init(land, battle, card, bTools) {
        this._battle = battle,
        this._land = land;
        this.bTools = bTools
        this.selfUnitArr = land == "left" ? this._battle.leftUnitArr : this._battle.rightUnitArr;
        this.enemyUnitArr = land == "left" ? this._battle.rightUnitArr : this._battle.leftUnitArr;
        this._initCard = card;
        this.setCardSkillPre();
    }

    /** 根据卡牌信息 拼接得到最后的技能  start */

    // 得到无需根据阵容变化每次重置  如修改技能的卡
    setCardSkillPre () {
        for(let i = this._initCard.length - 1; i >= 0; --i) {
            let ele = this._initCard[i];
            let cinfo = GetConfig("cardconfig")[ele.id];
            if(!cinfo) continue;
            if(cinfo.INITTYPE) {
                for(let j = 0; j < cinfo.CSKILL.length; ++j) {
                    let sinfo = GetConfig("dbCardSkill")[cinfo.CSKILL[j]];
                    for(let k = 0; k < sinfo.length; ++k) {
                        this.pushOneSkillBackPre(gUtils.deepClone(sinfo[k]));
                    }
                }
                this._initCard.splice(i,1);
            }
        }
    }

    setCardSkill () {
        if(this._initCard.length <= 0) return;
        this.m_objSkillBack = {};
        this._card = gUtils.deepClone(this._initCard);
        for(let i = 0; i < this._card.length; ++i) {
            let ele = this._card[i];
            let cinfo = GetConfig("cardconfig")[ele.id];
            if(!cinfo) continue;
            // 得到 技能个数的num
            let num = this.getSkillNumIndex(cinfo.NUMTYPE, i);
            let count = this.getCountByType(cinfo.COUNTTYPE, i);
            if(count <= 0) continue;
            let index = this.getIndexByType(cinfo.INDEXTYPE, i);
            let sinfo;
            if(index < 0) {
                for(let j = 0;  j < cinfo.CSKILL.length && (num == -2 || j <= num); ++j) {
                    let sinfo = GetConfig("dbCardSkill")[cinfo.CSKILL[j]];
                    for(let k = 0; k < sinfo.length; ++k) {
                        this.pushOneSkillBack(gUtils.deepClone(sinfo[k]), count);
                    }
                }
            }else{
                sinfo = GetConfig("dbCardSkill")[cinfo.CSKILL[index]];
                for(let j = 0; j < sinfo.length; ++j) {
                    this.pushOneSkillBack(gUtils.deepClone(sinfo[j]), count);
                }
            }
        }
    }

    /** 得到可以释放的技能数量 start*/

    // 配置 和 第index张卡      -2 表示全部生效  -1表示都不生效
    getSkillNumIndex (config, index) {
        if(!config) return -2;
        let numFunc = {
            1:  "toNum1",
        }
        if(this[numFunc[config.TYPE]]) {
            return this[numFunc[config.TYPE]](config.PARAM, index);
        }
        return -2;
    }

    // 找配置类型的卡 2张以上生效技能1  3张生效技能2  如 连环计   得到生效技能下标上限
    toNum1 (param, index) {
        let num = -1;
        for(let i = index + 1; i < this._card.length; ++i) {
            let ele = this._card[i];
            let cinfo = GetConfig("cardconfig")[ele.id];
            if(!cinfo) continue;
            if(cinfo.TYPE === param[0]) {
                num++;
                this._card.splice(i,1);
                --i;
            }
        }
        return num;
    }

    /** 得到可以释放的技能数量 end*/

    /** 得到可以技能效果的层数 */

    getCountByType (config, index) {
        if(!config) return 1;
        let countFunc = {
            1: "toCount1",
            2: "toCount2",
            3: "toCount3",
            4: "toCount4",
            5: "toCount5"
        }
        if(this[countFunc[config.TYPE]]) {
            return this[countFunc[config.TYPE]](config.PARAM, this._card[index].param);
        }
        return 1;
    }


    // 根据上阵的势力人数 得到生效的层数
    toCount1 (param) {
        if(!param || param.length <= 0) return 1;
        let count = 0;
        for(let i = 0; i < this.selfUnitArr.length; ++i) {
            if(this.selfUnitArr[i]._camp == param[0]) {
                count++;
            }
        }
        return Math.min(count, param[1]);
    }

    // 根据上阵的职业人数 得到生效的层数
    toCount2 (param) {
        if(!param || param.length <= 0) return 1;
        let count = 0;
        for(let i = 0; i < this.selfUnitArr.length; ++i) {
            if(this.selfUnitArr[i]._occu == param[0] || this.selfUnitArr[i]._occu2 == param[0]) {
                count++;
            }
        }
        return Math.min(count, param[1]);
    }

    // 根据传入的参数 得到生效的层数   比如有多少张紫色的卡等 param 配置的参数  param2 是服务器传入的card信息上的参数
    toCount3 (param, param2) {
        if(!param || !param2 || param2.length <= 0) return 0;
        return Math.min(param[0], param2[0]);
    }

    // 根据有没有其他某种类型 得到2层           连环计 查有无计中计
    toCount4 (param) {
        if(!param || param.length <= 0) return 1;
        for(let i = 0; i < this._card.length; ++i) {
            let ele = this._card[i];
            let cinfo = GetConfig("cardconfig")[ele.id];
            if(!cinfo) continue;
            if(cinfo.TYPE == param[0]) {
                return param[1];
            }
        }
        return 1;
    }

    // 根据传入的参数的  判断 是否生效 1 生效 0 不生效
    toCount5 (param, param2) {
        if(!param2 || param2.length <= 0) return 0;
        return param2[0] > 0 ? 1 : 0;
    }

    /** 得到可以技能效果的层数 end */

    /** 得到指定使用哪个配置的技能  适用于多倍效果 */
    getIndexByType (config, inx) {
        if(!config) return -1;
        let indexFunc = {
            1:  "toIndex1"
        }
        if(indexFunc[config.TYPE]) {
            return this[indexFunc[config.TYPE]](config.PARAM, inx);
        }
        return -1;
    }

    // 存在某张卡  则这张卡 使用高级技能(下标1)  否则 0级技能(下标0)
    toIndex1 (param) {
        for(let i = 0; i < this._card.length; ++i) {
            let cinfo = GetConfig("cardconfig")[this._card[i].id];
            if(!cinfo) continue;
            if(cinfo.TYPE == Number(param[0])) {
                return 1;
            }
        }
        return 0;
    }

    /** 根据卡牌信息 拼接得到最后的技能 end */



    // 给某一方推入一个技能
    pushOneSkillBack (arr, count) {
        if(!arr || !arr.length) return;
        let tp = arr[0].substr(0,1);
        arr.push(count);
        if(!this.m_objSkillBack[tp]) this.m_objSkillBack[tp] = [];
        this.m_objSkillBack[tp].push(arr);
    }

    pushOneSkillBackPre (arr) {
        if(!arr || !arr.length) return;
        let tp = arr[0].substr(0,1);
        if(!this.m_objSkillBackPre[tp]) this.m_objSkillBackPre[tp] = [];
        this.m_objSkillBackPre[tp].push(arr);
    }

    /**
     * 处理锦囊技能在战斗开始之前 所有武将生成之后
     * A 打头技能
     */
    BackByInit () {
        if(!this.m_objSkillBack["A"]) return;
        let initFunc = {
            "A001": "initA001",
            "A002": "initA002",
            "A003": "initA003",
            "A004": "initA004",
            "A005": "initA005",
            "A006": "initA006",
            "A007": "initA007",
            "A008": "initA008",
            "A009": "initA009",
            "A010": "initA010",
            "A011": "initA011",
            "A012": "initA012",
            "A013": "initA013"
        }
        for(let i = 0; i < this.m_objSkillBack["A"].length; ++i) {
            let ele = this.m_objSkillBack["A"][i];
            if(initFunc[ele[0]]) this[initFunc[ele[0]]](ele);
        }
    }   

    // 以下 -1 都表示全体

    // 己方某所有属性增加 例子 ["A001", "hp", 10, "atk", 10,...]
    initA001 (ele) {   
        this.selfUnitArr.forEach(unit => {
            for(let i = 1; i < ele.length - 1; i+=2) {
                if(multi.indexOf(ele[i]) >= 0) {
                    let add = unit.baseInfo[ele[i]] * ele[i+1] * ele[ele.length - 1] / 100;
                    unit.initInfo[ele[i]] += add;
                    unit.battleInfo[ele[i]] += add;
                }else{
                    unit.battleInfo[ele[i]] += ele[i+1] * ele[ele.length - 1] / 100;
                }
            }
        });
    }

    // 己方某势力所有初始蓝量增加 例子  ["A002", 1, 10] -1 表示所有单位
    initA002 (ele) {
        this.selfUnitArr.forEach(unit => {
            if(unit._camp != ele[1] && ele[1] != -1) return;
            unit.addMagic(ele[2]);
        })
    }

    // 己方所有人 推入一个被动 例子 ["A003", "Z001",...]
    initA003 (ele) {
        let arr = [];
        for(let inx = 1; inx < ele.length - 1; ++inx) {
            arr.push(ele[inx]);
        }
        for(let i = 0; i < this.selfUnitArr.length; ++i) {
            this.selfUnitArr[i].pushSkillBack(arr);
        }
    }

    // 己方所有人 推入1个buff  ["A004", "C10078", 5]
    initA004 (ele) {
        for(let i = 0; i < this.selfUnitArr.length; ++i) {
            this.selfUnitArr[i].pushOneBuff(ele[1], ele[2] * 60, null, this);
        }
    }

    // 敌方所有人  推入1个被动  ["A005", "Z002",...]
    initA005 (ele) {
        let arr = [];
        for(let inx = 1; inx < ele.length - 1; ++inx) {
            arr.push(ele[inx]);
        }

        for(let i = 0; i < this.enemyUnitArr.length; ++i) {
            this.enemyUnitArr[i].pushSkillBack(arr);
        }
    }

    // 敌方固定人数 推入1个buff   ["A006",  "C10079", 5]
    initA006 (ele) {
        let unitArr = this.enemyUnitArr;
        let rlength = unitArr.length;
        let total = ele[1] == -1 ? unitArr.length : ele[1];

        let tmparr = this.getDisOrderIndex(rlength, total);

        for(let i = 0; i < tmparr.length; ++i) {
            unitArr[tmparr[i]].pushOneBuff(ele[2], ele[3] * 60, null, this);
        }
    }

    // 己方某势力所有属性增加 例子 ["A001", 1, "hp", 10, "atk", 10,...]
    initA007 (ele) {   
        this.selfUnitArr.forEach(unit => {
            if(unit._camp != ele[1]) return;
            for(let i = 2; i < ele.length - 1; i+=2) {
                if(multi.indexOf(ele[i]) >= 0) {
                    let add = unit.baseInfo[ele[i]] * ele[i+1] * ele[ele.length - 1] / 100;
                    unit.initInfo[ele[i]] += add;
                    unit.battleInfo[ele[i]] += add;
                }else{
                    unit.battleInfo[ele[i]] += ele[i+1] * ele[ele.length - 1] / 100;
                }
            }
        });
    }

    // 己方某职业所有属性增加 例子 ["A001", 1, "hp", 10, "atk", 10,...]
    initA008 (ele) {   
        this.selfUnitArr.forEach(unit => {
            if(unit._occu != ele[1] && unit._occu2 != ele[1]) return;
            for(let i = 2; i < ele.length - 1; i+=2) {
                if(multi.indexOf(ele[i]) >= 0) {
                    let add = unit.baseInfo[ele[i]] * ele[i+1] * ele[ele.length - 1] / 100;
                    unit.initInfo[ele[i]] += add;
                    unit.battleInfo[ele[i]] += add;
                }else{
                    unit.battleInfo[ele[i]] += ele[i+1] * ele[ele.length - 1] / 100;
                }
            }
        });
    }

    // 己方所有武将 克制效果 提升 x%
    initA009 (ele) {
        this.selfUnitArr.forEach(unit => {
            unit._campRestrainVal *= (1 + ele[1] / 100);
        })
    }

    // 替换武将技能 
    initA010 (ele) {
        this.selfUnitArr.forEach(unit => {
            let gsid = Number(unit.gsid) - (Number(unit.gsid) % 20 - 1);
            if(gsid == ele[1]) {

            }
        })
    }

    // 己方指定武将增加属性
    initA011 (ele) {
        this.selfUnitArr.forEach(unit => {
            let gsid = Number(unit.gsid) - (Number(unit.gsid) % 20 - 1);
            if(gsid = ele[1]){
                if(multi.indexOf(ele[2]) >= 0) {
                    let add = unit.baseInfo[ele[2]] * ele[3] / 100;
                    unit.initInfo[ele[2]] += add;
                    unit.battleInfo[ele[2]] += add;
                }else{
                    unit.battleInfo[ele[2]] += ele[3] / 100;
                }
            }
        })
    }

    // 敌方某职业所有属性增加 例子 ["A001", 1, "hp", 10, "atk", 10,...]
    initA012 (ele) {   
        this.enemyUnitArr.forEach(unit => {
            if(unit._occu != ele[1] && unit._occu2 != ele[1]) return;
            for(let i = 2; i < ele.length - 1; i+=2) {
                if(multi.indexOf(ele[i]) >= 0) {
                    let add = unit.baseInfo[ele[i]] * ele[i+1] * ele[ele.length - 1] / 100;
                    unit.initInfo[ele[i]] += add;
                    unit.battleInfo[ele[i]] += add;
                }else{
                    unit.battleInfo[ele[i]] += ele[i+1] * ele[ele.length - 1] / 100;
                }
            }
        });
    }

    // 己方指定武将增加属性
    initA013 (ele) {
        this.selfUnitArr.forEach(unit => {
            let gsid = Number(unit.gsid) - (Number(unit.gsid) % 20 - 1);
            if(gsid == ele[1]){
                let arr = [];
                for(let inx = 2; inx < ele.length - 2; ++inx) {
                    arr.push(ele[inx]);
                }
                unit.pushSkillBack(arr)
            }
        })
    }


    /** 初始化数据 end */

    /** 每步需要检索的技能 start */
    BackByUpdate () {
        if(!this.m_objSkillBack["B"]) return;
        let length = this.m_objSkillBack["B"].length;
        let updateFunc = {
            "B001": "updateB001",
            "B002": "updateB002",
            "B003": "updateB003",
            "B004": "updateB004",
            "B005": "updateB005",
            "B006": "updateB006",
            "B007": "updateB007",
            "B008": "updateB008",
        }
        for(let i = length - 1; i >= 0; --i) {
            let ele = this.m_objSkillBack["B"][i];
            if(updateFunc[ele[0]]) {
                if(this[updateFunc[ele[0]]](ele)) {                    // 如果不需要这个被动了
                    this.m_objSkillBack["B"].splice(i,1);
                }
            }
        }
    }

    // 第 x 步  己方 所有人生命恢复 1次       ["B001", 1, 20]
    updateB001 (ele) {
        if(this.steps >= ele[1]) {
            let unitArr = this.getFriendArr();
            for(let i = 0; i < unitArr.length; ++i) {
                let unit = unitArr[i];
                unit.getCalHeal(null, unit.getHealInfo(unit.initInfo.hp * ele[2] / 100), "skill");
            }
            return true;
        }
        return false;
    }

    // 第 x 步 随机 x个敌人 推入1个buff  ["B002", 20, 3 "C10092", 3]
    updateB002 (ele) {
        if(this.steps >= ele[1]) {
            let unitArr = this.getEnemyArr();
            let rlength = unitArr.length;
            let total = ele[2] == -1 ? unitArr.length : ele[2];

            let tmparr = this.getDisOrderIndex(rlength, total);

            for(let i = 0; i < tmparr.length; ++i) {
                unitArr[tmparr[i]].pushOneBuff(ele[3], ele[4] * 60, null, this);
            }
            return true;
        }
        return false;
    }

    // 第 x 秒 治疗血量最低的队友 已损生命值  ["B003", 900, 20]
    updateB003 (ele) {
        if(this.steps >= ele[1] * 60) {
            let unitArr = this.getFriendArr();
            if(unitArr.length <= 0) return true;
            let min = unitArr[0].battleInfo.hp;
            let index = 0;
            for(let i = 0; i < unitArr.length; ++i) {
                if(unitArr[i].battleInfo.hp < min) {
                    index = i;
                    min = unitArr[i].battleInfo.hp;
                }
            }
            unitArr[index].getCalHeal(null, unitArr[index].getHealInfo((unitArr[index].initInfo.hp - unitArr[index].battleInfo.hp) * ele[2] / 100), "skill");
            return true;
        }
        return false;
    }

    // 第 x 步  扣除某职业 -1 所有职业敌方最大生命值， 并推入一个buff  ["B004", 1, 30, "C12002", 10]
    updateB004 (ele) {
        if(this.steps >= ele[1]) {
            let unitArr = this.getEnemyArr();
            for(let i = 0; i < unitArr.length; ++i) {
                let nflag = ele[2];
                let occu = unitArr[i]._occu;
                let occu2 = unitArr[i]._occu2;
                if(!((nflag >> (occu - 1)) & 1 == 1)) continue;
                if(occu2 && !(nflag >> (occu2 - 1) & 1 == 1)) continue;
                if(unitArr[i]._occu2 && !(Math.pow(2, unitArr[i]._occu2 - 1) & ele[2] == Math.pow(2, unitArr[i]._occu2 - 1))) continue;
                let hurm = unitArr[i].initInfo.hp * ele[3] / 100;
                let hurminfo = {crit: 0, hurm: hurm, hurmtype: 3, ptype: "skill"};
                unitArr[i].doLogicHurt(hurminfo, null, true);
                unitArr[i].pushOneBuff(ele[4], ele[5] * 60, {heal: hurm, sec: ele[5]}, this);
            }
                return true;
            }
        return false;
    }

    // 第 x 步  扣除当前生命值,  并推入一个buff ["B005", 25 * 60, 20, "10004", 10]
    updateB005 (ele) {
        if(this.steps >= ele[1]) {
            let unitArr = this.getEnemyArr();
            for(let i = 0; i < unitArr.length; ++i) {
                let hurm = unitArr[i].battleInfo.hp * ele[2] / 100;
                let hurminfo = {crit: 0, hurm: hurm, hurmtype: 3, ptype: "skill"};
                unitArr[i].doLogicHurt(hurminfo, null, true);
                unitArr[i].pushOneBuff(ele[3], ele[4] * 60, null, this);
            }
            return true;
        }
        return false;
    }

    // 第x步 攻击敌方全体 并播放一个特效   ["B006", 900, 30, 5, 46001]    第4个元素为 特效提前出来的帧数
    updateB006 (ele) {
        if(this.steps >= ele[1] - ele[3] && !this.flagPool[ele[4]])  {
            let unitArr = this.getEnemyArr();
            for(let i = 0; i < unitArr.length; ++i) {
                unitArr[i].skillHitArr.push(ele[4]);
            }
            this.flagPool[ele[4]] = true;
        }
        if(this.steps == ele[1]) {
            let unitArr = this.getEnemyArr();
            for(let i = 0; i < unitArr.length; ++i) {
                unitArr[i].getCalHurm(null, unitArr[i].getHurmInfo(unitArr[i].battleInfo.hp * ele[2] / 100, 2), "skill")
            }
            return true;
        }
        return false;
    }

    // 每隔 x 秒 y个敌人 随机扣血 推入buff  ["B007", 10, 5, 10, 10004, 2]
    updateB007 (ele) {
        if(this.steps % (ele[1] * 60) == 0) {
            let unitArr = this.getEnemyArr();
            let rlength = unitArr.length;
            let total = ele[2] == -1 ? unitArr.length : ele[2];

            let tmparr = this.getDisOrderIndex(rlength, total);

            for(let i = 0; i < tmparr.length; ++i) {
                let hurm = unitArr[tmparr[i]].initInfo.hp * ele[3] / 100;
                let hurminfo = {crit: 0, hurm: hurm, hurmtype: 3, ptype: "skill"};
                unitArr[tmparr[i]].doLogicHurt(hurminfo, null, true);
                unitArr[tmparr[i]].pushOneBuff(ele[4], ele[5] * 60, null, this);
            }
        } 
    }

    // 开场后己方随机一个武将加蓝
    updateB008(ele) {
        if(this.steps >= ele[1]) {
            let unitArr = this.getFriendArr();
            let rlength = unitArr.length;
            let total = ele[2] == -1 ? unitArr.length : ele[2];

            let tmparr = this.getDisOrderIndex(rlength, total);
            for(let i = 0; i < tmparr.length; ++i) {
                unitArr[tmparr[i]].addMagic(ele[3]);
            }
            return true;
        }
        return false;
    }

    /** 每步需要检索的技能 end */

    /** 结束时 需要处理的天赋 start*/
    // 结束时 存活 武将 恢复    ["C001", 30]
    BackByEnd () {
        if(!this.m_objSkillBack["C"]) return;
        let length = this.m_objSkillBack["C"].length;
        let endFunc = {
            "C001" : "endC001",
        }

        for(let i = 0; i < length ; ++i) {
            let ele = this.m_objSkillBack["C"][i];
            if(endFunc[ele[0]]) {
                this[endFunc[ele[0]]](ele)
            }
        }
    }

    endC001 (ele) {         
        let unitArr = this.getFriendArr();
        for(let i = 0; i < unitArr.length; ++i) {
            unitArr[i].battleInfo.hp += Math.floor((unitArr[i].initInfo.hp - unitArr[i].battleInfo.hp) * ele[1] / 100);
        }
    }

    /** 结束时 需要处理的天赋 end*/

    /** 处理收到队友死亡讯息的技能 start */ 
    BackByFriendDie () {
        if(!this.m_objSkillBack["D"]) return;
        let length = this.m_objSkillBack["D"].length;
        let fDieFunc = {
            "D001": "fDieD001",
            "D002": "fDieD002"
        }        
        for(let i = 0; i < length; ++i) {
            let ele = this.m_objSkillBack["D"][i];
            if(fDieFunc[ele[0]]) this[fDieFunc[ele[0]]](ele);
        }
    }

    // 队友死亡 己方属性提升   有上限
    fDieD001 (ele) {
        if(this.flagPool[ele[1]] && this.flagPool[ele[1]] > ele[2]) return;
        if(!this.flagPool[ele[1]]) this.flagPool[ele[1]] = 0;
        this.flagPool[ele[1]] += 1;
        let unitArr = this.getFriendArr();
        for(let i = 0; i < unitArr.length; ++i) {
            let unit = unitArr[i];
            if(multi.indexOf(ele[3]) >= 0) {
                let add = unit.baseInfo[ele[3]] * ele[4] / 100;
                unit.initInfo[ele[3]] += add;
                unit.battleInfo[ele[3]] += add;
            }else{
                unitArr[i].battleInfo[ele[3]] += ele[4] / 100;
            }
        }
    }

    // 队友死亡 我方回血
    fDieD002 (ele) {
        let unitArr = this.getFriendArr();
        for(let i = 0; i < unitArr.length; ++i) {
            unitArr[i].getCalHeal(null, unitArr[i].getHealInfo(unitArr[i].initInfo.hp * ele[1] / 100), "skill");
        }
    }



    /** 处理收到队友死亡讯息的技能 end */ 

    /** 处理收到敌人死亡讯息的技能 start */
    BackByEnemyDie () {
        if(!this.m_objSkillBack["E"]) return;
        let length = this.m_objSkillBack["E"].length;
        let eDieFunc = {
            "E001": "eDieE001",
        }
        for(let i = 0; i < length; ++i) {
            let ele = this.m_objSkillBack["E"][i];
            if(eDieFunc[ele[0]]) this[eDieFunc[ele[0]]](ele);
        }
    }

    // 敌人死亡 我方属性提升
    eDieE001 (ele) {
        if(this.flagPool[ele[1]] && this.flagPool[ele[1]] > ele[2]) return;
        if(!this.flagPool[ele[1]]) this.flagPool[ele[1]] = 0;
        this.flagPool[ele[1]] += 1;
        let unitArr = this.getFriendArr();
        for(let i = 0; i < unitArr.length; ++i) {
            if(multi.indexOf(ele[2]) >= 0) {
                let add = unit.baseInfo[ele[3]] * ele[4] / 100;
                unit.initInfo[ele[3]] += add;
                unit.battleInfo[ele[3]] += add;
            }else{
                unitArr[i].battleInfo[ele[3]] += ele[4] / 100;
            }
        }
    }

    /** 处理收到敌人死亡讯息的技能 end */

    /** 处理收到队友放技能的信息节能 start */ 
    BackByFskill (target) {
        if(!this.m_objSkillBack["F"]) return;
        let length = this.m_objSkillBack["F"].length;
        let fSkillFunc = {
            "F001": "fSkillF001"
        }

        for(let i = length - 1; i >= 0; --i) {
            let ele = this.m_objSkillBack["F"][i];
            if(fSkillFunc[ele[0]]) {
                if(this[fSkillFunc[ele[0]]](ele, target)) {
                    this.m_objSkillBack["F"].splice(i,1);
                }
            }
        }
    }

    fSkillF001 (ele, target) {
        target.addMagic(ele[1]);
        return true;
    }
    /** 处理收到队友放技能的信息节点 end */ 

    /** 处理收到敌人放技能的信息节点 start */
    BackByEskill (target) {
        if(!this.m_objSkillBack["G"]) return;
        let length = this.m_objSkillBack["G"].length;
        let eSkillFunc = {
            "G001": "eSkillG001"
        }

        for(let i = length - 1; i >= 0; --i) {
            let ele = this.m_objSkillBack["G"][i];
            if(eSkillFunc[ele[0]]) {
                if(this[eSkillFunc[ele[0]]](ele, target)) {
                    this.m_objSkillBack["G"].splice(i,1);
                }
            }
        }
    }

    eSkillG001 (ele, target) {
        let unitArr = this.getFriendArr();
        for(let i = 0; i < unitArr.length; ++i) {
            unitArr[i].pushOneBuff(ele[1], ele[2] * 60, null, this);
        }
        return true;
    }

    /** 处理收到敌人放技能的信息节点 end */

    /** 处理收到队友受伤节点  start */   
    BackByFhurt (target) {
        if(!this.m_objSkillBack["H"]) return;
        let length = this.m_objSkillBack["H"].length;
        let fhurtFunc = {
            "H001": "fhurtH001",
            "H002": "fhurtH002"
        }
        for(let i = length - 1; i >= 0 ; --i) {
            let ele = this.m_objSkillBack["H"][i];
            if(fhurtFunc[ele[0]]) {
                if(this[fhurtFunc[ele[0]]](ele, target)) {
                    this.m_objSkillBack["H"].splice(i,1);
                }
            }
        }
    }

    // 首位受到伤害后生命低于50% 的武将 每秒回复最大生命值的血量
    fhurtH001 (ele, target) {
        if(target.master) return false;
        if(target.battleInfo.hp > target.initInfo.hp * ele[1] / 100) return false;
        target.pushOneBuff(ele[2], ele[3] * 60, null, this);
        return true;
    }

    // 首位濒临死亡时 回复50%
    fhurtH002 (ele, target) {
        if(target.master) return false;
        if(target.battleInfo.hp > 0) return false;
        target.battleInfo.hp = target.initInfo.hp * ele[1] / 100;
        return true;
    }

    /** 处理收到敌人受到伤害变化的节点 */
    BackByEhurt(target) {
        if(!this.m_objSkillBack["I"]) return;
        let length = this.m_objSkillBack["I"].length;
        let ehurtFunc = {
            "I001": "ehurtI001"
        }
        for(let i = length - 1; i >= 0; --i) {
            let ele = this.m_objSkillBack["I"][i];
            if(ehurtFunc[ele[0]]) {
                if(this[ehurtFunc[ele[0]]](ele, target)) {
                    this.m_objSkillBack["I"].splice(i, 1);
                }
            }
        }
    }

    ehurtI001 (ele, target) {
        if(target.battleInfo.hp > target.initInfo.hp * ele[1] / 100) return;
        if(target.isInvicible() || target.getBuffNumByType("nodead") > 1) return;
        target.battleInfo.hp = 0;
        target.BackByHpExchange();
    }

    /** 处理技能改变 start */
    BackBySkillChange (land, gsid, arrSkill) {
        if(!this.m_objSkillBackPre["J"]) return;
        let length = this.m_objSkillBackPre["J"].length;
        let skillFunc = {
            "J001": "skillJ001",
            "J002": "skillJ002"
        }
        for(let i = 0; i < length; ++i) {
            let ele = this.m_objSkillBackPre["J"][i];
            if(this[skillFunc[ele[0]]]) {
                this[skillFunc[ele[0]]](ele, land, gsid, arrSkill);
            }
        }
    }

    // 修改技能
    skillJ001 (ele, land, gsid , arrSkill) {
        if(this._land != land) return;
        gsid = Number(gsid) - (Number(gsid) % 20 - 1);
        if(Number(ele[1]) != gsid) return;
        for(let i = 0; i < 5; ++i) {
            let nInx = arrSkill.indexOf(Number(ele[2]) + i);
            if(nInx >= 0) {
                arrSkill[nInx] = ele[2] + 1000000;
                break;
            }
        }
    }

    // 推入一个被动技能id
    skillJ002 (ele, land, gsid, arrSkill) {
        if(this._land != land) return;
        gsid = Number(gsid) - (Number(gsid) % 20 - 1);
        if(Number(ele[1]) != gsid) return;
        arrSkill.push(ele[2]);
    }

    /** 处理技能改变 end */


    // 获得一个乱序的 index数组   传入 总长度 和   目标人数
    getDisOrderIndex (rlength, total) {   
        let tmparr = [];
        for(let i = 0; i < rlength; ++i) tmparr.push(i);

        if(total >= rlength) return tmparr;

        // 如果目标比较少 随机 乱序 取前N个
        tmparr = this.bTools.getDisOrderIndex(tmparr);

        return tmparr.slice(0, total);
    }

    // 获取当前友军所有人  一般 战斗中用
    getFriendArr () {
        let result = [];
        for(let i = 0; i < this.selfUnitArr.length; ++i) {
            if(this.selfUnitArr[i].isDead()) continue;
            result.push(this.selfUnitArr[i]);
        }

        return result;
    }

    // 获取当前敌人所有人   一般 战斗中用
    getEnemyArr () {
        let result = [];
        for(let i = 0; i < this.enemyUnitArr.length; ++i) {
            if(this.enemyUnitArr[i].isDead() || this.enemyUnitArr[i].isInvicible()) continue;
            result.push(this.enemyUnitArr[i]);
        }
        return result;
    }

    // 收到某个角色释放主动技能的消息
    getUnitDoSkill (target) {

    }

    // 收到某个友军死亡的信息
    getFriendDie (target) {
        this.BackByFriendDie()
    }

    // 收到某个敌人死亡的消息
    getEnemyDie (target) {

    }

    // 每步逻辑
    start () {
        this.BackByInit();
    }

    update () {
        this.steps++;
        this.updateCd();
        this.updateLogic();
    }

    end () {
        this.BackByEnd();
    }

    updateCd () {
        for(let k in this.backCd) {
            this.backCd[k] += 1;
        }
    }

    // 每步操作
    updateLogic () {
        this.BackByUpdate();
    }
}

module.exports = groundUnit;