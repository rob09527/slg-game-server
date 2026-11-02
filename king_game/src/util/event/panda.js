'use strict'
const moment = require('moment');
const random = require("../random");
const commonsend = require("../../util/commonsend");
const utilCursor = require("../../util/cursor");
const _ = require('lodash');
const { assert } = require('console');
const _type = require("../../model/role/common/type");
const textgetter = require("../textgetter");
let {is7or14} = require("../weektarget")

// 是否在周活动内
// 是熊猫活动
const inPanda = function(key) {
    let config = global.config.PANDA[key];
    for (let i = 0; i < config.length; i++) {
        let obj = config[i];
        if (Date.in(obj.start, obj.end)){
            return [true, i];
        }
    }
    return [false, 0];
}

// 新服累充
const xflc = async function(role, money, cansave = true) {
    let save = false;
    let [ok, season] = role.isInPanda("XFLC");
    if (!ok || role.xflc.stage != season){
        if (role.xflc.money > 0) {
            // 补发奖励
            let config = global.gameconfig.xflc;
            assert(config, "invaild xflc config");
            let obj = config[role.xflc.stage];
            assert(obj, "invaild xflc config obj");

            let reward = [], scmoney = role.xflc.money;
            obj.ITEMS.forEach((element, index) => {
                if (scmoney >= element.PRICE && !role.xflc.record[index]) {
                    reward.push(...element.ITEMS);
                    role.xflc.record[index] = 1;
                }
            });
            if (reward.length) {
                let mails = [];
                mails.push({
                    type: 2, rid: role.i(), reward: reward.arrange(),
                    title: obj.MTITLE, content: obj.MCONTENT
                })
                await global.dao.mail.insertMany(mails);
            }
        }
        // 初始化数据
        role.xflc.stage = season;
        role.xflc.money = 0;
        role.xflc.record = [];
        save = true;
     }
    if (money > 0 && ok){
        role.xflc.money += money;
        save = true;
    }
    if (save){
        role.markModified('xflc');
        if (cansave) {
            await role.save();
        }
    }
}

const ljcz = async function(role, money, cansave = true) {
    let save = false;
    if (!role.panda.xyzm) {
        role.panda.xyzm = {general:[], val:0, freetime:0, xyflseason:0, xyflrecord:[], ljczmoney:0, ljczrecord:[], xylbrecord:[], xlbjrecord:[] }
        save = true;
    }
    let [ok, season] = role.isInPanda("XINYZM");
    if (!ok) {
        if (role.panda.xyzm.ljczmoney > 0) {
            // 补发奖励
            let obj = global.gameconfig.xyzm["LJCZ"];
            assert(obj, "invaild ljcz config");
            let ITEMS = obj.ITEMS;
            assert(ITEMS, "invaild ljcz info");
            let reward = [], scmoney = role.panda.xyzm.ljczmoney;
            ITEMS.forEach((info, index) => {
                if (scmoney >= info.MONEY && !role.panda.xyzm.ljczrecord[index]) {
                    reward.push(...info.ITEMS)
                    role.panda.xyzm.ljczrecord[index] = 1;
                }
            })
            if (reward.length) {
                let mails = [];
                mails.push({
                    type: 2, rid: role.i(), reward: reward.arrange(),
                    title: obj.MTITLE, content: obj.MCONTENT
                })
                await global.dao.mail.insertMany(mails);
            }
        }
    }
    [ok,season] = role.isInPanda("XINYFL");
    if (!ok || role.panda.xyzm.xyflseason != season){

        if (role.panda.xyzm.val > 0) {
            let xyfl = global.gameconfig.xyfl;
            assert(xyfl, "invaild xyfl config");
            let xyfl_items = xyfl[role.panda.xyzm.xyflseason];
            assert(xyfl_items, "invaild xyxs config");
            let reward = [], val = role.panda.xyzm.val, CNUM = 0;
            xyfl_items.ITEMS.forEach((info, index)=>{
                if (val >= info.CNUM) {
                    if (!role.panda.xyzm.xyflrecord[index]) {
                        reward.push(...info.ITEMS,...info.OPTIONAL.ITEMS);
                    }
                    CNUM = info.CNUM;//记录最高奖励分数，现有分数减去然后累积到下季度
                }
            })
            role.panda.xyzm.val = 0;

            if (reward.length) {
                let mails = [];
                mails.push({
                    type: 2, rid: role.i(), reward: reward.arrange(),
                    title: xyfl_items.MTITLE, content: xyfl_items.MCONTENT
                })
                await global.dao.mail.insertMany(mails);
            }
        }

        // 初始化数据
        role.panda.xyzm.xyflseason = season;
        role.panda.xyzm.xyflrecord = [];
        save = true;
     }
    if (money > 0 && ok){
        role.panda.xyzm.ljczmoney += money;
        save = true;
        
        assert(global.gameconfig.xyzm.LJCZ,"invaild ljcz config")
        let xyzm_ljcz = global.gameconfig.xyzm.LJCZ;
        let ljcz = 0;
        for (let i = 0; i < xyzm_ljcz.ITEMS.length; i++) {
            let info = xyzm_ljcz.ITEMS[i];
            if (role.panda.xyzm.ljczmoney >= info.MONEY && !role.panda.xyzm.ljczrecord[i]) {
                ljcz = 1;
                break;
            }
        }
        pushClient(role,{type:"xyzm_info",content:{ljcz}});
    }
    if (save){
        role.markModified('panda');
        if (cansave) {
            await role.save();
        }
    }
}

const dlsl = async function (role) {
    let [ok, season] = role.isInPanda("DLSL");
    let save = false, sepcialsave = false;
    let findtime = ()=>{
        // let start = 0, etime = 0;
        let dlslConfig = global.gameconfig.panda.DLSL;
        if (!dlslConfig || !dlslConfig[0]) {
            return [-1,-1]
        }
        let {start, etime} = dlslConfig[0];
        for (let info of dlslConfig) {
            if (info.start < start) {
                start = info.start;
                etime = info.etime;
            }
        }
        return [start,etime]
    }
    if (!role.panda.dlsl) {
        role.panda.dlsl = { season, record:[] }
        save = true;
        role.addItemsNoSave([{GSID:90652, COUNT:role.getProp(90215)}])

        let [start, etime] = findtime();
        if (etime == -1) {
            return console.error("dlslConfig 0 not find")
        }
        // 创建账号超过第一期时间，一定通过定时器发送邮件，这里添加发送记录，当登录赏令过期后，默认为0，不记录会再次发送
        if (moment(role.create).startOf('days').valueOf() + etime * 24 * 3600 * 1000 < Date.now()) {
            role.panda.dlsl.record.push(0);
        }
    }

    if (!ok || role.panda.dlsl.season != season) {
        let [start] = findtime();
        if (!role.panda.dlsl.record.includes(role.panda.dlsl.season) && start > -1 && moment(role.create).startOf('days').valueOf() + (start - 1) * 24 * 3600 * 1000 < Date.now()) {//当前期数没给奖励
            role.panda.dlsl.record.push(role.panda.dlsl.season);//记录当前领取奖励期数

            let dlslConfig = global.gameconfig.panda.DLSL;
            if (!dlslConfig || !dlslConfig[role.panda.dlsl.season]) {
                return console.error("dlslConfig not find")
            }
            let file = "panda_dlsl" + dlslConfig[role.panda.dlsl.season].id;
            let config = global.gameconfig[file];
            if (!config?.server) {
                return console.error(file + ' not find')
            }
            config = config.server;
            let items = [];

            for (let key in config) {
                let activity = config[key];
                for (let rule of activity) {
                    let canGet = true;
                    if (rule.REQUIRE) {
                        for (let req of rule.REQUIRE) {
                            let flags = [];
                            const count = role.getProp(req.GSID);
                            if (typeof req.COUNT === 'number') flags.push(count == req.COUNT);
                            if (typeof req.MINCOUNT === 'number') flags.push(count >= req.MINCOUNT);
                            if (typeof req.MAXCOUNT === 'number') flags.push(count <= req.MAXCOUNT);
                            if (Array.isArray(req.IN)) flags.push(req.IN.includes(count)); // 增加一个包含条件
                            if (typeof req.POS === 'number') flags.push((0x00000001 & (count >> (req.POS - 1))) !== 1);

                            canGet = flags.every(f => f);
                            if (!canGet) {
                                break;
                            }
                        }
                    }
                    if (canGet) {
                        for (let re of rule.TO) {
                            let type = _type(re.GSID);
                            if (type == "others") {
                                role.addItemsNoSave([{GSID:re.GSID, COUNT:re.COUNT}])
                                continue;
                            }
                            items.push(re)
                        }
                    }
                }
                for (let rule of activity) {
                    for (let re of rule.TO) {
                        let type = _type(re.GSID);
                        if (type == "others" && role.getProp(re.GSID)) {
                            role.castItemsNoSave([{gsid:re.GSID, count:role.getProp(re.GSID)}])
                            break;
                        }
                    }
                }
            }

            if (items.length) {
                let mails = [];
                mails.push({
                    type: 2, rid: role.i(), reward: items.arrange(),
                    title: textgetter('DLSL_SLJL_T'), content: textgetter('DLSL_SLJL_C')
                })
                await global.dao.mail.insertMany(mails);
            }
        }


        role.panda.dlsl.season = season;
        save = true;
        if (role.getProp(90652)) {
            role.castItemsNoSave([{gsid:90652, count:role.getProp(90652)}])
        }
        role.special["exp"] = null;
        role.special["adv"] = null;
        role.special["money"] = null;
        sepcialsave = true;
    }
    
    //90730登录赏令首次登陆标记
    if (ok && role.getProp(90730) == 0) {
        role.addItemsNoSave([{GSID:90652,COUNT:1}, {GSID:90730,COUNT:1}])
    }

    if (save) {
        role.markModified("panda.dlsl")
    }

    if (sepcialsave) {
        role.markModified("special");
    }
}

//神魔招募累计充值
const smljzc = async function(role, money, cansave = true) {
    let save = false;
    if (!role.panda.smzm) {
        let init = global.gameconfig.smzm.SMZM.INITGENERAL.map(info=>info);
        role.panda.smzm = {general:init, val:0, freetime:0, smflseason:0, smflrecord:[], ljczmoney:0, ljczrecord:[], smlbrecord:[], xlbjrecord:[] }
        save = true;
    }
    let smzm = role.panda.smzm;
    // let [ok, season] = role.isInPanda("SMZM");
    // if (!ok) {
    //     if (smzm.ljczmoney > 0) {
    //         let obj = global.gameconfig.smzm["LJCZ"];
    //         assert(obj, "invaild ljcz config");
    //         let ITEMS = obj.ITEMS;
    //         assert(ITEMS, "invaild ljcz info");
    //         let reward = [], scmoney = smzm.ljczmoney;
    //         ITEMS.forEach((info, index) => {
    //             if (scmoney >= info.MONEY && !smzm.ljczrecord[index]) {
    //                 reward.push(...info.ITEMS)
    //                 smzm.ljczrecord[index] = 1;
    //             }
    //         })
    //         if (reward.length) {
    //             let mails = [];
    //             mails.push({
    //                 type: 2, rid: role.i(), reward: reward.arrange(),
    //                 title: obj.MTITLE, content: obj.MCONTENT
    //             })
    //             await global.dao.mail.insertMany(mails);
    //         }
    //     }
    // }
    let [ok,season] = role.isInPanda("SMFL");
    if (!ok || smzm.smflseason != season) {
        if (smzm.val > 0) {
            let smfl = global.gameconfig.smfl;
            assert(smfl, "invaild smfl config");
            let smfl_items = smfl[smzm.smflseason];
            assert(smfl_items, "invaild smfl_items config");
            let reward = [], val = smzm.val;
            smfl_items.ITEMS.forEach((info, index)=>{
                if (val >= info.CNUM) {
                    if (!smzm.smflrecord[index]) {
                        reward.push(...info.ITEMS,...info.OPTIONAL.ITEMS);
                    }
                }
            })
            smzm.val = 0;

            if (reward.length) {
                let mails = [];
                mails.push({
                    type: 2, rid: role.i(), reward: reward.arrange(),
                    title: smfl_items.MTITLE, content: smfl_items.MCONTENT
                })
                await global.dao.mail.insertMany(mails);
            }
        }

        // 初始化数据
        smzm.smflseason = season;
        smzm.smflrecord = [];
        save = true;
    }
    if (money > 0 && ok){
        smzm.ljczmoney += money;
        save = true;
        
        assert(global.gameconfig.smzm.LJCZ,"invaild ljcz config")
        let smzm_ljcz = global.gameconfig.smzm.LJCZ;
        let ljcz = 0;
        for (let i = 0; i < smzm_ljcz.ITEMS.length; i++) {
            let info = smzm_ljcz.ITEMS[i];
            if (smzm.ljczmoney >= info.MONEY && !smzm.ljczrecord[i]) {
                ljcz = 1;
                break;
            }
        }
        pushClient(role,{type:"smzm_info",content:{ljcz}});
    }
    if (save){
        role.markModified('panda.smzm');
        if (cansave) {
            await role.save();
        }
    }
}

//皮肤星盘
const pfxp = async function(role, mark) {
    let [ok, season, id] = role.isInPanda("PFXP");
    let save = false;
    if (!role.panda.pfxp) {
        role.panda.pfxp = {free:0, id:id, score:0, get:{count:0}};
        save = true;
    }
    if (!ok || role.panda.pfxp.id != id) {
        let config = global.gameconfig['pfxppool'+role.panda.pfxp.id];
        if (role.panda.pfxp.score && config) {
            let { REWARD } = config;
            let items = [], score = 0;
            do {
                score = 0;
                REWARD.forEach(({SCORE, SIGN, ITEMS}, index)=>{
                    if (role.getProp(SIGN) > 0) {
                        role.castItemsNoSave([{GSID:SIGN, COUNT:role.getProp(SIGN)}]);
                        score = SCORE;
                    } else if (role.panda.pfxp.score >= SCORE) {
                        items.push(...ITEMS);
                        score = SCORE;
                    }
                })
                role.panda.pfxp.score -= score;
            } while (score > 0);

            if (items.length) {
                let mails = [];
                mails.push({
                    type: 2, rid: role.i(), reward: items.arrange(),
                    title: config.MTITLE, content: config.MCONTENT,
                })
                await global.dao.mail.insertMany(mails);
            }
        }
        role.panda.pfxp = {free:0, id:id, score:0, get:{count:0}};
        save = true;
    }
    if (save) {
        role.markModified('panda.pfxp');
    }
    if (mark) {
        mark.save = save;
    }
}

const hsgc = async function(role) {
	let key = "hsgc";
    let panda = role.panda[key];
    if (panda) {
        let [ok, season, id] = role.isInPanda(key);
        if (!ok || panda.id != id) {
            delete role.panda.hsgc;
            role.markModified('panda.hsgc');
            let mark = [];
            let CONFIG = global.gameconfig[key];
            if (CONFIG) {
                let shop = CONFIG.shop[id] || CONFIG.shop[panda.id];
                for (let stage in shop) {
                    shop[stage].forEach(({MARK})=>{
                        role.getProp(MARK) && mark.push({GSID:MARK, COUNT:0});
                    })
                }
            }
            mark.length && role.setItemsNoSave(mark);
            await role.save();
        }
    }
}

const weektarget = async function(role, money) {
    let keys = {"weektarget":0, "twoweektarget":1};
    let save = false;
    for (let key in keys) {
        let index = keys[key];
        const { RECHARGE } = global.gameconfig[key];
        if (!is7or14(role,index)) {//2023/3/7策划要求去掉邮件
            // let reward = [], addArr = [];
            // RECHARGE.forEach(value=>{
            //     if (role.getProp(value.MARK) >= value.NUM && !role.getProp(value.PMARK)) {
            //         addArr.push({GSID:value.PMARK,COUNT:1});
            //         reward.push(...value.REWARD);
            //     }
            // })
            // if (reward.length) {
            //     role.addItemsNoSave(addArr);
            //     let mails = [];
            //     let day = index == 0 ? "七":"十四";
            //     mails.push({
            //         type: 2, rid: role.i(), reward: reward.arrange(),
            //         title: `${day}日目标累充`, content: `您有未领取的${day}日目标累充奖励，请领取！`
            //     })
            //     await global.dao.mail.insertMany(mails);
            //     save = true;
            // }
            continue;
        }
        const _create = new Date(role.create);
        _create.setHours(0, 0, 0, 0);
    
        const _now = new Date();
        _now.setHours(0, 0, 0, 0);
        let day = (_now - _create) / (24 * 3600 * 1000);
        let item = RECHARGE.find(value=>value.DATE == day);
        if (!item) {continue;}
        role.addItemsNoSave({GSID:item.MARK, COUNT:money});
        save = true;
    }
    save && await role.save();
}

const tasks = {
    "EVENT_LOGIN": async function(role, mark) {
        // 登录事件
        // await xflc(role, 0);     // 2023/4/11 策划需求屏蔽
        await ljcz(role, 0);
        await dlsl(role);
        await smljzc(role, 0);   // 2023/3/1 策划需求屏蔽
        await pfxp(role, mark);
        await weektarget(role, 0);
        await hsgc(role);
        return 0;
    },
    "EVENT_RECHARGE": async function(role, price) {
        // 充值时间
        // await xflc(role, price, false);      // 2023/4/11 策划需求屏蔽
        await ljcz(role, price, false);
        // await smljzc(role, price, false);    // 2023/3/1 策划需求屏蔽
        await weektarget(role, price);
        return 0;
    },
}

// 周活动事件埋点任务
module.exports = async function (task, ...argv) {
    const fn = tasks[task];
    if(!fn) console.warn('MISS POINT TASK', task);
    return fn.call(this, ...argv);
}


