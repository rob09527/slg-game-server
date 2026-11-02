const textgetter = require("../../../util/textgetter")

//超级招募商业化
module.exports = exports = async function (ctx) {
    await luckysyh(ctx)
    await txzsyh(ctx)
    await lglbsyh(ctx)
}
//幸运值商业化初始化模式
async function luckysyh(ctx) {
    //初始化配置 
    initlucksyh = async (ctx) => {
        let act = global.ACTIVITY['cjrw']
        let etime = act.etime
        let lucky = {
            sign: etime,
            reward: {}
        }
        let unset = {}
        unset['hide.38025.count'] = 1
        global.gameconfig.cjzmsyh[0].forEach(e => {
            lucky.reward[e.CNUM] = { item: [...e.item], mark: [{ gsid: e.MARK, count: 1 }], title: e.TITLE }
            //清理标记
            unset[`other.${e.MARK}.count`] = 1
            // ctx.role.castItemsNoSave({ gsid: e.MARK, count: ctx.role.getItems(e.MARK).count });
        });
        let insert = {}
        insert[`cjzmsyh.lucky`] = lucky
        // if (ctx.role.cjzmsyh && ctx.role.cjzmsyh.lucky) {
        let itemid = 38025
        console.log(ctx.role.getItems(itemid).count, "初始化幸运值,道具数量")
        //ctx.role.castItemsNoSave({ gsid: itemid, count: ctx.role.getItems(itemid).count });
        await global.dao.role.updateOne({ _id: ctx.role.rid }, {
            $unset: unset
        })
        // }
        await ctx.role.save()
        await ctx.dao.role.updateOne({ _id: ctx.role.rid }, { $set: insert })
        ctx.role.cjzmsyh ??= {};
        ctx.role.cjzmsyh['lucky'] = lucky
    }
    let act = global.ACTIVITY['cjrw']
    let etime
    if (act) {
        etime = act.etime
    }

    if (!ctx.role.cjzmsyh?.lucky || ctx.role.cjzmsyh?.lucky.sign !== etime) {
        await initlucksyh(ctx)
    }
}
//通行证
async function txzsyh(ctx) {
    let act = global.ACTIVITY['txz']
    let etime = act.etime
    if (!ctx.role.cjzmsyh?.txz || ctx.role.cjzmsyh?.txz.sign !== etime) {
        let txz = {
            sign: etime,
            reward: {}
        }
        global.gameconfig.cjzmsyh[2].forEach(e => {
            txz.reward[e.DAY] = {
                free: 0,
                vip: 0
            }
        })
        ctx.role.cjzmsyh ??= {};
        ctx.role.cjzmsyh['txz'] = txz
        let insert = {}
        insert[`cjzmsyh.txz`] = txz
        await ctx.dao.role.updateOne({ _id: ctx.role.rid }, { $set: insert })
    }
    let time = Date.now()
    let key = 'cjzmtxz'
    if (ctx.role.special[key] && time < ctx.role.special[key]) {
        ctx.role.cjzmsyh['txz']['vip'] = true
    } else {
        ctx.role.cjzmsyh['txz']['vip'] = false
    }
    ctx.role.cjzmsyh['txz']['price'] = global.gameconfig.recharge['specialcjzmtxz'].PRICE
    let start = act.start
    ctx.role.cjzmsyh['txz']['day'] = daysBetween(start);

    await txzEmail(ctx)
}

function daysBetween(time, day) {
    // 确保 day 是当前时间戳，如果 day 没有提供，则使用 Date.now()
    day = day || Date.now();
    // 创建两个日期对象
    var date1 = new Date(time);
    var date2 = new Date(day);
    // 获取两个日期对象的时间戳（毫秒数）并计算差值
    var timeDiff = Math.abs(date2 - date1);
    // 如果时间差大于或等于一天的毫秒数，返回整数天数，否则返回1（因为不足一天也按一天计算）
    var daysDiff = (timeDiff >= (1000 * 60 * 60 * 24)) ? Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) : 1;
    return daysDiff;
}

async function txzEmail(ctx) {
    let act = global.ACTIVITY['txz']
    let etime = act.etime
    let start = act.start
    let time = Date.now()
    let key = 'cjzmtxz'
    if (time > etime && ctx.role.special[key] >= start) {
        txzEmailSystem(ctx)
    }
}


async function txzEmailSystem(ctx) {
    let items = []
    let data = {}
    for (let index = 1; index <= global.gameconfig.cjzmsyh[2].length; index++) {
        //免费领取
        if (ctx.role.cjzmsyh['txz']['reward'][index]['free'] == 0) {
            // item.push(...global.gameconfig.cjzmsyh[2][index - 1].freeitem)
            global.gameconfig.cjzmsyh[2][index - 1].freeitem.forEach(e => {
                data[e.gsid] ? data[e.gsid] += e.count : data[e.gsid] = e.count
            })
            ctx.role.cjzmsyh['txz']['reward'][index]['free'] = 1
        }
        //vip领取
        if (ctx.role.cjzmsyh['txz']['reward'][index]['vip'] == 0) {
            // item.push(...global.gameconfig.cjzmsyh[2][index - 1].item)
            global.gameconfig.cjzmsyh[2][index - 1].item.forEach(e => {
                data[e.gsid] ? data[e.gsid] += e.count : data[e.gsid] = e.count
            })
            ctx.role.cjzmsyh['txz']['reward'][index]['vip'] = 1
        }
    }

    for (let x in data) {
        let item = { gsid: Number(x), count: data[x] }
        items.push(item)
    }

    if (items.length > 0) {
        let insert = {}
        insert[`cjzmsyh.txz`] = ctx.role.cjzmsyh['txz']
        await ctx.dao.role.updateOne({ _id: ctx.role.rid }, { $set: insert })
        const mails = [];
        mails.push({
            rid: ctx.role.rid,
            type: 2,
            title: textgetter("ANONYMOUS_PREFIX"),	// 无法获得奖励邮件通知
            content: textgetter("TXZBF"),
            reward: items,
        });
        await global.dao.mail.insertMany(mails);
        //邮件
    }
}


//连购礼包商业化
async function lglbsyh(ctx) {
    let act = global.ACTIVITY['lglb']
    let etime = act.etime
    if (!ctx.role.cjzmsyh?.lglb || ctx.role.cjzmsyh?.lglb.sign !== etime) {
        let lglb = {
            sign: etime,
            spcount: 0,
            reward: {}
        }
        for (let index = 3; index <= 6; index++) {
            //3-5 三个连购礼包配置
            let key = ''
            switch (index) {
                case 3: key = 'mb'; break;
                case 4: key = 'yl'; break;
                case 5: key = 'jjd'; break;
                case 6: key = 'sp'; break;
            }
            lglb.reward[key] = { index: 0 };
            global.gameconfig.cjzmsyh[index].forEach(e => {
                if (index == 6) {
                    lglb.reward[key][e.CNUM] ?? {}
                    lglb.reward[key][e.CNUM] = {
                        id: e.CNUM,
                        title: e.TITLE,
                        cnum: e.CNUM,
                        item: e.item,
                        use: false
                    }
                } else {
                    lglb.reward[key][e.ID] ?? {}
                    lglb.reward[key][e.ID] = {
                        id: e.ID,
                        type: e.TYPE,//0免费 1付费 -1 元宝付费
                        price: e.PRICE,
                        spcount: e.SPCOUNT,
                        item: e.item,
                        use: false
                    }
                }
            })
        }
        ctx.role.cjzmsyh ??= {};
        ctx.role.cjzmsyh['lglb'] = lglb
        let insert = {}
        insert[`cjzmsyh.lglb`] = lglb
        await ctx.dao.role.updateOne({ _id: ctx.role.rid }, { $set: insert })
    }
}


