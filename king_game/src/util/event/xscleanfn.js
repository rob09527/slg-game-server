const tg = require('../textgetter');
const _type = require('../../model/role/common/type');
const utilCursor = require('../../util/cursor');
const moment = require('moment');
const _ = require('lodash');
module.exports = {
    XS_CPLB: async function (set,week){
        set.$unset.cplb = 1;
    },
    XS_CPLB2: async function (set,week){
        set.$unset.cplb2 = 1;
    },
    XS_GXLB:async function (set,week){
        set.$unset.gxlb = 1;
    },
    XS_QXSY:async function (set,week,cond){
        let ac_key = 'xs_qxsy';
        const actConfig = global.ACTIVITY[ac_key];
        let expand;
        if(actConfig) {
            set.$unset['act.XS_QXSY'] = 1;
            expand = actConfig.getExpand();
            const {
                EXCHANGE_COINS,
                MARK, MARKNAME,
                EVENTNAME,
                CLEAR_MARKS = [], // 只是清理的标记，不换算奖励
                COIN_GSID = 38006
            } = expand;
            if (MARK) { 
                for (const m of CLEAR_MARKS) { // 清理特殊标记
                    const t = _type(m);
                    set.$unset[`${t}.${m}`] = 1;
                };
            };
        };
    },
    XS_CJXG3:async function (set,week){
        set.$unset['cjxg3'] = 1;
    },
    XS_XYGX:async function (set,week,cond){
        let key1 = `xs_xygx${week}`;
        console.log(key1);
        let config = global.gameconfig.zhd[key1.toUpperCase()];
        if(!config) return;
        let uids = [];
        await utilCursor(global.dao.role.find(cond, {_id: 1}), async (role) => {
            uids.push(role._id);
        });
        await global.dao.c_spin.updateMany({rid:{$in:uids}}, {$set: {refresh: 1}});
    },
    XS_ZZTJJ_GX:async function (set,week,cond){
        await this.XS_ZZTJJ(set,'gx',week,cond)
    },
    XS_ZZTJJ: async function (set,type,week,cond){
        let key = `xs_zztjj_${type}${week}`;
        console.log(key);
        let config = global.gameconfig.zhd[key.toUpperCase()];
        if(!config) return;
        let {ITEMS} = config;
        set.$set[`zztjj_${type}`]= {ispay: 0, num: 0};
        let time;
        let [start, end] = [0, 0];
        const day = moment().add(-global.gameconfig.others.NEW_ROLE_DAYS, 'days');
        [start, end] = [day.startOf('days').valueOf(), moment().add(-1, 'days').startOf('days').valueOf()];
        try {
            time = moment(moment(end).format('YYYY-MM-DD')).diff(moment(start).format('YYYY-MM-DD'), 'days');
            if(time > 7) time = 7;
        } catch (error) {
            console.error(`SCHEDULEREF ${key}.toUpperCase()} TIME ERROR ${error}`, new Date().toLocaleString());
        }
        let mails = [];
        await utilCursor(global.dao.role.find({...cond, [`zztjj_${type}.ispay`]: 1}, {
            [`zztjj_${type}`]: 1,_id: 1
        }), async (role) => {
            let items = []
            let record = role[`zztjj_${type}`] || {};
            let num = record.num || 0;
            num = time + 1 - num;
            if (num <= 0) return;
            items = ITEMS.map(item => {
                return {
                    count: item.COUNT * num,
                    gsid: item.GSID
                }
            })
            mails.push({
                type: 2, rid: role._id.toString(),
                title: tg('ZZTJJ_T'),
                content: tg('ZZTJJ_C'),
                reward: items,
            })
    
            if (mails.length > 1000) {
                await global.dao.mail.insertMany(mails).catch(console.error);
                mails.splice(0, mails.length);
            }
        })
        if (mails.length > 0) await global.dao.mail.insertMany(mails);
    },
    JFHD: async function (set,xskey,week,cond){
        let key = `xs_${xskey}`;
        let key1 = `xs_${xskey}${week}`;
        console.log(key1);
        let config = global.gameconfig.zhd[key1.toUpperCase()];
        if(!config) return;
        let {
            REFMARKS,
            CLEANMARKS,
            MISSIONS,
            MARK,
            LOOPLIMIT,
        } = config;
        // 清空标记
        let cod = {$or:[]}
        if(REFMARKS){
            for (let mark of REFMARKS) {
                set.$unset[`others.${mark}`] = 1;
                cod.$or.push({
                    [`others.${mark}`]:{$exists : 1}
                })
            }
        }
        if(CLEANMARKS){
            for (let mark of CLEANMARKS) {
                set.$unset[`others.${mark}`] = 1;
                cod.$or.push({
                    [`others.${mark}`]:{$exists : 1}
                })
            }
        }
        cod.create = cond.create;
        let mails = [];
        await utilCursor( global.dao.role.find(cod, { others: 1, hide: 1,_id:1,create:1,uid:1}), async (role)=> {
            if(role.others[MARK]){
                let looplimit = LOOPLIMIT[role.vip];
                let cycleScore = _.last(MISSIONS).NUM;
                let curScore = role.getProp(MARK);
                curScore = Math.min(curScore, looplimit * cycleScore);
                let nowLoop = Math.min(Math.trunc(curScore / cycleScore), looplimit - 1);
                let reward = [];
                for (let curloop = 0; curloop <= nowLoop; curloop++) {
                    let markNums = MISSIONS.map(({ MARK }) => role.getProp(MARK));
                    for (let i = 0; i < MISSIONS.length; i++) {
                        let {NUM, ITEMS,SELECTITEMS } = MISSIONS[i];
                        let markNum = markNums[i];
                        if (markNum > curloop) continue;
                        let needScore = cycleScore * curloop + NUM;
                        if (needScore > curScore) break;
                        reward.push(...ITEMS);
                        if (SELECTITEMS && SELECTITEMS[0]) {
                            reward.push(SELECTITEMS[0]);
                        }
                        markNums[i] += 1;
                    }
                }
                if (reward.length < 1) return;
                reward = reward.arrange();
                const base_key = key.replace('xs_', '');
                mails.push({
                    type: 2,
                    rid: role._id,
                    title: tg(`${base_key.toUpperCase()}_RETURN_T`),
                    content: tg(`${base_key.toUpperCase()}_RETURN_C`),
                    reward,
                })
        
                if (mails.length > 1000) {
                    await global.dao.mail.insertMany(mails).catch(console.error);
                    mails.splice(0, mails.length);
                }
            };
        })
        if(mails.length > 0){
            global.dao.mail.insertMany(mails);
        }

    },
    XS_GXDB:async function (set,week,cond){
        await this.JFHD(set,'gxdb',week,cond);       
    },
    XS_CPJF:async function (set,week,cond){
        await this.JFHD(set,'cpjf',week,cond);
    },
    XS_CPJF2:async function (set,week,cond){
        await this.JFHD(set,'cpjf2',week,cond);
    },
    XS_THLB:async function(set,week){
        set.$unset['thlb'] = 1;
    },
    XS_DJS:async function(set,week){
        let key =  'xs_djs' ;
        let key1 = `${key}${week}`;
        console.log(key1);
        let config = global.gameconfig.zhd[key1.toUpperCase()];
        if(!config) return;
        let {
            REFMARKS,
            CLEANMARKS,
            MISSIONS,
            MARK,
            LOOPLIMIT,
        } = config;
        if(MARK) {
            const t = _type(MARK);
            set.$unset[`${t}.${MARK}`] = 1;
        }
        // 清空标记
        if(REFMARKS){
            for (let mark of REFMARKS) {
                const t = _type(mark);
                set.$unset[`${t}.${mark}`] = 1;
            }
        }
        if(CLEANMARKS){
            for (let mark of CLEANMARKS) {
                const t = _type(mark);
                set.$unset[`${t}.${mark}`] = 1;
            }
        }
    },
    XS_SZHC:async function(set,week){
        set.$unset['szhc'] = 1;
    },
    XS_ZZTJJ_GZ:async function(set,week,cond){
        await this.XS_ZZTJJ(set,'gz',week,cond)
    },
    XS_ZZTJJ_DJ:async function(set,week,cond){
        await this.XS_ZZTJJ(set,'dj',week,cond)
    },
    XS_XSDH:async function(set,week){
        set.$unset['xsdh'] = 1;
    },
    XS_ZMQY:async function(set,week){
        set.$unset['zmqy'] = 1;
    },
    XS_XYZM:async function(set,week){
        set.$unset['xyzm'] = 1;
    },
    XS_ZMJF:async function(set,week,cond){
        this.JFHD(set,'zmjf',week,cond);  
    },
    XS_GZLB:async function(set,week,cond){
        set.$unset['gzlb'] = 1;
    },
    // XS_CJXG1:async function(set,week,cond){
    //     set.$unset['cjxg1'] = 1;
    // },
    XS_CJXG2:async function(set,week,cond){
        set.$unset['cjxg2'] = 1;
    },
    XS_JFBX: async function(set,week,cond){
        let key = 'XS_JFBX' ;
        let mails = [];
        let key1 = `${key}${week}`;
        console.log(key1);
        let config = global.gameconfig.zhd[key1.toUpperCase()];
        if(!config) return;
        let {REFMARKS, BOX, EVENT, EVENTNAME} = config;
        // 清空标记
        for (let mark of REFMARKS) {
            set.$unset[`others.${mark}`] = 1;
        };
        set.$unset['jfbx'] = 1;
        let cod = {
            jfbx:{$exists:1}
        }
        cod.create = cond.create;
        await utilCursor(global.dao.role.find(cod, {others: 1,  jfbx: 1}), async (role) => {
            let totalScore = EVENT.map(({MARK}) => role.getProp(MARK)).reduce((sum, cur) => sum + cur, 0);
            let record = role.jfbx || [];
            let roleReward = [];
            BOX.forEach(({SCORE, REWARD}, index) => {
                let status = record[index] == 1 ? 2 : (totalScore >= SCORE ? 1 : 0);
                if (status == 1) roleReward.push(...REWARD);
            })
            if (roleReward.length > 0) mails.push({
                type: 2,
                rid: role._id,
                title: tg(`COMMON_RETURN_T`, EVENTNAME),
                content: tg(`COMMON_RETURN_C`, EVENTNAME),
                reward: roleReward,
            });
            if (mails.length > 1000) {
                await global.dao.mail.insertMany(mails);
                mails.splice(0, mails.length);
            }
        });
        if (mails.length > 0) await global.dao.mail.insertMany(mails);
    },
    XS_DJRW: async function(set,week,cond){
        let key = 'XS_DJRW';
        let key1 = `${key}${week}`;
        console.log(key1);
        let config = global.gameconfig.zhd[key1.toUpperCase()];
        if(!config) return;
        let {
            REFMARKS,
            MISSIONS,
        } = config;
         // 清空标记
        let cod = {$or:[]}
        for (let mark of REFMARKS) {
            set.$unset[`others.${mark}`] = 1;
            cod.$or.push({
                [`others.${mark}`]:{$exists : 1}
            })
        }
        cod.create = cond.create;
        let cursor = global.dao.role.find(cod, {others: 1,_id:1}).cursor();
        let role;
        let mails = [];
        while (role = await cursor.next()) {
                let beforeCHK = MISSIONS.filter(({CHK}) => CHK.length === 1)
                .map(({CHK}) => CHK)
                .reduce((pre, next) => pre.concat(next));
                let reward = [];
                for (let index = 0; index < MISSIONS.length; index++) {
                    let {MARK, CHK, ITEMS,} = MISSIONS[index];
                    if (role.getProp(MARK) > 0) continue;
                    let fullfill = false;
                    if (index == MISSIONS.length - 1) {
                        // 最后一个完成所有任务，检查标记，不检查领取状态
                        fullfill = beforeCHK.every(({MARK, NUM}) => {
                            return role.getProp(MARK) >= NUM;
                        })
                    } else {
                        fullfill = CHK.every(({MARK, NUM}) => {
                            return role.getProp(MARK) >= NUM;
                        })
                    }
                    if (fullfill) reward.push(...ITEMS);
                }
                if (reward.length > 0) mails.push({
                    type: 2,
                    rid: role._id,
                    title: tg('DJRW_RETURN_T'),
                    content: tg('DJRW_RETURN_C'),
                    reward,
                });
                if (mails.length > 1000) {
                    await global.dao.mail.insertMany(mails).catch(console.error);
                    mails.splice(0, mails.length);
                }            
        }
        if (mails.length > 0) global.dao.mail.insertMany(mails).catch(console.error);
        console.error(`SCHEDULEREF XSDJRW END`, JSON.stringify(cond));
    },
    XS_DJJF: async function(set,week,cond){
        await this.JFHD(set,'djjf',week,cond);  
    },
    XS_CZLB: async function(set,week,cond){
        set.$unset['czlb'] = 1;
    }
}