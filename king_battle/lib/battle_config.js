
const IsServer = (typeof(global) == "object" && global.window == false)
//是否修改为竖屏
var IsVertical = function(){
    return true
}

var GetVec2 = function(x, y){
    if(IsServer){
        return {"x":x, "y":y}
    }
    return cc.v2(x, y)
}
//竖向  GetVec2(120, -140)  斜向 GetVec2(40, 40)
var startpos =  GetVec2(150, -88)//(250,-80)
//竖向  GetVec2(140,  125)  GetVec2(80, 80)
var v2jiange = GetVec2(105, 87) //中间格子的距离
const ChanYiV2 = GetVec2(2, 2)
var GetJianGe = function (){
    return v2jiange
}

var _gridPosArr = []

//i=竖向 j=横向
for(var i=0; i<7; i++){
    var linei = []
    for(var j=0; j<7; j++){
        // linei.push(GetVec2(startpos.x + j*v2jiange.x -(i%2 == 0 ? 0 : 50) - (3 - i) * (ChanYiV2.x * (1 - (3 - i)/7 * 0.8)), startpos.y + i * v2jiange.y - (ChanYiV2.y * (1 - i/7 * 0.1)) * (3 - i) ))
        if(i%2==0 && j == 6){
            continue //丢掉不要的格子
        }
        let startX = startpos.x + j*v2jiange.x - (i%2 == 0 ? 0 : 50)
        linei.push(GetVec2(startX - (j - 3) * ChanYiV2.x * (1 - (3-i) * 1), startpos.y + i * v2jiange.y - ChanYiV2.y * (3 - i) ))
    }
    _gridPosArr.push(linei)
}

var _rowRect = [80, 78, 76, 74, 72, 70, 68, 66];

// 转换显示坐标位置 y 拉长 100/ 80  y斜率16  40度旋转
var _convertToShowSpace = (pos) => {
    if(IsVertical() ){
        return GetVec2(pos.x, pos.y)
    }
    let x = pos.x, y = pos.y;
    y = y * 103 / 80;
    x = x * 85.4 / 80;
    let offsety = Math.tan(16 * 2 * Math.PI / 360) * x;
    y = y + offsety;

    let x0 = (x - 0)*Math.cos(39.8 * 2 * Math.PI / 360) + (y- 0)*Math.sin(39.8 * 2 * Math.PI / 360) + 0;
    let y0 = (y - 0)*Math.cos(39.8 * 2 * Math.PI / 360) - (x - 0)*Math.sin(39.8 * 2 * Math.PI / 360) + 0;
    return GetVec2(x0, y0)
}

// 1-加物攻 2-加魔法攻击 2-加物理防御 4-加魔法防御 5-加攻速 6-加暴击 7-加暴击伤害 8-加闪避 9-加增伤 10-加免伤 
var _buff = {
    datk: 1,
    patk: 2,
    ddef: 3,
    pdef: 4,
    asp: 5,
    pcri: 6,
    vcri: 7,
    avd: 8,
    exdm: 9,
    exhr: 10,
};

var _debuff = {
    datk: 1,
    patk: 2,
    ddef: 3,
    pdef: 4,
    asp: 5,
    pcri: 6,
    vcri: 7,
    avd: 8,
};

const ZhenfaRestrain = {
    101:{103: 1, 105: 1},
    102:{101: 1, 104: 1},
    103:{102: 1, 104: 1},
    104:{101: 1, 105: 1},
    105:{102: 1, 103: 1}
}

// 获取阵法克制状态 
var getStateSrcforAgainst = function (sid, aid) {
    if(!sid || !aid) return 0;
    if(!!sid && sid === aid) return 0; 
    if(!ZhenfaRestrain[sid]) return 0;
    if(!ZhenfaRestrain[aid]) return 0; 

    return ZhenfaRestrain[sid][aid] ? 1 : 2;
}

var _talentSkill = {
    "11": 20000,
    "12": 20001,
    "13": 20003,
    "14": 20006,
    "15": 20010,
    "22": 20002,
    "23": 20004,
    "24": 20007,
    "25": 20011,
    "33": 20005,
    "34": 20008,
    "35": 20012,
    "44": 20009,
    "45": 20013,
    "55": 20014
}

const AllBattleTab = {
    dbEffInfo:"dbeffinfo.json",
    dbBuffInfo:"dbbuffinfo.json",
    dbRoleInfo:"dbroleinfo.json",
    dbSkillB:"dbskillback.json",
    dbThicBack:"dbthicback.json",
    dbHalo:"dbHalo.json",
    dbGeneral:"general.json",
    dbThicSkill:"dbthicskill.json",
    dbThicTalent:"dbthictalent.json",
    cardconfig:"cardinfo.json",
    dbCardSkill:"cardskill.json",
    dbTrapSkill:"dbTrapSkill.json",
    dbChariotSkill:"dbChariotSkill.json",
}
var configtab = {}
var GetBattleConfig = function(cfgName){
    if(!AllBattleTab[cfgName]){
        console.error("未找到配置:" + cfgName)
    }
    configtab[cfgName] = configtab[cfgName] || (IsServer ? require("../bconfig/" + AllBattleTab[cfgName]) :  app.db[cfgName])
    return configtab[cfgName]
}

//调试==============================================begin
let debugloglist = []
let battleStartData = {}
let AddRecordLog = function(strlog){
    debugloglist.push(strlog)
}
let ShowRecordLog = function(){
    console.log("startdata:\n" + JSON.stringify(battleStartData, null, 4) + "\n================================================logdata:\n" + JSON.stringify(debugloglist, null, 4))
}
let ClearRecordLog = function(){
    debugloglist = []
}
let IsShowDebug = function(){
    return false
}
let SetStartData = function(data){
    battleStartData = data
}
//调试==============================================end

let FrameCount = 60
module.exports = {
    norMalScale: 1,
    gridPosArr:  _gridPosArr,
    talentSkill: _talentSkill,
    gridWidth: 7,
    gridHeight: 7,
    turnCount: 60/FrameCount,
    turnTime: 1/FrameCount,
    buff: _buff,
    debuff: _debuff,
    gridRect: 75,
    convertToShowSpace: _convertToShowSpace,
    rowRect: _rowRect,
    getStateSrcforAgainst: getStateSrcforAgainst,
    IsVertical:IsVertical,
    GetJianGe:GetJianGe,
    GetBattleConfig:GetBattleConfig,
    //调试
    AddRecordLog:AddRecordLog,
    ShowRecordLog:ShowRecordLog,
    ClearRecordLog:ClearRecordLog,
    IsShowDebug:IsShowDebug,
    SetStartData:SetStartData,

}