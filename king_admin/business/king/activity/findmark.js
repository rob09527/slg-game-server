exports.name = '活动标识数据查询';
exports.type = 'I';
exports.inherit = 'activity-view';
const moment = require('moment');
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
// 根据id查找字段名
const getTypeFun = function (gsid) {
    let num = parseInt(gsid) / 10000;
    switch (Math.floor(num)) {
        case 1:
            return 'general';
        case 9:
            return 'others';
        case 5:
			if (num * 10 >= 51 && num * 10 < 52) { // 头像框
				return '_frames';
			}else if (num * 10 >= 54 && num * 10 < 55) {    // 54000 ~ 54999 兵书
				return 'book';		
			}else if (num * 10 >= 56 && num * 10 < 57) {	// 56000 ~ 56999 魂石
				return 'soulstone';
			// }else if (num * 10 >= 57 && num * 10 < 58) {	// 57000 ~ 57999 珍宝
			// 	return 'zhenbao';
			}else if (num * 10 >= 58 && num * 10 < 59) {	// 58000 ~ 58999 珍宝碎片
				return 'zbpiece';
			}else if (num * 10 >= 59 && num * 10 < 60){
				return 'props';
			}
        case 6:	
            if(gsid >= 60000 && gsid <= 60499){         //印记
                return 'signet'
            }else if (gsid >= 60500 && gsid < 61000) {   // 称号
                return '_titles';
            }else if (gsid >= 61000 && gsid < 62000) {   // 灵宠
                return 'pet';
			}else if (gsid >= 62000 && gsid < 63000) {   // 新坐骑
				return 'horse';
			}
        default:
            if (num * 10 >= 38 && num * 10 <= 39) {
                return 'hide';
            } else {
                return 'props';
            }
    }
}

exports.exec = async function (body, query, ctx) {
    let {actmarks, isset} = body;
    if(!actmarks) {
        return { items:[], total:0 }
    }

    isset = isset == 'true' ? true : false;

    actmarks = actmarks.split(',');

    const roleModel = await this.service.game.collection('roles');

    const setDataFun = async (roles, actPro, lowerHdMark) =>{
        console.log('[setDataFun] actPro =%s, lowerHdMark =',actPro, lowerHdMark)
        let notDelCount = 0;  // 未删除的玩家数
        for(const role of roles){
            let objOrArr = role[actPro];
            // 不存在 || 空数组 || 空对象
            if(!objOrArr || (Array.isArray(objOrArr) && !objOrArr.length) || !Object.keys(objOrArr).length) continue;
            let $set = {};
            if(Array.isArray(objOrArr)){ // 是否是数组
                if(objOrArr.includes(1)) {
                    notDelCount++;
                    $set[actPro] = [];
                }
                else if(lowerHdMark == 'hydt' && objOrArr.length){
                    notDelCount++;
                    $set[actPro] = [];
                }
            }
            else if(Object.keys(objOrArr).length){// 是否是对象
                if(lowerHdMark == 'xyzm') {
                    if(objOrArr.recruit.friend || objOrArr.recruit.normal || objOrArr.recruit.premium || objOrArr.rolltimes || objOrArr.record.length){
                        notDelCount++;
                        $set[actPro] = { recruit:{ friend: 0, normal: 0, premium:0}, rolltimes: 0, record: [] }
                    }
                }
                else if(lowerHdMark == 'thjj' || lowerHdMark == 'thjj1') {// {isbuy:0,num:0} 类型
                    if(objOrArr.isbuy || objOrArr.num) {
                        notDelCount++;
                        $set[actPro] = {isbuy:0,num:0};
                    }
                }
                else if(lowerHdMark == 'zztjj_gz'||lowerHdMark == 'zztjj_dj'||lowerHdMark == 'zztjj_gj'||lowerHdMark == 'zztjj_gx'||
                    lowerHdMark == 'zztjj1_gz'||lowerHdMark == 'zztjj1_dj'||lowerHdMark == 'zztjj1_gj'||lowerHdMark == 'zztjj1_gx' ) { // {ispay:0,num:0} 类型
                    if(objOrArr.ispay || objOrArr.num) {
                        notDelCount++;
                        $set[actPro] = {ispay:0,num:0};
                    }
                }
                else if(lowerHdMark == 'sgzb') {// {free:0,pickgsid:0,time:0} 类型
                    if(objOrArr.free || objOrArr.pickgsid|| objOrArr.time) {
                        notDelCount++;
                        $set[actPro] = {free:0,pickgsid:0,time:0}
                    }
                }
                else if(lowerHdMark == 'yd_hyfd') {// fudai 类型
                    if(objOrArr.unlocktime || objOrArr.buycount.length || objOrArr.rewardtime.length) {
                        notDelCount++;
                        $set[actPro] = {unlocktime:0,buycount:[],rewardtime:[]};
                    }
                }
                else if(lowerHdMark == 'xczc') {// {multiples:[],freeCount:1} 类型
                    if(objOrArr.multiples.length || objOrArr.freeCount) {
                        notDelCount++;
                        $set[actPro] = {};
                    }
                }
                else if(lowerHdMark == 'zcjb') {// 类型
                    if(objOrArr.box.length || objOrArr.dayhit || objOrArr.daycoin || objOrArr.log.length) {
                        notDelCount++;
                        $set[actPro] = {};
                    }
                } else if(lowerHdMark == 'xysh') {// {num:0,wishIndex:0,wishDone:true} 类型
                    if(objOrArr.num || objOrArr.wishIndex || objOrArr.wishDone) {
                        notDelCount++;
                        $set[actPro] = {};
                    }
                } else if(lowerHdMark == 'hjyt') {// {spot:0, box:[]} 类型
                    if(objOrArr.spot || objOrArr.box.length) {
                        notDelCount++;
                        $set[actPro] = {};
                    }
                } else if(lowerHdMark == 'mjdg') {// {index:0, hased:[], final:'', open:[],openitem:[]} 类型
                    if(objOrArr.index || objOrArr.hased.length || objOrArr.final || objOrArr.open.length || objOrArr.openitem.length) {
                        notDelCount++;
                        $set[actPro] = {};
                    }
                } else if(lowerHdMark == 'zmqy') {// {val:0, gsidlist:[]} 类型
                    if(objOrArr.val || objOrArr.gsidlist.length) {
                        notDelCount++;
                        $set[actPro] = {};
                    }
                } else if(lowerHdMark == 'sdbj') {// {nowtotal:0, scorerewards:[],progress:[]} 类型
                    if(objOrArr.nowtotal || objOrArr.scorerewards.length || objOrArr.progress.length) {
                        notDelCount++;
                        $set[actPro] = {};
                    }
                } else if(lowerHdMark == 'zdj') {// {progress:[],jdList:{status:0, awardItems:[]}} 类型
                    if(objOrArr.progress.length || objOrArr.jdList.status || objOrArr.jdList.awardItems.length) {
                        notDelCount++;
                        $set[actPro] = {};
                    }
                }
                else if(lowerHdMark == 'yccb') {// {pictures:[],limit:0,taskProcess:[],bigReward:} 类型
                    if(objOrArr.pictures.length || objOrArr.limit || objOrArr.taskProcess.length|| objOrArr.bigReward.length) {
                        notDelCount++;
                        $set[actPro] = {};
                    }
                }
                else{ // 其他对象
                    console.log('[WARN] Mark =', lowerHdMark);
                    notDelCount++;
                    $set[actPro] = {};
                }
            }
            else if(typeof objOrArr == 'number') {// 是否是数字
                if(objOrArr > 0) {
                    notDelCount++;
                    $set[actPro] = 0
                }
            }
            // if(isset && Object.keys($set).length > 0) {
            //    await roleModel.updateOne({uid:role.uid, servid:role.servid}, {$set});
            // }
        }

        return notDelCount;
    }

    const fun = async(actmark) => {
        const upperHdMark = actmark.toUpperCase();
        const lowerHdMark = actmark.toLowerCase();
        const todayTime = moment().startOf('d').valueOf(); // 今天的日期
        if(todayTime < moment().add(-20, 'hours').valueOf()) return 'Err: 日期错误';
        
        const actModel = await this.service.game.collection('activities');
        const cfgModel = await this.service.game.collection('gameconfigs');
        const ltTime = moment(todayTime).add(-28, 'days').valueOf(); // 玩家的28天新手期
    
        const resGameConf = await cfgModel.findOne({
            $or:[
                {[`config.zhd.${upperHdMark}`]: {$exists: 1}},
                {[`config.zhd_newhero.${upperHdMark}`]: {$exists: 1}},
            ]
        },{[`config.zhd.${upperHdMark}`]: 1,[`config.zhd_newhero.${upperHdMark}`]: 1});
        const resActConf = await actModel.findOne({type: upperHdMark}, {etime:1, params:1});
        if(!resActConf) return 'Err: 活动不存在';
        
        const endDate = moment(resActConf.etime).format(DATE_FORMAT); //活动的结束时间
        
        // 活动相关的标记
        let markList = [];
        const { config = { zhd:[], zhd_newhero:[] } } = resGameConf || {};
        let {REFMARKS=[], PMARKS=[], MARK=0, CLEANMARKS=[]} = config.zhd[upperHdMark] ? config.zhd[upperHdMark] : config.zhd_newhero[upperHdMark] || {};
        markList.push(...REFMARKS, ...PMARKS, ...CLEANMARKS);
        if(MARK) markList.push(MARK);
    
        markList = Array.from(new Set(markList)); // 去重标记
        let actPro = lowerHdMark;
        if(lowerHdMark == 'yd_hyfd') actPro = `fudai.${lowerHdMark}`;
    
        const filter = {
            create: {$lt: ltTime},
        };
        console.time('[FUN] role struct');
        // 查role结构里是否有字段
        let roles = await roleModel.find({[actPro]: {$exists: 1}, ...filter}).project({ uid: 1, servid: 1, create: 1, [actPro]: 1 });
        roles = await roles.toArray();
        
        // 统计数据
        let notRoleCount = await setDataFun(roles, actPro, lowerHdMark)
        console.timeEnd('[FUN] role struct');

        filter.$or = [];
        const project = {};
        markList.map(e =>{
            let typeStr = getTypeFun(+e);
            filter.$or.push({[`${typeStr}.${e}`]: {$exists:1}, [`${typeStr}.${e}.count`]: {$gt:0}}); // 使用$or满足一个即可
            project[`${typeStr}.${e}`] = 1;
        })
    
        let notMarkCount = 0;
        if(filter.$or.length > 0){
            console.time('[FUN] role marks');
            roles = await roleModel.find(filter).project({ uid:1, servid:1, create:1, ...project });
            roles = await roles.toArray();
            console.timeEnd('[FUN] role marks');
            markNoDel = roles.length;
        }

        if(lowerHdMark.startsWith('yd_xfyl')){
            const accumulModel = await this.service.game.collection('accumulgoodfixs');
            const actNum = await accumulModel.find({hdtype: lowerHdMark});
            notRoleCount = 0
        }
        else if(lowerHdMark == 'xygx'){

        }
        return {actMark: upperHdMark, actName: resActConf.name, endDate, notRoleCount, notMarkCount }
    }

    const runData = {};
    for(const actmark of actmarks){
        let resData = await fun(actmark);
        if(!resData || typeof resData == 'string') throw `${actmark.toUpperCase()}: ${resData}`;
        runData[actmark] = resData;
    }

    const items = Object.values(runData);
    return {
        items,
        total: items.length
    }
}