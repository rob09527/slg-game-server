const _ = require('lodash');
module.exports = async (ctx, next) => {
    let result = await global.dao.ssdbRole.findOne({ rid: ctx.role.rid })
    let now = new Date().format().slice(0, 10)
    let elgoda = global.ACTIVITY['elgoda'];
    if (!result || elgoda.start != result.start) {
        result = {
            layers: 0,
            try: 0,
            state: 0,
            start: elgoda.start,
            gift: {
                date: now
            },
        }

        await global.dao.ssdbRole.updateOne({ rid: ctx.role.rid }, result, { upsert: true })
        result = await global.dao.ssdbRole.findOne({ rid: ctx.role.rid })
    }
    //礼包商店 
    if (now !== result.gift.date) {
        //每日刷新用户的礼包情况(礼包和神树夺宝是绑定的)
        let updateGift = {
            gift: {
                date: now
            }
        }
        await global.dao.ssdbRole.updateOne({ rid: ctx.role.rid }, { $set: updateGift })
        result = await global.dao.ssdbRole.findOne({ rid: ctx.role.rid })
    }

    //世界宝箱
    let eltask = global.ACTIVITY['eltask'];
    let day = getDaysWithLodash(eltask.start)

    if (_.isUndefined(result.box) || (result.box.start && eltask.start != result.box.start)) {
        let update = {}
        update['box'] = {
            day: day,
            start: eltask.start
        }
        await global.dao.ssdbRole.updateOne({ rid: ctx.role.rid }, update, { upsert: true })
        result = await global.dao.ssdbRole.findOne({ rid: ctx.role.rid })
    }
    if (Date.now() < eltask.etime) {
        if (result.box?.day != day) {
            let update = {}
            update['box.day'] = day
            update['box.start'] = eltask.start
            await global.dao.ssdbRole.updateOne({ rid: ctx.role.rid }, { $set: update }, { upsert: true })
            result = await global.dao.ssdbRole.findOne({ rid: ctx.role.rid })
        }
    }

    //神树成就任务
    let elgift = global.ACTIVITY['elgift'];
    if (_.isUndefined(result.ach) || (result.ach.start && elgift.start != result.ach.start)) {
        let update = {}
        update['ach'] = {
            start: elgift.start
        }
        await global.dao.ssdbRole.updateOne({ rid: ctx.role.rid }, update, { upsert: true })
        let checkcount = ctx.role.getItems(99774).count
        ctx.role.castItemsNoSave({ gsid: 99774, count: checkcount });
        await ctx.role.save()
        result = await global.dao.ssdbRole.findOne({ rid: ctx.role.rid })
    }

    //神树通行证
    let elpas1 = global.ACTIVITY['elpas1'];
    let elpas1day = getDaysWithLodash(elpas1.start)
    if (_.isUndefined(result.txz) || (result.txz.start && elpas1.start != result.txz.start)) {
        let update = {}
        update['txz'] = {
            start: elpas1.start,
            day: elpas1day
        }
        await global.dao.ssdbRole.updateOne({ rid: ctx.role.rid }, update, { upsert: true })
        result = await global.dao.ssdbRole.findOne({ rid: ctx.role.rid })
    } else if (result.txz?.day != elpas1day) {
        let update = {}
        update['txz.day'] = elpas1day
        await global.dao.ssdbRole.updateOne({ rid: ctx.role.rid }, { $set: update }, { upsert: true })
        result = await global.dao.ssdbRole.findOne({ rid: ctx.role.rid })
    }


    let elshop = global.ACTIVITY['elshop'];

    if (_.isUndefined(result.shop) || (result.shop.start && elshop.start != result.shop.start)) {
        let update = {}
        update['shop'] = {
            start: elshop.start,
        }
        global.gameconfig.ssdb[7].forEach(config => {
            update['shop'][config.POS] = config.LIMIT
        });
        let checkcount = ctx.role.getItems(38031).count
        ctx.role.castItemsNoSave({ gsid: 38031, count: checkcount });
        await ctx.role.save()

        await global.dao.ssdbRole.updateOne({ rid: ctx.role.rid }, update, { upsert: true })
        result = await global.dao.ssdbRole.findOne({ rid: ctx.role.rid })
    }


    ctx.ssdb = result
    await pay(ctx)
    await next()
};



async function pay(ctx) {

    if (global.config.GANGER_NO_ORDER === true) {
        // 测试环境支付特殊处理，客户端没有准确的 pid，这里帮他们缓存
        ctx.orderReq = async (...args) => {

            const data = { data: { oid: Math.floor(Math.random() * 10000000 + 10000000) } };
            console.log('MAKE VIRTURE ORDER', ctx.role.rno, ctx.role.uid, ' OID:', data.data.oid, 'PRICE:', args[0].price, ' pid:', args[0].pid)
            if (data.data && typeof data.data == 'object') {
                CACHE[data.data.oid] = args[0].pid;
            } else {
                CACHE[data.oid] = args[0].pid;
            }
            data.data.data = { oid: data.data.oid };
            return data;
        };
    } else {
        ctx.orderReq = async function (params) {
            if (ctx.request.body.deviceInfo) {
                params.deviceInfo = ctx.request.body.deviceInfo;
                params.deviceInfo.ua = ctx.headers['user-agent'];
                params.deviceInfo.ip = ctx.ip;
            }
            params.current_level = ctx.role.level; // 埋下单时候的角色等级
            params.host = `${global._HOST}:${global._PORT}`;
            const data = await global.remote.proxy_order_create(params);
            data.data = { oid: data.oid };
            return { data };
        }

    }
}


function getDaysWithLodash(timestamp) {
    if (!_.isNumber(timestamp) || _.isNaN(timestamp)) {
        throw new Error('Invalid timestamp');
    }

    // 使用 Lodash 节流获取零点时间
    const getMidnight = _.memoize((ts) => {
        const d = new Date(ts);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    });

    // 计算差值
    return _.flow([
        () => getMidnight(Date.now()) - getMidnight(timestamp),
        diff => _.clamp(Math.ceil(diff / 864e5), 0, Infinity)
    ])();
}


