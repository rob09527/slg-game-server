const collider = require('./colliderBox');
const bConfig = require('./battle_config');
const vecT = require('./vec_tmp');

var __AttDisScale = null;

var GetConfig = function (configname) {
    return bConfig.GetBattleConfig(configname)
}
///////////////////////////////////////////////////////////////////////
class AStarNode {
    constructor(G, H, Data, LastNode) {
        this.G = G
        this.H = H
        this.Data = Data
        this.LastNode = LastNode
    }
    GetF() {
        return this.G + this.H
    }
}

class MapItem {
    constructor(x, y, isObstacle) {
        this.x = x
        this.y = y
        this.isObstacle = isObstacle
    }
    CanThrough() {
        return this.isObstacle == false
    }

    EqualToMapItem(item2) {
        return item2.x == this.x && item2.y == this.y
    }
}

class AStarSixPaths {
    constructor() {
        this._mapItemList = null
    }

    initMapData(row, col, callback) {
        this._mapItemList = []
        for (var i = 0; i < row; i++) {
            for (var j = 0; j < col; j++) {
                this._mapItemList.push(new MapItem(i, j, (callback && callback(i, j)) || false))
            }
        }
    }

    getAllPath() {
        return this._mapItemList
    }
    cube_to_evenr(hex) {
        var col = hex.q + (hex.r + (hex.r & 1)) / 2
        var row = hex.r
        return {
            col: col,
            row: row
        }
    }
    evenr_to_cube(hex) {
        var q = hex.row - (hex.col + (hex.col & 1)) / 2
        var r = hex.col
        return {
            q: q,
            r: r,
            s: -q - r
        }
    }
    _getFilePosByQuan(x, y, quan) {
        let center = { col: y, row: x }
        let start = this.evenr_to_cube(center)
        var results = []
        for (var q = -quan; q <= quan; q++) {
            for (var r = -quan; r <= quan; r++) {
                for (var s = -quan; s <= quan; s++) {
                    if (q + r + s == 0) {
                        if ((Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2 == quan) {
                            let cubeVal = this.cube_to_evenr({
                                q: q + start.q,
                                r: r + start.r,
                                s: s + start.s
                            })
                            results.push(cubeVal)
                        }
                    }
                }
            }
        }
        return results
    }
    _getSixDirection(y, x) {
        let arr = this._getFilePosByQuan(x, y, 1)
        let ret = []
        ret.push({ x: arr[0].row, y: arr[0].col })//左
        ret.push({ x: arr[1].row, y: arr[1].col })//左上
        ret.push({ x: arr[3].row, y: arr[3].col })//右上
        ret.push({ x: arr[5].row, y: arr[5].col })//右
        ret.push({ x: arr[4].row, y: arr[4].col })//右下
        ret.push({ x: arr[2].row, y: arr[2].col })//左下
        return ret
    }
    ComputePath(startxy, endxy) {
        let startItem = new MapItem(startxy.x, startxy.y, false)
        let endItem = new MapItem(endxy.x, endxy.y, false)
        let AllPath = this._mapItemList

        let ShortestPath = []
        let OpenedNodes = []
        let ClosedNodes = []

        let finded = false;
        let Current = new AStarNode(0, 0, startItem, true)
        OpenedNodes.push(Current)

        while (!finded && OpenedNodes.length > 0) {
            let index = this.GetOpenedBest(OpenedNodes)
            Current = OpenedNodes.splice(index, 1)[0]
            ClosedNodes.push(Current)

            let currentX = Current.Data.x;
            let currentY = Current.Data.y;
            let points = this._getSixDirection(currentX, currentY)

            for (var i = 0; i < points.length; i++) {
                var item = this.GetMapItem(points[i], AllPath);
                if (item && !this.Contains(item, ClosedNodes) && item.CanThrough()) {
                    let G = Current.G + 1;
                    let H = Math.abs(item.x - endItem.x) + Math.abs(item.y - endItem.y);
                    if (this.Contains(item, OpenedNodes)) {
                        let ExistingNode = this.GetNode(item, OpenedNodes);
                        if (ExistingNode.GetF() > G + H)//新的节点更优 更新节点
                        {
                            ExistingNode.LastNode = Current;
                            ExistingNode.G = G;
                            ExistingNode.H = H;
                        }
                    } else {
                        let cnode = new AStarNode(G, H, item, Current);
                        OpenedNodes.push(cnode);
                        if (item.EqualToMapItem(endItem)) {
                            finded = true;
                            break;//目的节点
                        }

                    }
                }
            }
        }

        if (finded) {
            Current = OpenedNodes[OpenedNodes.length - 1];
            do {
                ShortestPath.splice(0, 0, Current.Data);
                Current = Current.LastNode;
            } while (Current.LastNode != null);
        }

        return ShortestPath
    }
    GetOpenedBest(OpenedNodes) {
        let target = OpenedNodes[0];
        let index = 0
        for (let i = 1; i < OpenedNodes.length; i++) {
            if (OpenedNodes[i].GetF() < target.GetF()) {
                target = OpenedNodes[i];
                index = i
            }
        }
        return index
    }
    GetMapItem(point, AllPath) {
        for (let i = 0; i < AllPath.length; i++) {
            if (AllPath[i].x == point.x && AllPath[i].y == point.y)
                return AllPath[i];
        }
        return null;
    }
    Contains(item, nodes) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].Data == item) {
                return true;
            }
        }
        return false;
    }
    GetNode(item, nodes) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].Data == item) {
                return nodes[i];
            }
        }
        return null;
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////

const BACKCOUNT = 10000;

// 方向 移动信息
const dir = {
    left: 0,
    leftup: 1,
    up: 2,
    rightup: 3,
    right: 4,
    rightdown: 5,
    down: 6,
    leftdown: 7,
};

const DEFAULTFILTER = 0x0;

const FILTERMAP = {
    yinshen: 0x1,
    wudi: 0x2,
    fangzhu: 0x4,
    all: 0xFFFF,
}

const SKILLTARGET = {
    40121: true,
    40151: true,
    42081: true,
    42141: true,
    42301: true,
    42321: true,
    42421: true,
    44141: true,
    44321: true,
    46161: true,
    17021: true,
    17031: true,
    37161: true,
    18041: true,
    18061: true,
}

const ATTRIMAP = {
    other: "otherRatio",
    extra: "extraAttri",
}

const FILTERATT = {
    "jianshe": true,
    "fendan": true,
    "extra": true,
}

const CAMPRESTRAIN = {
    1: 2,
    2: 3,
    3: 4,
    4: 1,
    5: 6,
    6: 5
};

const eventFunc = {
    "dead": "doBuffDeadDeal"
}

// 特殊的全局传递消息
var eventGlobal = new Map();

/**
 * 
 * @param {*} ev "yechadead"- 浅井死了
 * @param {*} funCb 
 */
var onGlobalEvent = function (ev, funCb, flag) {
    let funcMap = eventGlobal.get(ev);
    if (!funcMap) {
        funcMap = new Map();
    }
    funcMap.set(flag, funCb);
    eventGlobal.set(ev, funcMap)
}

var emitGlobalEvent = function (ev, ...args) {
    let funcMap = eventGlobal.get(ev);
    if (!funcMap) return;
    funcMap.forEach(func => {
        func && func(...args);
    })
}

var clearGlobalEvent = function (ev, flag) {
    if (!flag) {
        eventGlobal.delete(ev);
    } else {
        let funcMap = eventGlobal.get(ev);
        funcMap.delete(flag);
    }
}

var getGlobalEventLength = function (ev) {
    let funcMap = eventGlobal.get(ev);
    if (!funcMap) return 0;
    return funcMap.size;
}

/////////////////////////////////////////////////////////////////////////////////
//寻路开始
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
//寻路结束
/////////////////////////////////////////////////////////////////////////////////
class BaseUnit {
    constructor() {
        this._nowJump = false;
        this.eventMap = new Map();
        this.onEvent("dead");
    }

    onEvent(ev) {
        this.eventMap.set(ev, eventFunc[ev]);
    }

    emitEvent(ev, ...args) {
        let func = this.eventMap.get(ev);
        if (!func) return;
        this[func](...args);
    }

    clearEvent(ev) {
        this.eventMap.delete(ev);
    }

    initPoolData() {
        this.isdobigskill = false;          //是否在大招过程中 需结合其他判断
        this.realtime = 0;                  //实际时间
        this.steps = 0;                    //  计时数组
        this.skillCdReset = [];          //  当前重置技能时
        this.skillArr = [];               //  skillid  存放的数组
        this.skillCdArr = [];             //  当前cd值  递增  达到cd上限时 可释放该技能
        this.skillCdConfig = [];          //  存放cd配置
        this.arrSkillInfo = [];
        this.m_objSkillBack = {};
        this.buffAura = {};
        this.debuffAura = {};             // 存放对敌人影响的光环
        this.auraRatio = {};
        this.deAuraRatio = {};
        this.hpToRatio = {};
        this.exTraRatio = {};
        this.mpToRatio = {};
        this.otherRatio = {};
        this.extraAttri = {};
        this.timeAttri = {};
        this.backAttri = {};
        this.backCd = {};                 // 存放被动天赋cd的池
        this.backNormCount = {};          // 存放被动天赋攻击次数的池
        this.backState = {};              // 存放某些特殊被动状态
        // this.stepDoActions = {};        
        this.stepDoActions = new Map();
        // this.unchtargetState = {};     
        this.hurmVal = 0;                 // 输出量
        this.healVal = 0;                 // 治疗量
        this.defVal = 0;                 // 承受伤害量
        // 额外血量用
        this._extraHp = {};
        this._extraId = 0;
        this._xuezhouId = 0;

        this.separaUnit = [];             // 存放分身的地方

        // 初始化 阵营克制的值
        this._campRestrainVal = 0.15;

        // 嘲讽我的单位组
        this._sneerTarget = {};
        this._sneerId = 0;

        // 存放当前的分担值
        this._fendanMap = new Map();

        this.greedyRouteInfo = [];                  // 贪心算法移动路径信息
        this.obstacleArr = [];                      // 寻路障碍格子数组
        this.AstarPath = [];                        // A*算法移动路径
        this.openArr = [];
        this.closeArr = [];
        this.map = [];
        this.unitMap = [];                          // 除自己以外武将单位地图
        this.preFindTarget;                         // 前一个寻找目标
        this.doResetClientShow();
        this.doResetData();
        this.initBuffInfo();
    }

    /**
     * @param {action: 设置当前动作}
     */
    setAction(action) {
        if (this.action == "shenzhugeliang_bianshen" && this.getBuffNumByType("bianshen") > 1) return;
        if (action == "skill") this.skillstart = true;
        this.action = action;
        if (action == "dead") {
            this.emitEvent("dead");
            //前端特有
            if (this.bDoUIThings) {
                this._isdied = true;
                eventMgr.emit(eventStr.hurtOutPanel.heroDie, this)
            }
        }
    }
    // setPeopleComClient(comp){
    //     this.m_peopleCom = comp
    // }
    // getPeopleComClient(){
    //     return this.m_peopleCom
    // }
    initUnit(obj, property, steps, bDoUIThings, bTools) {
        this.initPoolData();
        this.bDoUIThings = bDoUIThings
        this.bTools = bTools

        let mname = obj.model;

        this._obj = obj;
        this._pickAttr = obj.pickAttr || {};
        this._level = obj.level || 1;
        this._class = obj.class || 0;
        this._camp = obj.camp;
        this._occu = obj.occu;
        this._star = obj.star;
        if (obj.occu2) this._occu2 = obj.occu2;
        this._property = gUtils.deepClone(property);
        if (obj.index || obj.index == 0) this._id = obj.index;
        if (obj.team) this.nowTeam = this.initTeam = obj.team;
        if (obj.battle) this.battleS = obj.battle;
        if (obj.guid) this.guid = obj.guid;
        if (obj.gsid) this.gsid = obj.gsid;
        if (obj.born || obj.born == 0) this.born = obj.born;
        if (obj.hp) this._hp = obj.hp;        // 远征用的血量记录
        if (obj.skin) this._skin = obj.skin;
        this.initOccuEff(this._occu);
        this.initOccuEff(this._occu2);
        this.steps = steps;

        this.killnum = 0;

        this.battleS.getOptByUnit("skillchange", { land: this.initTeam, gsid: this.gsid, skills: obj.skills });

        this.config = gUtils.deepClone(GetConfig("dbRoleInfo")[mname]);
        if (!this.config) {
            console.error("未获取到武将模型逻辑配置");
            return false;
        }
        this.initModel = this.config.attinfo.model;
        if (this.config.attzone) {
            let att = this.config.attzone.split("x");
            if (att.length < 2) {
                console.log(this.gsid, "战斗攻击范围配置错误");
                throw { etype: "unit", obj: obj, errnum: 1002 };
            }
            this.config.attzone = { x: Number(att[0]), y: Number(att[1]) };
        }
        if (this.config.findzone) {
            let find = this.config.findzone.split("x");
            if (find.length < 2) {
                console.log(this.gsid, "战斗寻敌范围配置错误");
                throw { etype: "unit", obj: obj, errnum: 1002 };
            }
            this.config.findzone = { x: Number(find[0]), y: Number(find[1]) };
        }
        // 组装技能
        this._gskills = obj.gskills;
        this._skills = obj.skills;
        if (obj.skills && obj.skills.length > 0) {
            obj.skills.forEach(ele => {
                if (!!GetConfig("dbEffInfo")[ele]) {
                    this.skillArr.push(ele);
                    this.skillCdArr.push(999);
                    this.skillCdConfig.push(GetConfig("dbEffInfo")[ele].cd);
                    this.skillCdReset.push(0);
                    this.arrSkillInfo.push(gUtils.deepClone(GetConfig("dbEffInfo")[ele]));
                }
                if (!!GetConfig("dbSkillB")[ele]) {
                    let arr = gUtils.deepClone(GetConfig("dbSkillB")[ele]);
                    if (!arr) return;
                    for (let i = 0; i < arr.length; ++i) {
                        this.pushSkillBack(arr[i]);
                    }
                }
            })
        }

        this.face = this.nowTeam == "left" ? 4 : 1;
        this.mainSkillCd = this.skillCdConfig[0] || 100;
        this.maxmagic = 100;
        this.BackByAttri();
        this.initInfoPro(this._property);
        return true;
    }

    initOccuEff(occu) {
        if (!occu) return;
        switch (occu) {
            case 2:
                this.cikeCd = 1;
                break;
        }
    }

    initBaseData() {
        this.battleInfo.hp = this.initInfo.hp * (this._hp || 10000) / 10000;
        if (this._obj.hpcover) {
            this.battleInfo.hp = this.initInfo.hp = this._property.hp;
        }
        if (this._obj.nowhp) {
            this.battleInfo.hp = this._obj.nowhp;
            this._hp = Math.ceil(this.battleInfo.hp * 10000 / this.initInfo.hp);
        }

        this.BackByAfterInfo();
        this.BackByHpExchange(true);
        this.initSpecialBuffAttri();

        // if(this.nowTeam == "left") {
        //     console.log("---------- start", this.gsid);
        //     for(let k in this.battleInfo) {
        //         console.log(k, this.battleInfo[k]);
        //     }
        //     console.log("---------- end");
        // }
        if (this._obj.nowmp) this.addMagic(this._obj.nowmp);
        // console.log(this.gsid, this.battleInfo, this.nowTeam);
    }

    initSpecialBuffAttri() {
        if (this._obj.specialbuff) {
            for (let i = 0; i < this._obj.specialbuff.length; ++i) {
                let attri = this._obj.specialbuff[i];
                for (let k in attri) {
                    let multi = ["hp", "atk", "def", "mdef"];
                    if (multi.indexOf(k) >= 0) {
                        this.battleInfo[k] += this.baseInfo[k] * attri[k] / 100;
                    } else if (multi.indexOf(k)) {
                        this.battleInfo[k] = (this.battleInfo[k] || 0) + attri[k] / 100;
                    }
                }
            }
        }
    }

    // 刷新 与其他所有单位的位置图 友方  敌方
    refreshPosMap() {
        this.posMap = [];
        this.pushPosMap(this.battleS.leftUnitArr);
        this.pushPosMap(this.battleS.rightUnitArr);
    }

    refreshMapNew() {
        let llen = this.battleS.leftUnitArr.length;
        let index = this.initTeam == "left" ? this._id : (this._id + llen);
        this.posMap.forEach(ele => {
            if (!ele.unit) return;
            if (ele.unit.isDead()) return;
            let disx = Math.abs(ele.unit.x - this.x);
            let disy = Math.abs(ele.unit.y - this.y);
            ele.disx = disx;
            ele.disy = disy;
            let param = ele.unit.posMap[index];
            if (!param) return;
            param.disx = disx;
            param.disy = disy;
        });
    }

    pushPosMap(arr) {
        for (let i = 0; i < arr.length; ++i) {
            // if(arr[i].isDead()) continue;
            let disx = Math.abs(arr[i].x - this.x);
            let disy = Math.abs(arr[i].y - this.y);
            let param = { unit: arr[i] };
            param.disx = disx;
            param.disy = disy;
            this.posMap.push(param);
        }
    }

    // 是否拥有此职业
    isOccu(occu) {
        if (this._occu === occu) return true;
        if (this._occu2 && this._occu2 === occu) return true;
        if (this._occu3 && this._occu3 === occu) return true;
        return false;
    }

    initFetter(fetters, efetters) { // 友方羁绊  敌人方羁绊
        for (let i = 0; i < fetters.length; ++i) {
            if (fetters[i].level <= 0) continue;
            let arr;
            switch (fetters[i].fid) {
                case "zhanshi1":    // 战士
                    if (!this.isOccu(1)) break;
                    this.pushSkillBack(["F016", "normal", 100, "zhanshizy1", 60, 100000]);
                    // if(!this.Invisible || this.Invisible < 60) this.Invisible = 60;
                    break;
                case "zhanshi2":
                    if (!this.isOccu(1)) break;
                    this.pushSkillBack(["F016", "normal", 100, "zhanshizy2", 60, 100000]);
                    // if(!this.Invisible || this.Invisible < 60) this.Invisible = 60;
                    break;
                case "zhanshi3":
                    if (!this.isOccu(1)) break;
                    this.pushSkillBack(["F016", "normal", 100, "zhanshizy3", 60, 100000]);
                    // if(!this.Invisible || this.Invisible < 60) this.Invisible = 60;
                    break;
                case "cike1":     // 刺客
                    if (!this.isOccu(2)) break;
                    this.battleInfo.pcri = this.initInfo.pcri = this.battleInfo.pcri + 0.12;
                    this.battleInfo.pcrid = this.initInfo.pcrid = this.battleInfo.pcrid + 0.4;
                    if (!this.Invisible || this.Invisible < 60) this.Invisible = 60;
                    this.pushSkillBack(["G004", 9, 100000]);
                    break;
                case "cike2":
                    if (!this.isOccu(2)) break;
                    this.battleInfo.pcri = this.initInfo.pcri = this.battleInfo.pcri + 0.14;
                    this.battleInfo.pcrid = this.initInfo.pcrid = this.battleInfo.pcrid + 0.6;
                    if (!this.Invisible || this.Invisible < 60) this.Invisible = 60;
                    this.pushSkillBack(["G004", 9, 100000]);
                    break;
                case "cike3":
                    if (!this.isOccu(2)) break;
                    this.battleInfo.pcri = this.initInfo.pcri = this.battleInfo.pcri + 0.16;
                    this.battleInfo.pcrid = this.initInfo.pcrid = this.battleInfo.pcrid + 0.8;
                    if (!this.Invisible || this.Invisible < 60) this.Invisible = 60;
                    this.pushSkillBack(["G004", 9, 100000]);
                    break;
                case "sheshou1":   // 射手
                    if (!this.isOccu(3)) break;
                    this.pushSkillBack(["Q006", 6, "sheshou1", 3, 100000]);
                    break;
                case "sheshou2":
                    if (!this.isOccu(3)) break;
                    this.pushSkillBack(["Q006", 6, "sheshou2", 3, 100000]);
                    break;
                case "sheshou3":
                    if (!this.isOccu(3)) break;
                    this.pushSkillBack(["Q006", 6, "sheshou3", 3, 100000]);
                    break;
                case "junshi1": // 军师 
                    this.battleInfo.pskidam = this.initInfo.pskidam = this.battleInfo.pskidam + 0.6;
                    break;
                case "junshi2":
                    this.battleInfo.pskidam = this.initInfo.pskidam = this.battleInfo.pskidam + 0.7;
                    break;
                case "junshi3":
                    this.battleInfo.pskidam = this.initInfo.pskidam = this.battleInfo.pskidam + 0.8;
                    break;
                case "moushi1": // 谋士
                    this.pushSkillBack(["F052", 8, 100000]);
                    break;
                case "moushi2":
                    this.pushSkillBack(["F052", 10, 100000]);
                    break;
                case "moushi3":
                    this.pushSkillBack(["F052", 12, 100000]);
                    break;
                case "huwei1": // 护卫
                    if (!this.isOccu(6)) break;
                    this.pushSkillBack(["D019", 70, 30, 100000]);
                    break;
                case "huwei2":
                    if (!this.isOccu(6)) break;
                    this.pushSkillBack(["D019", 85, 30, 100000]);
                    break;
                case "huwei3":
                    if (!this.isOccu(6)) break;
                    this.pushSkillBack(["D019", 100, 30, 100000]);
                    break;
                case "hu1":
                    if (!this.isOccu(7)) break;
                    this.pushSkillBack(["Q024", 1, 5, 1, 100000]);
                    break;
                case "hu2":
                    if (!this.isOccu(7)) break;
                    this.pushSkillBack(["Q024", 1, 10, 1, 100000]);
                    break;
                case "hu3":
                    if (!this.isOccu(7)) break;
                    this.pushSkillBack(["Q024", 1, 15, 1, 100000]);
                    break;
                case "zhen1":
                    if (!this.isOccu(8)) break;
                    this.battleInfo.pdam += 0.1;
                    this.battleInfo.pasp += 0.1;
                    break;
                case "wei1": case "shu1": case "wu1": case "qun1":
                    this.battleInfo.hp += this.baseInfo.hp * 0.15;
                    this.initInfo.hp = this.battleInfo.hp;
                    this.battleInfo.atk += this.baseInfo.atk * 0.08;
                    this.initInfo.atk = this.battleInfo.atk;
                    break;
                case "wei2": case "shu2": case "wu2": case "qun2":
                    this.battleInfo.hp += this.baseInfo.hp * 0.3;
                    this.initInfo.hp = this.battleInfo.hp;
                    this.battleInfo.atk += this.baseInfo.atk * 0.15;
                    this.initInfo.atk = this.battleInfo.atk;
                    break;
                case "shen1":
                    this.battleInfo.hp += this.baseInfo.hp * 0.15;
                    this.initInfo.hp = this.battleInfo.hp;
                    this.battleInfo.atk += this.baseInfo.atk * 0.07;
                    this.initInfo.atk = this.battleInfo.atk;
                    this.battleInfo.pcd += 0.1;
                    this.initInfo.pcd = this.battleInfo.pcd;
                    break;
                case "shen2":
                    this.battleInfo.hp += this.baseInfo.hp * 0.25;
                    this.initInfo.hp = this.battleInfo.hp;
                    this.battleInfo.atk += this.baseInfo.atk * 0.1;
                    this.initInfo.atk = this.battleInfo.atk;
                    this.battleInfo.pcd += 0.12;
                    this.initInfo.pcd = this.battleInfo.pcd;
                    break
                case "mo1":
                    this.battleInfo.hp += this.baseInfo.hp * 0.15;
                    this.initInfo.hp = this.battleInfo.hp;
                    this.battleInfo.atk += this.baseInfo.atk * 0.07;
                    this.initInfo.atk = this.battleInfo.atk;
                    this.battleInfo.pratk += 0.1;
                    this.initInfo.pratk = this.battleInfo.pratk;
                    break;
                case "mo2":
                    this.battleInfo.hp += this.baseInfo.hp * 0.2;
                    this.initInfo.hp = this.battleInfo.hp;
                    this.battleInfo.atk += this.baseInfo.atk * 0.12;
                    this.initInfo.atk = this.battleInfo.atk;
                    this.battleInfo.pratk += 0.12;
                    this.initInfo.pratk = this.battleInfo.pratk;
                    break;
            }
            //光环羁绊加持
            if (fetters[i] && fetters[i].halo) {
                let generalCfg = GetConfig("dbGeneral")["" + this.gsid];
                if (generalCfg.HALO == fetters[i].halo) {
                    this.halo = fetters[i].halo;
                    this.haloConfig = GetConfig("dbHalo")["" + this.halo];
                    switch (fetters[i].halo) {
                        case 101:
                            break;

                        case 102:
                            break;

                        case 103:
                            break;

                        case 104:
                            this.battleInfo.atk += this.baseInfo.atk * (this.haloConfig.PARAMS[0] / 100);
                            this.initInfo.atk = this.battleInfo.atk;
                            break;

                        default: break;
                    }
                }
            }
        }

        if (bConfig.IsShowDebug()) {
            bConfig.AddRecordLog(this.getDebugString() + " startAttr:" + JSON.stringify(this.battleInfo))
        }
    }

    initThicBack() {
        let thicinfo = this.initTeam == "left" ? this.battleS.leftThic : this.battleS.rightThic;
        if (!thicinfo) return;
        // let thic = this.initTeam == "left" ? this.battleS.leftThic : this.battleS.rightThic;
        // thicinfo = thic.thicInfo;
        let tinfo = app.db.getMythicalById(thicinfo.tid);
        if (!tinfo) return;
        for (let i = 0; i < tinfo.PSKILL.length; ++i) {
            if (thicinfo.pskill[i] <= 0) continue;
            let attri = GetConfig("dbThicBack")[tinfo.PSKILL[i]];
            for (let k in attri) {
                var add = ["hp", "atk"];
                if (add.indexOf(k) >= 0) {
                    this.battleInfo[k] += attri[k][thicinfo.pskill[i] - 1];
                    this.initInfo[k] = this.battleInfo[k];
                } else {
                    this.battleInfo[k] += attri[k][thicinfo.pskill[i] - 1] / 1000;
                    this.initInfo[k] = this.battleInfo[k];
                }
            }
        }
    }

    initSeason() {
        if (!this.battleS.seasonInfo || Object.keys(this.battleS.seasonInfo).length == 0) { return; }

        let index = this.battleS.seasonInfo.pos.indexOf(Number(this.born));
        if (index < 0) { return; }

        let level = this.nowTeam == "left" ? this.battleS.seasonInfo.left : this.battleS.seasonInfo.right;
        if (0 == index && level < 9999) { return; }
        if (1 == index && level < 9999) { return; }

        switch (this.battleS.seasonInfo.season) {
            case 1:
                this.addMagic(25);
                this.skillHitArr.push("spring");
                break;
            case 2:
                this.pushOneBuff("b80000", 60 * 60, null, this);
                break;
            case 3:
                if (this._obj.hpcover) break;
                this.pushOneBuff("b80001", 15 * 60, null, this);
                break;
            case 4:
                this.pushOneBuff("b80002", 60 * 60, null, this);
                this.battleInfo.hp += this.baseInfo.hp * 0.15;
                this.initInfo.hp += this.baseInfo.hp * 0.15;
                break;
        }
    }


    pushSkillBack(arr, src) {
        if (!arr || !arr.length) return;
        let tp = arr[0].substr(0, 1);
        if (!this.m_objSkillBack[tp]) this.m_objSkillBack[tp] = [];
        if (src) arr.splice(arr.length - 1, 0, src);
        this.m_objSkillBack[tp].push(arr);
    }

    checkIsHaveSback(arr) {
        let tp = arr[0].substr(0, 1);
        if (!this.m_objSkillBack[tp]) return false;
        let str = this.m_objSkillBack[tp].join();
        let str1 = arr.join();
        return str.indexOf(str1) >= 0;
    }

    getExtraAttri(attri) {
        return this.backAttri[attri] || 0;
    }

    initInfoPro(unitInfo) {
        //测试代码
        if (this.bDoUIThings) {
            if (Number(app.maxhp)) {
                unitInfo.hp = app.maxhp
            }
        }
        //测试代码

        this.initInfo = {};
        this.battleInfo = {};
        this.baseInfo = {};
        var base = ["hp", "atk", "def", "mdef"];    // 
        var other = ["pasp", "pcri", "pcrid", "pdex", "pmdex", "ppthr", "pmthr", "ppdam", "pmdam", "pdam",
            "prdc", "pprdc", "pmrdc", "ppbs", "pmbs", "pmps", "phea", "pefc", "patkdam", "pskidam",
            "pratk", "pxfatk", "pckatk", "pssatk", "pjsatk", "pmsatk", "pcd", "pheal", "dpcri", "accu",
            "parry", "msp", "pdmh", "pdkj", "apower", "dpower", "pstunefc", "pskirdc", "patkrdc",
            "zsprdc", "ckprdc", "ssprdc", "jsprdc", "msprdc", "hwprdc"];
        for (let i = 0; i < base.length; ++i) {
            this.baseInfo[base[i]] = unitInfo[base[i]];
            this.battleInfo[base[i]] = this.initInfo[base[i]] = this.bTools.intergeNum(unitInfo[base[i]] * (1 + this.getExtraAttri(base[i]) / 100 + (this._pickAttr[base[i]] || 0) / 1000));
        }
        // this.battleInfo.hp = this.initInfo.hp * (this._hp || 100) / 100;
        for (let i = 0; i < other.length; ++i) {
            this.battleInfo[other[i]] = this.initInfo[other[i]] = (unitInfo[other[i]] || 0) / 1000 + this.getExtraAttri(other[i]) / 100 + (this._pickAttr[other[i]] || 0) / 1000;
        }

        if (!this.nowmagic) this.nowmagic = 0;
        this.nowmagic += (unitInfo.mp || 0);
        // console.log(this.battleInfo, this.initInfo);
        this.sendMagicChangeToClient()
    }

    // 初始化再格子上的位置
    initFieldPos(fieldX, fieldY) {
        this.fieldX = fieldX;
        this.fieldY = fieldY;
    }

    getLostHp() {
        return this.initInfo.hp - this.battleInfo.hp;
    }

    /********  判断各种状态  ********/
    // 判断是否死亡
    isDead() {
        if (!this.battleInfo) {
            console.log("数据出错", this.gsid);
            throw { etype: "unit", side: this.initTeam, gsid: this.gsid, errnum: 1000 };
        }
        return this.battleInfo.hp <= 0;
    }

    // 判断是否无敌 
    isInvicible() {
        if (!!this.gsid && !this.battleInfo) {
            console.log("数据出错", this.gsid);
            throw { etype: "unit", side: this.initTeam, gsid: this.gsid, errnum: 1000 };
        }
        return this.getBuffNumByType("wudi") > 1;
    }

    ExecAttrFunction(attri) {
        switch (attri) {
            case "ArrDirection":
                return this.getNowArrDirection();
            case "Field":
                return this.getNowField()
            case "Healeff":
                return this.getNowHealeff()
            case "msp":
                return this.getNowmsp()
            case "pasp":
                return this.getNowpasp()
            case "pcd":
                return this.getNowpcd()
            case "pmthr":
                return this.getNowpmthr()
            case "ppthr":
                return this.getNowppthr()
            default:
                return null
        }
    }
    /****** 获取当前单位最终属性数值 ******/

    getNowAttri(attri) {
        let multi = ["hp", "atk", "def", "mdef"];
        var ret = this.ExecAttrFunction(attri);
        if (ret != null) {
            return ret;
        } else {
            if (multi.indexOf(attri) >= 0) {
                let num = this.battleInfo[attri] * this.getBuffNumByType(attri) * (this.auraRatio[attri] || 1) * (this.deAuraRatio[attri] || 1) * (this.getStlAttri(ATTRIMAP.other, attri) + 1) + this.getStlAttri(ATTRIMAP.extra, attri) + (this.timeAttri[attri] || 0);
                num = this.BackByAttriToAttri(num, attri);
                num = Math.max(1, num);
                return num || this.initInfo[attri] || 1;
            } else {
                let num = this.battleInfo[attri] + (this.getBuffNumByType(attri) - 1) + (this.auraRatio[attri] || 0) + (this.deAuraRatio[attri] || 0) + this.getStlAttri(ATTRIMAP.other, attri) + (this.timeAttri[attri] || 0);
                num = this.BackByAttriToAttri(num, attri);
                return num || this.initInfo[attri] || 0;
            }
        }
    }

    getNowpasp() {
        let pasp = 1 + this.battleInfo.pasp + (this.getBuffNumByType("pasp") - 1) + this.getStlAttri(ATTRIMAP.other, "pasp") + (this.auraRatio["pasp"] || 0) + (this.deAuraRatio["pasp"] || 0);    //(this.getBuffNumByType("pasp") * ((this.auraRatio["pasp"] || 0) + 1) * (this.deAuraRatio["pasp"] || 1) * (this.getOtherAttri("pasp") + 1) * ((this.mpToRatio["pasp"] || 0) + 1) - 1) + (this.timeAttri["pasp"] || 0);
        pasp = this.BackByAttriToAttri(pasp, "pasp");
        pasp = Math.max(0.1, pasp);
        return pasp || 1;
    }

    getNowmsp() {
        let msp = 0;
        msp = 2 * (this.getBuffNumByType("msp") + (this.battleInfo.msp || 0) + (this.auraRatio["msp"] || 0) + this.getStlAttri(ATTRIMAP.other, "msp"));
        msp = msp > 4.5 ? 4.5 : msp;
        msp = msp < 0.5 ? 0.5 : msp;
        return Number(msp.toFixed(2));
    }

    getNowHealeff() {
        let healeff = 1 + (this.getBuffNumByType("healeff") - 1) + (this.getBuffNumByType("huoli") - 1) + this.getNowAttri("phea");
        healeff = Math.max(0, healeff);
        return healeff || 0;
    }

    getNowpcd() {
        let num = this.battleInfo.pcd + (this.getBuffNumByType("pcd") - 1) + (this.auraRatio["pcd"] || 0) + (this.deAuraRatio["pcd"] || 0) + this.getStlAttri(ATTRIMAP.other, "pcd");
        num = this.BackByAttriToAttri(num, "pcd");
        num = num || this.initInfo["pcd"] || 0;
        return Math.min(num, 0.8);
    }

    getNowppthr() {
        let num = this.battleInfo["ppthr"] + (this.getBuffNumByType("ppthr") - 1) + (this.auraRatio["ppthr"] || 0) + (this.deAuraRatio["ppthr"] || 0) + this.getStlAttri(ATTRIMAP.other, "ppthr");
        num = this.BackByAttriToAttri(num, "ppthr");
        // num *= 0.65;
        if (num <= 0) return 0;
        return num || this.initInfo["ppthr"] || 0;
    }

    getNowpmthr() {
        let num = this.battleInfo["pmthr"] + (this.getBuffNumByType("pmthr") - 1) + (this.auraRatio["pmthr"] || 0) + (this.deAuraRatio["pmthr"] || 0) + this.getStlAttri(ATTRIMAP.other, "pmthr");
        num = this.BackByAttriToAttri(num, "pmthr");
        // num *= 0.65;
        if (num <= 0) return 0;
        return num || this.initInfo["pmthr"] || 0;
    }

    // 初始化 一个随处有可能塞进来的属性加减成
    /** 
     * @param {*} stl 模板 otherRatio 用于加成值累计 extraAttri 用于额外的确定数值累计
     * @param {*} attri 属性
     */
    initStlAttri(stl, attri) {
        if (!this[stl][attri]) {
            this[stl][attri] = new Map();
        }
    }

    /** 
     * @param {*} stl 模板 otherRatio 用于加成值累计 extraAttri 用于额外的确定数值累计
     * @param {*} attri 属性
     * @param {*} flag 唯一标识 
     * @param {*} num 数值
     */
    setStlAttriNum(stl, attri, flag, num) {
        this.initStlAttri(stl, attri);
        this[stl][attri].set(flag, num);
    }

    /** 
     * @param {*} stl 模板 otherRatio 用于加成值累计 extraAttri 用于额外的确定数值累计
     * @param {*} attri 属性
     * @param {*} flag 唯一标识 
     * @intro 不需要时删除掉该标段下的值
     */
    deleteStlAttriNum(stl, attri, flag) {
        if (!this[stl][attri]) return;
        this[stl][attri].delete(flag);
    }

    /** 
     * @param {*} stl 模板 otherRatio 用于加成值累计 extraAttri 用于额外的确定数值累计
     * @param {*} attri 属性
     */
    getStlAttri(stl, attri) {
        if (!this[stl][attri]) return 0;
        let result = 0;
        this[stl][attri].forEach((value, key) => {
            result += value;
        })
        return result || 0;
    }


    /** config 相关获取相关配置信息处 */
    // 根据index 获取技能的当前配置信息   pindex    skillArr  arrSkillInfo 对应下标
    getSkillInfo(pindex) {
        return this.arrSkillInfo[pindex];
    }

    /***** buff *****/
    initBuffInfo() {
        this.buff = [];         // 单体buff
        this.buffId = 0;
        this.buffcache = {};    // 存放单体buff的总属性输出
        this.buffAura = {};     // 光环buff存放
    }

    doBuffDeadDeal() {
        this.clearEvent("dead");
        for (let i = 0; i < this.buff.length; ++i) {
            this.buff[i].deadDeal();
        }
        if (this._jieyimaster) {
            this._jieyimaster._jieyi = null;
            this._jieyimaster.jieyiOneTeammate();     // 重新结义武将
        }
    }

    updateOneStepBuff() {
        let optarr = [];            // 临时操作数组
        let deletearr = [];

        for (let i = 0; i < this.buff.length; ++i) {
            optarr.push(this.buff[i]);
        }

        for (let i = 0; i < optarr.length; ++i) {
            let buff = optarr[i];
            buff.countTime();            //  可能引起 this.buff 发生变化
            if (buff._ttime <= 0) {
                deletearr.push(optarr.splice(i, 1)[0]);     // 删除了一个控制 i 的变化
                i--;
            }
        }

        for (let i = 0; i < deletearr.length; ++i) {
            for (let j = 0; j < this.buff.length; ++j) {
                if (deletearr[i]._buffid == this.buff[j]._buffid) {
                    this.buff.splice(j, 1);
                    break;
                }
            }
            if (!deletearr[i].isDestroy) {
                deletearr[i].destroy();
                deletearr[i].isDestroy = true;
            }
        }
    }

    // 清楚身上的增益 或 减益 buff 级别 弱驱散 强驱散
    clearBuff(ptype, plevel) {
        let deletearr = [];
        for (let i = 0; i < this.buff.length; ++i) {
            let buff = this.buff[i];
            if (buff._config.btype == ptype && buff._config.dispel <= plevel) {
                deletearr.push(this.buff.splice(i, 1)[0]);
                i--;
            }
        }
        for (let i = 0; i < deletearr.length; ++i) {
            if (!deletearr[i].isDestroy) {
                deletearr[i].destroy(true);
                deletearr[i].isDestroy = true;
            }
        }
    }

    refreshBuffNumByType(ptype) {
        let num = 1;
        let typearr = [];
        let higharr = [];
        let stypecount = {};

        for (let i = 0; i < this.buff.length; ++i) {
            let tmparr = this.buff[i].getEffByType(ptype);
            let plies = this.buff[i].getPlies();
            for (let j = 0; j < tmparr.length; ++j) {
                if (this.BackByImmune(tmparr[j].type)) continue;
                if (typearr.indexOf(tmparr[j].stype) < 0) {
                    stypecount[tmparr[j].stype] = 1;
                    typearr.push(tmparr[j].stype);
                    higharr.push((tmparr[j].num * plies) || 0);
                } else {
                    if (stypecount[tmparr[j].stype] < tmparr[j].maxcount) {
                        stypecount[tmparr[j].stype] += 1;
                        typearr.push(tmparr[j].stype);
                        higharr.push(tmparr[j].num || 0);
                    } else {
                        let index = typearr.indexOf(tmparr[j].stype);
                        if (tmparr[j].num > higharr[index]) {
                            higharr[index] = (tmparr[j].num * plies) || 0;
                        }
                    }
                }
            }
        }
        let multi = [];      // multi 数组中的属性为乘算
        if (multi.indexOf(ptype) < 0) {
            for (let i = 0; i < higharr.length; ++i) {
                num += higharr[i] / 100;
            }
        } else {
            for (let i = 0; i < higharr.length; ++i) {
                num *= (1 + higharr[i] / 100);
            }
        }
        return num;
    }

    pushBuffExtraHp(extrahp, buff, type) { // type  吸收物理 或 法术  不传吸收所有
        this._extraHp[this._extraId] = { hp: extrahp, buff: buff, type: (type || 4) };
        this._extraId++;
        return this._extraId - 1
    }

    getExtraHp() {
        for (let k in this._extraHp) {
            return true;
        }
        return false;
    }

    lostBuffExtrahp(losthp, type) {
        for (let k in this._extraHp) {
            if (this._extraHp[k].type != 4 && this._extraHp[k].type != type) continue
            if (losthp >= this._extraHp[k].hp) {
                losthp -= this._extraHp[k].hp;
                this._extraHp[k].buff._ttime = 0;
                delete this._extraHp[k];
            } else {
                this._extraHp[k].hp -= losthp;
                losthp = 0;
                break;
            }
        }
        return losthp;
    }

    pushSneerBuff(src) {
        if (this._sneerTarget[this._sneerId - 1]) delete this._sneerTarget[this._sneerId - 1];
        this._sneerTarget[this._sneerId] = { src: src };
        this._sneerId++;
        return this._sneerId;
    }

    getSneerBuff() {
        for (let k in this._sneerTarget) {
            return true;
        }
        return false;
    }

    // buffcache 已经算好的数值
    getBuffNumByType(ptype) {
        if (this.buffcache[ptype] === 0) return 0;
        return this.buffcache[ptype] || 1;
    }

    // 推入一个增益光环 aurainfo  {num: ele[2], xdis: ele[3], ydis: ele[3], ttime: 10000}
    pushBuffAura(attri, aurainfo) {
        if (!this.buffAura[attri]) this.buffAura[attri] = [];
        this.buffAura[attri].push(aurainfo);
    }

    // 增益光环对队友的影响
    updateBuffAura() {
        let farr = this.getTargetByTypeState(2, -1, null, null, false, FILTERMAP.yinshen);
        for (let k in this.buffAura) {
            for (let i = this.buffAura[k].length - 1; i >= 0; --i) {
                let baura = this.buffAura[k][i];
                let bdelete = false;
                if (!baura.ttime || baura.ttime <= 0) {
                    baura.num = 0;
                    bdelete = true;
                }
                baura.ttime -= 1;

                for (let j = 0; j < farr.length; ++j) {
                    this.calBuffAuraRatio(k, i, farr[j], baura.xdis, baura.ydis)
                }
                if (bdelete) {
                    this.buffAura[k].splice(i, 1);
                }
            }
        }
    }

    // 推入一个增益光环 aurainfo  {num: ele[2], xdis: ele[3], ydis: ele[3], ttime: 10000}
    pushDebuffAura(attri, aurainfo) {
        if (!this.debuffAura[attri]) this.debuffAura[attri] = [];
        this.debuffAura[attri].push(aurainfo);
    }

    // 
    updateDebuffAura() {
        let farr = this.getTargetByTypeState(1, -1, null, null, false, FILTERMAP.yinshen);
        for (let k in this.debuffAura) {
            for (let i = this.debuffAura[k].length - 1; i >= 0; --i) {
                let baura = this.debuffAura[k][i];
                let bdelete = false;
                if (!baura.ttime || baura.ttime <= 0) {
                    baura.num = 0;
                    bdelete = true;
                }
                baura.ttime -= 1;
                for (let j = 0; j < farr.length; ++j) {
                    this.calDebuffAuraRatio(k, i, farr[j], baura.xdis, baura.ydis);
                }
                if (bdelete) {
                    this.debuffAura[k].splice(i, 1);
                }
            }
        }
    }

    calBuffAuraRatio(ptype, pindex, dst, xr, yr) {
        let xdis = this.x - dst.x;
        let ydis = this.y - dst.y;

        this._GetJianGe()
        xr = xr * __AttDisScale.x
        yr = yr * __AttDisScale.y

        if (xdis * xdis / (xr * xr) + ydis * ydis / (yr * yr) <= 1) {
            switch (ptype) {
                case "atk":
                case "def":
                case "mdef":
                    if (!dst.auraRatio[ptype]) dst.auraRatio[ptype] = 1;
                    dst.auraRatio[ptype] *= (1 + this.buffAura[ptype][pindex].num / 100);
                    break;
                case "pmdam":
                case "pcri":
                case "pasp":
                case "msp":
                    if (!dst.auraRatio[ptype] && dst.auraRatio[ptype] != 0) dst.auraRatio[ptype] = 0;
                    dst.auraRatio[ptype] += this.buffAura[ptype][pindex].num / 100;
                    break;
            }
        }
    }

    calDebuffAuraRatio(ptype, pindex, dst, xr, yr) {
        let xdis = this.x - dst.x;
        let ydis = this.y - dst.y;

        this._GetJianGe()
        xr = xr * __AttDisScale.x
        yr = yr * __AttDisScale.y

        if (xdis * xdis / (xr * xr) + ydis * ydis / (yr * yr) <= 1) {
            switch (ptype) {
                case "atk":
                case "def":
                case "mdef":
                    if (!dst.deAuraRatio[ptype]) dst.deAuraRatio[ptype] = 1;
                    dst.deAuraRatio[ptype] *= (1 - this.debuffAura[ptype][pindex].num / 100);
                    break;
                case "pmrdc":
                case "ppthr":
                case "pmthr":
                    if (!dst.deAuraRatio[ptype] && dst.deAuraRatio[ptype] != 0) dst.deAuraRatio[ptype] = 0;
                    dst.deAuraRatio[ptype] -= this.debuffAura[ptype][pindex].num / 100;
                    break;
            }
        }

    }

    sendMagicChangeToClient(able) {
        //前端特有
        if (this.bDoUIThings) {
            this.bPlayMagicEffect = able
            eventMgr.emit(eventStr.hurtOutPanel.nowMagic, this)
        }
        //依照时间去控制黑屏时间 而不是扣除怒气
        // if(this.nowmagic < this.maxmagic){
        //     this.isdobigskill = false
        // }
    }

    addMagic(num) {
        if (this.getBuffNumByType("fangzhu") > 1 || this.getBuffNumByType("meihuo") > 1) return;
        num = Number(num);
        num = this.BackByAddMp(num);
        if (!num) return;
        if (num > 0 && this.getBuffNumByType("yazhi") > 1) return;  // 如果压制状态不回能量。
        if (num > 0) num *= (1 + this.getNowAttri("pmps"));
        this.nowmagic += num;

        this.nowmagic = Math.max(0, this.nowmagic);
        this.nowmagic = Math.min(this.maxmagic, this.nowmagic);

        this.sendMagicChangeToClient()

        this.BackByMpChange();
    }

    /****** 寻找普通攻击目标 ******/
    findAttTarget() {
        if (this.attNext) return;
        if (this.getBuffNumByType("meihuo") > 1) return;
        this.findTarget = null;

        if (this.attTarget) {
            if (this.attTarget.isDead() || this.attTarget.isInvicible() || this.attTarget.Invisible) {
                this.attTarget = null;
            } else {
                return;
            }
        }
        this.getMotionAttTarget()
    }

    // 寻找普通敌人  如果在攻击范围之内 则设置为攻击目标
    getMotionAttTarget() {
        if (!this.config.attrange) this.config.attrange = 1;

        let tarr = [];
        let finddis = this._getfindDis()//注:未开方
        tarr = this.getTargetByType(1, -1); // 获取普攻目标 所有敌方目标

        let findtarget = null;
        let curmaxdis = 999999999;
        //嘲讽我方的单位
        if (this.getSneerBuff()) {
            findtarget = this._sneerTarget[this._sneerId - 1].src;
        }
        //还是打之前的目标
        if (this.preFindTarget) {
            //之前普攻的目标存在 并在普攻范围之类
            if (this.checkIsInAttArea(this.preFindTarget)) {
                //之前的目标状态还是正常的
                if (!this.preFindTarget.isDead() && !this.preFindTarget.isInvicible()) {
                    findtarget = this.preFindTarget
                }
            }
        }
        //之前的目标不在范围之类
        if (!findtarget) {
            for (let i = 0; i < tarr.length; ++i) {
                if (tarr[i].isDead() || tarr[i].isInvicible()) continue;
                //计算敌人距离 注:未开方
                var dis = Math.pow((tarr[i].x - this.x), 2) + Math.pow((tarr[i].y - this.y), 2)
                if (dis < finddis) {
                    if (dis < curmaxdis) {
                        curmaxdis = dis
                        findtarget = tarr[i]
                    }
                }
            }
        }
        //寻敌范围内没有目标 选择第一个角色为目标
        if (!findtarget) {
            for (let i = 0; i < tarr.length; ++i) {
                if (tarr[i].isDead() || tarr[i].isInvicible()) continue;
                findtarget = tarr[i];
                break;
            }
        }

        if (findtarget) {
            // 保存上一个目标对象
            this.findTarget = findtarget;
            //目标是否在攻击范围之类
            if (this.checkIsInAttArea(findtarget)) {
                this.attTarget = findtarget;
                this.preFindTarget = findtarget
            }
        }
    }

    // 如果有攻击目标 攻击  否则继续寻找位移坐标
    doNoNextGrid() {
        for (let i = 0; i < this.skillArr.length; ++i) {
            if (this._isCanDoSkill(i)) {
                this.attTarget = null;
                return;
            }
        }

        this.findAttTarget();
        if (this.attTarget) {
            this.doAtt();
            this.lastGrid = null;
            // 清空路径信息
            this.greedyRouteInfo = [];
            this.AstarPath = [];
        } else {
            this.findNextGrid();
        }
    }

    findNextGrid() {
        this.findNextField();
        this.isTakeNextGrid();
    }
    _IsCanWalkGrid(x, y) {
        return this.battleS.IsCanWalkGrid(x, y)
    }
    // 找到下一个移动的位置方块
    findNextField() {
        if (this.attNext) {
            return;
        }
        if (this.nextGrid) {
            // this.findNextField();
            if ((this._occu == 2 || this._occu2 == 2 || this.isCanBlink) && this.doBlink()) return;
            this.doMove();
            return;
        }
        if (!this.lastGrid) {
            this.lastGrid = new vecT(this.fieldX, this.fieldY);
        } else {
            this.lastGrid.setPos(this.fieldX, this.fieldY);
        }
        // 得到下一个确定的目标方格
        // 如果被恐惧了
        if (this.getBuffNumByType("fear") > 1) {
            let result = this.getNowArrDirection();
            let gridarr = [];
            for (let i = 0; i < result.length; ++i) {
                if (result[i] && !result[i].nowUnit && result[i].num == 1) {

                    gridarr.push(result[i])
                };
            }
            if (gridarr.length > 0) {
                let randint = this.bTools.getRandomInt(0, gridarr.length - 1);
                this.nextGrid = new vecT(gridarr[randint].x, gridarr[randint].y);
                this.isTakeNextGrid();
                this.doMove();
                return;
            }
        }

        let nextgrid = null;
        if (this.findTarget) {
            nextgrid = new vecT(this.findTarget.fieldX, this.findTarget.fieldY);
        }

        if (!nextgrid) {
            // console.log("没有攻击目标不动");
            this.setAction("stand");
            return;
        }

        if (Math.abs(this.fieldX - nextgrid.x) < 1 && Math.abs(this.fieldY - nextgrid.y) < 1) {
            console.log("单位错误，站位重合了");
            this.nextGrid = null;
            return;
        }

        this.AstarPath = this.getAStartSixPath(this.grid(this.fieldX, this.fieldY), this.grid(nextgrid.x, nextgrid.y))
        // cc.error(this, "当前:", JSON.stringify(this.grid(this.fieldX, this.fieldY)), " 目标:", JSON.stringify(this.grid(nextgrid.x, nextgrid.y))," this.AstarPath=", JSON.stringify(this.AstarPath), "阻挡=",  JSON.stringify(this.obstacleArr))
        this.nextGrid = null;
        if (this.AstarPath.length > 0) {
            this.nextGrid = this.AstarPath.pop()
            this.isTakeNextGrid();//占住格子
            // if(!this.battleS.bFieldArr[this.nextGrid.x][this.nextGrid.y].nowUnit){
            //     this.isTakeNextGrid();//占住格子
            // }else{
            //     this.nextGrid = null;
            // }
        }
        //无法寻路 或者下个位置坐标有人
        if (!this.nextGrid) {
            // 无解时，使用贪心
            // cc.error("贪心算法", this)
            //可能有目标位置存在
            this.nextGrid = null

            let dic = this.getNowArrDirection();
            let nextpos = this.getGridRealPos(nextgrid.x, nextgrid.y)
            let nowpos = this.getNowGridXY()

            let xdis = nowpos.x - nextpos.x;
            let ydis = nowpos.y - nextpos.y;
            let checkNum = 10//防止Y上的问题

            let zuo = dic[0]
            let zuoshang = dic[1]
            let youshang = dic[2]
            let you = dic[3]
            let youxia = dic[4]
            let zuoxia = dic[5]

            let gridarr = [];

            if (xdis <= -checkNum) {//目标在右边
                if (ydis > checkNum) {//右下
                    gridarr = [youxia, you, youshang, zuoshang, zuoxia, zuo]
                } else if (ydis < -checkNum) {//右上
                    gridarr = [youshang, you, zuoshang, youxia, zuo, zuoxia]
                } else {
                    gridarr = [youshang, you, zuoshang, youxia, zuo, zuoxia]
                }
            } else if (xdis > checkNum) {//目标在左边
                if (ydis > checkNum) {//左下
                    gridarr = [zuoxia, zuo, zuoshang, youxia, youshang, you]
                } else if (ydis < -checkNum) {//左上
                    gridarr = [zuoshang, zuo, zuoxia, youxia, youshang, you]
                } else {
                    gridarr = [zuoshang, zuo, zuoxia, youxia, youshang, you]
                }
            }

            let resultarr = [];
            for (let i = 0; i < gridarr.length; ++i) {
                if (gridarr[i] && !gridarr[i].nowUnit) {
                    if (this._IsCanWalkGrid(gridarr[i].x, gridarr[i].y)) {
                        resultarr.push(gridarr[i]);
                    }
                }
            }

            for (let ele of resultarr) {
                let moveInfo = this.getMoveInfo(ele);
                // 如果移动策略在路径中已存在，遍历移动策略，寻找下一个不重复的移动方向
                if (moveInfo && !this.checkGreedyRouteLoop(moveInfo)) {
                    this.greedyRouteInfo.push(moveInfo);
                    this.nextGrid = new vecT(ele.x, ele.y);
                    break;
                }
            }
            if (!this.nextGrid) {
                this.greedyRouteInfo = [];
            }
        }
        this.doMove();
    }

    getGridRealPos(gridX, gridY) {
        return bConfig.gridPosArr[gridX][gridY]
    }

    getNowGridXY() {
        return this.getGridRealPos(this.fieldX, this.fieldY)
    }

    getMoveInfo(moveGrid) {
        if (!moveGrid) { return; }

        let fieldposx = this.getNowGridXY().x;
        let fieldposy = this.getNowGridXY().y;

        let moveposx = this.getGridRealPos(moveGrid.x, moveGrid.y).x;
        let moveposy = this.getGridRealPos(moveGrid.x, moveGrid.y).y;

        let moveInfo = { x: moveGrid.x, y: moveGrid.y };
        let xdis = moveposx - fieldposx;
        let ydis = moveposy - fieldposy;
        if (xdis < 0) {  // 方向左
            if (ydis > 0) {
                moveInfo.dir = dir.leftup;
            } else if (ydis < 0) {
                moveInfo.dir = dir.leftdown;
            } else {
                moveInfo.dir = dir.left;
            }
        } else if (xdis > 0) {  // 方向右
            if (ydis > 0) {
                moveInfo.dir = dir.rightup;
            } else if (ydis < 0) {
                moveInfo.dir = dir.rightdown;
            } else {
                moveInfo.dir = dir.right;
            }
        } else {
            if (ydis > 0) {
                moveInfo.dir = dir.up;
            } else if (ydis <= 0) {
                moveInfo.dir = dir.down;
            }
        }
        return moveInfo;
    }

    checkGreedyRouteLoop(moveInfo) {
        for (let r of this.greedyRouteInfo) {
            if (r.x == moveInfo.x && r.y == moveInfo.y && r.dir == moveInfo.dir) {
                return true;
            }
        }
        return false;
    }

    // 是否占住下一个格子
    isTakeNextGrid() {
        if (!this.nextGrid) return;
        let bfieldarr = this.battleS.bFieldArr;
        if (bfieldarr[this.nextGrid.x] && bfieldarr[this.nextGrid.x][this.nextGrid.y]) {
            bfieldarr[this.fieldX][this.fieldY].nowUnit = null;
            this.fieldX = this.nextGrid.x;
            this.fieldY = this.nextGrid.y;
            bfieldarr[this.fieldX][this.fieldY].nowUnit = this;
        }
    }
    // 得到 6个方向的格子信息数组
    getNowArrDirection() {
        let bfieldarr = this.battleS.bFieldArr;
        let arr = this._getSixDirection(this.fieldX, this.fieldY)
        let ret = []
        for (var i = 0; i < arr.length; i++) {
            let grid = arr[i]
            if (bfieldarr[grid.x] && bfieldarr[grid.x][grid.y] && !bfieldarr[grid.x][grid.y].nowUnit && this._IsCanWalkGrid(grid.x, grid.y)) {
                ret.push(bfieldarr[grid.x][grid.y])
            } else {
                ret.push(null)
            }
        }
        return ret
    }

    // 移动单位位置
    doMove() {
        let movespeed = this.getNowAttri("msp");
        if (!this.nextGrid) return;

        this.setAction("walk");
        this.attInterval = 0;
        let selfpos = this.getPosition();
        // cc.error("this.nextGrid=", JSON.stringify(this.nextGrid))
        let nextpos = new vecT(bConfig.gridPosArr[this.nextGrid.x][this.nextGrid.y].x, bConfig.gridPosArr[this.nextGrid.x][this.nextGrid.y].y);
        let vec = nextpos.sub(selfpos);

        if (vec.mag() <= movespeed) {
            // this.position = nextpos;
            this.setPosition(nextpos.x, nextpos.y);
            this.nextGrid = null;
            // console.log(this.gsid, this.nowTeam, "移动到了(" + this.x +"," + this.y + ")" );
        } else {
            let xspeed = vec.x;
            let yspeed = vec.y;
            if (Math.abs(vec.x) >= movespeed) {
                xspeed = vec.x / Math.abs(vec.x) * movespeed;
            }
            if (Math.abs(vec.y) >= movespeed) {
                yspeed = vec.y / Math.abs(vec.y) * movespeed;
            }
            this.x += xspeed;
            this.y += yspeed;
        }
        this.refreshMapNew();
    }

    checkGridBlock(grid) {
        return !!this.battleS.bFieldArr[grid.x][grid.y].nowUnit;
    }

    //6变形寻路开始////////////////////////////////////////////////////////////////////////
    getObstacleArr2() {
        let obstacleArr = [];
        for (let i = 0; i < this.battleS.bFieldArr.length; ++i) {
            for (let j = 0; j < this.battleS.bFieldArr[i].length; ++j) {
                // 障碍：有人的都算障碍
                if (this.battleS.bFieldArr[i][j].nowUnit) {
                    obstacleArr.push({ x: i, y: j });
                }
            }
        }
        return obstacleArr;
    }

    // //获取2个坐标点之间的距离 //暂未使用 不要删除
    // _getDisLen(point1, point2){
    //     let startxy = this.pointy_hex_to_pixel(this.evenr_to_cube({row:point1.y, col:point1.x}))
    //     let endxy = this.pointy_hex_to_pixel(this.evenr_to_cube({row:point2.y, col:point2.x}))
    //     return Math.pow(endxy.x - startxy.x, 2) + Math.pow(endxy.y - startxy.y, 2)
    // }

    getAStartSixPath(gStart, gEnd1) {
        //找周边空位
        let gEnd = { x: gEnd1.x, y: gEnd1.y }
        let startxy = this.pointy_hex_to_pixel(this.evenr_to_cube({ row: gStart.y, col: gStart.x }))
        for (var j = 1; j < 7; j++) {
            let weiraoList = []
            let arr = this._getFilePosByQuan(gEnd.y, gEnd.x, j)
            let isContanStart = false

            for (var i = 0; i < arr.length; i++) {
                let xIndex = arr[i].row
                let yIndex = arr[i].col
                if (this.battleS.bFieldArr[xIndex] && this.battleS.bFieldArr[xIndex][yIndex]) {
                    let bfield = this.battleS.bFieldArr[xIndex][yIndex]
                    //自身只在第一层加入进去
                    if (bfield.nowUnit && (bfield.nowUnit == this)) {
                        isContanStart = true
                    }
                    if (!bfield.nowUnit && this._IsCanWalkGrid(xIndex, yIndex)) {
                        weiraoList.push({ x: xIndex, y: yIndex })
                    }
                }
            }
            //自己已经在第一层围绕了 就不要找新的位置了
            if (isContanStart) {
                if (j == 1) {//第一层直接返回 不移动
                    return [this.grid(gStart.x, gStart.y)]
                }
                //第二层全部满了 但是自己也在第二层 不移动
                if (j == 2 && weiraoList.length == 0) {
                    return [this.grid(gStart.x, gStart.y)]
                }
                //第三层理论上不会满
            }
            //除了自己位置之外的空余的点
            if (weiraoList.length > 0) {
                let dis = 999999999
                for (var k = 0; k < weiraoList.length; k++) {
                    let fieldXY = weiraoList[k]
                    let endxy = this.pointy_hex_to_pixel(this.evenr_to_cube({ row: fieldXY.y, col: fieldXY.x }))
                    let nowlen = Math.pow(endxy.x - startxy.x, 2) + Math.pow(endxy.y - startxy.y, 2)
                    if (nowlen < dis) {
                        dis = nowlen
                        gEnd.x = weiraoList[k].x
                        gEnd.y = weiraoList[k].y
                    }
                }
                break
            }
        }

        //周边空位找到 开始寻路
        //阻挡
        this.obstacleArr = this.getObstacleArr2();
        this.AStarSix = new AStarSixPaths()
        //初始化地图
        this.AStarSix.initMapData(bConfig.gridWidth, bConfig.gridHeight, (i, j) => {
            //右边有3个不能去
            if (i % 2 == 0 && j == bConfig.gridHeight - 1) {
                return true
            }
            //不能去到最后一个格子
            for (var index = 0; index < this.obstacleArr.length; index++) {
                let data = this.obstacleArr[index]
                if (data.x == i && j == data.y) {
                    return true
                }
            }
            return false
        })
        let arrs = this.AStarSix.ComputePath(gStart, gEnd)
        let arrret = []
        //第0个是起始格子
        for (var k = arrs.length - 1; k >= 1; k--) {
            // let isStart = (arrs[k].x == gStart.x && arrs[k].y == gStart.y)
            // let isend = (arrs[k].x != gEnd.x && arrs[k].y != gEnd.y)
            //去自身位置
            // if(!isStart){
            arrret.push(this.grid(arrs[k].x, arrs[k].y))
            // }
        }
        //丢掉数据
        this.AStarSix = null
        return arrret
    }
    //算点的实际x,y坐标
    pointy_hex_to_pixel(hex) {
        var x = 1 * (Math.sqrt(3) * hex.q + Math.sqrt(3) / 2 * hex.r)
        var y = 1 * (3. / 2 * hex.r)
        return {
            x: x,
            y: y
        }
    }
    cube_to_evenr(hex) {
        var col = hex.q + (hex.r + (hex.r & 1)) / 2
        var row = hex.r
        return {
            col: col,
            row: row
        }
    }
    evenr_to_cube(hex) {
        var q = hex.row - (hex.col + (hex.col & 1)) / 2
        var r = hex.col
        return {
            q: q,
            r: r,
            s: -q - r
        }
    }
    _getFilePosByQuan(x, y, quan) {
        let center = { col: y, row: x }
        let start = this.evenr_to_cube(center)
        var results = []
        for (var q = -quan; q <= quan; q++) {
            for (var r = -quan; r <= quan; r++) {
                for (var s = -quan; s <= quan; s++) {
                    if (q + r + s == 0) {
                        if ((Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2 == quan) {
                            let cubeVal = this.cube_to_evenr({
                                q: q + start.q,
                                r: r + start.r,
                                s: s + start.s
                            })
                            results.push(cubeVal)
                        }
                    }
                }
            }
        }
        return results
    }
    _getSixDirection(y, x) {
        let arr = this._getFilePosByQuan(x, y, 1)
        let ret = []
        ret.push({ x: arr[0].row, y: arr[0].col })//左
        ret.push({ x: arr[1].row, y: arr[1].col })//左上
        ret.push({ x: arr[3].row, y: arr[3].col })//右上
        ret.push({ x: arr[5].row, y: arr[5].col })//右
        ret.push({ x: arr[4].row, y: arr[4].col })//右下
        ret.push({ x: arr[2].row, y: arr[2].col })//左下
        return ret
    }
    //6变形寻路结束////////////////////////////////////////////////////////////////////////
    grid(x, y) {
        return { x: x, y: y };
    }
    getObstacleArr() {
        let obstacleArr = [];
        // if(this.lastGrid) obstacleArr.push({x: this.lastGrid, y: this.lastGrid});
        for (let i = 0; i < this.battleS.bFieldArr.length; ++i) {
            for (let j = 0; j < this.battleS.bFieldArr[i].length; ++j) {
                // 障碍：除空格，本身、目标格子之外的格子
                if (!this.battleS.bFieldArr[i][j].nowUnit || this.battleS.bFieldArr[i][j].nowUnit == this || this.battleS.bFieldArr[i][j].nowUnit == this.findTarget) {
                    continue;
                }
                if (this.battleS.bFieldArr[i][j].nowUnit.initTeam != this.initTeam) continue;
                obstacleArr.push({ x: i, y: j });
            }
        }
        return obstacleArr;
    }

    getNextGridPos() {
        return {
            x: bConfig.gridPosArr[this.nextGrid.x][this.nextGrid.y].x,
            y: bConfig.gridPosArr[this.nextGrid.x][this.nextGrid.y].y,
            gridX: this.nextGrid.x,
            gridY: this.nextGrid.y,
        };
    }

    doBlink() {  // 闪现
        if (this.playBlink) return false;
        // if(this.cikeCd == 20) this._blink = 1;
        if (this.cikeCd > 0) return false;
        // this.playBlink = true;

        let tarr = this.nowTeam == "left" ? this.battleS.rightUnitArr : this.battleS.leftUnitArr;
        // 检测谁离我最远
        let blinktar = null;
        let nowdis = 0;
        for (let i = 0; i < tarr.length; ++i) {
            if (tarr[i].isDead()) continue;
            let disx = Math.abs(tarr[i].x - this.x);
            let disy = Math.abs(tarr[i].y - this.y);
            let distance = disx * disx + disy * disy;
            if (!blinktar) {
                blinktar = tarr[i];
                nowdis = distance;
                continue;
            }
            if (distance > nowdis) {
                blinktar = tarr[i];
                nowdis = distance;
            }
        }
        if (!blinktar) return;

        let fieldnow = blinktar.getNowField();
        this.nextGrid = this.getPosByField(fieldnow);
        if (!this.nextGrid) return;
        this.isTakeNextGrid();
        this.playBlink = true;
        this._blink = 2;
        this._nowJump = true;
        this.blinkFps = 36;     // 刺客 跳时间
        this.pushOneBuff("cikejump", this.blinkFps, null, this);
        this.setAction("stand");
        return true;
    }

    // 刺客跳跃落地
    toGround() {
        this._nowJump = false;
        this.setPosition(bConfig.gridPosArr[this.nextGrid.x][this.nextGrid.y].x, bConfig.gridPosArr[this.nextGrid.x][this.nextGrid.y].y);
        this.nextGrid = null;
        this.refreshMapNew();
    }

    // 在某个位置周围寻找位置
    getPosByField(fieldnow) {
        for (var i = 1; i < bConfig.gridWidth; i++) {
            //第一圈到第N圈
            let results = this._getFilePosByQuan(fieldnow.y, fieldnow.x, i)
            for (var j = 0; j < results.length; j++) {
                let xindex = results[j].row
                let yindex = results[j].col
                //跳到周边没人的位置上去
                if (this.battleS.bFieldArr[xindex] && this.battleS.bFieldArr[xindex][yindex] && !this.battleS.bFieldArr[xindex][yindex].nowUnit) {
                    if (this._IsCanWalkGrid(xindex, yindex)) {
                        return new vecT(xindex, yindex);
                    }
                }
            }
        }
    }

    // 普攻判断
    doAtt() {
        if (this.attNext > 0) return;
        if (this.attInterval > 0) return;

        // if(this.attTarget) {
        if (!this.checkIsInAttArea(this.attTarget)) {
            this.attTarget = null;
        }
        if (!this.attTarget) return;

        if (this.attTarget.isDead() || this.attTarget.isInvicible()) {
            this.attTarget = null;
            return;
        }
        // }
        if (!this.attTarget) return;
        this.actiondt = 0;           // 刚开始动作
        this.doNormalAtt();
    }
    _GetJianGe() {
        if (__AttDisScale == null) {
            var v2 = bConfig.GetJianGe();
            __AttDisScale = { "x": v2.x / 80 * 1.1, "y": v2.y / 80 * 1.1 }
        }
        return __AttDisScale
    }
    //仅能用于配置表
    _getATKArr(arr) {
        this._GetJianGe()
        let ret = arr
        if (arr.length >= 2) {
            let val1 = Number(arr[0])
            let val2 = Number(arr[1])
            if (val1 && val2) {
                ret = []
                ret.push(val1 * __AttDisScale.x)
                ret.push(val2 * __AttDisScale.y)
            }
        }
        return ret
    }

    getAttArea_NoScale() {
        let ratt = this.config.attzone;
        return {
            x: ratt.x + this.getExtraAttri("attdis"),
            y: ratt.y + this.getExtraAttri("attdis")
        };
    }

    // 得到攻击范围数值
    getAttArea_Scale() {
        this._GetJianGe()
        let ratt = this.config.attzone;
        return {
            x: (ratt.x + this.getExtraAttri("attdis")) * __AttDisScale.x,
            y: (ratt.y + this.getExtraAttri("attdis")) * __AttDisScale.y
        };
    }
    // 得到寻敌范围数值
    getFindArea_Scale() {
        this._GetJianGe()
        let find = this.config.findzone;
        return {
            x: (find.x + this.getExtraAttri("attdis")) * __AttDisScale.x,
            y: (find.y + this.getExtraAttri("attdis")) * __AttDisScale.y
        };
    }

    _getfindDis() {
        if (!this._finddis) {
            let rfind = this.getFindArea_Scale();
            //注:未开方
            this._finddis = Math.pow(rfind.x, 2) + Math.pow(rfind.y, 2)
        }
        return this._finddis
    }

    // 检查目标是否在攻击范围内
    checkIsInAttArea(target) {
        let ratt = this.getAttArea_Scale();
        let xatt = ratt.x;
        let yatt = ratt.y;
        let xdis = Math.abs(this.x - target.x);
        let ydis = Math.abs(this.y - target.y);
        if (this.config.attrange == 1) {
            if (xdis > xatt || ydis > yatt) {
                return false;
            }
        }
        if (this.config.attrange == 2) {
            if (xdis * xdis / (xatt * xatt) + ydis * ydis / (yatt * yatt) > 1) {
                return false;
            }
        }
        return true;
    }

    // 子类重写
    doNormalAtt() {
        this.setAction("attack");

        for (let k in this.backNormCount) {
            this.backNormCount[k] -= 1;
        }
        this.BackByNormAction();

        // 如果目标有冰甲 则减速
        let abinjia = this.attTarget.getBuffNumByType("abinjia");
        if (abinjia > 1) {
            this.pushOneBuff("abinjia", abinjia * 60, null, this.attTarget)
        }

        let atype = "nearatt";
        if (this.config.attrange == 2) {
            atype = "faratt";
        }

        let duration = this.config.attinfo.tframe;
        this.attNext = this.bTools.intergeNum(duration / this.getNowAttri("pasp"));
        if (this.config.attinfo.batti) this.attInterval = this.bTools.intergeNum(this.config.attinfo.batti / this.getNowAttri("pasp"));

        let hframe = this.config.attinfo.hframe;
        hframe = hframe / this.getNowAttri("pasp");
        this.pushLogicStepsDeal(this.steps + this.bTools.intergeNum(hframe), atype);
    }

    // 无弹道攻击单位子类函数
    doNearAttHurm() {
        if (!this.attTarget) return;
        if (this.attTarget.isDead()) return;

        let hurminfo = this.getHurmInfo(this.getNowAttri("atk"), 1);
        this.BackForNormalAtt(hurminfo, this.attTarget);

        let hurmval = this.attTarget.getCalHurm(this, hurminfo, "normal");
        this.BackByNearAtt(hurmval);
    }

    BackByNearAtt(hurmval) {
        if (!this.m_objSkillBack["O"]) return;
        this.m_objSkillBack["O"].forEach(ele => {
            switch (ele[0]) {
                case "O001":    // 平砍暴击时 释放一个技能
                    if (hurmval.crit != 1) break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.bTools.getRandom() <= ele[2] / 100;
                    })) {
                        let pindex = this.getSkillIndex(ele[3]);
                        this.getSkillTarget(this.getSkillInfo(pindex));
                        if (!this.skilltarget) break;
                        this.doSkill(pindex);
                    }
                    break;
            }
        })
    }

    doFarAtt() {
        let hurminfo = this.getHurmInfo(this.getNowAttri("atk"), 1);
        let attinfo = this.config.attinfo;
        // 远程攻击全体buff
        if (this.getBuffNumByType("atkevery") > 1) {
            let ratt = this.getAttArea_NoScale();
            let xatt = ratt.x;
            let yatt = ratt.y;
            let tarr = this.getTargetByType(1, xatt, yatt, 1);
            for (let i = 0; i < tarr.length && i < this.getBuffNumByType("atkeverynumber"); ++i) {  // 最多打5个
                let hurminfo = this.getHurmInfo(this.getNowAttri("atk") * (this.getBuffNumByType("atkevery") - 1), 1);
                let attinfo = this.config.attinfo;
                let effnode = new eff_1(this.battleS.getEffId(), this.steps, attinfo.model, attinfo, this, new vecT(this.x, this.y), tarr[i], hurminfo, "normal");
                this.battleS.effUnitArr.push(effnode);
            }
            return;
        }
        this.BackByFarAtt(hurminfo);
        let effnode = new eff_1(this.battleS.getEffId(), this.steps, attinfo.model, attinfo, this, new vecT(this.x, this.y), this.attTarget, hurminfo, "normal");
        this.battleS.effUnitArr.push(effnode);
    }

    BackByAfterFarAtt(hurminfo, target) {
        if (!this.m_objSkillBack["W"]) return;
        this.m_objSkillBack["W"].forEach(ele => {
            switch (ele[0]) {
                case "W001":   //  蔡文姬弹射  // 如果有弹射
                    this.createBomb(ele[1], ele[2], ele[3], hurminfo, target);
                    break;
                case "W002":    // 神状态下才能弹射
                    if (this.getBuffNumByType("shen") > 1) {
                        this.createBomb(ele[1], ele[2], ele[3], hurminfo, target);
                    }
                    break;
            }
        })
    }

    // 生成弹射 传入次数 以及 衰减
    createBomb(count, dif, dis, hurminfo, target) {
        if (!hurminfo.bomb && hurminfo.bomb != 0) {
            hurminfo.bomb = count;
        }
        if (hurminfo.bomb && hurminfo.bomb > 0) {
            let tarr = target.getTargetByTypeState(1, dis, dis, 1, true, null, null, this.nowTeam);
            hurminfo.bomb -= 1;
            hurminfo.attval *= (1 - dif / 100);
            if (tarr.length > 0) {
                let tar = tarr[this.bTools.getRandomInt(0, tarr.length - 1)];
                let attinfo = this.config.attinfo;
                let effnode = new eff_1(this.battleS.getEffId(), this.steps, attinfo.model, attinfo, this, new vecT(target.x, target.y), tar, hurminfo, "normal");
                this.battleS.effUnitArr.push(effnode);
            }
        }
    }

    doFarHurm(source, hurminfo, model) {
        if (source) source.BackForNormalAtt(hurminfo, this);
        this.getCalHurm(source, hurminfo, "normal");
        this.skillHitArr.push(model);
        if (source) source.BackByAfterFarAtt(gUtils.deepClone(hurminfo), this);
    }

    getNormalHurmval() {
        // let targetComp = this.attTarget.getComponent(cc.Component);
        let atktype = this.atktype || 1;
        let deftype = this.attTarget.deftype || 1;
        let hurmtype = 1;
        let level = this._level || 1;
        let attval = this.getNowAttri("atk");
        let defval = this.attTarget.getNowAttri("def") * (1 - this.getNowAttri("ppthr"));
        let extra = 0;
        let pcr = this.getNowAttri("pcri");
        let vcr = this.getNowAttri("pcrid");
        let tinc = hurmtype == 1 ? this.getNowAttri("ppdam") : this.getNowAttri("pmdam");  // todo 物理 or 魔法增伤
        let inc = this.getNowAttri("pdam") || 0;
        let trdc = hurmtype == 1 ? this.attTarget.getNowAttri("pprdc") : this.attTarget.getNowAttri("pmrdc");
        let rdc = this.attTarget.getNowAttri("prdc");
        let apower = this.getNowAttri("apower");
        let dpower = this.attTarget.getNowAttri('dpower');
        let cancrit = 2;   // 普攻可暴击

        return this.bTools.getHurm(level, attval, defval, extra, pcr, vcr, tinc, inc, trdc, rdc, apower, dpower, cancrit);
    }

    // 重置攻击动作时间     眩晕等 控制状态时调用
    resetNormAtt() {
        this.attNext = 0;
        this.attInterval = 0;
    }

    logwhy(blog, str) {
        return
        if (this.gsid == 16341) {
            if (blog && this.nowmagic >= this.maxmagic) {
                // cc.error("怒气满了", str)
            }
        }
    }

    //外部调用的时候 bDoSkill 需要为false 或者null
    isCanDoSkillIMPL(pindex, bDoSkill) {
        if (this.attNext) {//正在施法中
            this.logwhy(pindex == 0, "attNext.................");
            return 1;    // 如果处于攻击或施法动作中 则还不能放技能。
        }
        if (this.getBuffNumByType("silent") > 1) {//沉默
            this.logwhy(pindex == 0, "silent.........");
            return 2;
        }
        if (this.getBuffNumByType("sneer") > 1) {// 被嘲讽状态 无法放技能;
            this.logwhy(pindex == 0, "sneer.........");
            return 3
        };
        if (this.getBuffNumByType("fangzhu") > 1) {  // 如果被放逐不做任何行为
            return 9;
        }
        if (this.blinkFps) { // 如果正在跳跃 则 不做任何行为
            return 10;
        }
        if (this.updateSkill) { //理论上目前不会触发
            return 11;
        }
        if (this.getBuffNumByType("stun") > 1) { //眩晕
            return 12;
        }
        if (this.getBuffNumByType("meihuo") > 1) { //魅惑
            return 13;
        }
        if (this.getBuffNumByType("fear") > 1) { // 恐惧了
            return 14;
        }
        let skillinfo = this.getSkillInfo(pindex);     //GetConfig("dbEffInfo")[sid];
        if (!skillinfo) {//技能未找到 理论上不会触发
            this.logwhy(pindex == 0, "noskillinfo.........");
            return 5
        };
        if (skillinfo.nomain) {//非主动技能
            this.logwhy(pindex == 0, "nomain.........");
            return 4
        };
        // 普通技能 && (消耗不足或者受到魅惑)
        if (!skillinfo.ecost && (this.nowmagic < this.maxmagic || this.getBuffNumByType("meihuo") > 1)) {
            this.logwhy(pindex == 0, "no skillinfo.ecost.........");
            return 6
        };
        //cd 中
        if (this.skillCdArr[pindex] < skillinfo.cd) {
            this.logwhy(pindex == 0, "cding.........");
            return 7
        };
        if (bDoSkill) {
            this.skilltarget = null;
            this.skilltargetsArr = [];
            if (!!SKILLTARGET[skillinfo.smodel]) {
                this["getTarget" + skillinfo.smodel] && this["getTarget" + skillinfo.smodel](skillinfo);
            } else {
                this.getSkillTarget(skillinfo);
            }
        }

        if (!this.skilltarget) {
            this.logwhy(pindex == 0, "no skilltarget.........");
            return 8
        };

        if (bDoSkill) {
            this.actiondt = 0;
            this.doSkill(pindex);
        }
        return 0;
    }


    _isCanDoSkill(pindex) {
        let states = this.isCanDoSkillIMPL(pindex, true)
        return states == 0
    }

    getSkillTarget(skillconfig) {
        if (!skillconfig) return;
        let targetsarr = this.getTargetByTypeState(skillconfig.target, skillconfig.doarea, skillconfig.doarea, skillconfig.areatype, !!skillconfig.target_unself);

        this.skilltarget = null;
        this.skilltargetsArr = [];
        //打乱顺序
        // for(let i = 0, len = targetsarr.length; i < len; i++){
        //     let currentRandom = this.bTools.getRandomInt(0, len - 1);
        //     let current = targetsarr[i];
        //     targetsarr[i] = targetsarr[currentRandom];
        //     targetsarr[currentRandom] = current;
        // }
        let oldIndex = 0
        for (var i = 0; i < targetsarr.length; i++) {
            if (this.preFindTarget == targetsarr[i]) {
                oldIndex = i
            }
        }

        //把原来的目标放在第一个  //大招优先对正在攻击的敌人进行释放
        if (targetsarr.length > 0) {
            let index0 = targetsarr[0]
            targetsarr[0] = targetsarr[oldIndex]
            targetsarr[oldIndex] = index0
        }

        let targetnum = skillconfig.targetnum > 0 ? this.BackByTargetnum(skillconfig.targetnum) : skillconfig.targetnum;
        for (let i = 0; (targetnum == -1 || i < targetnum) && i < targetsarr.length; ++i) {
            if (i == 0) {
                this.skilltarget = targetsarr[i]
            }
            this.skilltargetsArr.push(targetsarr[i]);
        }
    }

    //是否在释放大招暂停中
    isBigSkillPausing() {
        return this.isdobigskill && this.realtime < this.bigskillshowtime
    }

    getbigskilltargets() {
        if (this.isBigSkillPausing()) {
            var targets = []
            if (this.skilltargetsArr) {
                for (var i = 0; i < this.skilltargetsArr.length; i++) {
                    targets.push(this.skilltargetsArr[i])
                }
            }
            return targets
        }
    }

    getDebugString() {
        return "steps:" + this.steps + " gisd=" + (this.gsid || 0)
    }

    doSkill(pindex) {   //  技能分抬手时间()  丢出手特效  已经命中后效果
        if (!this.config.sttinfo.hframe) return;
        let duration = this.config.sttinfo.tframe;
        this.attNext = duration;
        this.attInterval = 0;
        this.setAction("skill");
        this._skillid = this.skillArr[pindex];
        this.doPushSkillActions(pindex);

        if (bConfig.IsShowDebug()) {
            bConfig.AddRecordLog(this.getDebugString() + " skillid:" + this._skillid)
        }

        if (this.bDoUIThings) {
            //大招逻辑
            if (pindex == 0 && this._star > 3) {
                let strPathSound = app.db.getSkillSoundByGsid(this.gsid);
                if (strPathSound) {
                    // let own = this.initTeam == "left" ? 0 : 1;
                    if (this.nowTeam == "left") {
                        app.playGeneralSkillSound(strPathSound, 0);
                    }
                }
                let sinfo = this.getSkillInfo(pindex);    // GetConfig("dbEffInfo")[skillid];
                //暂停时间
                if (!this.isdobigskill && sinfo && sinfo.pausetime && sinfo.pausetime > 0) {
                    this.isdobigskill = true
                    this.bigskillshowtime = this.realtime + sinfo.pausetime;
                }
                if (sinfo && sinfo.shaketime && sinfo.shaketime > 0) {
                    var shaketime = sinfo.shaketime
                    var shakestren = sinfo.shakestren
                    var shakedelay = sinfo.shakedelay

                    eventMgr.emit(eventStr.battleEvent.ShakeEvent, {
                        shaketime: shaketime,
                        shakestren: shakestren,
                        shakedelay: shakedelay
                    })
                }
            }

            this.sendMagicChangeToClient(pindex == 0)
        }
    }

    getMainResetCd() {
        return this.skillCdReset[0] + (this.skillCdConfig[0] * this.getNowAttri("pcd"))
    }

    doSkillNoAction(skillid) {   //  无技能释放动作的技能 如斧王转
        let index = this.skillArr.indexOf(skillid);
        let sinfo = this.getSkillInfo(index); // GetConfig("dbEffInfo")[skillid];
        if (!sinfo) return;
        this.getSkillTarget(sinfo);
        if (this.skillCdArr[index] < sinfo.cd) return;


        this.skillCdArr[index] = this.skillCdReset[index];
        let steps = this.steps + 1;
        this.setAction("skill");
        this._skillid = skillid;
        this.pushLogicStepsDeal(steps, "skilleff", index);
    }

    doPushSkillActions(pindex) {
        if (!this.config.sttinfo) return;
        let steps = this.steps + this.bTools.intergeNum(this.config.sttinfo.hframe);
        let skillid = this.skillArr[pindex];
        let sinfo = this.getSkillInfo(pindex);    // GetConfig("dbEffInfo")[skillid];
        if (sinfo.dotimes) {
            for (let i = 0; i < sinfo.dotimes.length; ++i) {
                this.pushLogicStepsDeal(steps + sinfo.dotimes[i], "skilleff", pindex);
            }
        } else {
            this.pushLogicStepsDeal(steps, "skilleff", pindex);
        }
    }

    // 检查是否所有的技能目标 都ok  有1个ok就返回true  或者所有目标都返回
    checkStargetIsAllOk() {
        if ((!this.skilltarget || this.skilltarget.isDead() || (this.skilltarget.nowTeam != this.nowTeam && this.skilltarget.isInvicible())) && this.skilltargetsArr.length == 1) return false;
        let numNoOk = 0;        // 目标失效的个数
        for (let i = this.skilltargetsArr.length - 1; i >= 0; --i) {
            if (this.skilltargetsArr[i].isDead() ||
                (this.skilltarget.nowTeam != this.nowTeam && this.skilltarget.isInvicible())) {
                this.skilltargetsArr.splice(i, 1);
                numNoOk++;
            }
        }
        return numNoOk < this.skilltargetsArr.length;
    }

    /**
     * 分身出现
     */
    BackBySeparaInit() {
        if (!this.m_objSkillBack["f"]) return;
        this.m_objSkillBack["f"].forEach(ele => {
            switch (ele[0]) {
                case "f001":   // 属性
                    this.pushOneBuff(ele[1], ele[2] * 60, null, this.master, true);
                    this.master.pushOneBuff(ele[1], ele[2] * 60, null, this.master, true);
                    break;
            }
        })
    }

    //大招释放展示效果
    showSkillEffect() {
        if (this.initTeam == "left") {
            //4星以上武将播放技能特效
            var objGeneralInfo = app.db.getGBaseByGsid(this.gsid);
            // console.log("objGeneralInfo：",objGeneralInfo);
            if (objGeneralInfo.STAR >= 5) {
                let skillData = {
                    skill: this._skillid,
                    gsid: this.gsid,
                    guid: this.guid,
                };
                eventMgr.emit(eventStr.battleEvent.RefGeneralSkillShow, skillData);
            }
        }
    }

    doSkillEff(pindex) {
        if (pindex == 0 && !this.checkStargetIsAllOk()) { return; }
        let skillid = this.skillArr[pindex];
        let sinfo = this.getSkillInfo(pindex);    // GetConfig("dbEffInfo")[skillid];

        // 释放成功 扣除
        this.skillCdArr[pindex] = Number(skillid) % 20 <= 5 ? this.getMainResetCd() : this.skillCdReset[pindex];
        if (!sinfo.ecost) {
            this.nowmagic = 0;
            //前端特有
            this.sendMagicChangeToClient()
            if (this.initTeam == "left") this.battleS.addLeftMp(this.bTools.getRandomInt(8, 12));
            else if (this.initTeam == "right") this.battleS.addRightMp(this.bTools.getRandomInt(8, 12));
        }
        if (pindex == 0) {   // 放在放完技能之后
            this.battleS.getOptByUnit("doskill", this);
        }
        //分身
        let separa = sinfo.separation;
        if (separa) {     // 分身技
            let battleinfo = {};
            let base = ["atk", "def", "mdef"]
            let rechp = this.getLostHp() * (separa.full < 10 ? 0 : separa.full) / 100;
            if (rechp > 0) this.getCalHeal(this, this.getHealInfo(rechp), "skill");
            for (let k in this.battleInfo) {
                if (base.indexOf(k) >= 0) { battleinfo[k] = this.battleInfo[k] }
                else { battleinfo[k] = this.battleInfo[k] * 1000 };
            }
            battleinfo.hp = this.initInfo.hp;
            for (let i = 0; i < separa.num; ++i) {
                let info = {
                    model: separa.model,
                    level: this._level,
                    class: this._class,
                    team: this.initTeam,
                    occu: separa.occu || this._occu,
                    occu2: separa.occu2 || this._occu2,
                    camp: separa.camp || this._camp,
                    star: this._star,
                    skills: separa.skills || [],
                }
                if (!!separa.undead) {
                    info.skills = []
                    for (let i = 0; i < this._gskills.length; ++i) {
                        if (this._gskills[i] % 20 > 5 && this._gskills[i] % 20 <= 10) continue;
                        info.skills.push(Number(this._gskills[i]) % 10000 + 30000);
                    }
                }
                info.index = this.initTeam == "left" ? this.battleS.leftUnitArr.length : this.battleS.rightUnitArr.length;
                info.born = !!separa.undead ? ("u" + info.index) : ("s" + info.index);
                // 找位置
                let nextGrid = this.getPosByField(this.getNowField());
                if (!nextGrid) break;
                this.battleS.createUnit(info, battleinfo, this.steps + 1, nextGrid.x, nextGrid.y, { nowhp: (separa.full === 1 ? battleinfo.hp : this.battleInfo.hp), hurm: separa.hurm, injure: separa.injure, duration: separa.duration, load: separa.load || 37, buff: separa.buff, master: this });
                this.nextGrid = null;
            }
        }

        let hconfig = sinfo.self_hurm;
        let effconfig = sinfo.self_eff;
        let hitconfig = sinfo.hit_eff;

        let nhurmtype = sinfo.hurmtype || 1;
        let nattval = 0;
        let objExtra = {};
        for (let i = 0; i < sinfo.add_arr.length; ++i) {
            let addone = sinfo.add_arr[i];
            switch (addone.rely) {
                case 1:
                    nattval += this.getNowAttri("atk") * addone.num / 100;
                    break;
                case 2:
                    let addnum = this.initInfo.hp * addone.num / 100;
                    if (sinfo.smodel == 18121) addnum = Math.min(addnum, this.getNowAttri("atk") * 2);
                    if (sinfo.smodel == 18136) addnum = Math.min(addnum, this.getNowAttri("atk") * 2);
                    nattval += addnum;
                    break;
                case 3:
                    nattval += this.battleInfo.hp * addone.num / 100;
                    break;
                case 4: // 此配置一定放在最后配置
                    nattval *= 1 + (this.getLostHp() / this.initInfo.hp) * (addone.num / 100);
                    break;
                case 5:
                    nattval += this.getNowAttri("def") * addone.num / 100;
                    break;
                case 6:
                    nattval += this.getNowAttri("mdef") * addone.num / 100;
                    break;
                case 7:
                    nattval += (this.skilltarget.initInfo.hp - this.skilltarget.battleInfo.hp) * addone.num / 100;
                    break;
                case 9:
                    if (!objExtra.inc) objExtra.inc = 0;
                    objExtra.inc += (this.skilltarget.initInfo.hp - this.skilltarget.battleInfo.hp) / this.skilltarget.initInfo.hp * addone.num;
                    break;
                case 11:
                    nattval += Math.min(this.skilltarget.battleInfo.hp * addone.num / 100, this.getNowAttri("atk") * 10);
                    break;
            }
        }
        let addinfo = this.getHurmInfo(nattval, nhurmtype, objExtra);

        if (sinfo.attri_add) {
            for (let i = 0; i < sinfo.attri_add.length; ++i) {
                let addone = sinfo.attri_add[i]
                switch (addone.attri) {
                    case "pcri":
                        addinfo.pcr += addone.num / 100;
                        break;
                    case "pcrid":
                        addinfo.vcr += addone.num / 100;
                        break;
                }
            }
        }
        addinfo.sindex = pindex;
        addinfo.stype = sinfo.stype;
        addinfo.target = sinfo.target;
        if (sinfo.bomb) addinfo.bomb = sinfo.bomb;

        if (sinfo.self_buff) {
            for (let i = 0; i < sinfo.self_buff.length; ++i) {
                if (this.bTools.getRandom() > sinfo.self_buff[i].prob) continue;
                this.pushOneBuff(sinfo.self_buff[i].id, sinfo.self_buff[i].ttime, null, this);
            }
        }

        // 释放技能后的一些行为
        this.BackByDoSkill(pindex);

        if (hconfig) {   // 如果没有施放出的特效  直接出现命中效果
            for (let i = 0; i < hconfig.hframe.length; ++i) {
                this.doSkillHurm(pindex, addinfo, hconfig.hframe[i]);
            }
            return;
        }

        if (effconfig) {

            let effc = this.getClassByEffType(effconfig.etype);
            if (effc != null) {
                let targetnum = sinfo.targetnum > 0 ? this.BackByTargetnum(sinfo.targetnum) : sinfo.targetnum;
                if (targetnum == 1) {
                    if (effconfig.bnum && effconfig.bnum > 1) {
                        // if(this.skilltarget.x this.skilltarget.y)
                        if (effconfig.estyle && effconfig.estyle == 1) {
                            let disy = this.skilltarget.y - this.y;
                            let disx = this.skilltarget.x - this.x;
                            let r = Math.pow(disx * disx + disy * disy, 0.5);
                            let uptheta = Math.atan2(disy, disx) * 180 / Math.PI;
                            let downtheta = uptheta;
                            let effunit = new effc(this.battleS.getEffId(), this.steps, sinfo.smodel, effconfig, this, new vecT(this.x, this.y), this.skilltarget, addinfo, "skill");
                            this.battleS.effUnitArr.push(effunit);
                            for (let i = 1; i < effconfig.bnum; ++i) {
                                let theta = i % 2 == 1 ? (uptheta += effconfig.eparam) : (downtheta -= effconfig.eparam);
                                let effunit = new effc(this.battleS.getEffId(), this.steps, sinfo.smodel, effconfig, this, new vecT(this.x, this.y), { x: this.x + r * Math.cos(theta * Math.PI / 180), y: this.y + r * Math.sin(theta * Math.PI / 180) }, addinfo, "skill");
                                this.battleS.effUnitArr.push(effunit);
                            }
                        }
                    } else {
                        let effunit = new effc(this.battleS.getEffId(), this.steps, sinfo.smodel, effconfig, this, new vecT(this.x, this.y), this.skilltarget, addinfo, "skill");
                        this.battleS.effUnitArr.push(effunit);
                    }
                } else {
                    for (let i = 0; (i < targetnum || targetnum == -1) && i < this.skilltargetsArr.length; ++i) {
                        let effunit = new effc(this.battleS.getEffId(), this.steps, sinfo.smodel, effconfig, this, new vecT(this.x, this.y), this.skilltargetsArr[i], addinfo, "skill");
                        this.battleS.effUnitArr.push(effunit);
                    }
                }
            }
        }
    }

    getClassByEffType(efftype) {
        if (this.m_clseffetpe == null) {
            this.m_clseffetpe = {
                "unit": eff_unit,
                "1": eff_1,
                "2": eff_2,
                "3": eff_3,
                "4": eff_4,
                "5": eff_5,
            }
        }
        return this.m_clseffetpe[efftype]
    }

    //释放嘲讽技能，光环加成
    checkHaloPlaySkill(hurminfo) {
        if (this.halo && this.halo == 101 && this.initTeam == "left") {
            if (this.haloConfig.SKILLBUFFLIST.indexOf("" + this._skillid) > -1) {
                let list = this.battleS.leftUnitArr;
                list.forEach((unit) => {
                    if (unit && unit.halo && unit.halo == 101) {
                        //加个护盾buff, 时间无限放大，额外血量消耗完时间会自动清零
                        unit.pushOneBuff("b40351", 100000000, null, this);
                    }
                })
            }
        }
    }

    doSkillHurm(pindex, hurminfo, hframe) {
        let skillid = this.skillArr[pindex];
        let sinfo = this.getSkillInfo(pindex);              // GetConfig("dbEffInfo")[skillid];
        let hconfig = sinfo.self_hurm;
        if (!hconfig) return;

        let basepos = this.getPosition();
        if (!this.skilltarget) this.skilltarget = this;
        let targetpos = this.skilltarget.getPosition();
        let disx = targetpos.x - basepos.x;
        let disy = targetpos.y - basepos.y;
        let tarr = this.getTargetByType(sinfo.target, -1, null, 1, !!sinfo.target_unself);
        let ratt;
        this.checkHaloPlaySkill(hurminfo);

        switch (hconfig.atype) {
            case 1: //前方矩形
                ratt = hconfig.area.split("x");
                ratt = this._getATKArr(ratt)

                if (this.skilltarget) this.skilltarget.skillHitArr.push(skillid);

                let rtheta = Math.atan2(disy, disx) * 180 / Math.PI;
                for (let i = 0; i < tarr.length; ++i) {
                    var bincolier = collider.isIntersrect({
                        x: this.x + Number(ratt[0]) / 2 * Math.cos(rtheta * Math.PI / 180),
                        y: this.y + Number(ratt[1]) / 2 * Math.sin(rtheta * Math.PI / 180),
                        w: Number(ratt[0]),
                        h: Number(ratt[1]),
                        theta: rtheta
                    }, { x: tarr[i].x, y: tarr[i].y, w: 50, h: 50, theta: 0 })

                    if (bincolier) {
                        if (hframe == 0) this.doEffHit(tarr[i], hurminfo, true);
                        else this.pushLogicStepsDeal(this.steps + hframe, "selfhurm", { target: tarr[i], effinfo: hurminfo, hit: true });
                    }
                }
                break;
            case 2:
                if (this.skilltarget) this.skilltarget.skillHitArr.push(skillid);
                let cnum = hconfig.area.split("x");
                cnum = this._getATKArr(cnum)
                let sector = { src: { x: basepos.x, y: basepos.y }, dst: { x: targetpos.x, y: targetpos.y }, theta: Number(cnum[0]), r: Number(cnum[1]) };
                for (let i = 0; i < tarr.length; ++i) {
                    if (collider.isInterSector({ x: tarr[i].x, y: tarr[i].y }, sector, { x: basepos.x, y: basepos.y })) {
                        if (hframe == 0) this.doEffHit(tarr[i], hurminfo, true);
                        else this.pushLogicStepsDeal(this.steps + hframe, "selfhurm", { target: tarr[i], effinfo: hurminfo, hit: true });
                    }
                }
                break;
            case 3: // 周围
                ratt = hconfig.area.split("x");
                ratt = this._getATKArr(ratt)
                for (let i = 0; i < tarr.length; ++i) {
                    if (collider.isIntersrect({ x: this.x, y: this.y, w: Number(ratt[0]) * 2, h: Number(ratt[1]) * 2, theta: 0 },
                        { x: tarr[i].x, y: tarr[i].y, w: 50, h: 50, theta: 0 })) {
                        if (hframe == 0) this.doEffHit(tarr[i], hurminfo);
                        else this.pushLogicStepsDeal(this.steps + hframe, "selfhurm", { target: tarr[i], effinfo: hurminfo });
                    }
                }
                break;
            case 4:
                for (let i = 0; i < this.skilltargetsArr.length; ++i) {
                    if (hframe == 0) this.doEffHit(this.skilltargetsArr[i], hurminfo);
                    else this.pushLogicStepsDeal(this.steps + hframe, "selfhurm", { target: this.skilltargetsArr[i], effinfo: hurminfo });
                }
                break;
            case 5:
                if (hframe == 0) this.doEffHit(this, hurminfo);
                else this.pushLogicStepsDeal(this.steps + hframe, "selfhurm", { target: this, effinfo: hurminfo });
                break;
            case 6:
                ratt = hconfig.area.split("x");
                ratt = this._getATKArr(ratt)

                for (let i = 0; i < tarr.length; ++i) {
                    let disx3 = this.x - tarr[i].x;
                    let disy3 = this.y - tarr[i].y;
                    let radius = Number(ratt[0]);
                    if (disx3 * disx3 + disy3 * disy3 <= radius * radius) {
                        if (hframe == 0) this.doEffHit(tarr[i], hurminfo);
                        else this.pushLogicStepsDeal(this.steps + hframe, "selfhurm", { target: tarr[i], effinfo: hurminfo });
                    }
                }
                break;
        }
    }

    doSkillEffBySetting() {

    }
    // hit 不需要推入命中动画
    doEffHit(target, hurminfo, hit) {    // 技能命中 
        if (!target) return;
        let skillid = this.skillArr[hurminfo.sindex];
        let sinfo = this.getSkillInfo(hurminfo.sindex)  // GetConfig("dbEffInfo")[skillid];
        if (!sinfo) return;
        let hitconfig = sinfo.hit_eff;
        let steps = this.steps + hitconfig.hframe;
        let effconfig = sinfo.self_eff;
        if (!hit) target.skillHitArr.push(skillid);

        if (hurminfo.bomb && hurminfo.bomb > 0) {   // 如果有弹射
            let tarr = target.getTargetByTypeState(sinfo.target, 240, 240, 1, true, null, null, this.nowTeam);
            let hinfo = gUtils.deepClone(hurminfo);
            if (hinfo.bomb == sinfo.bomb) {
                hinfo.baseattval = hinfo.attval;
            }
            if (effconfig.hurmdis) {
                hinfo.attval = hinfo.baseattval * (1 + (effconfig.hurmdis - 1) * (sinfo.bomb - hinfo.bomb + 1));
            }
            hinfo.bomb -= 1;
            if (tarr.length > 0) {
                let tar = tarr[this.bTools.getRandomInt(0, tarr.length - 1)];
                let effnode = new eff_1(this.battleS.getEffId(), this.steps, sinfo.smodel, effconfig, this, new vecT(target.x, target.y), tar, hinfo, "skill");
                this.battleS.effUnitArr.push(effnode);
            }
        }

        if (target.isDead()) return;
        if (steps == this.steps) {
            this.doSkillOutcome(target, hurminfo);
            return;
        }
        this.pushLogicStepsDeal(steps, "skillhurm", { target: target, effinfo: hurminfo });
    }


    doSkillOutcome(target, hurminfo) {
        if (!target) return;
        if (target.isDead()) return;
        let skillid = this.skillArr[hurminfo.sindex];
        let sinfo = this.getSkillInfo(hurminfo.sindex)  // GetConfig("dbEffInfo")[skillid];
        let hitconfig = sinfo.hit_eff;
        hurminfo.skillid = skillid;
        let addinfo;
        if (sinfo.bconcat == 1) {
            addinfo = this.skilltargetsArr;
        }

        hurminfo.hurmtype = sinfo.hurmtype;

        let tarr;
        let reff;
        switch (hitconfig.dtype) {
            case 1:
                if ((sinfo.stype == 1 || sinfo.stype == 4) && this.nowTeam != target.nowTeam) target.getCalHurm(this, hurminfo, "skill", 0, { skillid: skillid });
                else if ((sinfo.stype == 2 || sinfo.stype == 4) && this.nowTeam == target.nowTeam) target.getCalHeal(this, this.getHealInfo(hurminfo.attval, skillid), "skill");

                if (sinfo.enemy_buff && (sinfo.stype == 1 || sinfo.stype == 4 || (sinfo.stype == 3 && (sinfo.target == 1 || sinfo.target == 3))) && target.nowTeam != this.nowTeam) {
                    for (let j = 0; j < sinfo.enemy_buff.length; ++j) {
                        if (target.getBuffNumByType("mmiss") > 1) break;
                        if (this.bTools.getRandom() > sinfo.enemy_buff[j].prob) continue;
                        target.pushOneBuff(sinfo.enemy_buff[j].id, sinfo.enemy_buff[j].ttime, addinfo, this);
                    }
                } else if (sinfo.friend_buff && (sinfo.stype == 2 || sinfo.stype == 4 || (sinfo.stype == 3 && (sinfo.target == 2 || sinfo.target == 3))) && target.nowTeam == this.nowTeam) {
                    for (let j = 0; j < sinfo.friend_buff.length; ++j) {
                        if (this.bTools.getRandom() > sinfo.friend_buff[j].prob) continue;
                        target.pushOneBuff(sinfo.friend_buff[j].id, sinfo.friend_buff[j].ttime, addinfo, this);
                    }
                }
                break;
            case 2:
                reff = hitconfig.area.split("x");
                reff = this._getATKArr(reff)

                tarr = target.getTargetByTypeState(3, reff[0], reff[0], 1, false, null, null, this.nowTeam);

                for (let i = 0; i < tarr.length; ++i) {
                    if (tarr[i].isDead()) continue;
                    if ((sinfo.stype == 1 || sinfo.stype == 4) && this.nowTeam != tarr[i].nowTeam) tarr[i].getCalHurm(this, hurminfo, "skill", 0, { skillid: skillid });
                    else if ((sinfo.stype == 2 || sinfo.stype == 4) && this.nowTeam == tarr[i].nowTeam) tarr[i].getCalHeal(this, this.getHealInfo(hurminfo.attval, skillid), "skill");

                    if (sinfo.enemy_buff && (sinfo.stype == 1 || sinfo.stype == 4 || (sinfo.stype == 3 && (sinfo.target == 1 || sinfo.target == 3))) && this.nowTeam != tarr[i].nowTeam) {
                        for (let j = 0; j < sinfo.enemy_buff.length; ++j) {
                            if (tarr[i].getBuffNumByType("mmiss") > 1) break;
                            if (this.bTools.getRandom() > sinfo.enemy_buff[j].prob) continue;
                            tarr[i].pushOneBuff(sinfo.enemy_buff[j].id, sinfo.enemy_buff[j].ttime, addinfo, this);
                        }
                    }
                    if (sinfo.friend_buff && (sinfo.stype == 2 || sinfo.stype == 4 || (sinfo.stype == 3 && (sinfo.target == 2 || sinfo.target == 3))) && this.nowTeam == tarr[i].nowTeam) {
                        for (let j = 0; j < sinfo.friend_buff.length; ++j) {
                            if (this.bTools.getRandom() > sinfo.friend_buff[j].prob) continue;
                            tarr[i].pushOneBuff(sinfo.friend_buff[j].id, sinfo.friend_buff[j].ttime, addinfo, this);
                        }
                    }
                }
                break;
            case 3:
                reff = hitconfig.area.split("x");
                reff = this._getATKArr(reff)

                tarr = target.getTargetByType(3, reff[0], reff[0], 2);
                for (let i = 0; i < tarr.length; ++i) {
                    if (tarr[i].isDead()) continue;
                    if ((sinfo.stype == 1 || sinfo.stype == 4) && this.nowTeam != tarr[i].nowTeam) tarr[i].getCalHurm(this, hurminfo, "skill", 0, { skillid: skillid });
                    else if ((sinfo.stype == 2 || sinfo.stype == 4) && this.nowTeam == tarr[i].nowTeam) tarr[i].getCalHeal(this, this.getHealInfo(hurminfo.attval, skillid), "skill");

                    if (sinfo.enemy_buff && (sinfo.stype == 1 || sinfo.stype == 4 || (sinfo.stype == 3 && (sinfo.target == 1 || sinfo.target == 3))) && this.nowTeam != tarr[i].nowTeam) {
                        for (let j = 0; j < sinfo.enemy_buff.length; ++j) {
                            if (tarr[i].getBuffNumByType("mmiss") > 1) break;
                            if (this.bTools.getRandom() > sinfo.enemy_buff[j].prob) continue;
                            tarr[i].pushOneBuff(sinfo.enemy_buff[j].id, sinfo.enemy_buff[j].ttime, addinfo, this);
                        }
                    }
                    if (sinfo.friend_buff && (sinfo.stype == 2 || sinfo.stype == 4 || (sinfo.stype == 3 && (sinfo.target == 2 || sinfo.target == 3))) && this.nowTeam == tarr[i].nowTeam) {
                        for (let j = 0; j < sinfo.friend_buff.length; ++j) {
                            if (this.bTools.getRandom() > sinfo.friend_buff[j].prob) continue;
                            tarr[i].pushOneBuff(sinfo.friend_buff[j].id, sinfo.friend_buff[j].ttime, addinfo, this);
                        }
                    }
                }
                break;
            case 4: // 溅射

                break;
        }
    }

    getLuckStateNum(pnum) {
        let luck = 0;
        if (this.getBuffNumByType("luck") > 1) luck += 1;
        if (this.getBuffNumByType("unluck") > 1) luck -= 1;
        if (luck > 0) pnum = 1 - (1 - pnum) * (1 - pnum);
        else if (luck < 0) pnum = pnum * pnum;

        return pnum;
    }


    // 包装一个 伤害信息   obj 包含特殊的属性附加  如何伤害加深率
    getHurmInfo(attval, hurmtype, objExtra) {
        let hurminfo = {};
        hurminfo.hurmtype = hurmtype;
        hurminfo.attval = attval;
        hurminfo.extra = this.getNowAttri("pratk");
        hurminfo.pcr = this.getLuckStateNum(this.getNowAttri("pcri"));
        hurminfo.vcr = this.getNowAttri("pcrid");
        hurminfo.ppthr = this.getNowAttri("ppthr") || 0;
        hurminfo.pmthr = this.getNowAttri("pmthr") || 0;
        hurminfo.apower = this.getNowAttri("apower") || 0;
        hurminfo.tinc = 0;
        if (hurmtype == 1) hurminfo.tinc = this.getNowAttri("ppdam");
        else if (hurmtype == 2) hurminfo.tinc = this.getNowAttri("pmdam");
        hurminfo.inc = this.getNowAttri("pdam") + ((objExtra && objExtra.inc) || 0);
        return hurminfo;
    }

    getOccuPdam(occu) {
        var oarr = ["pxfatk", "pckatk", "pssatk", "pjsatk", "pmsatk"];
        return this.getNowAttri(oarr[occu - 1]);
    }

    getOccuPdrc(occu) {
        let oarr = ["zsprdc", "ckprdc", "ssprdc", "jsprdc", "msprdc", "hwprdc"];
        return this.getNowAttri(oarr[occu - 1]);
    }

    // camp - 被攻击者势力 scamp - 攻击者势力
    getCampRestrain(camp, scamp) {
        if (!camp || !scamp) return 0;
        if (CAMPRESTRAIN[scamp] == camp) return this._campRestrainVal;
        return 0
    }

    // 得到伤害 
    getCalHurm(source, hurminfo, ptype, nocrit, extrainfo) {
        hurminfo = gUtils.deepClone(hurminfo);
        if (this.getBuffNumByType("hundun") > 1 && this.getBuffNumByType("fangzhu") > 1) return { hurm: 0, hurmtype: hurminfo.hurmtype, crit: 0 };  // 混沌状态免疫伤害
        if (this.isDead()) return { hurm: 0, hurmtype: hurminfo.hurmtype, crit: 0 };
        if (!hurminfo) return { hurm: 0, hurmtype: hurminfo.hurmtype, crit: 0 };
        let hurmtype = hurminfo.hurmtype;                  // 如有特殊单位   可重写该伤害类型  1-物理 2-法术 3-真实
        let level = this._level;
        if (source) level = Math.max(source._level, this._level);
        let attval = hurminfo.attval;
        if (hurmtype == 2 && this.getBuffNumByType("mmiss") > 1) return { hurm: 0, hurmtype: hurminfo.hurmtype, crit: 0, miss: 1 };    // 魔免不受法术伤害
        if (source) {
            hurminfo.inc += source.getOccuPdam(this._occu);
            if (this._occu2) hurminfo.inc += source.getOccuPdam(this._occu2);
        }
        if (source) hurminfo.inc += this.getCampRestrain(this._camp, source._camp);   //(Number(this._camp) % 4 + 1) == Number(source._camp) ? 0.15 : 0;
        hurminfo.trdc = 0;
        if (hurmtype == 1) hurminfo.trdc = this.getNowAttri("pprdc");
        else if (hurmtype == 2) hurminfo.trdc = this.getNowAttri("pmrdc");
        hurminfo.rdc = this.getNowAttri("prdc");
        hurminfo.rdc += this.getOccuPdrc(this._occu);
        hurminfo.rdc += this.getOccuPdrc(this._occu2);
        if (ptype === "skill") {
            hurminfo.rdc += this.getNowAttri("pskirdc");
        } else if (ptype === "normal") {
            hurminfo.rdc += this.getNowAttri("patkrdc");
        }
        hurminfo.dpower = this.getNowAttri("dpower");
        let cancrit = ptype == "rehurm" ? 1 : 2;
        cancrit = !!nocrit ? 1 : 2;
        let hurmval;
        // 做伤害前的检测 如闪避 如技能被动增加的验证
        hurminfo.pcr = Math.max(hurminfo.pcr - this.getNowAttri("dpcri"), 0);               // 抗暴击
        this.BackByHurmInfo(hurminfo);        // 被动对数值的影响
        if (source) source.BackByCalHurm(hurminfo, ptype, this);

        hurminfo.defval = hurmtype == 1 ? this.getNowAttri("def") * (!!source ? 1 - (hurminfo.ppthr || 0) : 1) : this.getNowAttri("mdef") * (!!source ? 1 - (hurminfo.pmthr || 0) : 1);

        let accu = !!source ? source.getNowAttri("accu") : 0;
        let miss = 0;
        let misstype = 0;    // 哪种闪避
        switch (ptype) {
            case "normal":
                if (this.bTools.getRandom() < this.getLuckStateNum(this.getNowAttri("pdex") - accu)) {
                    this.normMiss.push(1);
                    miss = 1;
                    misstype = 1;
                }
                if (!source) break;
                if (this.bTools.getRandom() < source.getBuffNumByType("amiss") - 1) {
                    this.normMiss.push(1);
                    miss = 1;
                    misstype = 1;
                }
                break;
            case "skill":
                if (this.bTools.getRandom() < this.getLuckStateNum(this.getNowAttri("pmdex") - accu)) {
                    this.skillMiss.push(1);
                    miss = 1;
                    misstype = 2;
                }
                break;
            case "rehurm":   // 反弹伤害无法暴击
                cancrit = 1;
                break;
        }
        if (hurminfo.attextra && hurminfo.attextra == "rehurm") cancrit = 1;
        if (miss) {
            this.BackByMiss(source, misstype);
            return { hurm: 0, hurmtype: hurminfo.hurmtype, crit: 0 };
        }

        if (hurminfo.skillid && source && source.BackSkillHurt) source.BackSkillHurt(hurminfo.skillid, this);

        if (hurmtype == 3) {
            hurmval = { hurm: attval * (1 + hurminfo.inc) * (1 - hurminfo.rdc), hurmtype: 3, crit: 0, ptype: ptype };
            if (hurminfo.skillid) hurmval.skillid = hurminfo.skillid;
            if (hurminfo.sourcetype) hurmval.sourcetype = hurminfo.sourcetype;
            if (extrainfo) hurmval.attextra = extrainfo;
            this.doLogicHurt(hurmval, source);
            return hurmval;
        }
        if (this.getBuffNumByType("diyun") > 1) hurminfo.pcr = 0;
        if (source && source.getBuffNumByType("diyun") > 1) hurminfo.pcr = 0;
        hurminfo.apower = hurminfo.apower || 0;
        hurmval = this.bTools.getHurm(level, hurminfo.attval, hurminfo.defval, hurminfo.extra, hurminfo.pcr, hurminfo.vcr, hurminfo.tinc, hurminfo.inc, hurminfo.trdc, hurminfo.rdc, hurminfo.apower, hurminfo.dpower, cancrit);
        hurmval.ptype = ptype;
        hurmval.hurmtype = hurmtype;
        switch (ptype) {
            case "normal":
                if (!source) break;
                hurmval.hurm *= (1 + source.getNowAttri("patkdam")); break;
            case "skill":
                if (!source) break;
                hurmval.hurm *= (1 + source.getNowAttri("pskidam")); break;
        }
        if (hurminfo.skillid) hurmval.skillid = hurminfo.skillid;
        if (hurminfo.sourcetype) hurmval.sourcetype = hurminfo.sourcetype;
        if (extrainfo) hurmval.attextra = extrainfo;
        this.doLogicHurt(hurmval, source);

        if (bConfig.IsShowDebug()) {
            bConfig.AddRecordLog(this.getDebugString() + " getCalHurm:" + JSON.stringify(hurmval))
        }
        return hurmval;
    }

    getDamageAdd(target, hurmtype) {
        let inc = this.getNowAttri("pdam");
        let tinc = 0;
        let rdc = target.getNowAttri("prdc");
        let trdc = 0;
        if (hurmtype == 1) {
            tinc = this.getNowAttri("ppdam");
            trdc = target.getNowAttri("pprdc");
        }
        if (hurmtype == 2) {
            tinc = this.getNowAttri("pmdam");
            trdc = target.getNowAttri("pmrdc");
        }
        return Math.max(0, 1 + inc + tinc - rdc - trdc)
    }

    getPrdcAdd(hurmtype) {
        let rdc = this.getNowAttri("prdc");
        let trdc = 0;
        if (hurmtype == 1) {
            trdc = this.getNowAttri("pprdc");
        }
        if (hurmtype == 2) {
            trdc = this.getNowAttri("pmrdc");
        }
        return Math.max(0, 1 - rdc - trdc);
    }

    doPrdcLogicHurt(hurminfo, source, bnomp) {
        if (hurminfo.hurmtype == 2 && this.getBuffNumByType("mmiss") > 1) return;
        hurminfo.hurm = hurminfo.hurm * this.getPrdcAdd(hurminfo.hurmtype);
        this.doLogicHurt(hurminfo, source, bnomp);
    }

    getHealInfo(hval, skillid) {
        let heal = {};
        heal.val = this.bTools.intergeNum(hval);
        if (skillid) heal.skillid = skillid;
        return heal;
    }

    getCalHeal(source, heal, ptype, sourcetype) {
        if (this.getBuffNumByType("hundun") > 1) return;   // 混沌状态免疫治疗
        heal.ptype = ptype;
        if (sourcetype) heal.sourcetype = sourcetype;
        return this.doLogicHeal(heal, source);
    }

    // 特殊状态下 是否不受到伤害
    checkNoHurm(hurminfo, source) {
        if (!hurminfo) return true;
        if (hurminfo.hurmtype == 2 && this.getBuffNumByType("miss") > 1) return true;
        if (this.getBuffNumByType("hundun") > 1) return true;
        return false;
    }

    //计算光环羁绊103伤害
    calculateHaloHurm(source, hurt) {
        if (source && source.halo == 103) {
            let list = source.haloConfig.SKILLBUFFLIST;
            let bfarr = [];
            this.buff.forEach((item) => { bfarr.push(item._bid) });
            for (let i = 0; i < list.length; i++) {
                let fIdx = bfarr.indexOf(list[i]);
                if (fIdx > -1) {
                    hurt += hurt * (source.haloConfig.PARAMS[0] / 100)
                }
            }
        }
        return hurt;
    }

    /******* 伤害 结算  *******/ // hurminfo: hurm, hurmtype, pcrit 
    doLogicHurt(hurminfo, source, bnomp) {                 // bnomp 伤害 不让对方回蓝
        if (this.isDead() || this.isInvicible() || this.getBuffNumByType("fangzhu") > 1) return;   // 如果无敌不执行掉血
        if (this.checkNoHurm(hurminfo, source)) return;
        // if(hurminfo.hurmtype == 2 && this.getBuffNumByType("mmiss") > 1) return;
        // if(!hurminfo) return;
        let hurms = hurminfo.hurm;
        if (source && source.master) {
            hurms *= source.separahurm / 100;
            hurminfo.hurm = hurms;
        }

        if (!bnomp && source && source.BackInfluenceHurm && !hurminfo.is10006 && !hurminfo.is42421) {
            let result = source.BackInfluenceHurm(hurminfo, this);
            hurms = result.hurm;
            hurminfo.hurm = hurms;
            hurminfo.crit = result.crit;
        }


        if (hurminfo.ptype == "skill" && hurminfo.skillid && !!source) {
            let sinfo = source.getSkillInfo(source.skillArr.indexOf(hurminfo.skillid));  // GetConfig("dbEffInfo")[hurminfo.skillid];
            if (!!sinfo) {
                for (let i = 0; i < sinfo.add_arr.length; ++i) {
                    let addone = sinfo.add_arr[i];
                    switch (addone.rely) {
                        case 8:
                            hurms += hurms * (this.maxmagic - this.nowmagic) / this.maxmagic;
                            break;
                    }
                }
            }
        }

        // hurms = this.BackLastHurmOp(hurms, source, hurminfo.ptype, hurminfo.hurmtype, hurminfo.crit, hurminfo.vcr);
        hurms = this.BackLastHurmOp(hurms, hurminfo, source);

        if (hurms == 0) return;

        if (this.getBuffNumByType("nohurm") > 1) {
            hurms = 0;   // 如果免伤buff在(只免疫伤害，不免疫任何效果)
        }

        // 分担伤害
        if (hurms > 0 && !hurminfo.isShare && this.getBuffNumByType("fendan") > 1) {
            let flevel = 0;   // 级别
            let strEmit;
            for (let value of this._fendanMap.values()) {  // 根据级别优先级 只分担一
                let nowLv = Number(value[value.length - 1]);
                if (nowLv > flevel) {
                    flevel = nowLv;
                    strEmit = value;
                }
            }
            if (strEmit) {
                let alive = getGlobalEventLength(strEmit);
                hurminfo.isShare = true;
                if (alive > 0) {
                    let tmphurm = 0;
                    let fendanNum = this.getBuffNumByType(strEmit);
                    if (fendanNum > 1.01) {
                        if (hurminfo.attextra && hurminfo.attextra.htype == "rehurm") return;
                        tmphurm = this.bTools.intergeNum(hurms * (fendanNum - 1));
                    } else {
                        tmphurm = this.bTools.intergeNum(hurms / alive);
                    }
                    hurms = tmphurm;    // 该角色收到此伤害
                    let tmpinfo = gUtils.deepClone(hurminfo);
                    tmpinfo.hurm = tmphurm;
                    tmpinfo.isShare = true;
                    tmpinfo.attextra = { htype: "fendan" };
                    tmpinfo.crit = 0;
                    // 群发事件 带上id 和team 防止重复受伤
                    emitGlobalEvent(strEmit, tmpinfo, source, this._id, this.initTeam);
                }
            }
        }

        hurms = this.calculateHaloHurm(source, hurms);

        if (this.getBuffNumByType("hexhp") > 1) {
            this.getCalHeal(this, this.getHealInfo(hurms * (this.getBuffNumByType("hexhp") - 1)), "skill");
            hurms = 0;
        }
        // 记录输出  只统计对 非召唤/分身 单位的伤害
        hurms = hurms || 0;
        if (source && !this.master) {
            if (!source.master && !source.main) source.hurmVal += hurms;
            else if (source.master) source.master.hurmVal += hurms;
            else if (source.main) source.main.hurmVal += hurms;
        }
        //前端特有
        if (this.bDoUIThings) {
            eventMgr.emit(eventStr.hurtOutPanel.updateItemInfo, source);
        }
        // if(source.gsid || source.master) source.hurmVal += hurminfo.hurm;
        hurms = this.bTools.intergeNum(hurms);
        hurms = Math.abs(this.changeNowHp(-hurms, hurminfo.hurmtype));
        hurminfo.hurm = hurms;
        this.defVal += (hurms || 0);

        if (this.getBuffNumByType("hurmheal") > 1) {
            this.getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * (this.getBuffNumByType("hurmheal") - 1)), "skill");
        }

        if (source && source.BackHurmProfit) source.BackHurmProfit(hurms, hurminfo.ptype, hurminfo.hurmtype);

        if (!(hurminfo.attextra && hurminfo.attextra.htype == "rehurm")) {
            // 反弹伤害不吸血
            switch (hurminfo.ptype) {
                case "skill":
                    if (!source) break;
                    source.getCalHeal(source, source.getHealInfo(hurms * source.getNowAttri("pmbs")), "skill", "xixue");
                    break;
                case "normal":
                    if (!source) break;
                    source.getCalHeal(source, source.getHealInfo(hurms * source.getNowAttri("ppbs")), "normal", "xixue");
                    break;
            }
        }

        if (hurminfo.sourcetype != "buff" && this.bTools.intergeNum(hurms) != 0) {
            let numinfo = { hurm: this.bTools.intergeNum(hurms), type: "normal", source: hurminfo.ptype };
            if (hurminfo.attextra) {
                numinfo.source = "extra";
                if (hurminfo.attextra.htype == "extra") numinfo.type = "extra";
            }
            switch (hurminfo.hurmtype) {
                case 1:
                    if (!hurminfo.crit) this.normNum.unshift(numinfo);
                    else this.normCrit.unshift(numinfo);
                    break;
                case 2:
                    if (!hurminfo.crit) this.skillNum.unshift(numinfo);
                    else this.skillCrit.unshift(numinfo);
                    break;
                case 3:
                    this.realNum.unshift(this.bTools.intergeNum(hurms));
                    break;
                default:
                    if (!hurminfo.crit) this.normNum.unshift(numinfo);
                    else this.normCrit.unshift(numinfo);
                    break;
            }
        }

        if (hurminfo.ptype == "skill" || hurminfo.ptype == "normal") {
            if (source && (source.nowmagic || source.nowmagic == 0)) {
                if (hurminfo.ptype == "normal") {
                    if (!bnomp) source.addMagic(this.bTools.getRandomInt(8, 12));
                } else {
                    if (hurminfo.skillid) {
                        let sattinfo = GetConfig("dbEffInfo")[hurminfo.skillid];
                        if (!sattinfo || sattinfo.ecost) {
                            if (!bnomp) source.addMagic(this.bTools.getRandomInt(8, 12));
                        }
                    }
                }
            }
            this.addMagic(this.bTools.getRandomInt(3, 5));
        }

        if (hurminfo.skillid && !!source) {
            let sconfig = source.getSkillInfo(source.skillArr.indexOf(hurminfo.skillid));
            if (sconfig && sconfig.smodel) {
                switch (sconfig.smodel) {
                    // case 17161:  // 扣除蓝量
                    case 46296:
                    case 17101:
                    case 40321:
                        if (sconfig.special) this.addMagic(-sconfig.special[0]);
                        break;
                }
            }
        }

        // this.battleInfo.hp = Math.max(0, this.battleInfo.hp);
        // console.log("受到伤害了", hurminfo.hurm, this.nowTeam, this.gsid);
        if (this.battleInfo.hp <= 0) {
            // console.log("死了", this.steps);
            this.updateOneStepBuff();
            this.BackBySelfDie(source);
            if (this.battleInfo.hp > 0) return;
            if (source && source.BackByKill) source.BackByKill(hurminfo, this);
            // 广播给所有人 有单位死了
            this.battleS.getOptByUnit("onedie", this);
            this.setAction("dead");
            this.battleS.bFieldArr[this.fieldX][this.fieldY].nowUnit = null;//ok

            if (hurminfo.skillid && !!source) {
                let sconfig = source.getSkillInfo(source.skillArr.indexOf(hurminfo.skillid));
                if (sconfig && sconfig.smodel) {
                    switch (sconfig.smodel) {
                        case 40381:  // 获得目标10%的是攻击力
                            if (sconfig.special) {
                                source.addMagic(sconfig.special[0]);
                                source.skillCdArr[0] = 999;
                                source.battleInfo.atk += this.battleInfo.atk * sconfig.special[1] / 100;
                            }
                            break;
                    }
                }
            }
        }
        // if(!)  todo 如果释放单位  如主公技造成的伤害
    }

    /**
     * @intro 直接让某个单位死亡
     * @param {*} target 目标
     */
    toLetOneDead(target, skillid) {
        if (target.isInvicible() || target._obj.hpcover) return;
        this.hurmVal += (this.battleInfo.hp || 0);
        target.battleInfo.hp = 0;
        target.updateOneStepBuff();
        target.BackBySelfDie(this);
        target.battleInfo.hp = 0;           //  某些被动可能导致活过来   但是这里仍然要死   所以再置0。
        let hurminfo = {};
        if (skillid) {
            hurminfo.skillid = skillid;
        }
        this.BackByKill(hurminfo);
        // 广播给所有人 有单位死了
        target.battleS.getOptByUnit("onedie", this);
        target.setAction("dead");
        target.battleS.bFieldArr[target.fieldX][target.fieldY].nowUnit = null;//ok
    }

    /*
    * @param : target - 谁死了
    */
    getPeopleDie(target) {
        // 触发某单位死后的效果
        if (this.isDead()) return;  // 死后无需触发他人死亡效果
        if (this.initTeam == target.initTeam) {
            // 队友死了 
            this.BackByTmateDie(target);
        } else if (this.initTeam != target.initTeam) {
            // 敌人死了 
            this.BackByEnemyDie(target);       // 检测敌人死后 自己会如何
            target.BackByDie(this);      // 计策敌人死后 会对自己如何
        }
    }

    /* 治疗结算 */
    doLogicHeal(healinfo, source) {
        if (this.isDead()) return;
        if (!healinfo) return;
        if (healinfo.skillid && !!source) {
            let sinfo = source.getSkillInfo(source.skillArr.indexOf(healinfo.skillid));  // GetConfig("dbEffInfo")[hurminfo.skillid];
            if (!!sinfo) {
                for (let i = 0; i < sinfo.add_arr.length; ++i) {
                    let addone = sinfo.add_arr[i];
                    switch (addone.rely) {
                        case 10:
                            healinfo.val += this.initInfo.hp * addone.num / 100;
                            break;
                    }
                }
                if (sinfo && sinfo.smodel) {
                    switch (sinfo.smodel) {
                        case 17016:  // 增加蓝量
                            if (!sinfo.special) break;
                            this.addMagic(sinfo.special[0]);
                            break;
                    }
                }
            }
        }
        if (!healinfo.val) return;
        if (this.getBuffNumByType("noheal") > 1) return;
        healinfo.val *= this.getNowHealeff() + (!!source ? source.getNowAttri("pheal") : 0);
        healinfo.val = this.bTools.intergeNum(healinfo.val);
        if (source && source.BackByHeal) source.BackByHeal(this, healinfo);
        healinfo.val = this.BackByHealVal(healinfo.val);
        let losthp = this.getLostHp();
        healinfo.val = this.changeNowHp(healinfo.val);
        if (this.getBuffNumByType("xuezhou") > 1) {
            for (let k in this._sxuezhou) {
                if (this._sxuezhou[k].getBuffNumByType("xuezhou") > 1) continue;
                this._sxuezhou[k].getCalHeal(this._sxuezhou[k], this.getHealInfo(healinfo.val * (this.getBuffNumByType("xuezhou") - 1)), "skill");
            }
        }
        if (this._obj.hpcover) return;
        if (source && !this.master) {
            if (!source.master) source.healVal += healinfo.val;
            else source.master.healVal += healinfo.val;
        }
        if (healinfo.sourcetype != "buff") {
            let hnum = this.bTools.intergeNum(Math.min(healinfo.val, losthp));
            if (hnum != 0) {
                this.healNum.push(hnum);
            }
        }
        return healinfo.val;
    }

    // 当前血量的数值变化
    changeNowHp(num, type) {
        if (!num) return 0;
        if (!this.battleInfo.hp) {
            console.log("当前血量错误", this.battleInfo.hp);
        }
        if (!this.initInfo.hp) {
            console.log("上限血量错误");
        }

        if (num < 0 && (this.isInvicible() || this.getBuffNumByType("hundun") > 1)) return 0;
        let changehp = 0;
        // 额外血量抵挡伤害
        if (this.getExtraHp() && num < 0) {
            changehp = num;
            num = -this.lostBuffExtrahp(Math.abs(num), type);
            changehp = num - changehp;
            // let tmphp = this._extraHp;
            // this._extraHp -= Math.abs(num);
            // num = num + tmphp;
            // num = num > 0 ? 0 : num;
            // this._extraHp = Math.max(this._extraHp, 0);
        }
        if (num > 0 && this._obj.hpcover) return num;            //禁止回血
        num = this.bTools.intergeNum(num);
        let starthp = this.battleInfo.hp;
        // 当血量高于 maxhp 时  无法降到比 maxhp低   当血量低于maxhp时  无法再降低
        let maxhp = this.initInfo.hp * ((this.getBuffNumByType("lockhp") - 1));
        if (this.battleInfo.hp > maxhp) {
            this.battleInfo.hp += num;
            this.battleInfo.hp = Math.max(maxhp, this.battleInfo.hp);
        } else {
            if (num > 0) this.battleInfo.hp += num;
        }

        this.battleInfo.hp = Math.min(this.battleInfo.hp, this.initInfo.hp);
        changehp += this.battleInfo.hp - starthp;
        if (this.battleInfo.hp <= 0) {
            if (this.getBuffNumByType("nodead") > 1) {
                this.battleInfo.hp = 1;
            }
        }
        if (num < 0) {
            this.battleS.getOptByUnit("dohurt", this);
        }
        this.BackByHpExchange(false, changehp);
        return this.bTools.intergeNum(changehp);
    }

    doLogicCalcuTime(dt) {
        //暂停时间是要继续走的
        this.realtime += dt;
        //依照时间去控制黑屏时间 而不是扣除怒气
        if (this.isdobigskill) {
            if (this.realtime > this.bigskillshowtime) {
                this.isdobigskill = false
            }
        }
    }

    /****** 每计算逻辑 *******/
    doLogicCalcu() {
        this.skillstart = false;
        try {
            if (this.isDead()) {
                return;
            }
            this.updateOneStepBuff();
            this.doLogicOthers();
            this.resetAttTarget();
            this.updateState();
            this.doLogicStepDeal();
            this.steps++;
        } catch (e) {
            console.error("发生错误", e, this.buff10002);
            this.steps++;
        }
    }

    // 每帧重新运算后需要重置的数据
    doResetData() {
        if (this._blink > 0) this._blink--;           // 此状态最多保留3帧

        for (let k in this.auraRatio) {
            this.auraRatio[k] = 0;
        }

        for (let k in this.deAuraRatio) {
            this.deAuraRatio[k] = 0;
        }
    }

    doResetClientShow() {
        this.skillHitArr = [];     // 客户端用
        this.normNum = [];         // 客户端用
        this.normCrit = [];        // 客户端用
        this.skillNum = [];        // 客户端用
        this.realNum = [];         // 客户端用
        this.skillCrit = [];       // 客户端用
        this.normMiss = [];        // 客户端用
        this.skillMiss = [];       // 客户端用
        this.healNum = [];         // 客户端用
    }

    resetAttTarget() {
        if (!this.attTarget) return;
        if (this.attTarget.isDead() || this.attTarget.isInvicible() || this.attTarget.getBuffNumByType("fangzhu") > 1 || this.getBuffNumByType("meihuo") > 1) {
            this.attNext = 0;
            this.attTarget = null;
            return;
        }
        let ratt = this.getAttArea_Scale();
        let xatt = ratt.x;
        let yatt = ratt.y;

        let xdis = Math.abs(this.x - this.attTarget.x);
        let ydis = Math.abs(this.y - this.attTarget.y);

        if (this.config.attrange == 1 && xdis <= xatt && ydis <= yatt) return;

        if (this.config.attrange == 2 && xdis * xdis / (xatt * xatt) + ydis * ydis / (yatt * yatt) <= 1) return;
        this.attTarget = null;
    }
    GetUpdateSateFunc(updateSkill) {
        if (this.m_stateFunc == null) {
            this.m_stateFunc = {
                "OneStepBuff": this.updateOneStepBuff.bind(this),
                "BuffAura": this.updateBuffAura.bind(this),
                "DebuffAura": this.updateDebuffAura.bind(this),
                "State": this.updateState.bind(this),
            }
        }

        return this.m_stateFunc[updateSkill]
    }

    updateState() {
        if (this.attNext > 0) {
            this.attNext -= 1;
            this.actiondt += 1;
        } else if (this.attNext <= 0) {
            if (this.attInterval > 0) {
                this.attInterval -= 1;
            }
            this.setAction("stand");
        }

        if (this.getBuffNumByType("fangzhu") > 1) {  // 如果被放逐不做任何行为
            return;
        }

        if (this.blinkFps) { // 如果正在跳跃 则 不做任何行为
            this.blinkFps -= 1;
            if (this.blinkFps == 0) this.toGround();
            return;
        }

        if (this.updateSkill) {
            let func = this.GetUpdateSateFunc(this.updateSkill)
            if (func) {
                func();
            }
            return;
        }

        if (this.getBuffNumByType("stun") > 1 || this.getBuffNumByType("meihuo") > 1) return;

        if (this.getBuffNumByType("fear") > 1) {     // 恐惧了
            if (this.nextGrid) this.doMove();
            else this.findNextGrid();
            return;
        }

        if (!this.nextGrid) {
            this.doNoNextGrid();
        } else {
            this.findNextGrid();
        }
    }

    /******* 推入每一步做逻辑处理时需要做的操作 ********
     *  params:
     *      psteps : 操作触发的步数
     *      pinstruction : 操作名称
     *      pinfo  : 附带的相关信息  没有则不传
     *********************************************/
    pushLogicStepsDeal(psteps, pinstruction, pinfo) {
        // if(!this.stepDoActions[psteps]) this.stepDoActions[psteps] = [];
        let tmparr = this.stepDoActions.get(psteps);
        if (!tmparr) tmparr = [];
        tmparr.push({ instruction: pinstruction, info: pinfo });
        this.stepDoActions.set(psteps, tmparr);


        // this.stepDoActions[psteps].push({instruction: pinstruction,info: pinfo});
    }

    // 做未来要做的逻辑指令 比如普攻 第几帧出伤害
    doLogicStepDeal() {
        if (this.stepDoActions.has(this.steps)) {
            let actions = this.stepDoActions.get(this.steps);
            for (let i = 0; i < actions.length; ++i) {
                if ((this.getBuffNumByType("stun") > 1 || this.getBuffNumByType("bianshen") > 1 || this.getBuffNumByType("meihuo") > 1 || this.getBuffNumByType("fear") > 1) && actions[i].instruction != "selfhurm") continue;
                switch (actions[i].instruction) {
                    case "nearatt":
                        if (this.attTarget) this.doNearAttHurm();
                        break;
                    case "faratt":
                        if (this.attTarget) this.doFarAtt();
                        break;
                    case "skillhurm":
                        if (this.silentflag) break;
                        //
                        this.doSkillOutcome(actions[i].info.target, actions[i].info.effinfo);
                        break;
                    case "skilleff":
                        if (this.getBuffNumByType("silent") > 1) {
                            break;
                        }
                        if (!this.skilltarget) break;        // 目标丢失了
                        //
                        this.doSkillEff(actions[i].info);
                        break;
                    case "selfhurm":
                        this.doEffHit(actions[i].info.target, actions[i].info.effinfo, actions[i].info.hit);
                        break;
                    case "skillohter":
                        if (this.silentflag) break;
                        // 
                        break;
                }
            }
            // delete this.stepDoActions[this.steps];
            this.stepDoActions.delete(this.steps);
        }
    }

    doLogicOthers() {
        if (this.Invisible) this.Invisible -= 1;
        if (this.getBuffNumByType("fangzhu") > 1) return;
        for (let i = 0; i < this.skillArr.length; ++i) {
            this.skillCdArr[i] += bConfig.turnTime;
        }
        if (this.cikeCd) this.cikeCd -= 1;
        for (let k in this.backCd) {
            this.backCd[k] += 1;
        }
        this.BackByTime();
    }

    clearStepAction() {
        // for(let k in this.stepDoActions) {
        //     delete this.stepDoActions[k];
        // }
        this.stepDoActions.clear();
    }

    //获取光环眩晕技能加成时间(秒)
    getHalo102SkillstunTimeBySkillId(halocfgSkillList, skillid) {
        for (let i = 0; i < halocfgSkillList.length; i++) {
            let item = halocfgSkillList[i];
            if (skillid >= item[0] && skillid <= item[0] + 4) {
                return item[1];
            }
        }
        return 0;
    }

    // 推入一个buff bforce 强制推入
    pushOneBuff(bid, ttime, addinfo, target, bforce) {
        if (ttime <= 0) return;
        if (!GetConfig("dbBuffInfo")[bid]) return;
        if (this.steps > 0 && this.isInvicible() && bid != "wudi" && !bforce) return;
        if (!this.buff) this.buff = [];
        let binfo = GetConfig("dbBuffInfo")[bid];
        if (this.buff10076 && binfo.btype == 2) {
            this.buff10076._ttime = 0;
            this.buff10076 = null;
            return;
        }
        //光环羁绊加持
        if (target && target.halo == 102) {
            let list = target.haloConfig.SKILLBUFFLIST;
            let haloSkillTimeList = target.haloConfig.SKILLTIMELIST;
            let idx = target._skills.indexOf(target._skillid);//必须是必杀技
            if (idx == 0) {//大招生效
                let bool = false;
                for (let i = 0; i < list.length; i++) {
                    if (list[i].indexOf(bid) > -1) {
                        bool = true;
                        break
                    }
                }
                if (!bool) {
                    let bfarr = [];
                    this.buff.forEach((item) => { bfarr.push(item._bid) });
                    for (let i = 0; i < list.length; i++) {
                        let fIdx = bfarr.indexOf(list[i]);
                        if (fIdx > -1 && bfarr.indexOf(bid) > -1) {
                            let addTime = this.getHalo102SkillstunTimeBySkillId(haloSkillTimeList, target._skillid)
                            //概率激活
                            let rp = target.haloConfig.PARAMS[0];
                            let gv = this.bTools.getRandom() * 100;
                            if (gv <= rp && this.guid != target.guid) {
                                this.buff[fIdx]._ttime += 60 * addTime;//眩晕加2秒
                            }
                        }
                    }
                }
            }
        }

        if (bConfig.IsShowDebug()) {
            bConfig.AddRecordLog(this.getDebugString() + " pushOneBuff:" + bid + " ttime:" + ttime)
        }
        let obj = { bid: bid, ttime: ttime, id: this.buffId, add: addinfo, src: target }
        this.buffId++;
        try {
            if (binfo.logic) {
                var buffc = this.GetBuffClass(binfo.logic.toString())
                // if(buffc != null){//此处不要判断 保持跟服务器一致
                let buff = new buffc(obj, this);
                this.pushBuffIntoArr(buff);
                buff.refreshData();
                // }
            } else {
                let buff = new Buff(obj, this);
                this.pushBuffIntoArr(buff);
                buff.refreshData();
            }
        } catch (e) {
            let buff = new Buff(obj, this);
            this.pushBuffIntoArr(buff);
            buff.refreshData();
        }
    }

    GetBuffClass(bufflogic) {
        if (this.m_buff_cls == null) {
            this.m_buff_cls = {
                "hatkinv": Buffhatkinv,
                "hatkpinv": Buffhatkpinv,
                "hhpinv": Buffhhpinv,
                "hatkmpinv": Buffhatkmpinv,
                "hatkhpinv": Buffhatkhpinv,
                "hsrchpinv": Buffhsrchpinv,
                "hatkaround": Buffhatkaround,
                "mpinv": Buffmpinv,
                "adead": Buffadead,
                "change": Buffchange,
                "hpdun": Buffhpdun,
                "40351": Buff40351,
                "atkdun": Buffatkdun,
                "42171": Buff42171,
                "42321": Buff42321,
                "typeatkdun": Bufftypeatkdun,
                "xiratio": Buffxiratio,
                "xinum": Buffxinum,
                "40376": Buff40376,
                "reclosthp": Buffreclosthp,
                "recatkhp": Buffrecatkhp,
                "recinithp": Buffrecinithp,
                "atkadd": Buffatkadd,
                "deadheal": Buffdeadheal,
                "fendan": Bufffendan,
                "sneer": Buffsneer,
                "overhurm": Buffoverhurm,
                "46161": Buff46161,
                "changenum": Buffchangenum,
                "thurminv": Buffthurminv,
                "470311": Buff470311,
                "46391": Buff46391,
                "xuezhou": Buffxuezhou,
                "18101": Buff18101,
                "18156": Buff18156,
                "zhanshi": Buffzhanshi,
                "atkevery": Buffatkevery,
                "juji": Buffjuji,
                "huoli": Buffhuoli,
                "40471": Buff40471,
                "42421": Buff42421,
                "extradun": Buffextradun,
                "extradunover": Buffextradunover,
            }
        }
        return this.m_buff_cls[bufflogic]
    }

    pushBuffIntoArr(buff) {
        for (let i = 0; i < this.buff.length; ++i) {
            if (this.buff[i]._bid == buff._bid) {
                if (buff._config.bupdate) {
                    if (buff._config.bsource) {
                        if (!buff._config._src || !this.buff[i]._config._src ||
                            !(buff._config._src._id == this.buff[i]._config._src._id
                                && buff._config._src.initTeam == this.buff[i]._config._src.initTeam)
                        ) {
                            return;
                        }
                    }
                    if (!buff._config.level || buff._config.level >= this.buff[i]._config.level) {
                        if (buff._config.bincplies) buff.setPlies(Math.min(this.buff[i].getPlies() + 1, buff._config.bincplies));
                        this.buff[i].doUpdate && this.buff[i].doUpdate();
                        this.buff[i] = buff;
                    }
                }
                return;
            }
        }
        this.buff.push(buff);
    }

    // 随机驱散一个buff  bytpe -- 1 - 增益 2- 减益  level - 驱散级别
    dispelOneBuff(btype, level) {
        let buffnum = [];    // 存放可以驱散的数组下标
        if (this.buff.length <= 0) return;
        for (let i = 0; i < this.buff.length; ++i) {
            if (this.buff[i]._config.btype == btype && this.buff[i]._config.dispel <= level) buffnum.push(i);
        }
        if (buffnum.length <= 0) return;
        let randint = this.bTools.getRandomInt(0, buffnum.length - 1);
        let buffnow = this.buff[buffnum[randint]];
        this.buff.splice(buffnum[randint], 1);
        if (buffnow) buffnow.destroy(true);
    }

    /******  工具  *****/
    getPosition() {
        if (!this._nowpos) {
            this._nowpos = new vecT(this.x, this.y);
        } else {
            this._nowpos.setPos(this.x, this.y);
        }
        return this._nowpos;
    }

    /** 获取当前坐标下的站位而非  寻路时占住格子时的站位*/
    getNowField() {
        if (this._nowJump) return new vecT(this.lastGrid.x, this.lastGrid.y);
        if (!this.nextGrid) return new vecT(this.fieldX, this.fieldY);//=================okstart

        // this.fieldX,this.fieldY 当前占住的格子
        // 计算当前实际的位置(根据脸的朝向 计算是当前占住的格子 和 原本的格子哪个更近)
        let currPosX = bConfig.gridPosArr[this.fieldX][this.fieldY].x;
        let currPosY = bConfig.gridPosArr[this.fieldX][this.fieldY].y;

        let dic = this._getSixDirection(this.fieldX, this.fieldY)
        //实际所在格子
        let startGrid = dic[this.face - 1]
        if (startGrid && bConfig.gridPosArr[startGrid.x] && bConfig.gridPosArr[startGrid.x][startGrid.y]) {
            let fieldnowx = bConfig.gridPosArr[startGrid.x][startGrid.y].x;
            let fieldnowy = bConfig.gridPosArr[startGrid.x][startGrid.y].y;
            if (Math.abs(fieldnowy - this.y) < Math.abs(currPosY - this.y) && Math.abs(fieldnowx - this.x) > Math.abs(currPosX - this.x)) {
                // cc.error("(startGrid.x=",startGrid.x, "startGrid.y=", startGrid.y)
                return new vecT(startGrid.x, startGrid.y)
            }
        }
        return new vecT(this.fieldX, this.fieldY);//=================okend
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * 
     * @param {*} type 被动配置 需要判断cd的被动
     * @param {*} cd 被动冷却
     * @param {*} func 更多的重置判断
     */
    isBackCdOk(type, cd, func) {
        if ((!this.backCd[type] && this.backCd[type] != 0) || this.backCd[type] >= cd * 60) {
            if (func) {
                if (func()) {
                    this.backCd[type] = 0;// 重置cd
                    return true;
                }
            } else {
                this.backCd[type] = 0;
                return true;
            }
        }
        return false;
    }

    /**
     * @intro  多少下触发
     * @param {*} type 被动配置 需要判断cd的被动
     * @param {*} target 目标
     * @param {*} need 需要多少下
     */
    isAtkCountOk(type, target, need) {
        if (!this["count" + type] || (!this["tid" + type] && this["tid" + type] != 0) || this["tid" + type] != target._id || this["team" + type] != target.initTeam) {
            this["count" + type] = 1;
            this["tid" + type] = target._id;
            this["team" + type] = target.initTeam;
            return false;
        }
        this["count" + type] += 1;
        if (this["count" + type] >= need) {
            this["count" + type] = 0;
            return true;
        }
        return false;
    }

    /**
     * @intro  多少下触发
     * @param {*} type 被动配置 需要判断cd的被动
     * @param {*} need 需要多少下
     */
    isStateCountOk(type, need) {
        if (!this.backState[type]) this.backState[type] = 1;
        else this.backState[type]++;
        if (this.backState[type] >= need) {
            this.backState[type] = 0;
            return true;
        }
        return false;
    }

    getHpRatio() {
        return this.battleInfo.hp / this.initInfo.hp;
    }

    /**
     *  获取符合要求的目标数组 all 不判断无敌
     */
    getTargetByType(ptype, xarea, yarea, shape, unself, ball) {  // 1 - 获取敌人数组  2 - 获取友方数组  3 - 获取所有人数组  unself - 除了自己
        let strfilter = DEFAULTFILTER;
        if (ball) strfilter = 0xFFFF;
        return this.getTargetByTypeState(ptype, xarea, yarea, shape, unself, strfilter);
    }

    // 根据类型状态过滤所需要的单位  优化  strfilter 以后没增加一种过滤的类型需要
    /**
     * 
     * @param {*} ptype 
     * @param {*} xarea 
     * @param {*} yarea 
     * @param {*} shape 
     * @param {*} unself 
     * @param {*} strfilter  DEFAULTFILTER 0x8 0x4 0x2 0x1 从右往左  第1位 过滤隐身 第2位是否过滤无敌 3是否过滤放逐
     * @param {*} filterfunc 用来过滤的方式
     * @param {*} team 使用传入的team判断
     */
    getTargetByTypeState(ptype, xarea, yarea, shape, unself, strfilter, filterfunc, team) {
        this._GetJianGe()
        xarea = Number(xarea)
        yarea = Number(yarea)
        if (xarea) {
            xarea = xarea * __AttDisScale.x;
        }
        if (yarea) {
            yarea = yarea * __AttDisScale.y;
        }
        let result = [];
        team = team || this.nowTeam;
        strfilter = strfilter || DEFAULTFILTER;
        if (!this.posMap) return result;
        for (let i = 0; i < this.posMap.length; ++i) {
            let ele = this.posMap[i];
            if (ele.unit.isDead()) continue;
            if (ele.unit.nowTeam != team) {  // 是敌人的时候 需要过滤
                if (ptype === 2) continue;
                if ((strfilter & 0x1) === 0x0 && ele.unit.Invisible) continue;
                if ((strfilter & 0x2) === 0x0 && ele.unit.isInvicible()) continue;
            } else {
                if (ptype === 1) continue;
            }

            if (unself && ele.unit._id === this._id && this.initTeam === ele.unit.initTeam) continue;     // 过滤自己

            if (filterfunc && filterfunc(ele.unit)) continue;

            if ((strfilter & 0x4) === 0x0 && this.battleS.steps != 0 && ele.unit.getBuffNumByType("fangzhu") > 1) continue;

            if (xarea && xarea > 0) {
                if (shape === 1) {
                    if (ele.disx * ele.disx / xarea / xarea + ele.disy * ele.disy / yarea / yarea > 1) continue;
                } else {
                    if (!(ele.disx <= xarea && ele.disy <= yarea)) continue;
                }
            }
            result.push(ele.unit);
        }
        return result;
    }

    getMinHpFriend() {
        let tarr = this.getTargetByType(2, -1);
        if (tarr.length <= 0) return;
        tarr = tarr.sortByType("hp", "inc");
        return tarr[0];
    }

    getSkillIndex(skillid) {  // 得到某个主动技能的index
        if (!skillid) return -1;
        skillid = Number(skillid);
        let index = -1;
        for (let i = 0; i < 5; ++i) {
            index = this.skillArr.indexOf(skillid + i);
            if (index >= 0) break;
        }
        return index;
    }

    BackByAttri() {
        if (!this.m_objSkillBack["A"]) return;
        this.m_objSkillBack["A"].forEach(ele => {
            switch (ele[0]) {
                case "A001":   // 属性
                    if (!this.backAttri[ele[1]]) this.backAttri[ele[1]] = 0;
                    this.backAttri[ele[1]] += ele[2];
                    break;
                case "A002":  // 原A007   开场获得一个buff
                    this.pushOneBuff(ele[1], ele[2] * 60, null, this);
                    break;
                case "A003": // 原A002  推入一个增益光环 
                    this.pushBuffAura(ele[1], { num: ele[2], xdis: ele[3], ydis: ele[3], ttime: ele[4] });
                    break;
                case "A004": { //  减少某个技能的cd x秒
                    let inx = this.getSkillIndex(ele[1]);
                    if (inx >= 0) {
                        this.skillCdArr[inx] += ele[2];
                        this.skillCdReset[inx] = ele[2];
                    }
                } break;
                case "A005": { // 原A006 推入一个减益光环
                    this.pushDebuffAura(ele[1], { num: ele[2], xdis: ele[3], ydis: ele[3], ttime: ele[4] });
                } break;
                case "A006":
                    this.playBlink = true;
                    break;
                case "A007": {   // 初始多少层属性   之后靠其他效果变化
                    this.setStlAttriNum(ATTRIMAP.other, ele[1], ele[2], ele[3] / 100 * ele[4]);
                } break;
                case "A008": {   // 初始增加蓝量 不吃状态判断
                    if (!this.nowmagic) this.nowmagic = 0;
                    this.nowmagic += ele[1];
                    this.nowmagic = this.nowmagic || 0;
                    this.sendMagicChangeToClient()
                } break;
                case "A009": // 司马懿吸取恐惧之力
                    onGlobalEvent("fear", (id, team) => {
                        if (team == this.initTeam) return;
                        this.pushOneBuff(ele[1], ele[2] * 60, null, this);
                    }, this.initTeam + this._id);
                    break;
                case "A010": { // 单职业只有该武将时 加属性
                    let map = this.initTeam == "left" ? "leftOccuMap" : "rightOccuMap";
                    if (this.battleS[map][this._occu] === 1 || this.battleS[map][this._occu2] === 1) {
                        if (!this.backAttri[ele[1]]) this.backAttri[ele[1]] = 0;
                        this.backAttri[ele[1]] += ele[2];
                    }
                } break;
            }
        })
    }

    /** 某一属性对另一属性数值的影响 */
    BackByAttriToAttri(num, attri) {
        if (!this.m_objSkillBack["a"]) return num;
        this.m_objSkillBack["a"].forEach(ele => {
            switch (ele[0]) {
                case "a001":    // 每1%  提升x%  相乘属性
                    if (attri != ele[2]) break;
                    if (!this.battleInfo[ele[2]]) this.battleInfo[ele[2]] = 0;
                    num += (this.baseInfo[ele[2]] || 0) * this.getNowAttri(ele[1]) * ele[3];
                    break;
                case "a002":    // 每1% 提升x% 特殊属性
                    if (attri != ele[2]) break;
                    num += Math.min(this.getNowAttri(ele[1]) * ele[3], ele[4] || 0);
                    break;
                case "a003":  // 狙击状态下 攻速加成给攻击
                    if (attri != "atk") break;
                    if (this.getBuffNumByType("juji") > 1) {
                        num += this.baseInfo.atk * (Math.max(this.getNowpasp(true) - 1, 0)) * ele[1] / 100;
                    }
                    break;
            }
        })
        return num;
    }

    /** 一定要放在在属性初始化之后调用的初始设定 */
    BackByAfterInfo() {
        if (!this.m_objSkillBack["V"]) return;
        this.m_objSkillBack["V"].forEach(ele => {
            let index = -1;
            switch (ele[0]) {
                case "V001": {  // 开场前给所有敌人附加一个配置  
                    let tarr = this.getTargetByTypeState(1, -1, null, null, true, FILTERMAP.all);
                    for (let i = 0; i < tarr.length; ++i) {
                        let config = gUtils.deepClone(ele[1]);
                        tarr[i].pushSkillBack(config, this);
                    }
                } break;
                case "V002": {  // 开场前给所有友军施加一个被动
                    let tarr = this.getTargetByTypeState(2, -1, null, null, true);
                    for (let i = 0; i < tarr.length; ++i) {
                        let config = gUtils.deepClone(ele[1]);
                        tarr[i].pushSkillBack(config, this);
                    }
                } break;
                case "V003": { // 原V001 // 给友军 推入一个buff
                    let tarr = this.getTargetByTypeState(2, -1);
                    for (let i = 0; i < tarr.length; ++i) {
                        tarr[i].pushOneBuff(ele[1], ele[2] * 60, null, this);
                    }
                } break;
                case "V004": { // 原V002 // 给友军 推入一个buff
                    let tarr = this.getTargetByTypeState(1, -1, null, null, true, FILTERMAP.all);
                    for (let i = 0; i < tarr.length; ++i) {
                        tarr[i].pushOneBuff(ele[1], ele[2] * 60, null, this);
                    }
                } break;
                case "V005": { // 给自己注册事件 有cd 收到事件时麻沸散事件
                    onGlobalEvent(ele[1] + this._id + this.initTeam, (target) => {
                        this[ele[1]](target, ele);
                    }, this._id + this.initTeam);
                } break;
                case "V006": {  // 开场前给所有友军施加一个被动
                    let tarr = this.getTargetByTypeState(2, -1, null, null, false);
                    for (let i = 0; i < tarr.length; ++i) {
                        let config = gUtils.deepClone(ele[1]);
                        tarr[i].pushSkillBack(config, this);
                    }
                } break;
                case "V007": { // 左右格子
                    let left = !!this.battleS.bFieldArr[this.fieldX] ? this.battleS.bFieldArr[this.fieldX][this.fieldY - 1] : null;//ok
                    let right = !!this.battleS.bFieldArr[this.fieldX + 1] ? this.battleS.bFieldArr[this.fieldX + 1][this.fieldY + 1] : null;//ok
                    if (left && left.nowUnit) {
                        if (!left.nowUnit[ele[1]] || left.nowUnit[ele[1]] < ele[4]) {
                            if (!left.nowUnit[ele[1]]) left.nowUnit[ele[1]] = 0;
                            left.nowUnit[ele[1]] += 1;
                            left.nowUnit.pushOneBuff(ele[2], ele[3] * 60, null, this);
                        }
                    }
                    if (right && right.nowUnit) {
                        if (!right.nowUnit[ele[1]] || right.nowUnit[ele[1]] < ele[4]) {
                            if (!right.nowUnit[ele[1]]) right.nowUnit[ele[1]] = 0;
                            right.nowUnit[ele[1]] += 1;
                            right.nowUnit.pushOneBuff(ele[2], ele[3] * 60, null, this);
                        }
                    }
                    if (!this[ele[1]] || this[ele[1]] < ele[4]) {
                        if (!this[ele[1]]) this[ele[1]] = 0;
                        this[ele[1]] += 1;
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    }
                } break;
                case "V008": {
                    //上下变成左右
                    let up = this.battleS.bFieldArr[this.fieldX][this.fieldY + 1];//ok 右边
                    let down = this.battleS.bFieldArr[this.fieldX][this.fieldY - 1];//ok //坐标
                    if (up && up.nowUnit && up.nowUnit.initTeam === this.initTeam) {
                        if (!up.nowUnit[ele[1]] || up.nowUnit[ele[1]] < ele[4]) {
                            if (!up.nowUnit[ele[1]]) up.nowUnit[ele[1]] = 0;
                            up.nowUnit[ele[1]] += 1;
                            up.nowUnit.pushOneBuff(ele[2], ele[3] * 60, null, this);
                        }
                    }
                    if (down && down.nowUnit && down.nowUnit.initTeam === this.initTeam) {
                        if (!down.nowUnit[ele[1]] || down.nowUnit[ele[1]] < ele[4]) {
                            if (!down.nowUnit[ele[1]]) down.nowUnit[ele[1]] = 0;
                            down.nowUnit[ele[1]] += 1;
                            down.nowUnit.pushOneBuff(ele[2], ele[3] * 60, null, this);
                        }
                    }
                    if (!this[ele[1]] || this[ele[1]] < ele[4]) {
                        if (!this[ele[1]]) this[ele[1]] = 0;
                        this[ele[1]] += 1;
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    }
                } break;
                case "V009": { // 开场对应格子推入一个buff
                    let tarr = this.getTargetByTypeState(1, -1, null, null, true, FILTERMAP.all);
                    let tar;
                    if (tarr.length <= 0) break;
                    for (let i = 0; i < tarr.length; ++i) {
                        if (tarr[i].born == this.born) {
                            tar = tarr[i];
                        }
                    }
                    if (!tar) {  // 没有格子上的 随机吹
                        tar = tarr[this.bTools.getRandomInt(0, tarr.length - 1)];
                    }
                    if (!tar) break;
                    this.skillHitArr.push(46411);
                    let tatk = tar.getNowAttri("atk");
                    let myatk = this.getNowAttri("atk");
                    let diffper = (tatk - myatk) / myatk;
                    let ontime = ele[2] * 60;
                    if (diffper > 0.2) {
                        if (this.bTools.getRandom() < 0.99) ontime = ontime / 2;
                    } else if (diffper > 0.1) {
                        if (this.bTools.getRandom() < 0.9) ontime = ontime / 2;
                    }
                    tar.pushOneBuff(ele[1], ontime, null, this);
                    tar.Invisible = ontime;
                    if (ele.length > 4) {
                        if (!tar.buffAura["pcri"]) tar.buffAura["pcri"] = [];
                        tar.buffAura["pcri"].push({ num: ele[3], xdis: 190, ydis: 190, ttime: ontime - 1 });
                        if (!tar.buffAura["pasp"]) tar.buffAura["pasp"] = [];
                        tar.buffAura["pasp"].push({ num: ele[3], xdis: 190, ydis: 190, ttime: ontime - 1 });
                        if (!tar.buffAura["msp"]) tar.buffAura["msp"] = [];
                        tar.buffAura["msp"].push({ num: ele[3], xdis: 190, ydis: 190, ttime: ontime - 1 });
                    }
                }
                    break;
            }
        })
    }

    mafei(target, ele) {
        if (this.isBackCdOk(ele[0] + ele[3], ele[1])) {
            target.pushOneBuff(ele[3], ele[4] * 60, null, this);
        }
    }


    /* 受到伤害 计算最终伤害数值之前
    *   sType:
    *   hurmtype: 1-物理 2-法术 3-真实
    */
    BackBeforeHurm(hurm) {
        if (!this.m_objSkillBack["B"]) return hurm;
        this.m_objSkillBack["B"].forEach(ele => {
            switch (ele[0]) {
                case "B001":   // 项羽最多受到最大生命值
                    hurm = Math.min(this.initInfo.hp * ele[1] / 100, hurm);
                    break;
            }
        })
        return hurm;
    }

    /*
    *  天赋 受到伤害  在扣血操作之前的操作
    */
    BackLastHurmOp(hurm, hurminfo, source) {
        let stype = hurminfo.ptype;
        let hurmtype = hurminfo.hurmtype;
        let crit = hurminfo.crit;
        let vcr = hurminfo.vcr;
        let attextra = hurminfo.attextra;

        if (!(attextra && attextra.htype == "rehurm")) {
            if (this.getBuffNumByType("rebs") > 1 && source) {
                let rebs = (this.getBuffNumByType("rebs") - 1) * this.getNowAttri("atk");
                source.getCalHurm(this, this.getHurmInfo(rebs, hurmtype), "skill", 0, { htype: "rehurm" });
            }
            if (this.getBuffNumByType("sxuezhou") > 1) {
                if (!!this._xuezhou) {
                    let xuezhou = { hurm: hurm * (this.getBuffNumByType("sxuezhou") - 1), crit: 0, ptype: "skill", hurmtype: hurmtype, attextra: { htype: "rehurm" } };
                    hurm -= xuezhou.hurm;
                    this._xuezhou.doPrdcLogicHurt(xuezhou, this);
                }
            }
            if (stype != "yinji" && this.getBuffNumByType("chuyunyinji") > 1 && this.bTools.getRandom() < this.getBuffNumByType("chuyunyinji") - 1 && !!this._chuyunsrc) {
                if ((!this.backCd["chuyunyinji"] && this.backCd["chuyunyinji"] != 0) || this.backCd["chuyunyinji"] >= 1 * 60) {
                    this.backCd["chuyunyinji"] = 0;
                    this.getCalHurm(this._chuyunsrc, this.getHurmInfo(this._chuyunsrc.getNowAttri("atk") * (this.getBuffNumByType("chuyunextra") - 1), 1), "yinji");
                }
            }
        }

        let hurmratio = 1;
        let maxHurm = 0;
        if (!this.m_objSkillBack["D"]) return hurm;
        for (let index = this.m_objSkillBack["D"].length - 1; index >= 0; index--) {
            let ele = this.m_objSkillBack["D"][index];
            let rehurm;
            let hurminfo;
            switch (ele[0]) {
                case "D001": // 新  // 不屈状态等情况下 受到伤害按照攻击力回血 
                    if (this.getBuffNumByType(ele[1]) > 1) {
                        this.getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * ele[2] / 100), "skill");
                    }
                    break;
                case "D002": // 原D023 受到伤害概率恢复生命 按攻击力
                    if (this.isBackCdOk(ele[0] + ele[3], ele[1], () => {
                        return this.bTools.getRandom() <= ele[2] / 100;
                    })) {
                        this.getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * ele[3] / 100), "skill");
                        if (ele.length > 5) {
                            this.pushOneBuff(ele[4], ele[5] * 60, null, this);
                        }
                    }
                    break;
                case "D003": //  受到伤害概率 给自己buff
                    if (this.isBackCdOk(ele[0] + ele[4], ele[1], () => {
                        return (ele[2] === "all" || ele[2] === stype) && this.bTools.getRandom() <= ele[3] / 100;
                    })) {
                        this.pushOneBuff(ele[4], ele[5] * 60, null, this);
                    }
                    break;
                case "D004": // 有cd 受到到伤害反弹伤害 // 专属给一个队友回血
                    if (!source) break;
                    if (attextra && attextra.htype == "rehurm") break;
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        let hinfo = source.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, 1), "skill", 0, { htype: "rehurm" });
                        if (ele.length > 4) {
                            let tarr = this.getTargetByTypeState(2, -1, null, null, true, "000");
                            if (tarr.length > 0) {
                                tarr[0].getCalHeal(this, this.getHealInfo(hinfo.hurm * ele[3] / 100), "skill");
                            }
                        }
                    }
                    break;
                case "D005":    // 原D016   受到普攻 概率减伤 并回血
                    if (stype != "normal") break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.bTools.getRandom() <= ele[2] / 100;
                    })) {
                        hurmratio += -ele[3] / 100;
                        this.getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * ele[4] / 100), "skill");
                        if (ele.length > 6) {
                            this.addMagic(ele[5]);
                        }
                    }
                    break;
                case "D006": { // 原D004//   某个类型伤害命中概率触发某个技能 
                    if (!(ele[2] === "all" || ele[2] === stype)) break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.bTools.getRandom() <= ele[3] / 100;
                    })) {
                        let tarr = this.getTargetByTypeState(1, 120, 120, 1, true, FILTERMAP.yinshen);
                        if (tarr.length > 0) {
                            for (let i = 0; i < tarr.length; ++i) {
                                tarr[i].getCalHurm(this, this.getHurmInfo(this.initInfo.hp * ele[4] / 100, 1), "skill");
                            }
                        }
                        if (ele.length > 6 && ele[5]) this.skillHitArr.push(ele[5]); // 显示推入
                    }
                } break;
                case "D007": { // 原D008     // 受到某种伤害 反弹伤害 反弹的伤害自己不会受到
                    if (attextra && attextra.htype == "rehurm") break;
                    if (!((hurmtype == ele[2] || ele[2] == -1) && hurmtype <= 2 && source)) break;
                    if (this.isBackCdOk(ele[0] + ele[4], ele[1])) {
                        rehurm = this.bTools.intergeNum(hurm * ele[3] / 100);
                        hurm -= rehurm;
                        hurminfo = this.getHurmInfo(rehurm, hurmtype);
                        source.getCalHurm(this, hurminfo, "skill", 0, { htype: "rehurm" });
                        source.pushOneBuff(ele[4], ele[5] * 60, null, this);
                    }
                } break;
                case "D008": { //有cd 受到伤害 概率不受伤 并反伤 并给自己加状态
                    if ((attextra && attextra.htype === "rehurm") || !source) break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.bTools.getRandom() <= ele[2] / 100;
                    })) {
                        hurm = 0;
                        source.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[3] / 100, 1), "skill", 0, { htype: "rehurm" });
                        this.pushOneBuff(ele[4], ele[5] * 60, null, this);
                        // 赵云3技能特效
                        this.skillHitArr.push(42371);
                        source.skillHitArr.push(423711);
                    }
                } break;
                case "D009": //  受到伤害概率 给攻击者造成额外伤害 最多自身攻击 500%伤害
                    if ((attextra && attextra.htype === "rehurm") || !source) break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.bTools.getRandom() <= ele[2] / 100;
                    })) {
                        let maxhurm = this.getNowAttri("atk") * 5;
                        source.getCalHurm(this, this.getHurmInfo(Math.min(source.initInfo.hp * ele[3] / 100, maxhurm), hurmtype), "skill", 0, { htype: "rehurm" });
                    }
                    break;
                case "D010": { // 受到伤害时 有概率有冷却 恢复能量
                    if (!source) break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.bTools.getRandom() <= ele[2] / 100;
                    })) {
                        this.addMagic(ele[3]);
                    }
                } break;
                case "D011": { // 某个类型伤害 有概率推入一个buff
                    if (this.isBackCdOk(ele[0] + ele[4].toString(), ele[1], () => {
                        return (ele[2] === "all" || ele[2] === hurmtype) && this.bTools.getRandom() <= ele[3] / 100;
                    })) {
                        if (typeof ele[4] == "string" || typeof ele[4] == "number") {  // 如果不是string 就是数组
                            this.pushOneBuff(ele[4], ele[5] * 60, null, this);
                        } else {
                            ele[4].forEach((buff, idx) => {
                                this.pushOneBuff(buff, ele[5][idx] * 60, null, this);
                            });
                        }
                    }
                } break;
                case "D012":  // 原D014 // 每隔cd秒 受到伤害会治疗周围友军 并回复其能量
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        let tarr = this.getTargetByType(2, ele[2], ele[2], 1);
                        for (let i = 0; i < tarr.length; ++i) {
                            tarr[i].getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * (ele[3] / 100)), "skill");
                            tarr[i].addMagic(ele[4]);
                        }
                    }
                    break;
                case "D013":    // 宝物 降妖镇魔 受到伤害超过x生命上限 减伤 给x范围敌军 debuff 有cd
                    if ((hurm / this.initInfo.hp) < (ele[2] / 100)) break;
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        hurmratio -= ele[3] / 100;
                        let tarr = this.getTargetByTypeState(1, ele[4], ele[4], 1, false, FILTERMAP.yinshen);
                        for (let i = 0; i < tarr.length; ++i) {
                            tarr[i].pushOneBuff(ele[5], ele[6] * 60, null, this);
                        }
                    }
                    break;
                case "D014": { // 原D007     // 概率 受到伤害 反弹伤害 反弹的伤害自己不会受到 且给自己添加buff
                    if (attextra && attextra.htype == "rehurm") break;
                    if (!source) break;
                    if (this.isBackCdOk(ele[0] + ele[4].toString(), ele[1], () => {
                        return this.bTools.getRandom() <= ele[2] / 100;
                    })) {
                        rehurm = this.bTools.intergeNum(hurm * ele[3] / 100);
                        hurm -= rehurm;
                        hurminfo = this.getHurmInfo(rehurm, hurmtype);
                        source.getCalHurm(this, hurminfo, "skill", 0, { htype: "rehurm" });
                        this.pushOneBuff(ele[4], ele[5] * 60, null, this);
                    }
                } break;
                case "D015": // 原D013    // 生命比造成伤害的人 低 减伤。
                    if (!source) break;
                    if (this.battleInfo.hp < source.battleInfo.hp) break;
                    hurmratio -= ele[1] / 100;
                    break;
                case "D016": { // 受到的暴击伤害减少
                    if (crit != 1) break;
                    hurmratio -= ele[1] / 100;
                } break;
                case "D017":
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                        let tarr = this.getTargetByTypeState(2, Number(ele[4]), Number(ele[4]), 1);
                        for (let i = 0; i < tarr.length; ++i) {
                            tarr[i].getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * ele[5] / 100), "skill");
                        }
                    }
                    break;
                case "D018":   // 项羽概率最多受到最大生命值
                    if (this.bTools.getRandom() > ele[2] / 100) break;
                    if (maxHurm > 0) maxHurm = Math.min(this.initInfo.hp * ele[1] / 100, maxHurm);
                    else maxHurm = this.initInfo.hp * ele[1] / 100;
                    break;
                case "D019":    // 概率减伤
                    if (this.bTools.getRandom() > ele[1] / 100) break;
                    hurmratio -= (ele[2] / 100 - - this.getNowAttri("parry"));
                    break;
                case "D020": { //有cd 受到某伤害伤害  并反伤 真实伤害
                    if ((attextra && attextra.htype === "rehurm") || !source) break;
                    if (!(ele[2] === "all" || stype === ele[2])) break;
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        rehurm = this.bTools.intergeNum(hurm * ele[3] / 100);
                        hurm -= hurm * ele[4] / 100;
                        hurminfo = this.getHurmInfo(rehurm, 3);
                        source.getCalHurm(this, hurminfo, "skill", 0, { htype: "rehurm" });
                    }
                } break;
                case "D021": //  受到伤害概率 给自己 2次buff
                    if (this.isBackCdOk(ele[0] + ele[4], ele[1], () => {
                        return (ele[2] === "all" || ele[2] === stype) && this.bTools.getRandom() <= ele[3] / 100;
                    })) {
                        this.pushOneBuff(ele[4], ele[5] * 60, null, this);
                        this.pushOneBuff(ele[4], ele[5] * 60, null, this);
                    }
                    break;
                case "D022": {//  受到伤害最高不超过20%
                    // 与别的上限被动 取最小值
                    if (maxHurm > 0) maxHurm = Math.min(this.initInfo.hp * ele[1] / 100, maxHurm);
                    else maxHurm = this.initInfo.hp * ele[1] / 100
                } break;
                case "D023": { //  到此处证明平砍伤害没有被miss 增加闪避
                    if (stype != "normal") break;
                    if (attextra && FILTERATT[attextra.htype]) break;
                    if (!this.backState[ele[0]]) this.backState[ele[0]] = 0;
                    this.backState[ele[0]]++;
                    let _ratio = Math.min(ele[1], this.backState[ele[0]]);
                    this.setStlAttriNum(ATTRIMAP.other, ele[2], ele[0], ele[3] / 100 * _ratio);
                } break;
                case "D024": { //  到此处证明技能伤害没有被miss 增加抵抗
                    if (stype != "skill") break;
                    if (attextra && FILTERATT[attextra.htype]) break;
                    if (!this.backState[ele[0]]) this.backState[ele[0]] = 0;
                    this.backState[ele[0]]++;
                    let _ratio = Math.min(ele[1], this.backState[ele[0]]);
                    this.setStlAttriNum(ATTRIMAP.other, ele[2], ele[0], ele[3] / 100 * _ratio);
                } break;
                case "D025": { // 魂司马 被标记的人打他 伤害减半
                    if (!source) break;
                    if (source.getBuffNumByType("aoehsm") > 1) {
                        hurm /= 2;
                    }
                } break;
                case "D026": {
                    if (!source) break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.bTools.getRandom() < ele[2] / 100;
                    })) {
                        source.pushOneBuff("fear", ele[3] * 60, null, this);
                    }
                } break;
                case "D027": {
                    if (!source) break;
                    if (this.isBackCdOk(ele[0] + ele[4], ele[1], () => {
                        return (ele[2] === "all" || ele[2] === stype) && this.bTools.getRandom() <= ele[3] / 100;
                    })) {
                        source.pushOneBuff(ele[4], ele[5] * 60, null, this);
                    }
                } break;
                case "D028": {
                    if (!source) break;
                    if (source.initInfo.hp > this.initInfo.hp) {
                        hurmratio -= ele[1] / 100;
                    }
                } break;
                case "D029": {
                    if (!source) break;
                    if (source.initInfo.hp < this.initInfo.hp) {
                        hurmratio -= ele[1] / 100;
                    }
                } break;

            }
            ele[ele.length - 1] -= 1;
            if (ele[ele.length - 1] <= 0) this.m_objSkillBack["D"].splice(index, 1);
        }

        hurm = hurm * hurmratio;
        hurm = Math.max(0, hurm);
        if (maxHurm > 0) hurm = Math.min(maxHurm, hurm);
        return hurm;
    }

    /** **  被动技能 造成伤害时 受到的收益   
     *   ->此函数敌人调用
     *   sType : "normal"  "skill"  "rehurm"
     *   nHurmtype : 1-物理  2-法术 3-真实
     */
    BackHurmProfit(hurm, stype, hurmtype) {
        if (!this.m_objSkillBack["E"]) return;
        for (let index = this.m_objSkillBack["E"].length - 1; index >= 0; index--) {
            let ele = this.m_objSkillBack["E"][index];
            switch (ele[0]) {
                case "E001":    // 普攻或者技能伤害 获得吸血效果
                    if (stype == ele[1]) this.getCalHeal(this, this.getHealInfo(hurm * (ele[2] / 100)), "skill");
                    break;
                case "E002":    // 概率 任意吸血
                    if (this.bTools.getRandom() > ele[1] / 100) break;
                    this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    break;
            }
            ele[ele.length - 1] -= 1;
            if (ele[ele.length - 1] <= 0) this.m_objSkillBack["E"].splice(index, 1);
        }
    }
    // 造成伤害方的被动影响
    BackInfluenceHurm(hinfo, target) {
        let hurm = hinfo.hurm;
        let stype = hinfo.ptype;
        let hurmtype = hinfo.hurmtype;
        let crit = hinfo.crit;
        let attextra = hinfo.attextra;
        let skillid = hinfo.skillid;

        let hurmadd = 1;
        let extraHurm = 0;
        if (target.getBuffNumByType("binhun") > 1 && stype == "normal" && !attextra) {
            this.addMagic((this.getBuffNumByType("binhunmp") - 1) * 100);
        }

        if (!this.m_objSkillBack["F"]) return { hurm: hurm, crit: crit };
        for (let index = this.m_objSkillBack["F"].length - 1; index >= 0; index--) {
            let ele = this.m_objSkillBack["F"][index];
            if (!ele) continue;
            switch (ele[0]) {
                case "F001":  // 原F010 李典 暴击伤害后 命中一个buff 注意命中后的buff是否是持续掉血且可以暴击
                    if (crit == 1) {
                        if (attextra && attextra.htype === "buff") break;
                        target.pushOneBuff(ele[1], ele[2] * 60, null, this);
                    }
                    break;
                case "F002": { // 新 // 平砍时 对周围人造成某种伤害类型的范围伤害 算平砍伤害 但不能继续溅射
                    if (stype != "normal") break;
                    if (attextra && FILTERATT[attextra.htype]) break;
                    // 此为能找到隐身的
                    let tarr = target.getTargetByTypeState(2, ele[1], ele[1], 1, true, FILTERMAP.yinshen);
                    for (let i = 0; i < tarr.length; ++i) {
                        tarr[i].getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, 1), ele[3], 0, { htype: "jianshe" });
                        // if(ele.length > 5) {
                        //     tarr[i].pushOneBuff(ele[4], ele[5] * 60, null, this);
                        // }
                    }
                    // 如果存在溅射特效，则显示
                    if (ele.length > 5 && ele[4]) target.skillHitArr.push(ele[4]);
                }
                    break;
                case "F003":  // 新 原N010改为此处 //  普攻有概率给目标加buff
                    if (stype != ele[2] && ele[2] != "all") break;
                    if (attextra) break;
                    if (this.isBackCdOk(ele[0] + ele[4].toString(), ele[1], () => {
                        return this.bTools.getRandom() <= ele[3] / 100;
                    })) {
                        if (typeof ele[4] == "string" || typeof ele[4] == "number") {  // 如果不是string 就是数组
                            target.pushOneBuff(ele[4], ele[5] * 60, null, this);
                        } else {
                            ele[4].forEach((buff, idx) => {
                                target.pushOneBuff(buff, ele[5][idx] * 60, null, this);
                            });
                        }
                    }
                    break;
                case "F004":  // 新 某个技能命中时  目标血量 高于多少 受到额外伤害
                    if (!skillid || Number(skillid) != Number(ele[1])) break;
                    if (this.battleInfo.hp < this.initInfo.hp * ele[2] / 100) break;
                    target.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[3] / 100, 1), "skill");
                    break;
                case "F005": { // 新 原N012 普攻概率造成额外伤害 及类型
                    if (stype != "normal" || attextra) break;     // 不是单纯的普攻 不能给目标加buff
                    if (this.bTools.getRandom() > ele[1] / 100) break;
                    target.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, ele[3]), "skill");
                    if (ele.length > 5) { // 孙策 驱散自己一个负面buff
                        for (let i = 0; i < Number(ele[4]); ++i) {
                            this.dispelOneBuff(2, 2);
                        }
                    }
                }
                    break;
                case "F006": // 原F003 攻击血量低于xa%的敌人 增加xb%伤害
                    if (ele[1] === "all" || ele[1] === stype) {
                        if (attextra && attextra.htype != "jianshe") break;
                        if (target && target.getHpRatio() <= (ele[2] / 100)) {
                            hurmadd += ele[3] / 100;
                        }
                    }
                    break;
                case "F007": // 平砍有概率造成额外伤害 恢复能量 并推入眩晕buff
                    if (stype != "normal" || attextra) break;
                    if (this.bTools.getRandom() > ele[1] / 100) break;
                    target.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, ele[3]), "skill");
                    this.addMagic(ele[4]);
                    target.pushOneBuff("stun", ele[5] * 60, null, this);
                    break;
                case "F008": { // 新 // 有cd 平砍时 对目标及周围人造成某种伤害类型的范围伤害 算平砍伤害 但不能继续溅射  专属概率buff
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return stype == "normal" && !(attextra && FILTERATT[attextra.htype])
                    })) {
                        // 此为能找到隐身的 
                        hurmadd += ele[3] / 100 - 1;
                        if (ele.length > 5 && this.bTools.getRandom() < 0.33) {
                            target.pushOneBuff(ele[4], ele[5] * 60, null, this);
                        }
                        let tarr = target.getTargetByTypeState(2, ele[2], ele[2], 1, true, FILTERMAP.yinshen);
                        for (let i = 0; i < tarr.length; ++i) {
                            tarr[i].getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[3] / 100, 1), "normal", 0, { htype: "jianshe" });
                            if (ele.length > 5 && this.bTools.getRandom() < 0.33) {
                                tarr[i].pushOneBuff(ele[4], ele[5] * 60, null, this);
                            }
                        }
                    }
                } break;
                case "F009": { // 新 // 对生命比例高于x的敌军 额外造成攻击y的 z类型伤害
                    if (!attextra) {
                        if (target && target.battleInfo.hp > target.initInfo.hp * ele[1] / 100) {
                            target.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, ele[3]), "skill", 0, { htype: "extra" });
                        }
                    }
                } break;
                case "F010": { // 造成伤害时给自己buff 概率
                    if (this.bTools.getRandom() > ele[1] / 100) break;
                    if (typeof ele[2] == "string" || typeof ele[2] == "number") {  // 如果不是string 就是数组
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    } else {
                        ele[2].forEach((buff, idx) => {
                            this.pushOneBuff(buff, ele[3][idx] * 60, null, this);
                        });
                    }
                } break;
                case "F011": { // 某种不戴额外效果的伤害类型
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return !attextra && (ele[2] == "all" || stype == ele[2]);
                    })) {
                        let attval = Math.min(target.battleInfo.hp * ele[3] / 100, this.getNowAttri("atk") * ele[5]);
                        let objHurm = target.getCalHurm(this, this.getHurmInfo(attval, ele[4]), "skill", 0, { htype: "extra" });
                        this.getCalHeal(this, this.getHealInfo(objHurm.hurm), "skill");
                    }
                } break;
                case "F012": // 原F031  // 对同一目标造成几次伤害 附加一个buff  可造成额外伤害
                    if (this.isAtkCountOk(ele[0], target, ele[1])) {
                        target.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    }
                    break;
                case "F013":   //  攻击时 增伤 有概率驱散目标的一个增益buff
                    if (stype != "normal") break;
                    if (this.bTools.getRandom() > ele[1] / 100) break;
                    hurmadd += (ele[2] / 100 - 1);
                    target.dispelOneBuff(1, 2);
                    if (ele.length > 4) {
                        let arrBuff = ["yazhi", "stun", "zhongshang", "noheal", "unluck", "silent"];
                        target.pushOneBuff(arrBuff[this.bTools.getRandomInt(0, arrBuff.length - 1)], ele[3] * 60, null, this);
                    }
                    break;
                case "F014":  // 原F026 暴击时 给自己buff   
                    if (crit == 1) {
                        if (this.bTools.getRandom() > ele[1] / 100) break;
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    }
                    break;
                case "F015":   // F027 魏延(木鹿大王) 平砍暴击时 回复攻击力%生命
                    if (!crit) break;
                    if (attextra) break;
                    if (stype != ele[3] && ele[3] != "all") break;
                    if (this.isBackCdOk(ele[0] + ele[2], ele[1])) {
                        this.getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * ele[2] / 100), "skill");
                        this.addMagic(ele[4])
                    }
                    break;
                case "F016":    // 某种伤害动作概率给自己加buff
                    if (attextra) break;
                    if (stype != ele[1] && ele[1] != "all") break;
                    if (this.bTools.getRandom() > ele[2] / 100) break;
                    this.pushOneBuff(ele[3], ele[4] * 60, null, this);
                    break;
                case "F017":  // 原F017 // 对同一目标伤害增加额外伤害 层数
                    if (!this.countF017 || (!this.tidF017 && this.tidF017 != 0) || this.tidF017 != target._id || this.teamF017 != target.nowTeam) {
                        this.countF017 = 1;
                        this.tidF017 = target._id;
                        this.teamF017 = target.nowTeam;
                        break;
                    }
                    this.countF017 += 1;
                    this.countF017 = Math.min(this.countF017, ele[1] + 1);
                    hurmadd += (this.countF017 - 1) * ele[2] / 100;
                    break;
                case "F018": //原F029 // 对某个状态的敌人增加伤害
                    if (target.getBuffNumByType(ele[1]) > 1) {
                        hurmadd += ele[2] / 100;
                        if (ele.length > 4) {
                            this.addMagic(ele[3]);
                        }
                    }
                    break;
                case "F019":  // 暴击时 会增加额外的物理攻击百分比伤害
                    if (crit != 1) break;
                    if (attextra && attextra.htype === "extra") break;
                    if (this.isBackCdOk(ele[0] + ele[2], ele[1])) {
                        for (let i = 0; i < ele[3]; ++i) {
                            target.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, 1), "skill", 1, { htype: "extra" });
                        }
                    }
                    break;
                case "F020":  // 对同一敌军第3次攻击附带重击
                    if (stype != "normal") break;
                    if (attextra) break;   // 溅射不算
                    if (this.isAtkCountOk(ele[0], target, ele[1])) {
                        if (ele.length > 1 && ele[4]) target.skillHitArr.push(ele[4]);  // 黄忠带敌人受击特效
                        let attval = Math.min(this.getNowAttri("atk") * 15, target.initInfo.hp * ele[2] / 100);
                        target.getCalHurm(this, this.getHurmInfo(attval, 1), "skill", 1, { skillid: ele[3] });
                    }
                    break;
                case "F021": // 攻击某个状态的敌人
                    if (stype != "normal") break;
                    if (attextra) break;
                    if (target.getBuffNumByType("nizei") > 1) {
                        this.getCalHeal(this, this.getHealInfo(this.initInfo.hp * ele[1] / 100), "skill");
                        this.addMagic(ele[2]);
                        if (ele.length > 4) {
                            let tarr = this.getTargetByTypeState(2, -1, null, null, true, DEFAULTFILTER, (unit) => {
                                return !(unit.getBuffNumByType("light") > 1);
                            });
                            tarr.forEach(unit => {
                                unit.getCalHeal(this, this.getHealInfo(unit.initInfo.hp * ele[1] / 100), "skill");
                                unit.addMagic(ele[2]);
                            })
                        }
                    }
                    break;
                case "F022": {  // 平砍时 有cd 对周围人造成某种伤害类型的范围法术伤害 算平砍伤害 给buff
                    if (stype != "normal") break;
                    if (attextra && FILTERATT[attextra.htype]) break;
                    if (this.isBackCdOk(ele[0] + ele[3], ele[1])) {
                        target.skillHitArr.push(42331);
                        hurmadd += ele[3] / 100 - 1;
                        let tarr = target.getTargetByTypeState(2, ele[2], ele[2], 1, true, FILTERMAP.yinshen);
                        target.pushOneBuff(ele[4], ele[5] * 60, null, this);
                        for (let i = 0; i < tarr.length; ++i) {
                            tarr[i].getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[3] / 100, 2), "skill", 0, { htype: "jianshe" });
                            tarr[i].pushOneBuff(ele[4], ele[5] * 60, null, this);
                        }
                    }
                } break;
                case "F023": { // 原F007  // 自身血量高于x% 增加普攻伤害  自己不受伤
                    if (stype != "normal") break;
                    if (attextra && FILTERATT[attextra.htype]) break;
                    if (this.getHpRatio() < (ele[1] / 100)) break;
                    let extra = Math.min(this.bTools.intergeNum(this.battleInfo.hp * (ele[2] / 100)), this.getNowAttri("atk") * ele[3]);
                    extraHurm += extra * this.getDamageAdd(target, 1);
                } break;
                case "F024": { // 原F008  // 自身血量低于x% 时 攻击回复已损失生命值y%的生命
                    if (stype != "normal") break;
                    if (attextra && FILTERATT[attextra.htype]) break;
                    if (this.getHpRatio() > (ele[1] / 100)) break;
                    this.getCalHeal(this, this.getHealInfo(this.getLostHp() * (ele[2] / 100)), "skill");
                } break;
                case "F025": // 模式同F006  攻击血量高于xa%的敌人 增加xb%伤害
                    if (ele[1] === "all" || ele[1] === stype) {
                        if (attextra && attextra.htype != "jianshe") break;
                        if (target && target.getHpRatio() >= (ele[2] / 100)) {
                            hurmadd += ele[3] / 100;
                        }
                    }
                    break;
                case "F026": // 模式同F006  对生命比例高于自己的敌人 增加xb%伤害
                    if (ele[1] === "all" || ele[1] === stype) {
                        if (attextra && attextra.htype === "jianshe") break;
                        if (target && (target.getHpRatio() >= this.getHpRatio())) {
                            hurmadd += ele[2] / 100;
                        }
                    }
                    break;
                case "F027": { // 平砍有概率造成额外物理伤害 并推入buff
                    if (stype != "normal" || attextra) break;
                    if (this.isBackCdOk(ele[0] + ele[4], ele[1], () => {
                        return this.bTools.getRandom() <= ele[2] / 100;
                    })) {
                        target.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[3] / 100, 1), "skill");
                        target.pushOneBuff(ele[4], ele[5] * 60, null, this);
                    }
                } break;
                case "F028": { // 某指定技能打击时 吸取目标的能量
                    if (attextra && attextra.skillid == ele[1]) {
                        if (this.isBackCdOk(ele[0], ele[2])) {
                            target.addMagic(-ele[3]);
                            this.addMagic(ele[3]);
                        }
                    }
                } break;
                case "F029": { // 平砍有概率，有冷却，恢复能量
                    if (ele[2] === "all" || ele[2] === stype) {
                        if (attextra) break;
                        if (this.isBackCdOk(ele[0], ele[1], () => {
                            return this.bTools.getRandom() <= ele[3] / 100;
                        })) {
                            this.addMagic(ele[4]);
                        }
                    }
                } break;
                case "F030": {
                    if (!crit) break;
                    if (attextra) break;
                    if (stype != ele[2] && ele[2] != "all") break;
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        this.getCalHeal(this, this.getHealInfo(this.initInfo.hp * ele[3] / 100), "skill");
                        if (ele.length > 5) {
                            target.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[4] / 100, 1), "skill", 0, { htype: "extra" });
                        }
                    }
                } break;
                case "F031":    // 暴击时有概率，有冷却 可以额外造成目标生命上限伤害，最多攻击力500%
                    if (!crit) break;
                    if (attextra) break;
                    if (stype != ele[2] && ele[2] != "all") break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.bTools.getRandom() <= ele[3] / 100;
                    })) {
                        let maxhurm = this.getNowAttri("atk") * 5;
                        target.getCalHurm(this, this.getHurmInfo(Math.min(target.initInfo.hp * ele[4] / 100, maxhurm), hurmtype), "extra", 1);
                    }
                    break;
                case "F032": { // 造成法术伤害时 给某个状态下的状态 加buff
                    if (ele[1] === "all" || hurmtype === ele[1]) break;
                    if (target.getBuffNumByType("burn") > 1 && this.bTools.getRandom() <= ele[2] / 100) {
                        target.pushOneBuff(ele[3], ele[4] * 60, null, this);
                        if (ele.length > 6) {
                            hurmadd += ele[5] / 100;
                        }
                    }
                } break;
                case "F033": {  // 平砍时 有有概率 对周围人造成某种伤害类型的范围法术伤害 算技能伤害 给buff
                    if (stype != "normal") break;
                    if (attextra && FILTERATT[attextra.htype]) break;
                    if (this.bTools.getRandom() <= ele[1] / 100) {
                        let tarr = target.getTargetByTypeState(2, ele[2], ele[2], 1, false, FILTERMAP.yinshen);
                        for (let i = 0; i < tarr.length; ++i) {
                            tarr[i].getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[3] / 100, 2), "skill", 0, { htype: "jianshe" });
                            tarr[i].pushOneBuff(ele[4], ele[5] * 60, null, this);
                        }
                        // 陆逊受击特效
                        target.skillHitArr.push(44276);
                    }
                } break;
                case "F034": // 原F040   // 本多忠胜  4技能 有cd
                    if ("normal" != stype) break;
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        extraHurm += Math.min(this.bTools.intergeNum(this.initInfo.hp * ele[2] / 100), this.getNowAttri("atk") * 8) * this.getDamageAdd(target, 1);
                        target.pushOneBuff(ele[3], ele[4] * 60, null, this);
                    }
                    if ((!this.backCd[ele[0]] && this.backCd[ele[0]] != 0) || this.backCd[ele[0]] > ele[1] * 60) {
                        this.backCd[ele[0]] = 0;
                        let extra = this.bTools.intergeNum(this.initInfo.hp * (ele[2] / 100));
                        extra = Math.min(extra, this.getNowAttri("atk") * 8);
                        target.pushOneBuff(ele[3], ele[4] * 60, null, this);
                        hurm += extra * this.getDamageAdd(target, 1);
                    } break;
                case "F035": {// 新 某个技能命中时 向目标推入buff
                    if (!skillid) break;
                    let inx = this.getSkillIndex(ele[1]);
                    if (inx != 0) break;
                    if (this.skillArr[inx] != skillid) break;
                    target.pushOneBuff(ele[2], ele[3] * 60, null, this);
                } break;
                case "F036": {
                    if (!skillid && this.skillArr[0] != skillid) break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return target.battleInfo.hp <= target.initInfo.hp * ele[2] / 100;
                    })) {
                        this.toLetOneDead(target, skillid);
                        this.skillCdArr[0] = 999;
                        this.addMagic(200);
                    }
                } break;
                case "F037": { // 新 // 对生命比例低于x的敌军 额外造成攻击y的 z类型伤害
                    if (!attextra) {
                        if (target && target.battleInfo.hp < target.initInfo.hp * ele[1] / 100) {
                            target.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, ele[3]), "skill", 0, { htype: "extra" });
                        }
                    }
                } break;
                case "F038": // 平砍有概率造成额外伤害  并推入buff
                    if (stype != "normal" || attextra) break;
                    if (this.bTools.getRandom() > ele[1] / 100) break;
                    target.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, ele[3]), "skill");
                    target.pushOneBuff(ele[4], ele[5] * 60, null, this);
                    break;
                case "F039": {  // 平砍时 有有cd 对周围人造成某种伤害类型的范围法术伤害 算技能伤害 给buff
                    if (stype != "normal") break;
                    if (attextra && FILTERATT[attextra.htype]) break;
                    if (this.isBackCdOk(ele[0] + ele[4], ele[1])) {
                        let tarr = target.getTargetByTypeState(2, 120, 120, 1, false, FILTERMAP.yinshen);
                        for (let i = 0; i < tarr.length; ++i) {
                            tarr[i].getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, 2), "skill", 0, { htype: "jianshe" });
                            tarr[i].pushOneBuff(ele[3], ele[4] * 60, null, this);
                            if (ele.length > 6) {
                                tarr[i].addMagic(-ele[5]);
                            }
                        }
                    }
                } break;
                case "F040": {  // 普攻吸收能量  根据自身能量比例
                    if (stype != "normal" || attextra) break;
                    target.addMagic(-ele[1]);
                    this.addMagic(ele[1]);
                    let _ratio = this.nowmagic / this.maxmagic;
                    let _diff = _ratio * (ele[3] - ele[2]);
                    this.setStlAttriNum(ATTRIMAP.other, "ppdam", ele[0], (ele[2] + _diff) / 100);
                } break;
                case "F041": { // 新 // 平砍时 有溅射状态的 溅射
                    if (stype != "normal") break;
                    if (attextra && FILTERATT[attextra.htype]) break;
                    let ratio = this.getBuffNumByType("atkjianshe") - 1;
                    if (ratio > 0) {
                        let tarr = target.getTargetByTypeState(2, ele[1], ele[1], 1, true, FILTERMAP.yinshen);
                        for (let i = 0; i < tarr.length; ++i) {
                            tarr[i].getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ratio, 1), "normal", 0, { htype: "jianshe" });
                        }
                    }
                }
                    break;
                case "F042": {  // 平砍造成额外物理伤害 只触发一次 与e001联动,存在第4项，则推入buff,写死2秒 兵法技能
                    if (stype != "normal") break;
                    if (!this.backState["e001"]) break;
                    let hurm = target.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[1] / 100, 1), "skill").hurm;
                    this.backState["e001"] = 0;
                    if (ele.length > 3) {
                        let add = hurm * ele[3] / 100;
                        this.pushOneBuff(ele[2], 2 * 60, add, this);
                    }
                } break;
                case "F043":  //  普攻有概率对 血量最低的队友加buff
                    if (this.isBackCdOk(ele[0] + ele[3], ele[1])) {
                        let tarr = this.getTargetByTypeState(2, -1);
                        if (tarr.length > 0) {
                            let tar = tarr[this.bTools.getRandomInt(0, tarr.length - 1)];
                            if (!tar) break;
                            tar.pushOneBuff(ele[3], ele[4] * 60, null, this);
                            tar.skillHitArr.push(46336);
                        }
                    }
                    break;
                case "F044": // 原F022 // 吕布 对同一目标攻击，x下触发 额外增伤 最大生命值x%物理伤害(最多不超过攻击力1000%)
                    if (stype != "normal") break;
                    if (!this.backState[ele[0]]) this.backState[ele[0]] = 1;
                    else this.backState[ele[0]]++;
                    if (this.backState[ele[0]] >= ele[1]) {
                        this.backState[ele[0]] = 0;
                        hurmadd += ele[2] / 100;
                        extraHurm += Math.min(target.initInfo.hp * ele[3] / 100, 15 * this.getNowAttri("atk"));
                    }
                    break;
                case "F045":  // 生命值低于目标时  增伤
                    if (this.battleInfo.hp > target.battleInfo.hp) break;
                    hurmadd += ele[1] / 100;
                    break;
                case "F046": // 原F034 // 华雄 普攻打出范围伤害。
                    if (stype != "normal") break;
                    if (!this.backState[ele[0]]) this.backState[ele[0]] = 1;
                    else this.backState[ele[0]]++;
                    if (this.backState[ele[0]] >= ele[1]) {
                        this.backState[ele[0]] = 0;
                        let tarr = target.getTargetByTypeState(2, 80, 80, 1, true, FILTERMAP.yinshen);
                        hurmadd += ele[2] / 100 - 1;
                        let totalhurm = hurm;
                        for (let j = 0; j < tarr.length; ++j) {
                            let hurmval = tarr[j].getCalHurm(this, this.getHurmInfo(hurm * ele[2] / 100, 1), "skill");
                            if (ele.length > 5) {
                                tarr[j].pushOneBuff(ele[4], ele[5] * 60, null, this);
                            }
                            totalhurm += hurmval.hurm;
                        }
                        this.getCalHeal(this, this.getHealInfo(totalhurm * ele[3] / 100), "skill");
                        if (ele.length > 5) target.pushOneBuff(ele[4], ele[5] * 60, null, this);

                        // 华雄4技能 敌人受击特效
                        target.skillHitArr.push(46376);
                    }
                    break;
                case "F047":   // 普攻给随机一名敌方加buff
                    if (stype != "normal" || attextra) break;
                    let tarr = this.getTargetByType(1, -1);
                    if (tarr.length > 0) {
                        tarr[this.bTools.getRandomInt(0, tarr.length - 1)].pushOneBuff(ele[1], ele[2] * 60, null, this);
                    }
                    break;
                case "F048":  // 在某个状态下攻击 根据敌人已损失血量增伤
                    if (this.getBuffNumByType("leiting") > 1) {
                        let _ratio = target.getLostHp() / target.initInfo.hp;
                        hurmadd += ele[1] / 100 * _ratio;
                    }
                    break;
                case "F049":   // 神诸葛变身前 平砍造成的伤害 恢复友军血量
                    if (this._bSecondState) {
                        this.m_objSkillBack["F"].splice(index, 1);
                        break;
                    }
                    if (stype == "normal") {
                        let tarr = this.getTargetByTypeState(2, -1, null, 1, true);
                        if (tarr.length > 0) {
                            tarr = tarr.sortByType("hp", "inc");
                            for (let j = 0; j < tarr.length && j < ele[1]; ++j) {
                                tarr[j].getCalHeal(this, this.getHealInfo(hurm * ele[2] / 100), "skill");
                            }
                        }
                    }
                    break;
                case "F050": // 平砍有cd造成额外伤害 恢复能量 
                    if (stype != "normal" || attextra) break;
                    if (this.isBackCdOk(ele[0] + ele[2], ele[1])) {
                        target.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, ele[3]), "skill");
                        this.addMagic(ele[4]);
                    }
                    break;
                case "F051": {
                    if (attextra && attextra.skillid === ele[1]) {
                        this.addMagic(ele[2]);
                    }
                } break;
                case "F052": {  // 普攻额外回上限 备份比蓝量
                    if (stype != "normal" || attextra) break;
                    this.addMagic(Math.min(this.maxmagic, 100) * ele[1] / 100);
                } break;
                case "F053": {   // 攻击暴击时，恢复自身攻击力百分比 生命值
                    if (!crit) break;
                    if (attextra) break;
                    if (stype != ele[2] && ele[2] != "all") break;
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        this.getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * ele[3] / 100), "skill");
                        if (ele.length > 5) {
                            target.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[4] / 100, 1), "skill", 0, { htype: "extra" });
                        }
                    }
                } break;
                case "F054": {  // 平砍时 对周围人增加法术伤害， 陆逊爆炎效果
                    if (stype != "normal") break;
                    if (attextra && FILTERATT[attextra.htype]) break;
                    if (this.getBuffNumByType("baoyan") > 1) {
                        let tarr = target.getTargetByTypeState(2, ele[1], ele[1], 2, false, FILTERMAP.yinshen);
                        for (let i = 0; i < tarr.length; ++i) {
                            tarr[i].getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, 2), "skill", 0);
                        }
                    }
                } break;
                case "F055": {
                    if (stype != ele[2] && ele[2] != "all") break;
                    if (attextra && attextra.htype == "buff") break;
                    if (target.getHpRatio() > ele[1] / 100) break;
                    target.pushOneBuff(ele[3], ele[4] * 60, null, this);
                } break;
                case "F056": {
                    if (attextra) break;
                    if (this.bTools.getRandom() > ele[1] / 100) break;
                    target.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, 3), "skill", 1, { htype: "extra" })
                } break;
                case "F057": {
                    if (stype != ele[2] && ele[2] != "all") break;
                    if (attextra && attextra.htype == "buff") break;
                    if (this.bTools.getRandom() > ele[1] / 100) break;
                    hurmadd += ele[3] / 100;
                    target.pushOneBuff(ele[4], ele[5] * 60, null, this);
                } break;
                case "F058": {
                    if (stype != "normal") break;
                    if (attextra && attextra.htype == "buff") break;
                    if (this.getBuffNumByType("weiyanatk") <= 1) break;
                    this.getCalHeal(this, this.getHealInfo(this.getLostHp() * ele[1] / 100), "skill");
                } break;
                case "F059": {
                    if (this.getBuffNumByType("juji") > 1) {
                        if (stype != "normal") break;
                        let hurt = target.getLostHp() * ele[1] / 100;
                        hurt = Math.min(this.getNowAttri("atk") * ele[2], hurt);
                        target.getCalHurm(this, this.getHurmInfo(hurt, 2), "skill", 1, { htype: "extra" })
                        if (ele.length > 4) {
                            target.pushOneBuff(ele[3], ele[4] * 60, null, this);
                        }
                    }
                } break;
                case "F060": {    // 某种伤害动作概率给自己加buff
                    if (this.getBuffNumByType("juji") > 1) {
                        if (attextra) break;
                        if (stype != ele[1] && ele[1] != "all") break;
                        if (this.bTools.getRandom() > ele[2] / 100) break;
                        this.pushOneBuff(ele[3], ele[4] * 60, null, this);
                    }
                } break;
                case "F061": {  // 对同一敌军第3次攻击附带溅射
                    if (stype != "normal") break;
                    if (attextra) break;   // 溅射不算
                    if (this.isAtkCountOk(ele[0], target, ele[1])) {
                        let attval = Math.min(target.initInfo.hp * ele[2] / 100, this.getNowAttri("atk") * ele[3]);
                        target.getCalHurm(this, this.getHurmInfo(attval, 1), "skill", 1, { attextra: "zhongji" });
                        let tarr = target.getTargetByTypeState(2, 120, 120, 1, true);
                        target.skillHitArr.push(40416);
                        for (let i = 0; i < tarr.length; ++i) {
                            tarr[i].getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[4] / 100, 1), "skill", 1, { htype: "jianshe" });
                        }
                    }
                } break;
                case "F062": {
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return ele[2] === "all" || hurmtype === ele[2];
                    })) {
                        let tarr = target.getTargetByTypeState(2, ele[3], ele[3], 1);
                        for (let i = 0; i < tarr.length; ++i) {
                            tarr[i].getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[4] / 100, 2), "skill", 1, { htype: "extra" });
                        }
                    }
                } break;
                case "F063": { // 在某状态下 平砍额外伤害
                    if (stype != "normal" || attextra) break;
                    if (this.getBuffNumByType(ele[1]) > 1) {
                        target.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, ele[3]), "skill", 1, { htype: "extra" });
                    }
                } break;
                case "F064": {
                    if (stype == "normal" || stype == "skill") {
                        emitGlobalEvent(this._id + this.initTeam + "42421", hurm);
                        if (target.getBuffNumByType("aoehsm") > 1) {
                            this.pushOneBuff(ele[1], ele[2] * 60, null, this);
                        }
                    }
                } break;
                case "F065": {  // 魂司马懿
                    if (stype != "normal") break;
                    if (this.isAtkCountOk(ele[0], target, ele[1])) {
                        target.skillHitArr.push(42436);
                        let thurm = (target.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, 2), "skill")).hurm;

                        let tarr = target.getTargetByTypeState(2, ele[3], ele[3], 1, true);
                        for (let j = 0; j < tarr.length; ++j) {
                            tarr[j].getCalHurm(this, this.getHurmInfo(thurm * ele[4] / 100, 2), "skill", 1);
                        }
                    }
                } break;
                case "F066": {  // 平砍造成额外物理伤害 只触发一次 与e001联动,存在第4项，则推入buff,写死2秒 兵法技能
                    if (stype != "normal") break;
                    if (!this.backState[ele[0]]) break;
                    let attval = Math.min(target.initInfo.hp * ele[1] / 100, target.getNowAttri("atk") * ele[2]);
                    target.getCalHurm(this, this.getHurmInfo(attval, 3), "skill").hurm;
                    this.backState[ele[0]] = 0;
                } break;
                case "F067": { // 新 // 对生命比例高于x的敌军 额外造成攻击y的 z类型伤害
                    if (!attextra) {
                        if (this.isBackCdOk(ele[0], ele[1], () => {
                            return target && target.initInfo.hp < this.initInfo.hp;
                        })) {
                            target.getCalHurm(this, this.getHurmInfo(this.initInfo.hp * ele[2] / 100, ele[3]), "skill", 0, { htype: "extra" });
                        }
                    }
                } break;
                case "F068": {
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        let value = hurm * ele[2] / 100;
                        this.pushOneBuff(ele[3], ele[4] * 60, value, this);
                    }
                } break;
            }
            ele[ele.length - 1] -= 1;
            if (ele[ele.length - 1] <= 0) this.m_objSkillBack["F"].splice(index, 1);
        }

        hurm *= hurmadd;
        hurm += extraHurm;
        return { hurm: hurm, crit: crit };
    }

    // 攻击者调用  伤害信息 
    BackByKill(hinfo, target) {
        //阵亡武将target,凶手武将this
        //光环羁绊加持
        if (this.halo && this.halo == 104 && this.initTeam == "left") {
            this.battleInfo.atk += this.baseInfo.atk * (this.haloConfig.PARAMS[1] / 100);
            this.initInfo.atk = this.battleInfo.atk;
        }
        this.killnum++;           // 记录杀人数
        if (!this.m_objSkillBack["G"]) return;
        this.m_objSkillBack["G"].forEach(ele => {
            switch (ele[0]) {
                case "G001": // 原G005 指定技能击杀
                    if (this.getSkillIndex(ele[1]) != this.getSkillIndex(hinfo.skillid)) break;
                    this.battleInfo.atk += (this.baseInfo.atk || 0) * ele[2] / 100;
                    break;
                case "G002": // 被某个技能击杀 加buff
                    if (hinfo.attextra && Number(hinfo.attextra.skillid) === Number(ele[1])) {
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    }
                    break;
                case "G003": { //  指定技能杀人 重置cd
                    if (!hinfo.attextra || !hinfo.attextra.skillid) break;
                    let inx = this.getSkillIndex(hinfo.attextra.skillid);
                    if (this.getSkillIndex(ele[1]) != inx) break;
                    this.skillCdArr[inx] = 999;
                } break;
                case "G004": { // 击杀 恢复已损失的血量百分比
                    this.getCalHeal(this, this.getHealInfo(this.getLostHp() * ele[1] / 100), "skill");
                } break;
                case "G005": {
                    if (hinfo.skillid && Number(hinfo.skillid) === Number(ele[1])) {
                        let tarr = this.getTargetByTypeState(2, ele[2], ele[2], 2);
                        for (let i = 0; i < tarr.length; ++i) {
                            tarr[i].pushOneBuff(ele[3], ele[4] * 60, null, this);
                        }
                    }
                } break;
                case "G006": { // 击杀对周围人造成伤害
                    let tarr = target.getTargetByTypeState(1, ele[1], ele[1], 1, false, null, null, this.initTeam);
                    for (let i = 0; i < tarr.length; ++i) {
                        tarr[i].getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, 1), "skill", { htype: "extra" });
                        tarr[i].pushOneBuff(ele[3], ele[4] * 60, null, this);
                    }
                    target.skillHitArr.push(44416);
                } break;
                case "G007": { // 魂司马懿 击杀重置
                    this["count" + ele[1]] = ele[2];
                } break;
            }
        });
    }

    // 被动技能对回复的影响
    BackByHealVal(hval) {
        if (!this.m_objSkillBack["H"]) return hval;
        this.m_objSkillBack["H"].forEach((ele, index) => {
            switch (ele[0]) {
                case "H001":
                    hval *= (1 + ele[1] / 100);
                    break;
                case "H002":    //每次最多回复自身10%;
                    hval = Math.min(this.initInfo.hp * ele[1] / 100, hval);
                    break;
                case "H003": { // 如果治疗量会溢出
                    if (this.isBackCdOk(ele[0] + index, ele[1], () => {
                        return hval + this.battleInfo.hp > this.initInfo.hp;
                    })) {
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    }
                } break;
            }
        });
        return this.bTools.intergeNum(hval);
    }

    BackByDoSkill(sindex) {
        if (!this.m_objSkillBack["I"]) return;
        this._GetJianGe()
        for (let index = this.m_objSkillBack["I"].length - 1; index >= 0; index--) {
            let ele = this.m_objSkillBack["I"][index];
            switch (ele[0]) {
                case "I001": {  // 原I005   //  释放技能后  受到施加被动的人的伤害
                    let sinfo = this.getSkillInfo(sindex);  // GetConfig("dbEffInfo")[this.skillArr[sindex]];
                    if (!sinfo || sinfo.ecost) break;       // 如果不是1技能(消耗蓝量) 则不被弹
                    let src = ele[ele.length - 2];
                    if (src.isDead()) {
                        ele[ele.length - 1] = 0;
                        break;
                    }
                    this.getCalHurm(src, src.getHurmInfo(src.getNowAttri("atk") * ele[1] / 100, 2), "skill", { htype: "rehurm" });
                } break;
                case "I002": { // 原I007 // 推入一个被动  每次放技能 随机敌人沙包
                    let sinfo = this.getSkillInfo(sindex);  // GetConfig("dbEffInfo")[this.skillArr[sindex]];
                    if (!sinfo || sinfo.ecost) break;       // 如果不是1技能(消耗蓝量) 则不被弹
                    let src = ele[ele.length - 2];
                    if (src.isDead()) {
                        this.m_objSkillBack["I"].splice(index, 1);
                        break;
                    }
                    let tarr = this.getTargetByTypeState(1, -1);
                    if (tarr.length > 0) {
                        let tar = tarr[this.bTools.getRandomInt(0, tarr.length - 1)];
                        let res = tar.getTargetByTypeState(2, ele[1], ele[1], 1, false, FILTERMAP.yinshen);
                        // todo 受击效果配置
                        if (ele.length > 4 && ele[3]) tar.skillHitArr.push(ele[3]);
                        for (let i = 0; i < res.length; ++i) {
                            res[i].getCalHurm(src, src.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, 2), "skill");
                        }
                    }
                } break;
                case "I003": { // 释放技能后给某个状态的队友 额外施加buff

                } break;
                case "I004": { // 原I011 // 释放主动技能后 推入一个buff
                    if (this.isBackCdOk(ele[0] + ele[2], ele[1]), () => {
                        let sinfo = this.getSkillInfo(sindex);
                        return sinfo && !sinfo.ecost;
                    }) {
                        this.pushOneBuff(ele[2], Number(ele[3]) * 60, null, this);
                    }
                } break;
                case "I005": { // 释放技能后 受到释放人的效果
                    let sinfo = this.getSkillInfo(sindex);  // GetConfig("dbEffInfo")[this.skillArr[sindex]];
                    if (!sinfo || sinfo.ecost) break;       // 如果不是1技能(消耗蓝量) 则不被弹
                    let src = ele[ele.length - 2];
                    if (src.isDead() || src._bSecondState) {
                        this.m_objSkillBack["I"].splice(index, 1);
                        break;
                    }
                    if (Math.abs(src.x - this.x) > 80 * __AttDisScale.x || Math.abs(src.y - this.y) > 80 * __AttDisScale.x) break;
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        let targetarr = this.getTargetByType(2, 120, 120, 1);
                        targetarr.forEach(tar => {
                            tar.pushOneBuff(ele[2], ele[3] * 60, null, src);
                        })
                    }
                } break;
                case "I006": {        // 莫步练师 释放1技能后 根据入魔人数获得效果
                    let inx = this.getSkillIndex(ele[1]);
                    if (sindex != inx) break;
                    let num = this.skilltargetsArr.length;
                    this.getCalHeal(this, this.getHealInfo(this.initInfo.hp * num * ele[2] / 100), "skill");
                    for (let i = 0; i < num; ++i) {
                        this.pushOneBuff(ele[3], ele[4] * 60, null, this);
                    }
                } break;
                case "I007": {   // 魔孙权释放技能后回血
                    let inx = this.getSkillIndex(ele[1]);
                    if (sindex != inx) break;
                    this.getCalHeal(this, this.getHealInfo(this.initInfo.hp * ele[2] / 100), "skill");
                } break;
                case "I008": {  // 魔吕布技能1 少消耗50
                    let sinfo = this.getSkillInfo(sindex);  // GetConfig("dbEffInfo")[this.skillArr[sindex]];
                    if (!sinfo || sinfo.ecost) break;       // 如果不是1技能(消耗蓝量) 则不被弹
                    this.addMagic(ele[1]);
                } break;
                case "I009":  // 释放技能后  获得一层战意  战意达到层数时
                    if (!this.backState["zhanyi"]) this.backState["zhanyi"] = 0;
                    this.backState["zhanyi"]++;
                    if (this.backState["zhanyi"] >= ele[1]) {
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                        if (!!this.master) {
                            this.master.pushOneBuff(ele[2], ele[3] * 60, null, this);
                            this.master.backState["zhanyi"] = 0;
                        } else if (!!this.separaUnit[0]) {
                            this.separaUnit[0].pushOneBuff(ele[2], ele[3] * 60, null, this);
                            this.separaUnit[0].backState["zhanyi"] = 0;
                        }
                        this.backState["zhanyi"] = 0;
                    } else {
                        if (!!this.master) {
                            this.master.backState["zhanyi"] = this.backState["zhanyi"];
                        } else if (!!this.separaUnit[0]) {
                            this.separaUnit[0].backState["zhanyi"] = this.backState["zhanyi"];
                        }
                    }
                    break;
                case "I010": {  //  神诸葛亮放技能自杀时判断是否血量小于0
                    if (this._bSecondState) this.m_objSkillBack["I"].splice(index, 1);
                    let inx = this.getSkillIndex(ele[1]);
                    if (sindex != inx) break;
                    this.changeNowHp(-this.initInfo.hp * ele[2] / 100);
                    if (this.battleInfo.hp <= 0) {
                        this.BackBySelfDie();
                    }
                } break;
                case "I011": {
                    if (this.isBackCdOk(ele[0] + ele[2], ele[1]), () => {
                        let sinfo = this.getSkillInfo(sindex);
                        return sinfo && !sinfo.ecost;
                    }) {
                        for (let i = 0; i < ele[3]; ++i) {
                            this.dispelOneBuff(2, 2);
                        }
                    }
                } break;
                case "I012": {  // 随机buff
                    if (this.isBackCdOk(ele[0] + ele[2], ele[1], () => {
                        let sinfo = this.getSkillInfo(sindex);
                        return sinfo && !sinfo.ecost;
                    })) {
                        if (typeof ele[3] == "string" || typeof ele[3] == "number") {
                            this.pushOneBuff(ele[3], ele[4] * 60, null, this);
                        } else {
                            this.pushOneBuff(ele[3][this.bTools.getRandomInt(0, ele[3].length - 1)], ele[4] * 60, null, this);
                        }
                    }
                } break;
                case "I013": {  // 使用主动技能
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        let sinfo = this.getSkillInfo(sindex);
                        return sinfo && !sinfo.ecost;
                    })) {
                        this.addMagic(ele[2] / 100 * this.maxmagic);
                    }
                } break;
                case "I014": {
                    let sinfo = this.getSkillInfo(sindex);
                    if (sinfo && !sinfo.ecost) {
                        this.backState[ele[1]] = 1;
                    }
                } break;
            }
            ele[ele.length - 1] -= 1;
            if (ele[ele.length - 1] <= 0) this.m_objSkillBack["I"].splice(index, 1);
        }
    }

    // changehp ->> 本次变化的hp 
    BackByHpExchange(binit, changehp) {  // 如果是初始化时 则不做某些逻辑
        if (!this.m_objSkillBack["J"]) return;
        let bnodead = false;  // 触发免死
        this.m_objSkillBack["J"].forEach((ele, index) => {

            switch (ele[0]) {
                case "J001": {// 原J018 血量首次低于x 时 给生命最低的友军 及 周围 回血
                    if (binit) break;
                    if (this.battleInfo.hp > this.initInfo.hp * ele[1] / 100) break;
                    if (this.backState[ele[0] + ele[1] + ele[2]]) break;
                    let tarr = this.getTargetBySort({ target: 2, doarea: -1 }, "hp", "inc");
                    if (!tarr[0]) break;
                    this.backState[ele[0] + ele[1] + ele[2]] = 1;
                    tarr[0].skillHitArr.push(40171);
                    tarr = tarr[0].getTargetByTypeState(2, ele[4], ele[4], 1);
                    if (tarr.length > 0) {
                        tarr.forEach(unit => {
                            unit.pushOneBuff(ele[2], ele[3] * 60, null, this);
                            unit.getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * ele[5] / 100), "skill");
                        })
                    }
                }
                    break;
                case "J002": // 新 有cd 血量低于x时 给自己增加buff 黄忠3技能
                    if (binit) break;
                    if (this.isBackCdOk(ele[0] + ele[3] + index, ele[1], () => {
                        return this.battleInfo.hp <= this.initInfo.hp * ele[2] / 100;
                    })) {
                        this.pushOneBuff(ele[3], ele[4] * 60, null, this);
                    }
                    break;
                case "J003":  //原J019  // 司马懿 致死  
                    if (this.battleInfo.hp > 0) break;
                    if (bnodead) break;
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        this.battleInfo.hp = 1;
                        this.skillCdArr[0] = 999;           //  0 一定是主动技能
                        this.maxmagic = 0;                  //  不再消耗法力值
                        let skillinfo = this.getSkillInfo(0);   // GetConfig("dbEffInfo")[this.skillArr[0]];
                        this.getMainResetCd = () => {
                            return skillinfo.cd - ele[2];
                        }
                        bnodead = true;
                        this.pushOneBuff(ele[3], ele[4] * 60, null, this);
                        if (ele.length > 6) {
                            this.skillArr.pop();
                            this.skillCdArr.pop();
                        }
                    }
                    break;
                case "J004": // 原J007 // 致死时 1血 x秒免伤  cd xmiao 
                    if (this.battleInfo.hp > 0) break;
                    if (bnodead) break;
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        bnodead = true;
                        this.battleInfo.hp = 1;
                        this.addMagic(ele[2]);
                        this.pushOneBuff(ele[3], ele[4] * 60, null, this);
                        if (ele.length > 6) this.skillCdArr[0] = 999;
                    }
                    break;
                case "J005": //
                    // if(this.isBackCdOk(ele[0] + ele[2] + ele[3], ele[1], () => {
                    //     return this.getHpRatio() < ele[2] / 100;
                    // })) {
                    //     this.pushOneBuff(ele[3], ele[4] * 60, null, this);
                    // }
                    break;
                case "J006": { // 血量越多 属性增加越多
                    let _ratio = this.getHpRatio();
                    this.setStlAttriNum(ATTRIMAP.other, ele[1], ele[0] + index, _ratio * ele[2] / 100);
                } break;
                case "J007": { // 原J001 // 每损失多少血量 增加 某属性
                    let _ratio = Math.max(this.getLostHp(), 0) / this.initInfo.hp;
                    this.setStlAttriNum(ATTRIMAP.other, ele[1], ele[0] + index, _ratio * ele[2] / 100);
                } break;
                case "J008": // 原J006 // 血量低于 x  能量回复提升 
                    this.setStlAttriNum(ATTRIMAP.other, ele[1], ele[0] + index, 0);
                    if (this.battleInfo.hp > this.initInfo.hp * ele[2] / 100) break;
                    this.setStlAttriNum(ATTRIMAP.other, ele[1], ele[0] + index, ele[3] / 100);
                    break;
                case "J009": // 日月星辰 血量低于x时  恢复能量 重置cd
                    if (binit) break;
                    if (this.battleInfo.hp > this.initInfo.hp * ele[2] / 100) break;
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        this.addMagic(1000);
                        for (let i = 0; i < this.skillCdArr.length; ++i) {
                            if (this.skillCdConfig[i] >= 60) continue;       //  增加德川无法召唤2次
                            this.skillCdArr[i] = 999;
                        }
                    }
                    break;
                case "J010": // 原J005 // cd 秒 移除所有负面buff  血量低于x 时 持续y秒 某个buff
                    if (binit) break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.getHpRatio() <= ele[2] / 100;
                    })) {
                        this.clearBuff(2, 2);
                        this.pushOneBuff(ele[3], ele[4] * 60, null, this);
                        if (ele.length > 6) {
                            this.skillCdArr[0] = 999;
                            this.addMagic(150);
                        }
                    }
                    break;
                case "J011": {// 血量高于x 时 增加属性
                    let bFalse = this.battleInfo.hp < this.initInfo.hp * ele[2] / 100;
                    if (typeof ele[1] == "string" || typeof ele[1] == "number") {
                        this.setStlAttriNum(ATTRIMAP.other, ele[1], ele[0] + index, 0);
                        if (bFalse) break;
                        this.setStlAttriNum(ATTRIMAP.other, ele[1], ele[0] + index, ele[3] / 100);
                    } else {
                        ele[1].forEach((eattri, inx) => {
                            this.setStlAttriNum(ATTRIMAP.other, eattri, ele[0] + index, 0);
                        });
                        if (bFalse) break;
                        ele[1].forEach((eattri, inx) => {
                            this.setStlAttriNum(ATTRIMAP.other, eattri, ele[0] + index, ele[3][inx] / 100);
                        });
                    }
                } break;
                case "J012":  // 周瑜3技能 致死时 回血  免伤buff
                    if (this.battleInfo.hp > 0) break;
                    if (bnodead) break;
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        bnodead = true;
                        this.battleInfo.hp = 1;
                        this.skillHitArr.push(44391);
                        this.getCalHeal(this, this.getHealInfo(this.initInfo.hp * ele[4] / 100), "skill");
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                        // if(ele.length > 6) this.Invisible = ele[5] * 60;
                    }
                    break;
                case "J013":    // 致死 混沌之力  过一段时间之后死亡
                    if (this.battleInfo.hp > 0) break;
                    if (bnodead) break;
                    if (this.isBackCdOk(ele[0] + ele[2], ele[1])) {
                        bnodead = true;
                        this.battleInfo.hp = 1;
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    }
                    break;
                case "J014":    //原 J025 // 生命低于x 时 主动技能冷却额外缩减 x秒 并恢复x最大生命
                    if (binit) break;
                    if (this.battleInfo.hp > this.initInfo.hp * ele[2] / 100) break;
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        this.skillCdArr[0] += Number(ele[3]);
                        this.getCalHeal(this, this.getHealInfo(ele[4] / 100 * this.initInfo.hp), "skill");
                        this.addMagic(ele[4] / 100 * this.maxmagic);
                    }
                    break;
                case "J015": {// 血量低于x 时 增加属性
                    let bFalse = this.battleInfo.hp > this.initInfo.hp * ele[2] / 100;
                    if (typeof ele[1] == "string" || typeof ele[1] == "number") {
                        this.setStlAttriNum(ATTRIMAP.other, ele[1], ele[0] + index, 0);
                        if (bFalse) break;
                        this.setStlAttriNum(ATTRIMAP.other, ele[1], ele[0] + index, ele[3] / 100);
                    } else {
                        ele[1].forEach((eattri, inx) => {
                            this.setStlAttriNum(ATTRIMAP.other, eattri, ele[0] + index, 0);
                        });
                        if (bFalse) break;
                        ele[1].forEach((eattri, inx) => {
                            this.setStlAttriNum(ATTRIMAP.other, eattri, ele[0] + index, ele[3][inx] / 100);
                        });
                    }
                } break;
                case "J016": {// 血量首次低于x 时 增加能量,如果存在第4个数，则恢复 x% 已损失生命值
                    if (binit) break;
                    if (this.battleInfo.hp > this.initInfo.hp * ele[2] / 100) break;
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        this.addMagic(ele[3]);
                        if (ele.length > 5) {
                            this.getCalHeal(this, this.getHealInfo(this.getLostHp() * ele[4] / 100), "skill");
                        }
                    }
                }
                    break;
                case "J017": { // 血量低于多少时通知
                    if (binit) break;
                    if (this.battleInfo.hp > this.initInfo.hp * ele[1] / 100) break;
                    let src = ele[ele.length - 2];
                    if (src.isDead()) {
                        break;
                    }
                    emitGlobalEvent(ele[2] + src._id + src.initTeam, this);
                } break;
                case "J018": { // 神诸葛变身
                    if (this._bSecondState || this.battleInfo.hp > 0) break;
                    this.setAction("longxingzhugeliang");
                    this._bSecondState = true;
                    this.attNext = 55;
                    this.skillHitArr.push(17171);
                    if (ele.length > 2) this.pushOneBuff(ele[1], ele[2] * 60, null, this);
                    this.pushOneBuff("bianshen", 55, null, this);
                    this.pushOneBuff("wudi", 3 * 60, null, this);
                    this.clearBuff(2, 2);
                    this.battleInfo.hp = this.initInfo.hp;
                    this.nowmagic = 0;
                    this.sendMagicChangeToClient()
                    this.config = gUtils.deepClone(GetConfig("dbRoleInfo")["longxingzhugeliang"]);
                    if (this.config.attzone) {
                        let att = this.config.attzone.split("x");
                        if (att.length < 2) {
                            console.log(this.gsid, "战斗攻击范围配置错误");
                            throw { etype: "unit", obj: obj, errnum: 1002 };
                        }
                        this.config.attzone = { x: Number(att[0]), y: Number(att[1]) };
                    }
                    if (this.config.findzone) {
                        let find = this.config.findzone.split("x");
                        if (find.length < 2) {
                            console.log(this.gsid, "战斗寻敌范围配置错误");
                            throw { etype: "unit", obj: obj, errnum: 1002 };
                        }
                        this.config.findzone = { x: Number(find[0]), y: Number(find[1]) };
                    }
                    this.skillCdReset = [];          //  当前重置技能时
                    this.skillArr = [];               //  skillid  存放的数组
                    this.skillCdArr = [];             //  当前cd值  递增  达到cd上限时 可释放该技能
                    this.skillCdConfig = [];          //  存放cd配置
                    this.arrSkillInfo = [];

                    this._gskills.forEach(skill => {
                        let skillid = Number(skill) % 10000 + 30000;
                        if (!!GetConfig("dbEffInfo")[skillid]) {
                            this.skillArr.push(skillid);
                            this.skillCdArr.push(999);
                            this.skillCdConfig.push(GetConfig("dbEffInfo")[skillid].cd);
                            this.skillCdReset.push(0);
                            this.arrSkillInfo.push(gUtils.deepClone(GetConfig("dbEffInfo")[skillid]))
                        }
                        if (!!GetConfig("dbSkillB")[skillid]) {
                            let arr = gUtils.deepClone(GetConfig("dbSkillB")[skillid]);
                            if (!arr) return;
                            for (let i = 0; i < arr.length; ++i) {
                                this.pushSkillBack(arr[i]);
                            }
                        }
                    })
                    this.mainSkillCd = this.skillCdConfig[0] || 100;
                } break;
                case "J019": // 原J005 //
                    if (binit) break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.getHpRatio() <= ele[2] / 100;
                    })) {
                        this.skillCdArr[0] = 999;
                        this.addMagic(ele[3]);
                    }
                    break;
                case "J020": { // 原刘秀帝怒   // 血量低于多少时 触发一次复仇魔焰
                    if (binit) break;
                    if (this.backState[ele[0] + ele[1]] || this.battleInfo.hp > this.initInfo.hp * ele[1] / 100) break;
                    this.backState[ele[0] + ele[1]] = true;
                    let hurminfo = this.getHurmInfo(this.getNowAttri("atk") * ele[2] / 100, 2);
                    this.addMagic(ele[3]);
                    let tarr = this.getTargetByTypeState(1, 80, 80, 2, false, FILTERMAP.yinshen);
                    for (let i = 0; i < tarr.length; ++i) {
                        tarr[i].getCalHurm(this, hurminfo, "skill", 1);
                        tarr[i].pushOneBuff("stun", ele[4] * 60, null, this);
                    }
                    this.pushOneBuff("b18101s", 60 * 60, null, this);
                    this.skillHitArr.push("18101s");
                    if (ele.length > 6) this.pushOneBuff(ele[5], 5 * 60, null, this);
                } break;
                case "J021":
                    if (binit) break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.getHpRatio() <= ele[2] / 100;
                    })) {
                        this.getCalHeal(this, this.getHealInfo(this.initInfo.hp * ele[3] / 100), "skill");
                        this.skillCdArr[0] = 999;
                        this.addMagic(200);
                    }
                    break;
                case "J022":
                    if (this.battleInfo.hp > 0) break;
                    if (bnodead) break;
                    if (this.isBackCdOk(ele[0] + index, ele[1])) {
                        bnodead = true;
                        this.battleInfo.hp = -changehp;
                        if (!this.Invisible || this.Invisible < ele[2] * 60) this.Invisible = ele[2] * 60;
                        this.pushOneBuff(ele[3], ele[4] * 60, null, this);
                        this.pushOneBuff("wudi", 1 * 60, null, this);
                    }
                    break;
                case "J023": { // 虎典韦 生命首次低于多少时
                    if (binit) break;
                    if (this.backState[ele[0] + ele[1]] || this.battleInfo.hp > this.initInfo.hp * ele[1] / 100) break;
                    this.backState[ele[0] + ele[1]] = true;
                    let attval = Math.min(this.initInfo.hp * ele[2] / 100, this.getNowAttri("atk") * 10);
                    let hurminfo = this.getHurmInfo(attval, ele[3]);
                    let tarr = this.getTargetByTypeState(1, 80, 80, 2, false, FILTERMAP.yinshen);
                    for (let i = 0; i < tarr.length; ++i) {
                        tarr[i].getCalHurm(this, hurminfo, "skill", 1);
                    }
                    this.pushOneBuff("b40411", ele[4] * 60, null, this);
                    this.skillHitArr.push(40411);
                    if (ele.length > 6) this.pushOneBuff(ele[5], 2 * 60, null, this);
                } break;
                case "J024": {
                    if (binit) break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.battleInfo.hp <= this.initInfo.hp * ele[2] / 100;
                    })) {
                        let tarr = this.getTargetByTypeState(2, ele[3], ele[3], 1, true);
                        tarr.forEach(tar => {
                            tar.getCalHeal(this, this.getHealInfo(tar.initInfo.hp * ele[4] / 100), "skill");
                        })
                    }
                } break;
                case "J025": {// 血量首次低于x 时回血
                    if (binit) break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.battleInfo.hp <= this.initInfo.hp * ele[2] / 100;
                    })) {
                        this.getCalHeal(this, this.getHealInfo(this.initInfo.hp * ele[3] / 100), "skill");
                    }
                }
                    break;
                case "J026": {
                    if (this.battleInfo.hp > 0) break;
                    // 检查队友是否都隐身
                    let bInv = false;
                    let tarr = this.getTargetByTypeState(2, -1, null, 1, true);
                    for (let i = 0; i < tarr.length; ++i) {
                        if (!tarr[i].Invisible || tarr[i].Invisible < 0) {
                            break;
                        }
                    }
                    if (!bInv) {
                        if (this.isBackCdOk(ele[0] + index, ele[1])) {
                            this.battleInfo.hp = 1;
                            this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                        }
                    }
                } break;
            }
        });
    }

    BackByMpChange() {
        if (!this.m_objSkillBack["M"]) return;
        this.m_objSkillBack["M"].forEach((ele, index) => {
            let ratio = 0;
            switch (ele[0]) {
                case "M001": {// 原M001 // 能量越高 属性越高
                    let _ratio = this.nowmagic / this.maxmagic;
                    let _num = _ratio * ele[2] / 100;
                    this.setStlAttriNum(ATTRIMAP.other, ele[1], ele[0] + index, _num);
                } break;
                case "M002": // 原M003 // 满能量后 推入一个buff 有概率有冷却
                    if (this.nowmagic < this.maxmagic) break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.bTools.getRandom() <= ele[2] / 100;
                    })) {
                        this.pushOneBuff(ele[3], ele[4] * 60, null, this);
                    }
                    break;
                case "M003": {
                    this.setStlAttriNum(ATTRIMAP.other, ele[1], ele[0] + index, 0);
                    if (this.nowmagic < this.maxmagic) break;
                    this.setStlAttriNum(ATTRIMAP.other, ele[1], ele[0] + index, ele[2] / 100);
                } break;
            }
        })
    }

    // 某个队友死了的话
    BackByTmateDie(target) {
        if (!this.m_objSkillBack["K"]) return;
        this.m_objSkillBack["K"].forEach(ele => {
            switch (ele[0]) {
                case "K001": // 原K006 // 队友死了 相应技能cd 重置
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        this.skillCdArr[this.getSkillIndex(ele[2])] = 999;
                    }
                    break;
                case "K002": // 原K004  回血 回蓝
                    this.getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * ele[1] / 100), "skill");
                    this.addMagic(ele[2]);
                    if (ele.length > 4) {
                        let tarr = this.getTargetByType(2, -1, null, null, true);
                        if (tarr.length > 0) {
                            let tar = tarr[this.bTools.getRandomInt(0, tarr.length - 1)];
                            tar.getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * ele[1] / 100), "skill");
                            tar.addMagic(ele[2]);
                        }
                    }
                    break;
                case "K003": // 队友死了 给自己加buff
                    if (this.isBackCdOk(ele[0] + ele[2], ele[1])) {
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    }
                    break;
                case "K004":     //   蔡文姬 附近 队友死 给所有敌方武将附加buff
                    if (this.checkIsInAttArea(target)) {
                        let tarr = this.getTargetByType(1, -1);
                        for (let i = 0; i < tarr.length; ++i) {
                            tarr[i].pushOneBuff(ele[1], ele[2] * 60, null, this);
                        }
                    }
                    break;
                case "K005":
                    if ((!!this.master && this.master.initTeam == target.initTeam && this.master._id == target._id) || (!!this.separaUnit[0] && this.separaUnit[0].initTeam == target.initTeam && this.separaUnit[0]._id == target._id)) {
                        this.pushOneBuff(ele[1], ele[2] * 60, null, this);
                        this.getCalHeal(this, this.getHealInfo(this.initInfo.hp * ele[3] / 100), "skill");
                        if (ele.length > 5) {
                            this.addMagic(ele[4] || 0);
                        }
                    }
                    break;
                case "K006": // 配合许褚3技能R009被动
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        this.backCd["R009"] = 999;
                    }
                    break;
            }
        })
    }

    // 某个敌人死了的话
    BackByEnemyDie(target) {
        if (!this.m_objSkillBack["L"]) return;
        this.m_objSkillBack["L"].forEach((ele, index) => {
            let xdis = 0;
            let ydis = 0;
            switch (ele[0]) {
                case "L001": // 某个敌人死了 重置技能cd
                    if (this.isBackCdOk(ele[0] + index, ele[1])) {
                        this.skillCdArr[this.getSkillIndex(ele[2])] = 999;
                    }
                    break;
                case "L002": // 在攻击范围内的敌人死亡 给自己加buff
                    if (this.checkIsInAttArea(target)) {
                        this.pushOneBuff(ele[1], ele[2] * 60, null, this);
                    }
                    break;
                case "L003": {  // 范围内敌人死亡时  自己加敌人攻击的% 回复生命%
                    this._GetJianGe()
                    xdis = Math.abs(target.x - this.x);
                    ydis = Math.abs(target.y - this.y);
                    // dc 回血距离计算问题
                    let cfg_dis = ele[1] * ele[1] * __AttDisScale.x * __AttDisScale.x
                    if (!(xdis * xdis + ydis * ydis <= cfg_dis)) break;
                    this.setStlAttriNum(ATTRIMAP.extra, "atk", ele[0] + target._id, target.battleInfo.atk * ele[2] / 100);
                    this.getCalHeal(this, this.getHealInfo(this.initInfo.hp * ele[3] / 100), "skill");
                    if (ele.length > 5) {
                        this.pushOneBuff(ele[4], ele[5] * 60, null, this);
                    }
                } break;
                case "L004": // 敌人死亡 给自己加buff
                    if (this.isBackCdOk(ele[0] + ele[2], ele[1])) {
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    }
                    break;
                case "L005": // 敌人死亡 计数 改变效果
                    if (!this.backState["L005"]) this.backState["L005"] = 2;
                    else this.backState["L005"] += 2;
                    this.setStlAttriNum(ATTRIMAP.other, ele[1], ele[2], ele[3] / 100 * Math.max(0, ele[4] - this.backState["L005"]));
                    break;
            }
        })
    }
    // 死了会给敌人造成什么
    BackByDie(target) {
        if (!this.m_objSkillBack["S"]) return;
        this.m_objSkillBack["S"].forEach(ele => {
            switch (ele[0]) {
                case "S001":  // 死了给敌人造成buff
                    target.pushOneBuff(ele[1], ele[2] * 60, null, this);
                    if (ele.length > 4) {
                        target.addMagic(-ele[3]);
                    }
                    break;
            }
        })
    }

    /***
     * 死了以后会做什么
     * 
     */
    BackBySelfDie(source) {
        if (!this.m_objSkillBack["b"]) return;
        for (let i = this.m_objSkillBack["b"].length - 1; i >= 0; --i) {
            let ele = this.m_objSkillBack["b"][i];
            switch (ele[0]) {
                case "b001": {   // 死了以后 给血量最低队友队友加buff
                    let tarr = this.getTargetBySort({ target: 2, doarea: -1 }, "hp", "inc");
                    if (tarr.length > 0) {
                        tarr[0].pushOneBuff(ele[1], ele[2] * 60, null, this);
                    }
                } break;
                case "b002":
                    break;
                case "b003": {
                    let tarr = this.getTargetByType(2, -1, null, null, null, true);
                    if (tarr.length <= 0) break;
                    tarr.forEach((ele_t) => {
                        if (ele_t._occu != 6 && ele_t._occu2 != 6) return;
                        ele_t.battleInfo.pdam += (ele[1] / 100) * Math.pow(2, ele[2]) - ele[1];
                    })
                } break;
                case "b004": {   // 死了以后 给最后一击的敌人buff
                    if (source) {
                        let area = Math.min(Math.floor(this.steps / 60), 6);
                        let param = 5 + area * ele[1];
                        if (source._star > this._star) param /= 2;
                        source.pushOneBuff(ele[2], ele[3] * 60, [param, param], this);
                        if (ele.length > 5) { // 专属效果
                            let tarr = this.getTargetByType(2, -1);
                            if (tarr.length <= 0) break;
                            tarr.forEach((ele_t) => {
                                ele_t.pushOneBuff(ele[4], ele[5] * 60, 5 + this.killnum * 5, this);
                            })
                        }
                    }
                } break;
                case "b005": {
                    if (source) {
                        if (((!this.backCd[ele[0]] && this.backCd[ele[0]] != 0) || this.backCd[ele[0]] > ele[1] * 60)) {
                            this.backCd[ele[0]] = 0;
                            this.battleInfo.hp = 1;
                            this.initInfo.hp = 1;
                            this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                        }
                    }
                }
            }
            ele[ele.length - 1] -= 1;
            if (ele[ele.length - 1] <= 0) this.m_objSkillBack["b"].splice(i, 1);
        }
    }

    /**
     * 
     * @param { 加蓝量
     * } type 
     */
    BackByAddMp(num) {
        if (!this.m_objSkillBack["c"]) return num;
        for (let i = this.m_objSkillBack["c"].length - 1; i >= 0; --i) {
            let ele = this.m_objSkillBack["c"][i];
            switch (ele[0]) {
                case "c001":  // 不会扣蓝
                    if (num <= 0) num = 0
                    break;
            }
        }
        return num;
    }

    /*
    *  被动技能天生免疫某buff 状态
    */
    BackByImmune(type) {
        if (!this.m_objSkillBack["C"]) return false;
        // let arr = this.m_objSkillBack["C"][0];
        for (let i = this.m_objSkillBack["C"].length - 1; i >= 0; --i) {
            let ele = this.m_objSkillBack["C"][i];
            switch (ele[0]) {
                case "C001":
                    if (ele.indexOf(type) >= 0) return true;
                    break;
                case "C002": // 神状态下免疫
                    if (this.getBuffNumByType("leiting") > 1 && ele[1].indexOf(type) >= 0) {
                        return true;
                    }
                    break;
            }
        }
        return false;
    }


    /**
     *  被动技能 对普攻的英雄
     */
    BackForNormalAtt(hurminfo, target) {
        if (!this.m_objSkillBack["N"]) return;
        this.m_objSkillBack["N"].forEach(ele => {
            let tarr = []
            switch (ele[0]) {
                default:
                    break;
            }
        })
    }

    BackByNormAction() {
        if (this.backState["R009"]) this.skillHitArr.push(40291);  // 特殊许褚显示效果
        if (!this.m_objSkillBack["P"]) return;
        this.m_objSkillBack["P"].forEach((ele, index) => {
            switch (ele[0]) {
                case "P001":    // 关羽强化普攻
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        this.pushOneBuff("atkadd", 3600, null, this);
                        this.backNormCount["P001"] = ele[2];
                    }
                    break;
                case "P002":    // 平砍时，有概率给自己推入buff，有冷却时间
                    if (this.isBackCdOk(ele[0] + ele[3].toString(), ele[1], () => {
                        return this.bTools.getRandom() <= ele[2] / 100;
                    })) {
                        if (typeof ele[3] == "string" || typeof ele[3] == "number") {  // 如果不是string 就是数组
                            this.pushOneBuff(ele[3], ele[4] * 60, null, this);
                        } else {
                            ele[3].forEach((buff, idx) => {
                                this.pushOneBuff(buff, ele[4][idx] * 60, null, this);
                            });
                        }
                    }
                    break;
                case "P003": {   // 平砍时 给周围加攻击
                    let tarr = this.getTargetByType(2, ele[1], ele[1], 2);
                    for (let j = 0; j < tarr.length; ++j) {
                        tarr[j].pushOneBuff(ele[2], ele[3] * 60, null, this);
                    }
                } break;
                case "P004": {
                    if (this.backNormCount[ele[0]] == 0) break;
                    if (this.isStateCountOk(ele[0] + index, ele[1])) {
                        this.pushOneBuff("atkadd", 3600, null, this);
                        this.backNormCount[ele[0]] = ele[2];
                    }
                } break;
                case "P005": {
                    if (this.backNormCount[ele[0]] == 0) break;
                    if (this.getBuffNumByType("shalu") > 1 && this.bTools.getRandom() < ele[1] / 100) {
                        this.pushOneBuff("atkadd", 3600, null, this);
                        this.backNormCount[ele[0]] = ele[2];
                    }
                } break;

            }
        })
    }

    // 受到时间变化而影响的被动
    BackByTime() {
        if (!this.m_objSkillBack["Q"]) return;
        this.m_objSkillBack["Q"].forEach((ele, index) => {
            switch (ele[0]) {
                case "Q001":  // 每隔x秒 给自己一个 buff 并且清除所有负面状态 给攻击力最高的队友1个
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                        if (ele.length > 5) {
                            let tarr = this.getTargetBySort({ target: 2, doarea: -1, target_unself: true }, "atk", "dec");
                            if (tarr.length > 0) {
                                tarr[0].pushOneBuff(ele[2], ele[3] * 60, null, this);
                            }
                        }
                    }
                    break;
                case "Q002": // 原Q012  //  每隔 x 秒 根据目标 给你随机数量人物加buff  
                    if (this.isBackCdOk(ele[0] + ele[4], ele[1])) {
                        let tarr = this.getTargetByTypeState(ele[2], -1);
                        if (tarr.length > ele[3]) {
                            let rIndex = 0;
                            while (rIndex < ele[3]) {
                                let rint = this.bTools.getRandomInt(0, tarr.length - 1);
                                tarr[rint].pushOneBuff(ele[4], ele[5] * 60, null, this);
                                tarr.splice(rint, 1);
                                rIndex++;
                            }
                        } else {
                            tarr.forEach(tar => {
                                tar.pushOneBuff(ele[4], ele[5] * 60, null, this);
                            });
                        }
                    }
                    break;
                case "Q003":  // 原Q007 诸葛亮 每隔多少秒驱散负面状态
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        this.clearBuff(2, 2);
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                        if (ele.length > 5 && ele[4]) this.skillHitArr.push(ele[4]);
                    }
                    break;
                case "Q004": // 原Q003     //  小乔4 每隔1秒 如果有这些状态 则 回血 会能量
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.getBuffNumByType("stun") > 1 || this.getBuffNumByType("fear") > 1 || this.getBuffNumByType("silent") > 1 || this.getBuffNumByType("yazhi") > 1;
                    })) {
                        this.getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * ele[2] / 100), "skill");
                        this.addMagic(ele[3]);
                    }
                    break;
                case "Q005": // 原Q004 // 每隔多少秒给血最少队友 加一个buff
                    if (this.isBackCdOk(ele[0] + ele[2], ele[1])) {
                        let tar = this.getMinHpFriend();
                        if (!tar) break;
                        tar.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    }
                    break;
                case "Q006":  // 原Q008 // 每隔x秒 给自己加一个buff
                    if (this.isBackCdOk(ele[0] + ele[2], ele[1])) {
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    }
                    break;
                case "Q007": // 每隔多少秒 大乔3技能 周围人友军加血 敌人扣血
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        let tarr = this.getTargetByTypeState(3, 80, 80, 2, false, FILTERMAP.yinshen);
                        tarr.forEach(tar => {
                            if (tar.initTeam != this.nowTeam) {
                                let atval = Math.min(this.getNowAttri("atk") * ele[3], tar.initInfo.hp * ele[2] / 100);
                                tar.getCalHurm(this, this.getHurmInfo(atval, 2), "skill");
                            } else {
                                tar.getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * ele[4] / 100), "skill");
                            }
                        });
                    }
                    break;
                case "Q008": { // 某个属性随时间变化 
                    if (this.steps == 0) this.setStlAttriNum(ATTRIMAP.other, ele[1], ele[0] + index, ele[2] / 100);
                    if (this.steps % 60 == 0 && this.steps != 0) {
                        if (!this.backState[ele[0] + index] && this.backState[ele[0] + index] != 0) {
                            this.backState[ele[0] + index] = 0;
                        }
                        this.backState[ele[0] + index]++;
                        let _max = ele[4] * 10;
                        let _trend = Math.pow(-1, (ele[2] > 0 ? 1 : 2) + Math.floor(this.backState[ele[0] + index] / 10));
                        let _times = 0;
                        _times = (this.backState[ele[0] + index] % 10) || 10;
                        let _num = 0;
                        if (_trend > 0) _num = ele[4] * _times / 100;
                        else _num = (_max - ele[4] * _times) / 100;
                        this.setStlAttriNum(ATTRIMAP.other, ele[1], ele[0] + index, _num);
                    }
                } break;
                case "Q009": // 每隔多少秒 潘璋4技能 周围人敌人扣血 自己回血
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        let tarr = this.getTargetByTypeState(1, 80, 80, 2, false, FILTERMAP.yinshen);
                        tarr.forEach(tar => {
                            let atval = this.getNowAttri("atk") * ele[2] / 100;
                            tar.getCalHurm(this, this.getHurmInfo(atval, 2), "skill");
                        })
                        this.getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * ele[3] / 100), "skill");
                        this.skillHitArr.push(ele[4]);
                    }
                    break;
                case "Q010":  // 随着时间推移  全基础属性增加
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        if (!this.backState[ele[0]]) this.backState[ele[0]] = 0;
                        this.backState[ele[0]]++;
                        let _count = this.backState[ele[0]]
                        let base = ["atk", "def", "mdef"];
                        for (let i = 0; i < base.length; ++i) {
                            this.setStlAttriNum(ATTRIMAP.other, base[i], ele[0] + index, ele[2] / 100 * _count);
                        }
                    }
                    break;
                case "Q011":  // 原Q005 每隔多少秒 周围队友加buff
                    if (this.isBackCdOk(ele[0] + ele[3], ele[1])) {
                        let tarr = this.getTargetByTypeState(2, ele[2], ele[2], 1);
                        tarr.forEach(tar => {
                            tar.pushOneBuff(ele[3], ele[4] * 60, null, this);
                        });
                    }
                    break;
                case "Q012":  //  每隔x秒 给一个攻击力最高敌人加一个状态 
                    if (this.isBackCdOk(ele[0] + ele[2], ele[1])) {
                        let tarr = this.getTargetBySort({ target: 1, doarea: -1 }, "atk", "dec", FILTERMAP.yinshen);
                        if (tarr.length > 0) {
                            tarr[0].pushOneBuff(ele[2], ele[3] * 60, null, this);
                            if (ele.length > 5) {
                                this.pushOneBuff(ele[4], ele[5] * 60, null, this);
                            }
                        }
                    }
                    break;
                case "Q013": // 每隔多少秒 陈宫3技能 周围人友军加血 
                    if (this.isBackCdOk(ele[0] + index + ele[2], ele[1])) {
                        let tarr = this.getTargetByTypeState(2, ele[2], ele[2], 2, false);
                        tarr.forEach(tar => {
                            tar.getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * ele[3] / 100), "skill");
                        });
                    }
                    break;
                case "Q014": {
                    let tarr = this.getTargetByTypeState(1, ele[1], ele[1], 2, true, FILTERMAP.all);
                    if (tarr.length > 0) {
                        this.setStlAttriNum(ATTRIMAP.other, ele[2], ele[0] + index, ele[4] / 100 * tarr.length);
                        this.setStlAttriNum(ATTRIMAP.other, ele[3], ele[0] + index, ele[4] / 100 * tarr.length);
                    }
                } break;
                case "Q015": // 每隔多少秒 自己如果有血盾，则对周围x 敌人造成x 法术伤害 兵法
                    if (!this.getExtraHp()) break;
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        let tarr = this.getTargetByTypeState(1, ele[2], ele[2], 1, false, FILTERMAP.yinshen);
                        tarr.forEach(tar => {
                            tar.getCalHurm(this, this.getHurmInfo(this.getNowAttri("atk") * ele[3] / 100, 2), "skill");
                        })
                    }
                    break;
                case "Q016": { // 每隔x秒使血量最低的友军进入
                    if (this.isBackCdOk(ele[0] + index, ele[1])) {
                        let tarr = this.getTargetBySort({ target: 2, doarea: -1 }, "hp", "inc");
                        if (tarr.length > 0) {
                            tarr[0].pushOneBuff(ele[2], ele[3] * 60, null, this);
                        }
                    }
                } break;
                case "Q017": { // 每隔x 使血量最低的3个队友恢复生命
                    if (this.isBackCdOk(ele[0] + index, ele[1])) {
                        let tarr = this.getTargetBySort({ target: 2, doarea: -1 }, "hp", "inc");
                        for (let i = 0; i < tarr.length && i < ele[2]; ++i) {
                            tarr[i].getCalHeal(this, this.getHealInfo(this.getNowAttri("atk") * ele[3] / 100), "skill");
                        }
                    }
                } break;
                case "Q018":
                    if (this.getBuffNumByType("leiting") > 1) {
                        if (this.isStateCountOk(ele[0], ele[1])) {
                            this.clearBuff(2, 2);
                        }
                        this.setStlAttriNum(ATTRIMAP.other, ele[2], ele[0] + index, 0);
                    } else {
                        this.backState[ele[0]] = 0;
                        this.setStlAttriNum(ATTRIMAP.other, ele[2], ele[0] + index, ele[3] / 100);
                    }
                    break;
                case "Q019": // 每隔x秒 自己随机获得buff
                    if (this.isBackCdOk(ele[0] + index, ele[1])) {
                        let buffindex = this.bTools.getRandomInt(0, ele[2].length - 1);
                        this.pushOneBuff(ele[2][buffindex], ele[3] * 60, null, this);
                        // 张飞添加特效
                        this.skillHitArr.push(17111);
                    }
                    break;
                case "Q020": // 配合R009 许褚3技能
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        this.backState["R009"] = 1;
                    }
                    break;
                case "Q021": // 每隔一定时间某属性增加
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        if (!this.backState[ele[0] + index]) this.backState[ele[0] + index] = 1;
                        else this.backState[ele[0] + index]++;
                        this.setStlAttriNum(ATTRIMAP.other, ele[2], ele[0] + index, ele[3] / 100 * this.backState[ele[0] + index])
                    }
                    break;
                case "Q022": // 每隔一定时间自己回血
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        this.getCalHeal(this, this.getHealInfo(this.initInfo.hp * ele[2] / 100), "skill");
                    }
                    break;
                case "Q023":
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.getHpRatio() >= ele[2] / 100;
                    })) {
                        this.changeNowHp(-this.initInfo.hp * ele[3] / 100);
                    }
                    break;
                case "Q024": // 每秒恢复血量 如果满血则回蓝
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        // 算出来现在是第几个间隔
                        if (!this.backState[ele[0]]) this.backState[ele[0]] = 0;
                        let ratio = ele[2] - Math.floor(this.backState[ele[0]] / 2) * ele[3];
                        ratio = Math.max(1, ratio);
                        if (this.battleInfo.hp >= this.initInfo.hp) this.addMagic(this.maxmagic * ratio / 100);
                        else this.getCalHeal(this, this.getHealInfo(this.initInfo.hp * ratio / 100), "skill");
                        this.backState[ele[0]]++;
                    }
                    break;
                case "Q025":  //  每隔x秒 给x个防御力最高的友军加一个状态 
                    if (this.isBackCdOk(ele[0] + ele[2], ele[1])) {
                        let tarr = this.getTargetBySort({ target: 2, doarea: -1 }, "def", "dec", FILTERMAP.yinshen);
                        if (tarr.length > 0) {
                            for (let i = 0; i < tarr.length && i < ele[3]; ++i) {
                                tarr[i].pushOneBuff(ele[4], ele[5] * 60, null, this);
                            }
                        }
                    }
                    break;
                case "Q026":  //  每隔x秒 给一个攻击力最高敌人加一个状态 且只能调用x次
                    if (this.isBackCdOk(ele[0] + ele[2], ele[1], () => {
                        return !this.backState[ele[0] + ele[2]] || this.backState[ele[0] + ele[2]] < ele[4];
                    })) {
                        if (!this.backState[ele[0] + ele[2]]) this.backState[ele[0] + ele[2]] = 0;
                        this.backState[ele[0] + ele[2]]++;
                        let tarr = this.getTargetBySort({ target: 1, doarea: -1 }, "atk", "dec", FILTERMAP.yinshen);
                        if (tarr.length > 0) {
                            tarr[0].pushOneBuff(ele[2], ele[3] * 60, null, this);
                        }
                    }
                    break;
                case "Q027": // 每隔多少秒 给周围敌军加buff
                    if (this.isBackCdOk(ele[0] + ele[3], ele[1])) {
                        let tarr = this.getTargetByTypeState(1, ele[2], ele[2], 1, false, FILTERMAP.yinshen);
                        tarr.forEach(tar => {
                            tar.pushOneBuff(ele[3], ele[4] * 60, null, this);
                        })
                    }
                    break;
                case "Q028": // 根据职业推入buff
                    if (this.isBackCdOk(ele[0], ele[1])) {
                        this.skillHitArr.push(17191);
                        let tarr = this.getTargetByTypeState(2, -1);
                        for (let j = 0; j < tarr.length; ++j) {
                            for (let k = 0; k < 5; ++k) {
                                if (tarr[j].isOccu(k + 1)) {
                                    tarr[j].pushOneBuff(ele[2][k], ele[3] * 60, null, this);
                                }
                            }
                        }
                    }
                    break;
            }
        })
    }

    BackByMiss(source, misstype) {
        if (!this.m_objSkillBack["e"]) return;
        for (let i = this.m_objSkillBack["e"].length - 1; i >= 0; --i) {
            let ele = this.m_objSkillBack["e"][i];
            switch (ele[0]) {
                case "e001": // 闪避后推入一个被动 有cd
                    if (this.isBackCdOk(ele[0] + i, ele[1], () => {
                        return !this.backState["e001"];
                    })) {
                        this.pushSkillBack(gUtils.deepClone(ele[2]), null);
                        this.backState["e001"] = 1;
                    }
                    break;
                case "e002": // 闪避后推入一个buff 有cd
                    if (this.isBackCdOk(ele[0] + i, ele[1])) {
                        this.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    }
                    break;
                case "e003": // 闪避成功后给伤害来源 推入一个buff
                    if (source) {
                        source.pushOneBuff(ele[1], ele[2] * 60, null, this);
                    }
                    break;
                case "e004": { // 某种类型闪避后闪避后清空某数据 D023 D024
                    if (misstype != ele[1]) break;
                    this.backState[ele[2]] = 0;
                    this.setStlAttriNum(ATTRIMAP.other, ele[3], ele[2], 0);
                } break;
                case "e005": {
                    if (this.isBackCdOk(ele[0] + i, ele[1], () => {
                        return !!source;
                    })) {
                        if (typeof ele[2] == "string" || typeof ele[2] == "number") {
                            source.pushOneBuff(ele[2], ele[3] * 60, null, this);
                        } else {
                            source.pushOneBuff(ele[2][this.bTools.getRandomInt(0, ele[2].length - 1)], ele[3] * 60, null, this);
                        }
                    }
                } break;
            }
        }
    }

    BackByHurmInfo(hurminfo) {
        if (!this.m_objSkillBack["d"]) return;
        for (let i = this.m_objSkillBack["d"].length - 1; i >= 0; --i) {
            let ele = this.m_objSkillBack["d"][i];
            switch (ele[0]) {
                // case "d001":
                //     if(this.getExtraHp()) {
                //         hurminfo.rdc -= Number(ele[1]) / 100;
                //     }
                //     break;
                case "d001": {//新 对生命值低于x的敌人破甲提升35
                    if (hurminfo.hurmtype != 1) break;
                    if (this.battleInfo.hp > this.initInfo.hp * ele[1] / 100) break;
                    let nowppthr = hurminfo.ppthr;
                    let defval = this.getNowAttri("def") * (1 - hurminfo.ppthr - ele[2] / 100);
                    defval = Math.max(defval, 0);
                    hurminfo.defval = defval;
                }
                    break;
                case "d002": {
                    if (this.getExtraHp()) {
                        hurminfo[ele[1]] += Number(ele[2]) / 100;
                    }
                } break;

            }
        }
    }

    // 计算伤害时被动影响  攻击方调用
    BackByCalHurm(hurminfo, ptype, target) {
        if (!this.m_objSkillBack["R"]) return;
        for (let index = this.m_objSkillBack["R"].length - 1; index >= 0; index--) {
            let ele = this.m_objSkillBack["R"][index];
            switch (ele[0]) {
                case "R001": // 对中毒的单位 增加暴击  专属增加buff
                    if (target.getBuffNumByType("poison") <= 1) break;
                    hurminfo.pcr += ele[1] / 100;
                    if (ele.length > 3) {
                        target.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    }
                    break;
                case "R002":  // 对血量低于自己  x伤害 必定暴击
                    if (ele[1] === "all" || ptype === ele[1]) {
                        if (target && target.battleInfo.hp < this.battleInfo.hp) {
                            hurminfo.pcr = 2;
                        }
                    }
                    break;
                case "R003": // 原 R008 // 对有血护盾的人伤害提高
                    if (target.getExtraHp()) {
                        hurminfo[ele[1]] += Number(ele[2]) / 100;
                    }
                    break;
                case "R004":  // 自己有血护盾 伤害属性变化
                    if (this.getExtraHp()) {
                        hurminfo[ele[1]] += Number(ele[2]) / 100;
                    }
                    break;
                case "R005": //原R010 // 攻击有buff的目标 获得buff  有概率有冷却 兵法
                    if (target.buff.length <= 0) break;
                    if (this.isBackCdOk(ele[0], ele[1], () => {
                        return this.bTools.getRandom() <= ele[2] / 100;
                    })) {
                        let stateKey = ele[0] + ele[3];
                        if (!this.backState[stateKey]) this.backState[stateKey] = 0;
                        this.backState[stateKey] += 1;
                        this.pushOneBuff(ele[3], 100 * 60, null, this);
                        // 首次达到10层 推入一个buff
                        if (this.backState[stateKey] >= 10 && ele.length > 4) {
                            this.backState[stateKey] = -999;
                            this.pushOneBuff(ele[4], ele[5] * 60, null, this);
                        }
                    }
                    break;
                case "R006": // 原R007  // 对血量低于35% 必定暴击
                    if (this.getSkillIndex(ele[1]) == this.getSkillIndex(hurminfo.skillid) && target.battleInfo.hp <= target.initInfo.hp * ele[2] / 100) { // 如果是主动技能
                        hurminfo.pcr = 2;
                    }
                    break;
                case "R007": // 第四下 平砍无视敌军护甲
                    if (ptype != "normal" || (hurminfo.attextra && !!FILTERATT[hurminfo.attextra.htype])) break;
                    if (this.isStateCountOk(ele[0], ele[1])) {
                        hurminfo[ele[2]] += ele[3] / 100;
                    }
                    break;
                case "R008": // 平砍 第x下回能量  减cd
                    if (ptype != "normal" || (hurminfo.attextra && !!FILTERATT[hurminfo.attextra.htype])) break;
                    if (this.isStateCountOk(ele[0] + index, ele[1])) {
                        this.addMagic(ele[2]);
                        target.addMagic(-ele[2]);
                        this.skillCdArr[this.getSkillIndex(ele[3])] += Number(ele[4]);
                    }
                    break;
                case "R009":
                    if (ptype != "normal" || hurminfo.hurmtype != 1 || (hurminfo.attextra && !!FILTERATT[hurminfo.attextra.htype])) break;
                    if (this.backState["R009"] == 1) {
                        this.backState["R009"] = 0;
                        hurminfo.ppthr += ele[2] / 100;
                        hurminfo.attval *= ele[1] / 100;
                    }
                    break;
                case "R010": { // 攻击生命高于x%的人 提高破甲 和 穿透
                    if (target.getHpRatio() < ele[1] / 100) break;
                    hurminfo.ppthr += ele[2] / 100;
                    hurminfo.pmthr += ele[2] / 100;
                } break;
                case "R011": {  // 攻击生命低于多少 某伤害公式属性增加
                    if (ele[1] === "all" || ptype === ele[1]) {
                        if (target && target.getHpRatio() <= ele[2] / 100) {
                            hurminfo[ele[3]] += ele[4] / 100;
                        }
                    }
                } break;
                case "R012": {  // 平砍概率提升某攻击属性
                    if (ptype != "normal" || (hurminfo.attextra && !!FILTERATT[hurminfo.attextra.htype])) break;
                    if (this.bTools.getRandom() <= ele[1] / 100) {
                        if (typeof ele[2] == "string" || typeof ele[2] == "number") {
                            if (ele[2] == "attval") hurminfo[ele[2]] += this.battleInfo.atk * ele[3] / 100;
                            else hurminfo[ele[2]] += ele[3] / 100;
                        } else {
                            for (let i = 0; i < ele[2].length; ++i) {
                                if (ele[2] == "attval") hurminfo[ele[2][i]] += this.battleInfo.atk * ele[3][i] / 100;
                                else hurminfo[ele[2][i]] += ele[3][i] / 100;
                            }
                        }
                        if (ele.length > 5) {
                            if (typeof ele[4] == "string" || typeof ele[4] == "number") {
                                target && target.pushOneBuff(ele[4], ele[5] * 60, null, this);
                            } else {
                                for (let i = 0; i < ele[4].length; ++i) {
                                    target && target.pushOneBuff(ele[4][i], ele[5][i] * 60, null, this);
                                }
                            }
                        }
                    }
                } break;
                case "R013": {
                    if (this.getSkillIndex(ele[2]) != this.getSkillIndex(hurminfo.skillid)) break;
                    if (this.bTools.getRandom() > ele[1] / 100) break;
                    this.backCd[ele[3]] += ele[4];
                } break;
                case "R014": {
                    if (this.getSkillIndex(ele[2]) != this.getSkillIndex(hurminfo.skillid)) break;
                    if (this.bTools.getRandom() > ele[1] / 100) {
                        this.backCd[ele[3]] += ele[4];
                    } else {
                        this.skillCdArr[0] += ele[4];
                    }
                } break;
            }
        }
    }

    BackByHeal(target, healinfo) {
        if (!this.m_objSkillBack["T"]) return;
        for (let index = this.m_objSkillBack["T"].length - 1; index >= 0; index--) {
            let ele = this.m_objSkillBack["T"][index];
            switch (ele[0]) {
                case "T001":  //原T003 治疗时 有概率 给目标增加buff 并给自己回蓝
                    if (ele[1] < 100 && this.bTools.getRandom() > ele[1] / 100) break;
                    this.addMagic(ele[4]);
                    if (target && target.initTeam == this.initTeam) { // 是友军
                        target.pushOneBuff(ele[2], ele[3] * 60, null, this);
                    }
                    break;
                case "T002":  // 治疗时 有概率 驱散n个debuff
                    if (this.bTools.getRandom() > ele[1] / 100) break;
                    for (let i = 0; i < ele[2]; ++i) {
                        this.dispelOneBuff(2, 2);
                    }
                    break;
                case "T003": { // 每次治疗时会对目标周围范围内生命最低的友军
                    if (healinfo.sourcetype == "extra") break;
                    if (healinfo.sourcetype != "xixue" && this.bTools.getRandom() <= ele[1] / 100) {
                        let tarr = target.getTargetBySort({ target: 2, doarea: ele[2], areatype: 1, target_unself: true }, "hp", "inc");
                        if (tarr.length > 0) {
                            let hinfo = gUtils.deepClone(healinfo);
                            hinfo.sourcetype = "extra";
                            hinfo.val *= ele[3] / 100;
                            tarr[0].doLogicHeal(hinfo, this);
                        }
                    }
                } break;
                case "T004": {
                    if (healinfo.sourcetype == "xixue") break;
                    if (target && target.initTeam == this.initTeam) { // 是友军
                        target.pushOneBuff(ele[1], ele[2] * 60, null, this);
                    }
                } break;
            }
        }
    }

    BackByFarAtt(hinfo) {
        if (!this.m_objSkillBack["U"]) return;
        for (let index = this.m_objSkillBack["U"].length - 1; index >= 0; index--) {
            let ele = this.m_objSkillBack["U"][index];
            switch (ele[0]) {
                case "U001":
                    this.extraFarAtt(ele[1], ele[2] / 100, 1, 0);
                    break;
                case "U002":
                    if (this.getBuffNumByType("leiting") > 1) {
                        this.extraFarAtt(ele[1], ele[2] / 100, 1, 0, { type: "hp", direction: "inc" });
                    }
                    break;
                case "U003":
                    this.extraFarAtt(ele[1], ele[2] / 100, 2, 0);
                    break;
                case "U004":
                    hinfo.hurmtype = 2;
                    hinfo.attval = this.getNowAttri("atk") * ele[2] / 100;
                    this.extraFarAtt(ele[1], ele[2] / 100, 2, 0);
                    break;

            }
        }
    }

    /**
     * @intro 额外攻击其他目标
     * @param {*} num 额外增加的数量
     * @param {*} ratio 多少攻击力
     * @param {*} hurmtype 伤害类型是什么
     * @param {*} extradis 额外增加的攻击距离
     */
    extraFarAtt(num, ratio, hurmtype, extradis, sortinfo) {
        extradis = extradis || 0;
        let ratt = this.getAttArea_NoScale();
        let xatt = ratt.x;
        let yatt = ratt.y;
        let tarr;
        if (sortinfo) {
            tarr = this.getTargetBySort({ target: 1, doarea: xatt, areatype: 1 }, sortinfo.type, sortinfo.direction);
        } else {
            tarr = this.getTargetByTypeState(1, xatt, yatt, 1);
        }
        let nIndex = 0;
        for (let i = 0; i < tarr.length && nIndex < num; ++i) {
            if (tarr[i]._id !== this.attTarget._id) {
                let hurminfo = this.getHurmInfo(this.getNowAttri("atk") * ratio, hurmtype);
                let attinfo = this.config.attinfo;
                let effnode = new eff_1(this.battleS.getEffId(), this.steps, attinfo.model, attinfo, this, new vecT(this.x, this.y), tarr[i], hurminfo, "normal");
                this.battleS.effUnitArr.push(effnode);
                nIndex++;
            }
        }
    }

    // 公孙瓒用技能加
    BackByTargetnum(targetnum) {
        if (!this.m_objSkillBack["X"]) return targetnum;
        for (let index = this.m_objSkillBack["X"].length - 1; index >= 0; index--) {
            let ele = this.m_objSkillBack["X"][index];
            switch (ele[0]) {
                // 继续使用
                case "X001":  // 增加目标
                    targetnum += Number(ele[1]);
                    break;
                case "X002":   // 概率增加随机目标数
                    for (let i = 0; i < Number(ele[1]); ++i) {
                        if (this.bTools.getRandom() > ele[2] / 100) break;
                        targetnum += 1;
                    }
                    break;
            }
        }
        return targetnum
    }

    // 技能命中后
    BackSkillHurt(skillid, target) {
        if (!this.m_objSkillBack["Z"]) return;
        for (let index = this.m_objSkillBack["Z"].length - 1; index >= 0; index--) {
            let ele = this.m_objSkillBack["Z"][index];
            switch (ele[0]) {
                case "Z001":   // 项羽1技能减怒气
                    if (skillid != Number(ele[1])) break;
                    target.addMagic(-ele[2]);
                    break;
            }
        }
    }


    // 得到需要显示的buff数组
    getShowBuff() {
        let buffshow = [];
        for (let i = 0; i < this.buff.length; ++i) {
            if (buffshow.indexOf(this.buff[i]._bid) < 0) {
                // if(buff)
                buffshow.push(this.buff[i]._bid);
            }
        }
        return buffshow;
    }

    saveStepInfo() {
        let sinfo = {};
        if (this.isSaveDead) {
            sinfo.dead = 1;
            sinfo.maxhp = this.initInfo.hp;
            this.battleS.saveStepInfo(this.born, sinfo, this.nowTeam);
            return;
        }
        if (this.Invisible) sinfo.invisible = this.Invisible;
        sinfo.nowhp = this.battleInfo.hp;        // 储存当前血量
        sinfo.maxhp = this.initInfo.hp;          // 储存当前血量上限信息
        sinfo.nowmp = this.nowmagic;
        sinfo.maxmp = this.maxmagic;
        sinfo.x = this.x;                    // 储存位置
        sinfo.y = this.y;
        sinfo.action = this.action;               // 储存当前动作 
        sinfo.skillid = this._skillid;
        sinfo.asp = this.getNowAttri("pasp");           // 如果是普攻 需要用到asp
        if (this._blink) {
            sinfo.blink = 1;
        }
        let target = null;
        if (this.nextGrid) {
            target = {
                x: bConfig.gridPosArr[this.nextGrid.x][this.nextGrid.y].x,
                y: bConfig.gridPosArr[this.nextGrid.x][this.nextGrid.y].y,
                fieldX: this.nextGrid.x,//ok
                fieldY: this.nextGrid.y,//ok
            };
        }
        if (!target) target = this.attTarget || this.skilltarget;

        if (!this.attNext || this.actiondt == 0) {
            if (target) {
                let preY = this.lastGrid ? this.lastGrid.y : this.fieldY
                let preX = this.lastGrid ? this.lastGrid.x : this.fieldX

                //用实际坐标点计算
                let fieldpos = this.getGridRealPos(preX, preY)
                // let fieldpos = {x:this.x, y:this.y} //this.getnow this.getGridRealPos(this.fieldX, this.fieldY)
                let targetpos = this.getGridRealPos(target.fieldX, target.fieldY)

                let checkNum = 10
                let realface
                if (targetpos.y - fieldpos.y > checkNum) {
                    //右上 左上 
                    realface = targetpos.x > fieldpos.x ? 3 : 2
                } else if (targetpos.y - fieldpos.y < -checkNum) {
                    //右下 左下 
                    realface = targetpos.x > fieldpos.x ? 5 : 6
                } else {
                    //左右
                    realface = targetpos.x > fieldpos.x ? 4 : 1
                }

                sinfo.face = realface
                this.face = realface
            } else {
                sinfo.face = this.face;
            }
        }

        if (this.findTarget) sinfo.target = this.findTarget._id;
        if (this.battleInfo.hp <= 0) {
            this.setAction("dead");
            this.isSaveDead = true;
        }
        sinfo.skillhit = [];
        for (let i = 0; i < this.skillHitArr.length; ++i) sinfo.skillhit[i] = this.skillHitArr[i];

        if (this.initTeam == "right") {
            sinfo.nhurm = [];
            sinfo.ncrit = [];
            for (let i = 0; i < this.normNum.length; ++i) sinfo.nhurm[i] = this.normNum[i];
            for (let i = 0; i < this.normCrit.length; ++i) sinfo.ncrit[i] = this.normCrit[i];
            sinfo.shurm = [];
            sinfo.scrit = [];
            for (let i = 0; i < this.skillNum.length; ++i) sinfo.shurm[i] = this.skillNum[i];
            for (let i = 0; i < this.skillCrit.length; ++i) sinfo.scrit[i] = this.skillCrit[i];
            sinfo.real = [];
            for (let i = 0; i < this.realNum.length; ++i) sinfo.real[i] = this.realNum[i];
            sinfo.nmiss = [];
            for (let i = 0; i < this.normMiss.length; ++i) sinfo.nmiss[i] = this.normMiss[i];
            sinfo.smiss = [];
            for (let i = 0; i < this.skillMiss.length; ++i) sinfo.smiss[i] = this.skillMiss[i];
        } else {
            sinfo.heal = [];
            for (let i = 0; i < this.healNum.length; ++i) sinfo.heal[i] = this.healNum[i];
        }
        sinfo.buff = this.getShowBuff();
        this.battleS.saveStepInfo(this.born, sinfo, this.nowTeam);
    }

    /* 
    *    主动技能寻目标 实现
    */

    /**
     * @intro 寻找目标 某属性值 按 降序 或者 升序 
     * @param sconfig 技能配置
     * @param attri 属性
     * @param sorttype 升序or降序
     * @param strfilter 过滤条件
     * */
    getTargetBySort(config, attri, sorttype, strfilter) {
        strfilter = strfilter || DEFAULTFILTER;
        let tarr = this.getTargetByTypeState(config.target, config.doarea, config.doarea, config.areatype, !!config.target_unself, strfilter);
        return tarr.sortByType(attri, sorttype);
    }

    // 主动技能排序模板
    getTargetByAttriSort(sconfig, attri, sorttype, strfilter) {
        let tarr = this.getTargetBySort(sconfig, attri, sorttype, strfilter);
        this.skilltargetsArr = [];
        for (let i = 0; i < sconfig.targetnum && i < tarr.length; ++i) {
            if (tarr[i].isDead()) continue;
            this.skilltargetsArr.push(tarr[i]);
        }
        if (this.skilltargetsArr.length <= 0) return;
        this.skilltarget = this.skilltargetsArr[0];
    }

    // 乐进1主动技能目标 40121
    getTarget40121(sconfig) {
        this.getTargetByAttriSort(sconfig, "def", "dec");
    }

    // 于吉1技能目标
    getTarget46161(sconfig) {
        this.getTargetByAttriSort(sconfig, "def", "dec");
    }

    // 甄姬3主动技能目标 40151 能找到隐身
    getTarget40151(sconfig) {
        this.getTargetByAttriSort(sconfig, "atk", "dec", FILTERMAP.yinshen);
    }

    // 祝融1技能目标
    getTarget42081(sconfig) {
        this.getTargetByAttriSort(sconfig, "hp", "inc");
    }

    // 廖化1技能目标
    getTarget42141(sconfig) {
        this.getTargetByAttriSort(sconfig, "hp", "inc");
    }
    // 刘备1技能
    getTarget42301(sconfig) {
        this.getTargetByAttriSort(sconfig, "def", "dec");
    }
    // 姜维1技能目标
    getTarget42321(sconfig) {
        this.getTargetByAttriSort(sconfig, "hp", "inc");
    }

    // 寻找里自己最近的人
    getTarget42421(sconfig) {
        let tarr = this.getTargetByTypeState(sconfig.target, -1, null, 1, true);
        let tar = tarr[0];
        for (let i = 1; i < tarr.length; ++i) {
            if (Math.pow(tarr[i].x - this.x, 2) + Math.pow(tarr[i].y - this.y, 2) < Math.pow(tar.x - this.x, 2) + Math.pow(tar.y - this.y, 2)) {
                tar = tarr[i];
            }
        }
        if (tar) {
            this.skilltargetsArr.push(tar);
            this.skilltarget = tar;
        }
    }

    // 张昭1技能目标
    getTarget44141(sconfig) {
        this.getTargetByAttriSort(sconfig, "hp", "inc");
    }

    // 孙坚1技能
    getTarget44321(sconfig) {
        this.getTargetByAttriSort(sconfig, "hp", "inc");
    }

    // 神庞统1技能
    getTarget17021(sconfig) {
        this.getTargetByAttriSort(sconfig, "atk", "dec");
    }

    // 神庞统3技能
    getTarget17031(sconfig) {
        this.getTargetByAttriSort(sconfig, "hp", "inc");
    }

    // 神诸葛 变身1技能
    getTarget37161(sconfig) {
        this.getTargetByAttriSort(sconfig, "atk", "dec");
    }

    // 魔于吉 1技能
    getTarget18041(sconfig) {
        this.getTargetByAttriSort(sconfig, "atk", "dec");
    }

    // 魔步练师 1技能
    getTarget18061(sconfig) {
        let tarr = this.getTargetByTypeState(sconfig.target, sconfig.doarea, sconfig.doarea, sconfig.areatype, !!sconfig.target_unself);
        this.skilltarget = null;
        this.skilltargetsArr = [];
        let nTmate = 0;
        let nEnemy = 0;
        for (let i = 0; i < tarr.length && (nTmate < 3 || nEnemy < 3); ++i) {
            if (i == 0) this.skilltarget = tarr[i];
            if (tarr[i].initTeam == this.initTeam && nTmate >= 3) {
                this.skilltargetsArr.push(tarr[i]);
                nTmate++;
            } else {
                this.skilltargetsArr.push(tarr[i]);
                nEnemy++;
            }
        }
    }


    /***以下是旧代码 20210720*/

    destroy() {
        clearGlobalEvent("fear");
        delete this.lastGrid;
    }
}

class Cunit extends BaseUnit {
    constructor() {
        super();
    }
}

class Lunit extends BaseUnit {
    constructor() {
        super();
    }
}

// 召唤单位 近战
class Csepara extends Cunit {
    initSeparaInfo(separa) {
        this.separahurm = separa.hurm;
        this.separainjure = separa.injure;
        this.master = separa.master;
        this.master.separaUnit.push(this);
        this.separatime = separa.duration;
        this.loaddt = separa.load;
        this.setAction("stand");
        this.pushOneBuff(separa.buff, separa.load, null, this);
        this.battleInfo.hp = separa.nowhp;
        this.BackBySeparaInit();
        // this.
    }

    changeNowHp(num, type) {
        if (num < 0) num *= (1 + this.separainjure / 100);
        return super.changeNowHp(num, type)
    }

    doLogicCalcu() {
        if (this.isDead()) return;
        if (this.loaddt > 0) {
            this.step++;
            this.loaddt--;
            this.separatime -= 1;
            return;
        }
        this.separatime -= 1;
        if (this.separatime <= 0) {
            this.setAction("dead");
            this.battleS.bFieldArr[this.fieldX][this.fieldY].nowUnit = null;//OK
            return;
        }
        super.doLogicCalcu()
    }

    isDead() {
        return this.battleInfo.hp <= 0 || this.separatime <= 0;
    }
}

// 召唤单位 远程
class Lsepara extends Lunit {
    initSeparaInfo(separa) {
        this.separahurm = separa.hurm;
        this.separainjure = separa.injure;
        this.master = separa.master;
        this.separatime = separa.duration;
        this.loaddt = separa.load;
        this.setAction("stand");
        this.pushOneBuff(separa.buff, separa.load, null, this);
        this.battleInfo.hp = separa.nowhp;
        this.BackBySeparaInit()
    }

    changeNowHp(num, type) {
        if (num < 0) num *= (1 + this.separainjure / 100);
        return super.changeNowHp(num, type)
    }

    doLogicCalcu() {
        if (this.isDead()) return;
        if (this.loaddt > 0) {
            this.step++;
            this.loaddt--;
            this.separatime -= 1;
            return;
        }
        this.separatime -= 1;
        if (this.separatime <= 0) {
            this.setAction("dead");
            this.battleS.bFieldArr[this.fieldX][this.fieldY].nowUnit = null;//OK
            return;
        }
        super.doLogicCalcu()
    }

    isDead() {
        return this.battleInfo.hp <= 0 || this.separatime <= 0;
    }
}

// 嬴政的变身龙
class yingzhengl_1 extends Lunit {


}



/*** 丢出特效 ****/
class eff_unit {
    constructor(pid, steps, mid, pconfig, src, born, target, addinfo, addtype) {
        this._id = pid;
        this.steps = steps;
        this._addinfo = addinfo;
        this._model = mid;
        this._src = src;
        this._target = target;
        this._addtype = addtype;
        this._width = pconfig.width || 30;
        this._height = pconfig.height || 18;
        let bornpos = pconfig.bornpos || 1;
        bornpos === 1 ? this.setPosition(born.x, born.y) : this.setPosition(target.x, target.y);

    }

    updateState() { }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setShowAngle(selfpos, dscpos) {
        if (this._src && !this._src.bDoUIThings) return;

        let showselfpos = bConfig.convertToShowSpace(selfpos);
        let showtarpos = bConfig.convertToShowSpace(dscpos);
        showselfpos = new vecT(showselfpos.x, showselfpos.y);
        showtarpos = new vecT(showtarpos.x, showtarpos.y);
        let vec = showtarpos.sub(showselfpos);
        this._showangle = vec.angle();
    }

    getPosition() {
        if (!this._nowpos) {
            this._nowpos = new vecT(this.x, this.y);
        } else {
            this._nowpos.setPos(this.x, this.y);
        }
        return this._nowpos;
    }

    saveEffStepInfo() {
        let sinfo = {};
        sinfo.gsid = this._model,
            sinfo.x = this.x;
        sinfo.y = this.y;
        sinfo.face = this._face;
        sinfo.rotation = this._showangle;
        this._src.battleS.saveEffStepInfo(this._id, sinfo);
    }

    destroy() {
        delete this;
    }
}

// 单体 有目标的移动
class eff_1 extends eff_unit {
    constructor(pid, steps, mid, pconfig, src, born, target, addinfo, addtype) {
        super(pid, steps, mid, pconfig, src, born, target, addinfo, addtype);
        this._speed = pconfig.speed || 9;
        this._add = pconfig.add || 0; //|| 0.99;
        let selfpos = this.getPosition();
        let dscpos = target.getPosition();
        this._face = dscpos.x >= selfpos.x ? 1 : 2;
    }

    updateState() {
        let selfpos = this.getPosition();
        let dscpos = this._target.getPosition();
        let msp = this._speed;
        this._speed += this._add / 24;

        let vec = dscpos.sub(selfpos);
        this._rotation = bConfig.IsVertical() ? 0 : -1 * Math.atan(vec.y / vec.x) * 180 / Math.PI;
        this.setShowAngle(selfpos, dscpos);

        if (vec.mag() <= msp) {
            this.setPosition(dscpos.x, dscpos.y);
        } else {
            let xspeed = vec.x;
            let yspeed = vec.y;
            if (Math.abs(vec.x) >= msp) {
                xspeed = vec.x / Math.abs(vec.mag()) * msp;
            }
            if (Math.abs(vec.y) >= msp) {
                yspeed = vec.y / Math.abs(vec.mag()) * msp;
            }
            this.setPosition(this.x + xspeed, this.y + yspeed);
        }

        if (collider.isIntersrect({ x: this.x, y: this.y, w: this._width, h: this._height, theta: (this._rotation || 0) },
            { x: this._target.x, y: this._target.y, w: 20, h: 20, theta: 0 })) {
            if (!this._addinfo) return "over";
            if (this._addtype == "normal") {
                this._target.doFarHurm(this._src, this._addinfo, this._model);
            } else if (this._addtype == "skill") {
                this._src.doEffHit(this._target, this._addinfo);
            }
            return "over";
        }
        this.steps++;
    }
}

// 移动 类似冲击波 的AOE
class eff_2 extends eff_unit {
    constructor(pid, steps, mid, pconfig, src, born, target, addinfo, addtype) {
        super(pid, steps, mid, pconfig, src, born, target, addinfo, addtype);
        this._speed = pconfig.speed || 9;
        this._exist = (pconfig.movedis || 400) / this._speed;    // 存在多少个逻辑帧
        this._initsteps = steps;

        let selfpos = this.getPosition();
        let dscpos = new vecT(target.x, target.y);
        this._face = dscpos.x >= selfpos.x ? 1 : 2;
        let vec = dscpos.sub(selfpos);

        this._xspeed = vec.x / Math.abs(vec.mag()) * this._speed;
        this._yspeed = vec.y / Math.abs(vec.mag()) * this._speed;

        this._hurmdis = pconfig.hurmdis || 0.9;
        this._dislimit = pconfig.dislimit / 100 || null;
        this._attval = this._addinfo.attval || 0;

        this._rotation = -1 * Math.atan(vec.y / vec.x) * 180 / Math.PI;
        this.setShowAngle(selfpos, dscpos);
        this.searchArr = src.getTargetByType(1, -1);
        this.hurmArr = [];
    }

    updateState() {
        if (this.steps > this._initsteps + this._exist) {
            return "over";
        }
        this.setPosition(this.x + this._xspeed, this.y + this._yspeed);
        for (let i = 0; i < this.searchArr.length; ++i) {
            if (this.hurmArr.indexOf(this.searchArr[i]._id) >= 0) continue;
            if (collider.isIntersrect({ x: this.x, y: this.y, w: this._width, h: this._height, theta: (this._rotation || 0) },
                { x: this.searchArr[i].x, y: this.searchArr[i].y, w: 50, h: 50, theta: 0 })) {
                this._src.doEffHit(this.searchArr[i], this._addinfo);
                if (this._dislimit) this._addinfo.attval = Math.max(this._addinfo.attval * this._hurmdis, this._attval * this._dislimit);
                this.hurmArr.push(this.searchArr[i]._id)
            }
        }
        this.steps++;
    }
}

class eff_3 extends eff_unit {
    constructor(pid, steps, mid, pconfig, src, born, target, addinfo, addtype) {
        super(pid, steps, mid, pconfig, src, born, target, addinfo, addtype);

        this._exist = pconfig.ftotal;    // 存在多少个逻辑帧
        this._dofeff = pconfig.dofeff;
        this._initsteps = steps;

        this.x += pconfig.posx || 0;
        this.y += pconfig.posy || 0;

        this.searchArr = src.getTargetByType(addinfo.stype == 4 ? 3 : addinfo.target, -1);
        this.hurmArr = [];
    }

    updateState() {
        if (this.steps > this._initsteps + this._exist) {
            return "over";
        } else if (!this.bEff && this.steps > this._initsteps + this._dofeff) {
            this.bEff = !this.bEff;
            for (let i = 0; i < this.searchArr.length; ++i) {
                if (this.hurmArr.indexOf(this.searchArr[i]._id) >= 0) continue;
                if (collider.isIntersrect({ x: this.x, y: this.y, w: this._width * 2, h: this._height * 2, theta: (this._rotation || 0) },
                    { x: this.searchArr[i].x, y: this.searchArr[i].y + this.searchArr[i].config.point.y, w: 50, h: 80, theta: 0 })) {
                    this._src.doEffHit(this.searchArr[i], this._addinfo);
                    // console.log("命中技能");
                    this.hurmArr.push(this.searchArr[i]._id)
                }
            }
        }
        this.steps++;
    }
}

// 范围持续轰击
class eff_4 extends eff_unit {
    constructor(pid, steps, mid, pconfig, src, born, target, addinfo, addtype) {
        super(pid, steps, mid, pconfig, src, born, target, addinfo, addtype);
        this._exist = pconfig.ftotal;
        this._interval = pconfig.intv;

        this.searchArr = src.getTargetByType(addinfo.stype == 4 ? 3 : addinfo.target, -1);
    }

    updateState() {
        if (this._exist % this._interval == 0) {
            // 命中一次
            for (let i = 0; i < this.searchArr.length; ++i) {
                if (this.searchArr[i].isDead()) continue;
                if (collider.isIntersrect({ x: this.x, y: this.y, w: this._width, h: this._height, theta: (this._rotation || 0) },
                    { x: this.searchArr[i].x, y: this.searchArr[i].y + this.searchArr[i].config.point.y, w: 50, h: 80, theta: 0 })) {
                    this._src.doEffHit(this.searchArr[i], this._addinfo);
                }
            }
        }
        this._exist -= 1;
        if (this._exist <= 0) return "over";
        this.steps++;
    }
}
// 范围随机选择1个目标进行攻击
class eff_5 extends eff_unit {
    constructor(pid, steps, mid, pconfig, src, born, target, addinfo, addtype) {
        super(pid, steps, mid, pconfig, src, born, target, addinfo, addtype);
        this._exist = pconfig.ftotal;
        this._interval = pconfig.intv;

        this.searchArr = src.getTargetByType(addinfo.stype == 4 ? 3 : addinfo.target, -1);
    }

    updateState() {
        if (this._exist % this._interval == 0) {
            // 命中一次
            let tarr = [];
            for (let i = 0; i < this.searchArr.length; ++i) {
                if (this.searchArr[i].isDead()) continue;
                if (this.searchArr[i].getBuffNumByType("fangzhu") > 1) continue;
                if (collider.isIntersrect({ x: this.x, y: this.y, w: this._width, h: this._height, theta: (this._rotation || 0) },
                    { x: this.searchArr[i].x, y: this.searchArr[i].y + this.searchArr[i].config.point.y, w: 50, h: 80, theta: 0 }) || this._width == -1) {
                    tarr.push(this.searchArr[i]);
                }
            }
            if (tarr.length > 0) {
                this._src.doEffHit(tarr[this._src.bTools.getRandomInt(0, tarr.length - 1)], this._addinfo);
            }
        }
        this._exist -= 1;
        if (this._exist <= 0) return "over";
        this.steps++;
    }
}

/*** buff  ***/
class Buff {
    constructor(obj, unit) {
        this._unit = unit;
        this._bid = obj.bid;
        this._buffid = obj.id;
        this._config = gUtils.deepClone(GetConfig("dbBuffInfo")[this._bid]);
        this._src = obj.src;
        this._ttime = this.duration = obj.ttime;
        this._plies = 1;
        if (!this._config || this._config.buffarr.length <= 0) return;
        switch (this._config.buffarr[0].type) {
            case "stun":
                this._ttime *= 1 - (this._unit.getNowAttri("pefc") + this._unit.getNowAttri("pstunefc"));
                break;
            case "yazhi":
            case "sneer":
            case "silent":
                this._ttime *= (1 - this._unit.getNowAttri("pefc"));
                break;
            case "meihuo":
                this._ttime *= (1 - this._unit.getNowAttri("pdmh"));
                break;
            case "fear":
                this._ttime *= (1 - this._unit.getNowAttri("pdkj"));
                break;
        }

        if (this._unit.BackByImmune(this._config.buffarr[0].type)) {
            this._ttime = 0;
        }

        if (!this._config) {
            console.log("无配置");
            this._ttime = 0;
        }
        this._add = obj.add;
        if (this._config.b_def) this._ttime *= 1;  //this._unit.getNowStateDef();
        // 给对应类型值生成新的数据
        this.timing = 0;
        // this.refreshData();
    }

    refreshData() {
        if (!this._config.buffarr) return;
        for (let i = 0; i < this._config.buffarr.length; ++i) {
            let tmp = this._config.buffarr[i];
            switch (tmp.type) {
                case "stun": if (this._ttime > 0) this._unit.setAction("stand"); break;
                case "fear": if (this._ttime > 0) {
                    this._unit.setAction("stand");
                    this._unit.attNext = 0;
                    this._unit.attInterval = 0;
                }
                    break;
                case "silent": if (this._unit.action == "skill" && this._ttime > 0) this._unit.setAction("stand"); break;
            }
            this._unit.buffcache[tmp.type] = this._unit.refreshBuffNumByType(tmp.type);
        }
    }
    // 特殊标记实现   
    countTime() {
        this._ttime -= 1 * bConfig.turnCount;
        this.timing += 1 * bConfig.turnCount;
    }

    getEff() {
        if (!this._config.buffarr) return {};
        let barr = this._config.buffarr;
        return barr;
    }

    getEffByType(ptype) {
        if (!this._config.buffarr) return {};
        let barr = this._config.buffarr;
        let tmparr = [];
        for (let i = 0; i < barr.length; ++i) {
            if (barr[i].type == ptype) tmparr.push(barr[i]);
        }
        return tmparr;
    }

    setPlies(plies) {
        this._plies = plies;
    }

    getPlies() {       // 得到buff层数
        return this._plies || 1;
    }

    /**
     * @intro 死亡时调用一些buff的该方法
     */
    deadDeal() { }   // 子类重写   

    /**
     * @intro 被覆盖时调用的方法
     */
    doUpdate() { }   // 子类重写

    // 销毁时的处理
    destroy() {
        this.refreshData();
        // delete this;
    }

};

/**
 *  @intro 根据时间长度来扣血的buff 第一个参数为攻击百分比，伤害类型为法术, 第二个参数为时间间隔
 *         能否暴击
 *  @intro 即每隔x秒 造成 伤害 如灼烧 中毒 流血 可以使用此模板
 */
class Buffhatkinv extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        let length = this._config.buffarr.length;
        this._addnum = this._config.buffarr[0] ? this._config.buffarr[0].num / 100 : 1;
        this._inv = this._config.buffarr[1] ? this._config.buffarr[1].num * 60 : 60;
        this._nocrit = 1;
        if (this._config.buffarr[length - 1].type == "crit") {
            this._nocrit = 0;
        }
    }

    countTime() {
        super.countTime();
        if (!this._addnum || !this._inv) return;
        // 每秒造成伤害
        if (this._ttime % this._inv == 0) {
            // let hurminfo
            let hurminfo = this._src.getHurmInfo(this._src.getNowAttri("atk") * this._addnum, 2);
            this._unit.getCalHurm(this._src, hurminfo, "skill", this._nocrit, { htype: "buff" });
        }
    }
}

/**
 *  @intro 根据时间长度来扣血的buff 第一个参数为攻击百分比，伤害类型为物理, 第二个参数为时间间隔
 *         能否暴击
 *  @intro 即每隔x秒 造成 伤害 如灼烧 中毒 流血 可以使用此模板
 */
class Buffhatkpinv extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        let length = this._config.buffarr.length;
        this._addnum = this._config.buffarr[0] ? this._config.buffarr[0].num / 100 : 1;
        this._inv = this._config.buffarr[1] ? this._config.buffarr[1].num * 60 : 60;
        this._nocrit = 1;
        if (this._config.buffarr[length - 1].type == "crit") {
            this._nocrit = 0;
        }
    }

    countTime() {
        super.countTime();
        if (!this._addnum || !this._inv) return;
        // 每秒造成伤害
        if (this._ttime % this._inv == 0) {
            // let hurminfo
            let hurminfo = this._src.getHurmInfo(this._src.getNowAttri("atk") * this._addnum, 1);
            this._unit.getCalHurm(this._src, hurminfo, "skill", this._nocrit, { htype: "buff" });
        }
    }
}

/**
 *  @intro 根据时间长度来扣血的buff 第一个参数为自身最大生命 第二个参数为时间间隔，伤害类型为法术, 第二个参数为时间间隔
 *         能否暴击
 *  @intro 即每隔x秒 造成 伤害 如周瑜火焰
 */
class Buffhhpinv extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        this._addnum = this._config.buffarr[0] ? this._config.buffarr[0].num / 100 : 1;
        this._maxnum = this._config.buffarr[1] ? this._config.buffarr[1].num : 10;
        this._inv = this._config.buffarr[2] ? this._config.buffarr[2].num * 60 : 60;
        this._nocrit = 1;
        this._maxval = this._src.getNowAttri("atk") * this._maxnum;
    }

    countTime() {
        super.countTime();
        if (!this._addnum || !this._inv) return;
        // 每秒造成伤害
        if (this._ttime % this._inv == 0) {
            // let hurminfo
            let hpattval = Math.min(this._unit.initInfo.hp * this._addnum, this._maxval);
            let hurminfo = this._src.getHurmInfo(hpattval, 2);
            this._unit.getCalHurm(this._src, hurminfo, "skill", this._nocrit, { htype: "buff" });
            if (this._config.buffarr[3]) {
                this._unit.pushOneBuff(this._config.buffarr[3].type, this._config.buffarr[3].num * 60, null, this._src);
            }
        }
    }
}

class Buffhatkmpinv extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        let length = this._config.buffarr.length;
        this._addnum = this._config.buffarr[0] ? this._config.buffarr[0].num / 100 : 1;
        this._mpnum = this._config.buffarr[1] ? this._config.buffarr[1].num : 0;
        this._inv = this._config.buffarr[2] ? this._config.buffarr[2].num * 60 : 60;
    }

    countTime() {
        super.countTime();
        if (!this._addnum || !this._inv) return;
        // 每秒造成伤害
        if (this._ttime % this._inv == 0) {
            // let hurminfo
            this._unit.addMagic(-this._mpnum);
            let hurminfo = this._src.getHurmInfo(this._src.getNowAttri("atk") * this._addnum, 2);
            this._unit.getCalHurm(this._src, hurminfo, "skill", 1, { htype: "buff" });
        }
    }
}

/**
 *  @intro 根据时间长度来扣血的buff 第一个参数为攻击百分比，伤害类型为法术, 第二个参数为自身最大生命 第二个参数为时间间隔
 *         能否暴击
 *  @intro 即每隔x秒 造成 伤害 如灼烧 中毒 流血 可以使用此模板
 */
class Buffhatkhpinv extends Buff {

    constructor(obj, unit) {
        super(obj, unit);
        this._addnum1 = this._config.buffarr[0] ? this._config.buffarr[0].num / 100 : 1;
        this._addnum2 = this._config.buffarr[1] ? this._config.buffarr[1].num / 100 : 0;
        this._maxnum2 = this._config.buffarr[2] ? this._config.buffarr[2].num : 10;
        this._inv = this._config.buffarr[3] ? this._config.buffarr[3].num * 60 : 60;
        this._nocrit = 1;
    }

    countTime() {
        super.countTime();
        if (!this._addnum1 || !this._inv) return;
        // 每秒造成伤害
        if (this._ttime % this._inv == 0) {
            let hpattval = Math.min(this._unit.initInfo.hp * this._addnum2, this._src.getNowAttri("atk") * this._maxnum2);
            let hurminfo = this._src.getHurmInfo(this._src.getNowAttri("atk") * this._addnum1 + hpattval, 2);
            let tarr = this._unit.getTargetByTypeState(1, 120, 120, 1, 1, FILTERMAP.yinshen);
            tarr.forEach(ele => {
                ele.getCalHurm(this._src, hurminfo, "skill", this._nocrit);
            })
        }
    }
}

// 根据来源的血量上限掉血
class Buffhsrchpinv extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        this._addnum = this._config.buffarr[0] ? this._config.buffarr[0].num / 100 : 1;
        this._maxnum = this._config.buffarr[1] ? this._config.buffarr[1].num : 10;
        this._inv = this._config.buffarr[2] ? this._config.buffarr[2].num * 60 : 60;
        this._nocrit = 1;
    }

    countTime() {
        super.countTime();
        if (!this._addnum || !this._inv) return;
        // 每秒造成伤害
        if (this._ttime % this._inv == 0) {
            // let hurminfo
            let hpattval = Math.min(this._src.initInfo.hp * this._addnum, this._src.getNowAttri("atk") * this._maxnum);
            let hurminfo = this._src.getHurmInfo(hpattval, 2);
            this._unit.getCalHurm(this._src, hurminfo, "skill", this._nocrit, { htype: "buff" });
        }
    }
}

// 根据来源攻击力使周围掉血并推入一个buff
class Buffhatkaround extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        this._addnum = this._config.buffarr[0] ? this._config.buffarr[0].num / 100 : 1;
        this._buff = this._config.buffarr[1] ? this._config.buffarr[1].stype : null;
        this._bufftime = this._config.buffarr[1] ? this._config.buffarr[1].num : 2;
        this._inv = this._config.buffarr[2] ? this._config.buffarr[2].num * 60 : 60;
        this._nocrit = 1;
    }

    countTime() {
        super.countTime();
        if (!this._addnum || !this._inv) return;
        if (this._ttime % this._inv == 0) {
            let hurminfo = this._src.getHurmInfo(this._src.getNowAttri("atk") * this._addnum, 2);
            let tarr = this._unit.getTargetByTypeState(1, 80, 80, 1, false, FILTERMAP.yinshen);
            for (let i = 0; i < tarr.length; ++i) {
                tarr[i].getCalHurm(this._src, hurminfo, "skill", this._nocrit);
                tarr[i].pushOneBuff(this._buff, this._bufftime * 60, null, this._src);
            }
        }
    }
}

/**
 *  @intro 根据时间长度来回蓝 第一个参数为回蓝值， 第二个参数为时间间隔
 *        
 *  @intro 即每隔x秒 回蓝  如buff回蓝可使用此模板
 */
class Buffmpinv extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        this._addnum = this._config.buffarr[0] ? this._config.buffarr[0].num : 0;
        this._inv = this._config.buffarr[1] ? this._config.buffarr[1].num * 60 : 60;
    }

    countTime() {
        super.countTime();
        if (!this._addnum || !this._inv) return;
        // 每x秒回蓝
        if (this._ttime % this._inv == 0) {
            this._unit.addMagic(this._addnum);
        }
    }
}
/**
    @intro 延迟死亡
 */

class Buffadead extends Buff {
    destroy() {
        this._unit.battleInfo.hp = 0;
        this._unit.updateOneStepBuff();
        this._unit.BackBySelfDie(this._src);
        if (this._unit.battleInfo.hp <= 0) {
            for (let i = 0; i < this._unit.battleS.leftUnitArr.length; ++i) {
                this._unit.battleS.leftUnitArr[i].getPeopleDie(this._unit);
            }
            for (let i = 0; i < this._unit.battleS.rightUnitArr.length; ++i) {
                this._unit.battleS.rightUnitArr[i].getPeopleDie(this._unit);
            }
            this._unit.battleS.getOptByUnit("onedie", this._unit);
            this._unit.setAction("dead");
            this._unit.battleS.bFieldArr[this._unit.fieldX][this._unit.fieldY].nowUnit = null;//OK
        }
        super.destroy();
    }
}
/**
    @intro 后面的值跟随生命值变化的buff
    @intro config 的maxcount 用来做最小值
 */
class Buffchange extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        let hpratio = 1 - this._unit.bTools.intergeNum(this._unit.battleInfo.hp / this._unit.initInfo.hp * 10000) / 10000;
        for (let i = 0; i < this._config.buffarr.length; ++i) {
            let _min = this._config.buffarr[i].maxcount;
            let _num = this._config.buffarr[i].num;
            this._config.buffarr[i].num = _min + (_num - _min) * hpratio;
        }
    }
}

/** 
    @intro 血盾 基础类  使用buff自身血量上限
 */
class Buffhpdun extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        let _ratio = this._config.buffarr[0].num / 100;
        this.extraId = this._unit.pushBuffExtraHp(this._unit.initInfo.hp * _ratio, this);
    }

    destroy() {
        delete this._unit._extraHp[this.extraId];
        super.destroy();
    }
}

class Buff40351 extends Buffhpdun {
    constructor(obj, unit) {
        super(obj, unit);
        this._unit.clearBuff(2, 2);     // 增加一个buff清除
    }
}

/** 
    @intro 血盾 基础类  使用施加着攻击力 基础类
 */
class Buffatkdun extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        let _ratio = this._config.buffarr[0].num / 100;
        this.extraId = this._unit.pushBuffExtraHp(this._src.getNowAttri("atk") * _ratio, this);
    }

    destroy() {
        delete this._unit._extraHp[this.extraId];
        super.destroy();
    }
}

// 孟获3技能buff
class Buff42171 extends Buffatkdun {
    constructor(obj, unit) {
        super(obj, unit);
        this._recnum = this._config.buffarr[1] ? this._config.buffarr[1].num / 100 : 1;
        this._inv = this._config.buffarr[2] ? this._config.buffarr[2].num * 60 : 60;
    }

    countTime() {
        super.countTime();
        if (this.timing % this._inv == 0) {
            this._unit.getCalHeal(this._src, this._src.getHealInfo(this._unit.initInfo.hp * this._recnum), "skill", "buff");
        }
    }
}

// 姜维攻击盾 带驱散效果
class Buff42321 extends Buffatkdun {
    constructor(obj, unit) {
        super(obj, unit);
        for (let i = 0; i < this._config.buffarr[1].num; ++i) {
            this._unit.dispelOneBuff(2, 2);
        }
    }
}

// 类型盾
class Bufftypeatkdun extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        let _ratio = this._config.buffarr[0].num / 100;
        let _type = this._config.buffarr[1].num;
        this.extraId = this._unit.pushBuffExtraHp(this._src.getNowAttri("atk") * _ratio, this, _type);
    }

    destroy() {
        delete this._unit._extraHp[this.extraId];
        super.destroy();
    }
}


/**
    @intro buff 吸对方属性的 此buff配置的属性百分比都被吸 
 */
class Buffxiratio extends Buff {
    constructor(obj, unit) {
        super(obj, unit);

        for (let i = 0; i < this._config.buffarr.length; ++i) {
            let _type = this._config.buffarr[i].type;
            let _num = Math.abs(this._config.buffarr[i].num / 100);
            this._src.setStlAttriNum(ATTRIMAP.other, _type, this._bid + this._buffid, _num);
        }
    }

    deadDeal() {
        super.deadDeal();
        for (let i = 0; i < this._config.buffarr.length; ++i) {
            let _type = this._config.buffarr[i].type;
            this._src.deleteStlAttriNum(ATTRIMAP.other, _type, this._bid + this._buffid);
        }
    }

    doUpdate() {
        super.doUpdate();
        for (let i = 0; i < this._config.buffarr.length; ++i) {
            let _type = this._config.buffarr[i].type;
            this._src.deleteStlAttriNum(ATTRIMAP.other, _type, this._bid + this._buffid);
        }
    }

    destroy() {
        super.destroy();
        for (let i = 0; i < this._config.buffarr.length; ++i) {
            let _type = this._config.buffarr[i].type;
            this._src.deleteStlAttriNum(ATTRIMAP.other, _type, this._bid + this._buffid);
        }
    }
}

/**
    @intro buff 吸对方属性的数值
 */
class Buffxinum extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        for (let i = 0; i < this._config.buffarr.length; ++i) {
            let _type = this._config.buffarr[i].type;
            let _num = this._unit.getNowAttri(_type) * Math.abs(this._config.buffarr[i].num / 100);
            this._src.setStlAttriNum(ATTRIMAP.extra, _type, this._bid + this._buffid, _num);
        }
    }

    deadDeal() {
        super.deadDeal();
        for (let i = 0; i < this._config.buffarr.length; ++i) {
            let _type = this._config.buffarr[i].type;
            this._src.deleteStlAttriNum(ATTRIMAP.extra, _type, this._bid + this._buffid);
        }
    }

    doUpdate() {
        super.doUpdate();
        for (let i = 0; i < this._config.buffarr.length; ++i) {
            let _type = this._config.buffarr[i].type;
            this._src.deleteStlAttriNum(ATTRIMAP.extra, _type, this._bid + this._buffid);
        }
    }

    destroy() {
        super.destroy();
        for (let i = 0; i < this._config.buffarr.length; ++i) {
            let _type = this._config.buffarr[i].type;
            this._src.deleteStlAttriNum(ATTRIMAP.extra, _type, this._bid + this._buffid);
        }
    }
}

/**
    @intro 张辽4技能buff
 */
class Buff40376 extends Buff {
    countTime() {
        super.countTime();
        if (this._unit.isDead()) {
            this._src.getCalHeal(this._src, this._src.getHealInfo(this._src.initInfo.hp * this._config.buffarr[1].num / 100), "skill");
            this._src.addMagic(this._config.buffarr[2].num);
            this._ttime = 0;
        }
    }
}

/**
    @intro 每间隔时间回血 回复已损失的血量
 */
class Buffreclosthp extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        this._addnum = this._config.buffarr[0] ? this._config.buffarr[0].num / 100 : 0;
        this._inv = this._config.buffarr[1] ? this._config.buffarr[1].num * 60 : 60;
    }

    countTime() {
        super.countTime();
        if (this.timing % this._inv == 0) {
            this._unit.getCalHeal(this._src, this._src.getHealInfo(this._unit.getLostHp() * this._addnum), "skill", "buff");
        }
    }
}


/**
    @intro 每间隔时间回血 回复已来源攻击力百分比的血量
 */
class Buffrecatkhp extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        this._addnum = this._config.buffarr[0] ? this._config.buffarr[0].num / 100 : 0;
        this._inv = this._config.buffarr[1] ? this._config.buffarr[1].num * 60 : 60;
    }

    countTime() {
        super.countTime();
        if (this.timing % this._inv == 0) {
            this._unit.getCalHeal(this._src, this._src.getHealInfo(this._src.getNowAttri("atk") * this._addnum), "skill", "buff");
        }
    }
}

/**
    @intro 每间隔时间回血 回复上线百分比的血量
 */
class Buffrecinithp extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        this._addnum = this._config.buffarr[0] ? this._config.buffarr[0].num / 100 : 0;
        this._inv = this._config.buffarr[1] ? this._config.buffarr[1].num * 60 : 60;
    }

    countTime() {
        super.countTime();
        if (this.timing % this._inv == 0) {
            this._unit.getCalHeal(this._src, this._src.getHealInfo(this._unit.initInfo.hp * this._addnum), "skill", "buff");
        }
    }
}


/**
    @intro 强化普攻的buff
 */
class Buffatkadd extends Buff {
    countTime() {
        super.countTime();
        if (this._unit.backNormCount["P001"] == 0 || this._unit.backNormCount["P002"] == 0 || this._unit.backNormCount["P004"] == 0
            || this._unit.backNormCount["P005"] == 0) this._ttime = 0;
    }
}

class Buffdeadheal extends Buff {
    deadDeal() {
        let _addnum = this._config.buffarr[0].num / 100;
        this._src.getCalHeal(this._src, this._src.getHealInfo(this._src.initInfo.hp * _addnum), "skill");
    }
}


class Bufffendan extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        // 给自己注册一个分担事件
        this._fdtype = this._config.buffarr[0].type;
        if (this._src) {
            this._ev = this._src._id + this._src.initTeam + this._src.steps + this._fdtype;
        } else {
            this._ev = this._fdtype;
        }
        this._unit._fendanMap.set(this._fdtype, this._ev);
        onGlobalEvent(this._ev, (hurminfo, source, id, team) => {
            // 受伤 
            if (this._unit._id == id && this._unit.initTeam == team) return;
            hurminfo.hurmtype = 3;
            this._unit.doPrdcLogicHurt(hurminfo, source, true);
        }, this._buffid + this._unit._id + this._unit.initTeam);
    }

    doUpdate() {
        clearGlobalEvent(this._ev, this._buffid + this._unit._id + this._unit.initTeam);
    }

    deadDeal() {
        clearGlobalEvent(this._ev, this._buffid + this._unit._id + this._unit.initTeam);
        this._unit._fendanMap.delete(this._fdtype);
    }

    destroy() {
        clearGlobalEvent(this._ev, this._buffid + this._unit._id + this._unit.initTeam);
        this._unit._fendanMap.delete(this._fdtype);
        super.destroy();
    }
}

class Buffsneer extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        if (this._unit.attTarget) {
            if (!(this._src.initTeam == this._unit.attTarget.initTeam && this._unit.attTarget._id == this._src._id)) {
                this._unit.clearStepAction();
                this._unit.stand = "stand";
                this._unit.attTarget = null;
                this.sneerId = this._unit.pushSneerBuff(obj.src);
            }
        }
    }
    destroy() {
        delete this._unit._sneerTarget[this.sneerId - 1];
        super.destroy();
    }
}

/**
 * @intro 结束时造成范围伤害
 * 
 */
class Buffoverhurm extends Buff {
    destroy() {
        let ratio = this._config.buffarr[0] ? this._config.buffarr[0].num / 100 : 0;
        let area = this._config.buffarr[1] ? this._config.buffarr[1].num : 0;
        let tarr = this._unit.getTargetByTypeState(1, area, area, 1);
        for (let i = 0; i < tarr.length; ++i) {
            tarr[i].getCalHurm(this._src, this._src.getHurmInfo(this._src.getNowAttri("atk") * ratio, 2), "skill");
        }
        super.destroy();
    }
}

class Buff46161 extends Buffoverhurm {
    constructor(obj, unit) {
        super(obj, unit);
        if (!this._src.m_objSkillBack["I"]) return;
        for (let index = this._src.m_objSkillBack["I"].length - 1; index >= 0; index--) {
            let ele = this._src.m_objSkillBack["I"][index];
            if (ele[0] == "I003") {
                this._unit.pushOneBuff(ele[2], ele[3] * 60, null, this._src);
            }
        }
    }

    destroy() {
        if (this._config.buffarr[3]) this._unit.skillHitArr.push(this._config.buffarr[3].num);
        super.destroy();
    }
}

/**
@intro 神兽使用，通过传入数值改变配置数值
*/
class Buffchangenum extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        if (obj.add) {
            for (let i = 0; i < this._config.buffarr.length; ++i) {
                this._config.buffarr[i].num = obj.add;
            }
        }
    }
}

/**
 *  @intro 根据时间长度来扣血的buff 第一个参数为具体数值根据add传入hurminfo直接替换，伤害类型为神兽, 第二个参数为时间间隔
 是否暴击
*  @intro 即每隔x秒 造成 伤害 
*/
class Buffthurminv extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        let length = this._config.buffarr.length;
        this._thurminfo = !!obj.add ? obj.add : this._unit.getHurmInfo(this._config.buffarr[0].num, 2);
        this._inv = this._config.buffarr[1] ? this._config.buffarr[1].num * 60 : 60;
        this._nocrit = 1;
        if (this._config.buffarr[length - 1].type == "crit") {
            this._nocrit = 0;
        }
    }

    countTime() {
        super.countTime();
        if (!this._thurminfo || !this._inv) return;
        if (this._ttime % this._inv == 0) {
            this._unit.getCalHurm(this.src, this._thurminfo, "thic", this._nocrit, { htype: "buff" });
        }
    }
}

class Buff470311 extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        this.extraId = this._unit.pushBuffExtraHp(this._add, this);
    }

    destroy() {
        delete this._unit._extraHp[this.extraId];
        super.destroy();
    }
}

// 貂蝉鼓动buff接受推入另一个buff
class Buff46391 extends Buff {
    destroy(bdispel) {
        if (!bdispel) {
            this._unit.pushOneBuff("b46391b", 60 * 3, null, this._src);
        }
        super.destroy();
    }
}

class Buffxuezhou extends Buff { // 血咒 源头
    constructor(obj, unit) {
        super(obj, unit);
        this._src._xuezhou = this._unit;
        if (!this._unit._sxuezhou) this._unit._sxuezhou = {};
        this._unit._sxuezhou[this._unit._xuezhouId] = this._src;
        this._xueIndex = this._unit._xuezhouId;
        this._unit._xuezhouId++;
    }

    destroy() {
        this._src._xuezhou = null;
        delete this._unit._sxuezhou[this._xueIndex];
        super.destroy();
    }
}

// 魔司马懿 18101
class Buff18101 extends Buff {
    countTime() {
        super.countTime();
        // 每2秒造成伤害
        if (this._ttime % 120 == 15) {
            this._unit.skillHitArr.push("18101s");
        }
        if (this._ttime % 120 == 0) {
            // let hurminfojkl;'

            let add = this._config.buffarr[0].num / 100;
            let buff = this._config.buffarr[1].num;
            let hurminfo = this._unit.getHurmInfo(this._unit.getNowAttri("atk") * add, 2);

            let tarr = this._unit.getTargetByTypeState(1, 120, 120, 1, true, FILTERMAP.yinshen);
            for (let i = 0; i < tarr.length; ++i) {
                tarr[i].getCalHurm(this._unit, hurminfo, "skill", 1);
            }
            this._unit.pushOneBuff(buff, 60 * 60, null, this._src);
        }
    }
}

// 魔曹操 4技能诅咒效果
class Buff18156 extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        this.initHp = this._unit.battleInfo.hp;
    }
    destroy(bdispel) {
        if (!bdispel) {
            let hphurm = Math.max(this.initHp - this._unit.battleInfo.hp, 0) * this._config.buffarr[0].num / 100;
            let hurminfo = { crit: 0, hurm: hphurm, hurmtype: 2, ptype: "skill", attextra: { htype: "buff" } };
            if (!!this._src.getDamageAdd) {
                hurminfo.hurm = hurminfo.hurm * this._src.getDamageAdd(this._unit, hurminfo.hurmtype);
            }
            this._unit.doLogicHurt(hurminfo, this._src);
        }
        super.destroy();
    }
}

//  战士职业效果
class Buffzhanshi extends Buff {
    setPlies(plies) {
        super.setPlies(plies);
        if (this._plies == 6) {
            let buff = this._config.buffarr[1].type;
            this._unit.pushOneBuff(buff, 5 * 60, null, this._unit);
        }
    }
}

class Buffatkevery extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        let newmodel;
        if (this._config.buffarr[1]) {
            newmodel = this._config.buffarr[1].type;
        }
        this._unit.config.attinfo.model = newmodel;
    }

    destroy() {
        this._unit.config.attinfo.model = this._unit.initModel;
        super.destroy();
    }
}

class Buffjuji extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        // if(!this.backAttri["attdis"]) this.backAttri["attdis"] = 0;
        // this._unit.backAttri["attdis"] += 1000;      // 射程扩大到全场  
        this._realPaspFunc = this._unit.getNowpasp;
        this._unit.getNowpasp = (breal) => {
            if (breal) return this._realPaspFunc.call(this._unit);
            let total = this._unit.config.attinfo.tframe + this._unit.config.attinfo.batti;
            return this._unit.bTools.intergeNum(total / 120 * 1000) / 1000;
        }
        this._realAttTarget = this._unit.getMotionAttTarget;
        this._unit.getMotionAttTarget = () => {
            let tarr = this._unit.getTargetBySort({ target: 1, doarea: -1 }, "hp", "inc");
            if (tarr.length > 0) {
                this._unit.attTarget = tarr[0];
                this._unit.jujiTarget = [];
                for (let i = 0; i < 2 && i < tarr.length; ++i) {
                    this._unit.jujiTarget.push(tarr[i]);
                }
            }
        }
        this._unit.config.attinfo.model = "taishicijuji";
        this._realFarAttFunc = this._unit.doFarAtt;
        this._unit.doFarAtt = () => {
            let hurminfo = this._unit.getHurmInfo(this._unit.getNowAttri("atk"), 1);
            let attinfo = this._unit.config.attinfo;

            this._unit.BackByFarAtt(hurminfo);

            if (this._unit.jujiTarget) {
                for (let i = 0; i < this._unit.jujiTarget.length; ++i) {
                    let hinfo = gUtils.deepClone(hurminfo);
                    let effnode = new eff_1(this._unit.battleS.getEffId(), this._unit.steps, attinfo.model, attinfo, this._unit, new vecT(this._unit.x, this._unit.y), this._unit.jujiTarget[i], hinfo, "normal");
                    this._unit.battleS.effUnitArr.push(effnode);
                }
            }
        }
    }

    destroy() {
        this._unit.config.attinfo.model = this._unit.initModel;
        this._unit.getNowpasp = this._realPaspFunc;
        this._unit.getMotionAttTarget = this._realAttTarget;
        this._unit.doFarAtt = this._realFarAttFunc;
        super.destroy();
    }
}

class Buffhuoli extends Buff {
    setPlies(plies) {
        super.setPlies(plies);
        if (this._plies == 6) {
            let buff = this._config.buffarr[1].type;
            this._unit.pushOneBuff(buff, 4 * 60, null, this._unit);
        }
    }
}

class Buff40471 extends Buff {
    countTime() {
        super.countTime();
        // 每2秒造成伤害
        if (this._ttime % 120 == 0) {
            // let hurminfo
            let add = this._config.buffarr[0].num / 100;
            let bufftime = this._config.buffarr[1].num;
            let hurminfo = this._src.getHurmInfo(this._src.getNowAttri("atk") * add, 2);

            let tarr = this._unit.getTargetByType(1, 250, 250, 1);
            for (let i = 0; i < tarr.length; ++i) {
                tarr[i].getCalHurm(this._src, hurminfo, "skill", 1);
                tarr[i].pushOneBuff("db40471", bufftime * 60, null, this._src);
            }
        }
    }
}


class Buff42421 extends Buff {
    constructor(obj, unit) {
        super(obj, unit);
        onGlobalEvent(this._src._id + this._src.initTeam + "42421", (hurm) => {
            let num = this._config.buffarr[0].num;
            let hurminfo = { hurm: hurm * num / 100, hurmtype: 3, ptype: "skill", crit: 0 }
            hurminfo.is42421 = true;        // 标记是已经触发的伤害
            this._unit.doPrdcLogicHurt(hurminfo, this._src);
        }, this._unit._id + this._unit.initTeam + this._buffid);
    }

    destroy() {
        clearGlobalEvent(this._src._id + this._src.initTeam + "42421", this._unit._id + this._unit.initTeam + this._buffid);
        super.destroy()
    }
}

class Buffextradun extends Buff470311 { }

class Buffextradunover extends Buffextradun {

    destroy(bdispel) {
        if (!bdispel) {
            let buff = this._config.buffarr[1].stype;
            let ttime = this._config.buffarr[1].num;
            this._unit.pushOneBuff(buff, ttime * 60, null, this._src);
        }
        super.destroy();
    }
}

/**
    以下为旧代码buff
 */


// 魏
class qiangnubing_1 extends Lunit { }
class haozhao_1 extends Cunit { }
class caohong_1 extends Cunit { }
class chenqun_1 extends Lunit { }
class lidian_1 extends Cunit { }
class zhanghe_1 extends Cunit { }
class lejin_1 extends Lunit { }
class zhenji_1 extends Lunit { }
class xunyu_1 extends Lunit { }
class xiahouyuan_1 extends Lunit { }
class zhangliao_1 extends Cunit { }
class jiaxu_1 extends Lunit { }
class simayi_1 extends Lunit { }
class pangde_1 extends Cunit { }
class xuchu_1 extends Cunit { }
class caocao_1 extends Cunit { }
class xiahoudun_1 extends Cunit { }
class caoren_1 extends Cunit { }
class xuhuang_1 extends Lunit { }
class guojia_1 extends Lunit { }
class hudianwei_1 extends Cunit { }
// 蜀
class daofushou_1 extends Cunit { }
class zhangxingcai_1 extends Lunit { }
class liufeng_1 extends Cunit { }
class wangping_1 extends Cunit { }
class huangyueying_1 extends Cunit { }
class muludawang_1 extends Cunit { }
class zhurong_1 extends Lunit { }
class liaohua_1 extends Lunit { }
class menghuo_1 extends Cunit { }
class guanyu_1 extends Cunit { }
class pangtong_1 extends Lunit { }
class liushan_1 extends Lunit { }
class xushu_1 extends Lunit { }
class machao_1 extends Cunit { }
class huangzhong_1 extends Lunit { }
class liubei_1 extends Cunit { }
class jiangwei_1 extends Lunit { }
class zhangfei_1 extends Cunit { }
class zhaoyun_1 extends Cunit { }
class zhugeliang_1 extends Lunit { }
class weiyan_1 extends Cunit { }
class zhenpangtong_1 extends Lunit { }
// 吴
class shinv_1 extends Lunit { }
class jiangqin_1 extends Lunit { }
class dingfeng_1 extends Cunit { }
class zhanghong_1 extends Lunit { }
class lingtong_1 extends Cunit { }
class xiaoqiao_1 extends Lunit { }
class zhugejin_1 extends Lunit { }
class zhangzhao_1 extends Lunit { }
class zhoutai_1 extends Cunit { }
class daqiao_1 extends Lunit { }
class sunshangxiang_1 extends Cunit { }
class panzhang_1 extends Cunit { }
class lvmeng_1 extends Lunit { }
class luxun_1 extends Lunit { }
class bulianshi_1 extends Lunit { }
class ganning_1 extends Cunit { }
class sunjian_1 extends Cunit { }
class sunquan_1 extends Cunit { }
class sunce_1 extends Lunit { }
class zhouyu_1 extends Lunit { }
class taishici_1 extends Lunit { }
// 群
class huangjinjun_1 extends Cunit { }
class guanhai_1 extends Cunit { }
class zhangji_1 extends Lunit { }
class zhangliang_1 extends Lunit { }
class panfeng_1 extends Cunit { }
class hanxiandi_1 extends Cunit { }
class guosi_1 extends Cunit { }
class chengong_1 extends Lunit { }
class yuji_1 extends Lunit { }
class wenchou_1 extends Cunit { }
class yanliang_1 extends Cunit { }
class gongsunzan_1 extends Cunit { }
class caiwenji_1 extends Lunit { }
class dongzhuo_1 extends Cunit { }
class yuanshao_1 extends Lunit { }
class zhangjiao_1 extends Lunit { }
class huatuo_1 extends Lunit { }
class lvbu_1 extends Cunit { }
class huaxiong_1 extends Cunit { }
class diaochan_1 extends Lunit { }
class huyuanshao_1 extends Lunit { }
//神魔
class shendaodunbing_1 extends Cunit { }
class shenpangtong_1 extends Lunit { }
class shenzhoutai_1 extends Cunit { }
class shenliubei_1 extends Lunit { }
class shenlvmeng_1 extends Lunit { }
class shenzhangfei_1 extends Cunit { }
class shenguanyu_1 extends Cunit { }
class shenluxun_1 extends Cunit { }
class shenzhugeliang_1 extends Lunit { }
class shenzhugeliang_bianshen extends Lunit { }
class shenzhouyu_1 extends Lunit { }
class moqibing_1 extends Cunit { }
class mosimazhao_1 extends Lunit { }
class moyuji_1 extends Lunit { }
class mobulianshi_1 extends Lunit { }
class modiaochan_1 extends Lunit { }
class modiaochan_fenshen extends Lsepara { }
class mosimayi_1 extends Lunit { }
class mosunquan_1 extends Cunit { }
class mocaocao_1 extends Cunit { }
class mocaocao_fenshen extends Lsepara { }
class molvbu_1 extends Cunit { }
class molvbu_fenshen extends Csepara { }



class hunqianjingchangzheng_1 extends Lunit {
    doBuffDeadDeal() {
        super.doBuffDeadDeal();
        emitGlobalEvent("yechadead" + this._id + this.initTeam);
    }

    // 重新结义武将
    jieyiOneTeammate() {
        let tarr = this.getTargetByTypeState(2, -1, null, null, true, FILTERMAP.all, (unit) => {
            return !!unit._jieyi;
        })
        if (tarr.length > 0) {
            tarr = tarr.sortByType("atk", "dec");
            this._jieyi = tarr[0];
            tarr[0]._jieyimaster = this;
            if (this._jieyiSpec) {
                tarr[0].pushOneBuff("jieyi4", 100 * 60, null, this);
            } else {
                tarr[0].pushOneBuff("jieyi1", 100 * 60, null, this);
            }
        }
    }
}


module.exports = {
    BaseUnit: BaseUnit,
    qiangnubing_1: qiangnubing_1,
    haozhao_1: haozhao_1,
    caohong_1: caohong_1,
    chenqun_1: chenqun_1,
    lidian_1: lidian_1,
    zhanghe_1: zhanghe_1,
    lejin_1: lejin_1,
    zhenji_1: zhenji_1,
    xunyu_1: xunyu_1,
    xiahouyuan_1: xiahouyuan_1,
    zhangliao_1: zhangliao_1,
    jiaxu_1: jiaxu_1,
    simayi_1: simayi_1,
    pangde_1: pangde_1,
    xuchu_1: xuchu_1,
    caocao_1: caocao_1,
    xiahoudun_1: xiahoudun_1,
    caoren_1: caoren_1,
    xuhuang_1: xuhuang_1,
    guojia_1: guojia_1,
    hudianwei_1: hudianwei_1,
    daofushou_1: daofushou_1,
    zhangxingcai_1: zhangxingcai_1,
    liufeng_1: liufeng_1,
    wangping_1: wangping_1,
    huangyueying_1: huangyueying_1,
    muludawang_1: muludawang_1,
    zhurong_1: zhurong_1,
    liaohua_1: liaohua_1,
    menghuo_1: menghuo_1,
    guanyu_1: guanyu_1,
    pangtong_1: pangtong_1,
    liushan_1: liushan_1,
    xushu_1: xushu_1,
    machao_1: machao_1,
    huangzhong_1: huangzhong_1,
    liubei_1: liubei_1,
    jiangwei_1: jiangwei_1,
    zhangfei_1: zhangfei_1,
    zhaoyun_1: zhaoyun_1,
    zhugeliang_1: zhugeliang_1,
    weiyan_1: weiyan_1,
    shinv_1: shinv_1,
    jiangqin_1: jiangqin_1,
    dingfeng_1: dingfeng_1,
    zhanghong_1: zhanghong_1,
    lingtong_1: lingtong_1,
    xiaoqiao_1: xiaoqiao_1,
    zhugejin_1: zhugejin_1,
    zhangzhao_1: zhangzhao_1,
    zhoutai_1: zhoutai_1,
    daqiao_1: daqiao_1,
    sunshangxiang_1: sunshangxiang_1,
    panzhang_1: panzhang_1,
    lvmeng_1: lvmeng_1,
    luxun_1: luxun_1,
    bulianshi_1: bulianshi_1,
    ganning_1: ganning_1,
    sunjian_1: sunjian_1,
    sunquan_1: sunquan_1,
    sunce_1: sunce_1,
    zhouyu_1: zhouyu_1,
    huangjinjun_1: huangjinjun_1,
    guanhai_1: guanhai_1,
    zhangji_1: zhangji_1,
    zhangliang_1: zhangliang_1,
    panfeng_1: panfeng_1,
    hanxiandi_1: hanxiandi_1,
    guosi_1: guosi_1,
    chengong_1: chengong_1,
    yuji_1: yuji_1,
    wenchou_1: wenchou_1,
    yanliang_1: yanliang_1,
    gongsunzan_1: gongsunzan_1,
    caiwenji_1: caiwenji_1,
    dongzhuo_1: dongzhuo_1,
    yuanshao_1: yuanshao_1,
    zhangjiao_1: zhangjiao_1,
    huatuo_1: huatuo_1,
    lvbu_1: lvbu_1,
    huaxiong_1: huaxiong_1,
    diaochan_1: diaochan_1,
    shendaodunbing_1: shendaodunbing_1,
    shenpangtong_1: shenpangtong_1,
    shenzhoutai_1: shenzhoutai_1,
    shenliubei_1: shenliubei_1,
    shenlvmeng_1: shenlvmeng_1,
    shenzhangfei_1: shenzhangfei_1,
    shenguanyu_1: shenguanyu_1,
    shenluxun_1: shenluxun_1,
    shenzhugeliang_1: shenzhugeliang_1,
    shenzhugeliang_bianshen: shenzhugeliang_bianshen,
    moqibing_1: moqibing_1,
    mosimazhao_1: mosimazhao_1,
    moyuji_1: moyuji_1,
    mobulianshi_1: mobulianshi_1,
    modiaochan_1: modiaochan_1,
    modiaochan_fenshen: modiaochan_fenshen,
    mosimayi_1: mosimayi_1,
    mosunquan_1: mosunquan_1,
    mocaocao_1: mocaocao_1,
    mocaocao_fenshen: mocaocao_fenshen,
    molvbu_1: molvbu_1,
    molvbu_fenshen: molvbu_fenshen,
    taishici_1: taishici_1,
    huyuanshao_1: huyuanshao_1,
    zhenpangtong_1: zhenpangtong_1,
    shenzhouyu_1: shenzhouyu_1,

    eventGlobal: eventGlobal,
}   