const weighted_util = require("../../../util/weighted_util");

function getshowitem() {
    //randomconfig, count, type, remove
    let itemlist = weighted_util(global.gameconfig.cjzm[2], 3, "CHANCE", true)
    let itemcountlist = weighted_util(global.gameconfig.cjzm[3], 3, "CHANCE", false)
    let item = []
    let receiveItem = []
    let clientshow = []
    itemlist.forEach((element, index) => {
        item.push({ gsid: element.GSID, count: itemcountlist[index].NUM })
        clientshow.push(element.SHOWID)
        receiveItem.push({ gsid: element.GSID, count: 0 })
    });

    return { item, receiveItem, clientshow }

}
function getnexttime() {
    return Date.now() + Number(global.gameconfig.cjzm[7][0]['time'] * 1000)
}

/**
 * 创建一个超级招募的数据结构
 */
function refreshData() {
    let lunckyinfo = {}
    for (let x in global.gameconfig.cjzm[0]) {
        //填充记录幸运值
        lunckyinfo[x] = false
    }
    let data = getshowitem()
    let act = global.ACTIVITY['cjzm']
    let cjzm = {
        etime: act.etime,
        //下次刷新时间（时间戳）
        refreshtime: getnexttime(),
        //三个道具站台展示。下面0 1 2 对应展示位置 1 2 3 
        showitem: data.item,
        refresh: { frequency: 0, sign: (new Date()).format().slice(0, 10) },
        //领取过的道具,下面 0 1 2 对应领取位置 1 2 3，没领取count为0，领取过后>0
        receiveItem: data.receiveItem,
        clientshow: data.clientshow,
        //玩家选择的倍数,只有第一次抽取的时候可以选。在第一次抽取的时候在接口处对数据进行修改
        multiple: 1,
        //本批次第几次抽取
        docount: 0,
        //幸运数值
        lucky: 0,
        //幸运数据使用情况
        lunckyinfo: lunckyinfo
    }
    return cjzm
}
//处理幸运数据的数据结构
function luckyData(userdata) {
    for (let x in userdata.lunckyinfo) {
        if (userdata.lucky >= x && !userdata.lunckyinfo[x]) {
            //id_1卡池抽一次
            let id_1 = global.gameconfig.cjzm[0][x]['pond1']
            //id_2卡池抽2次
            let id_2 = global.gameconfig.cjzm[0][x]['pond2']
            let itemlist = []
            itemlist.push(...weighted_util(global.gameconfig.cjzm['tskc'][id_1], 1, "CHANCE", true))
            itemlist.push(...weighted_util(global.gameconfig.cjzm['tskc'][id_2], 2, "CHANCE", true))
            //个数随机
            let itemcountlist = weighted_util(global.gameconfig.cjzm[3], 3, "CHANCE", false)
            let spitemcounlist = []
            if (id_1 == 201 || id_1 == 301) {
                let reuslt = JSON.parse(JSON.stringify(global.gameconfig.cjzm[3])).slice(-3)
                spitemcounlist = weighted_util(reuslt, 1, "CHANCE", false)
            }
            let receiveItem = []
            let item = []
            let clientshow = []
            itemlist.forEach((element, index) => {
                if (index == 0 && spitemcounlist.length > 0) {
                    item.push({ gsid: element.GSID, count: spitemcounlist[0].NUM })
                    clientshow.push(element.SHOWID)
                    receiveItem.push({ gsid: element.GSID, count: 0 })
                } else {
                    item.push({ gsid: element.GSID, count: itemcountlist[index].NUM })
                    clientshow.push(element.SHOWID)
                    receiveItem.push({ gsid: element.GSID, count: 0 })
                }

            });
            //数据库写入数据整理
            userdata.showitem = item
            userdata.receiveItem = receiveItem
            userdata.clientshow = clientshow
            //对幸运值使用状态进行修改
            userdata.lunckyinfo[x] = true;
            //在判断一下幸运值是否到顶,对幸运值进行重置
            if (userdata.lucky >= global.gameconfig.cjzm['maxluckycount']) {
                let lunckyinfo = {}
                for (let x in global.gameconfig.cjzm[0]) {
                    //填充记录幸运值
                    lunckyinfo[x] = false
                }
                userdata.lunckyinfo = lunckyinfo
                userdata.lucky = 0
            }
            //数据结束,停止循环。
            return userdata
        }
    }

}
//docount 是否为抽卡行为
module.exports = exports = async function (ctx, refreshsign = false, quit = false) {
    let time = Date.now()
    const datekey = (new Date()).format().slice(0, 10);
    let save = false
    let act = global.ACTIVITY['cjzm']
    let etime = act.etime
    if (!ctx.role.cjzm || etime !== ctx.role.cjzm.etime) {
        //初始化填充
        ctx.role.cjzm = refreshData()
        save = true
    } else if (time >= ctx.role.cjzm.refreshtime || ctx.role.cjzm.docount >= 3 || refreshsign) {
        console.log(time, ctx.role.cjzm.refreshtime, "时间", getnexttime())
        //超出时间或者第三次抽取结束进行初始化填充
        //记录幸运值 
        let lucky = ctx.role.cjzm.lucky
        if (ctx.role.cjzm.docount == 3 || quit) {
            lucky += 1
            await ctx.role.addItemsNoSave({ gsid: 38025, count: 1 });
            await ctx.role.save()
        }
        let refresh = ctx.role.cjzm['refresh']
        //记录幸运值使用情况
        let lunckyinfo = ctx.role.cjzm.lunckyinfo
        let newdata = refreshData()
        newdata.lucky = lucky
        newdata.lunckyinfo = lunckyinfo
        newdata['refresh'] = refresh
        if (refreshsign && !quit) {
            newdata['refresh']['frequency'] += 1
        }
        //如果满足幸运值的状态就替换原有的随机数据。转进幸运值的逻辑
        luckyData(newdata)
        ctx.role.cjzm = newdata
        save = true
    }

    if (ctx.role.cjzm['refresh']['sign'] != datekey) {
        save = true
        ctx.role.cjzm['refresh']['sign'] = datekey
        ctx.role.cjzm['refresh']['frequency'] = 0
    }
    if (save) {
        await ctx.dao.role.updateOne({ _id: ctx.role.rid }, { $set: { cjzm: ctx.role.cjzm } })
    }

}