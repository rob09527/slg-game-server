
'use strict'
const assert = require('assert');
const random = require('../../../util/random');
const _ = require('lodash');
// 获取节点事件(随机)
module.exports = exports = async function (chapter, season, histpower) {
    let config = global.gameconfig.mazenode[this.gateid];
    assert(config, 'mazenode config err');
    let chapterConfig = global.gameconfig.mazechapter.find(chapter => chapter.ID == this.gateid);
    assert(chapterConfig, 'mazechapter config err');
    let mazeArr = config.map(arr => {
        arr = [...arr];
        arr.shuffle();
        return arr;
    });

    // 查出备选玩家
    let roleList = await selectRole(this.gateid, histpower, this.rid);
    let rows = [];
    // 生成事件
    for (let i = 0; i < mazeArr.length; i++) {
        let nodes = [];
        for (let j = 0; j < mazeArr[i].length; j++) {
            let node = await fetchConfig(mazeArr[i][j], chapter, this.floor, i + 1, this.rid, chapterConfig.REWARDS_ADD_FLOOR, season, histpower, this.gateid, roleList);
            nodes.push(node);
        }
        rows.push(nodes);
    }
    return rows
}
let fetchConfig = async (...args) => {
    let [type, chapter, floor, index, rid, rewardfactor = 1, season = 1, histpower = 1, gateid, selectRoleList = []] = args;
    // floor 是层数,index是小层数 用来计算奖励的步长
    // rewardfactor 层奖励系数
    // season 当前所属季节 1234 春夏秋冬
    // histpower 玩家历史最高战斗力(用于匹配玩家阵容)
    // selectRoleList 查询出来的敌人列表[[{},{},{}],[{},{},{}],...]
    // 指定配置
    let config;
    let _chapter;
    // 判断是否城池id在一个范围区间
    let chatperList = Object.keys(global.gameconfig.mazetype01234);
    for (let i = 0; i < chatperList.length; i++) {
        if (chapter <= chatperList[i]) {
            // 当取通关的关卡则需要取当前关卡的上一关
            _chapter = chatperList[i - 1];
            if (!_chapter) _chapter = chatperList[0];
            break;
        }
    }
    if (!_chapter) _chapter = chatperList[chatperList.length - 1];
    let _chapter1;
    let chatperList1 = Object.keys(global.gameconfig.mazetype7);
    for (let j = 0; j < chatperList1.length; j++) {
        if (chapter <= chatperList1[j]) {
            // 当取通关的关卡则需要取当前关卡的上一关
            _chapter1 = chatperList1[j - 1];
            if (!_chapter1) _chapter1 = chatperList1[0];
            break;
        }

    }
    if (!_chapter1) _chapter1 = chatperList1[chatperList1.length - 1];
    let _chapter2;
    let chatperList2 = Object.keys(global.gameconfig.mazetype8);
    for (let h = 0; h < chatperList2.length; h++) {
        if (chapter <= chatperList2[h]) {
            //当取通关的关卡则需要取当前关卡的上一关
            _chapter2 = chatperList2[h - 1];
            if (!_chapter2) _chapter2 = chatperList2[0];
            break;
        }
    }
    if (!_chapter2) _chapter2 = chatperList2[chatperList2.length - 1];
    let data = {};
    data.state = 0;// 初始状态
    data.type = type; // 类别
    // 查出玩家对象
    let mazeRole = await global.dao.role.findOne({ _id: rid });

    switch (type) {
        case 0:
        case 1:
        case 2:
            // 怪物战斗因子-对应新远征配置表-事件类型
            const fighting_factor = global.gameconfig.others.MAZE.FIGHTING_FACTOR;
            const level_factor = global.gameconfig.others.MAZE.LEVEL_FACTOR;
            data.boxitems = [];
            // 查找
            config = global.gameconfig.mazetype01234[_chapter];
            assert(config.length > 0, 'invalid config');
            config = config.filter((arr) => {
                return arr.TYPE == type;
            });
            // 筛选出目标配置
            let rate1 = config.deepMap('W');
            config = config[random.inweight(rate1)];
            assert(config, 'invalid mazetype01234 config');
            // 计算冬季加成
            let add = 0;
            if (season == 3) {
                add = global.gameconfig.others.BATTLESEASON.VALS[season - 1];
            }
            //计算奖励的增长步长
            let items = config.ITEMS.map(({ GSID: gsid, COUNT, ADDNODE: addnode }) => {
                let count = 0;
                // 以下资源受冬季季节影响
                if (gsid == 38006 || gsid == 30015 || gsid == 30001 || gsid == 30003) {
                    count = Math.floor((COUNT + ((floor - 1) * 10 + index - 1) * addnode * rewardfactor) * (1 + add / 100));
                } else {
                    count = COUNT + ((floor - 1) * 10 + index - 1) * addnode * rewardfactor
                }
                return {
                    gsid,
                    count
                }
            })
            data.boxitems.append(items);
            const tconfig = global.gameconfig.mazetargetpower[gateid][index];
            let role = [];
            // 记录到该节点的步长
            data.stepnum = (floor - 1) * 10 + index;
            if (selectRoleList.length > 0) {
                // 判断是否是最后一个节点,如果是最后一个节点则敌人取最后一个人。
                if (index && index == 10) {
                    role = selectRoleList[selectRoleList.length - 1];
                    console.log('最后一个了', role);
                } else {
                    role = selectRoleList[0];
                    // 移除内存找那个第一个值
                    selectRoleList.splice(0, 1);
                }
            }
            if (role) {
                let userbset = [];
                // 取出来的是{mythic:{},team:{}}
                if (!role.isbot) {
                    // 真实玩家
                    userbset = await role.getBattleSet('pvpdef');
                    // pvpdef为空,取normal阵容
                    if (Object.keys(userbset.team).length == 0) userbset = await role.getBattleSet('normal');
                    // 玩家的防守阵容战斗力
                    data.pvpdefpower = role._powerbattleset.pvpdef;
                    // 记录匹配时主公的战力
                    data.role_pvpdefpower = histpower;
                } else {
                    // 机器人
                    userbset = role.battleset;
                }
                // 增加因子
                for (let pos in userbset.team) {
                    let pinfo = userbset.team[pos].property;
                    let p_power = userbset.team[pos].power;
                    // 根据玩家等级取出等级战斗因子
                    let level_f = level_factor.find(({ MAX, MIN }) => role.level >= MIN && role.level <= MAX);
                    // 血量
                    let hp = pinfo['hp'] || 0;
                    pinfo['hp'] = Math.floor(hp * tconfig.HP_ADD * fighting_factor[type] * (level_f.ADD_HP || 0));
                    let atk = pinfo['atk'] || 0;
                    pinfo['atk'] = Math.floor(atk * tconfig.ATK_ADD * fighting_factor[type] * (level_f.ADD_ATK || 0));
                    // 战斗力
                    let power = p_power || 0;
                    power = Math.floor(power * tconfig.POWER_ADD * fighting_factor[type]);
                    userbset.team[pos].property = pinfo;
                    userbset.team[pos].power = power;
                }
                data.bset = userbset;
                // 怪物的战斗力因子
                data.fighting_factor = fighting_factor[type];
                // 打真实玩家的要有这个字段
                data.pvp = 1;
                data.rname = role.name ? role.name : role.NAME || null;
                // 头像
                data.headid = role.headid ? role.headid : null;
                // 头像框
                data.frameid = role.frameid ? role.name : null
                // 血量增长因子
                data.hpadd = tconfig.HP_ADD;
                // 攻击增长因子
                data.atkadd = tconfig.ATK_ADD;
                break;
            }

        case 3:
        case 4:
            data.boxitems = [];
            // 查找
            config = global.gameconfig.mazetype01234[_chapter];
            assert(config.length > 0, 'invalid config');
            config = config.filter((arr) => {
                return arr.TYPE == type;
            });
            // 筛选出目标配置
            let rate = config.deepMap('W');
            config = config[random.inweight(rate)];
            assert(config, 'invalid mazetype01234 config');
            // 计算冬季加成
            let _add = 0;
            if (season == 3) {
                _add = global.gameconfig.others.BATTLESEASON.VALS[season - 1];
            }
            //计算奖励的增长步长
            let _items = config.ITEMS.map(({ GSID: gsid, COUNT, ADDNODE: addnode }) => {
                let count = 0;
                // 以下资源受冬季季节影响
                if (gsid == 38006 || gsid == 30015 || gsid == 30001 || gsid == 30003) {
                    count = Math.floor((COUNT + ((floor - 1) * 10 + index - 1) * addnode * rewardfactor) * (1 + _add / 100));
                } else {
                    count = COUNT + ((floor - 1) * 10 + index - 1) * addnode * rewardfactor
                }
                return {
                    gsid,
                    count
                }
            })
            data.boxitems.append(_items);
            // 返回怪物组信息
            data.bset = { team: global.gameconfig.battlemaze[config.MONSTERID] };
            // 返回怪物的id
            data.monsterid = config.MONSTERID;
            // 记录怪物的步增长系数
            data.stepfactor = config.MONSTERNODE;
            // 记录到该节点的步长
            data.stepnum = (floor - 1) * 10 + index;
            // 判断是否有招降的武将
            if (config.RESUITID) {
                data.resuitid = config.RESUITID;
                let mazeGeneralConfig = global.gameconfig.mazegeneral;
                let info = mazeGeneralConfig[data.resuitid];
                // 非空约束
                if (info) {
                    let generalInfo = await global.dao.tempgeneral.newGeneralNoSave(rid, info.GSID);
                    await generalInfo.wearEquip(info.EQUIP, info.TREASURE);
                    // 更新武将等级和阶级
                    generalInfo.level = info.LEVEL;
                    generalInfo.class = info.CLASS;
                    data.generalinfo = await generalInfo.save();
                }
            }
            // 前端显示是否显示等级,前端用
            data.showlevel = config.SHOWLEVEL;
            break;
        case 7: 	// 龙门客栈
            config = global.gameconfig.mazetype7[_chapter1];
            // 找出武将
            let list2 = [];
            let _list = [];
            while (list2.length < 4) {
                let rate = config.deepMap('W');
                let general = config[random.inweight(rate)];
                let one = list2.deepQueryOne('GSID', general.GSID);
                if (!one) {
                    let g = await global.dao.tempgeneral.newGeneralNoSave(rid, general.GSID);
                    await g.wearEquip(general.EQUIP, general.TREASURE);
                    // 更新武将等级和阶级
                    g.level = general.LEVEL;
                    g.class = general.CLASS;
                    let info = await g.save();
                    list2.push(info);
                    _list.push(info.i());
                }
            }
            let generalDetils = [];
            // 把创建的武将查出来
            for (let j = 0; j < _list.length; j++) {
                let g = await global.dao.tempgeneral.findOne({ _id: _list[j] });
                generalDetils.push(g.base());
            }
            data.generals = generalDetils;
            break;
        case 8:    // 西域商人
            config = global.gameconfig.mazetype8[_chapter2];
            let list1 = [];
            while (list1.length < 4) {
                let rate = config.deepMap('W');
                let goods = config[random.inweight(rate)];
                let one = list1.deepQueryOne('ID', goods.ID);
                if (!one) {
                    list1.push({
                        id: goods.ID,
                        items: goods.ITEMS,
                        cast: goods.CAST,
                        discount: goods.DISCOUNT,
                        limit: 1
                    })
                }
            }
            data.goods = list1;
            break;
    }
    return data;
}

let selectRole = async (...args) => {
    let [gateid = 101, histpower, rid] = args;
    let select_role = {
        rno: 1, rname: 1, iconid: 1, headid: 1, frameid: 1,
        '_powerbattleset.pvpdef': 1,
        'battlearr.pvpdef': 1,
        'battlearr.normal': 1,
        'hide': 1,
        tech: 1,
        mythical: 1,
    }
    // 取每层的第一个数据
    const tconfig = global.gameconfig.mazetargetpower[gateid][1];
    let role = [];
    const power_$gte = Math.floor(histpower * tconfig.POWER[0] / 1000);
    const power_$lte = Math.floor(histpower * tconfig.POWER[1] / 1000);

    // filter
    if (role.length < 1) {
        console.log(`按照范围匹配敌人,rid:${rid},power<:${power_$lte},power>${power_$gte}`);
        let cond = {
            _id: { $ne: rid },
            'rname': { $exists: 1 },
            'battlearr.pvpdef': { $exists: 1 },
            'battlearr.pvpdef.team': { $ne: {} },
            '_powerbattleset.pvpdef': { $gte: power_$gte, $lte: power_$lte }
        }
        let time = process.hrtime()
        role = await global.dao.role.find(cond, select_role).limit(200).sort({ '_powerbattleset.pvpdef': 1 });
        let difftime = process.hrtime(time);
        console.log('difftime1', difftime)
    }
    if (role.length < 20) {
        console.log(`按照最小战斗力匹配,rid:${rid},power<:${power_$lte},power>${power_$gte}`);
        let cond = {
            '_id': { $ne: rid },
            'rname': { $exists: 1 },
            'battlearr.pvpdef': { $exists: 1 },
            'battlearr.pvpdef.team': { $ne: {} },
            '_powerbattleset.pvpdef': { $lt: power_$gte }
        }
        let time = process.hrtime()
        let rolelist2 = await global.dao.role.find(cond, select_role).limit(20).sort({ '_powerbattleset.pvpdef': -1 });
        if (role.length > 0 && rolelist2.length > 0) {
            console.log(`范围池子不够_手动添加50人。rid:${rid},当前范围池子人数:${role.length}`);
            // 取战斗力最强20个,放入敌人池子里。
            role = _.concat(role,rolelist2);
        }
        // 下面这段逻辑是,范围池子为0,则取最小战斗力以下
        if (role.length == 0) role = rolelist2;        
        let difftime = process.hrtime(time);
        console.log('difftime2', difftime)
    }

    // 不满20人则加入机器人。取30-40级的机器人,加进去再按照。
    if (role.length < 20) {
        console.log(`不满20人添加机器人--head,rid:${rid},role.length:${role.length}`);
        // 添加机器人的数量。
        let robotlist = global.gameconfig.robotpvp.filter(function (robot) {	// filter in range
            return robot.LV >= 30 && robot.LV <= 40;
        }).sort((a, b) => a.POWER > b.POWER);
        // 转换成阵容
        let rotbotlist = [];
        let needbot = _.dropRight(robotlist, role.lenth);
        for (let i = 0; i < needbot.length; i++) {
            let robot = global.dao.role.robotGenerator(needbot[i]);
            robot.sex = role.sex || 1;
            robot.isbot = 1;
            rotbotlist.push(robot);
        }
        role.unshift(rotbotlist);
        // 递归为1维数组
        role = _.flattenDeep(role);
        console.log(`不满20人添加机器人--tail,rid:${rid},role.length:${role.length}`);
    } else {
        // 够人数,随机20个人。
        role.shuffle();
        role = role.slice(0,20)
        role = role.sort((a,b)=> a._powerbattleset.pvpdef - b._powerbattleset.pvpdef);
        console.log(`满20人,rid:${rid},role.length:${role.length}`);
    }
    return role
}