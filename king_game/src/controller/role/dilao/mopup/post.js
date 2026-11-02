
'use strict'

module.exports = exports = async (ctx, next) =>{
    let {type, pos} = ctx.request.body;
    ctx.assert(ctx.role.dltp.map[type - 1] > pos, "Not yet unlocked");
    ctx.assert(ctx.role.dltp.mopup[type - 1] > 0, "time limit");
    ctx.role.dltp.mopup[type - 1]--;
    ctx.role.markModified("dltp.mopup");
    ctx.save = true;
    let rewardObj = ctx.config.REWARD[pos];
    let reward = rewardObj.REWARD.filter(value=>{
        return ctx.random.hit(value.RATE, 100);
    });
    let totalChance = rewardObj.SREWARD.reduce((a,b)=> (a.RATE || a) + b.RATE) / 100;
    let randCnt = parseInt(totalChance);
    if (Number.isInteger(totalChance) == false) {
        let count = totalChance - parseInt(totalChance);
        if (ctx.random.hit(count * 100)) {
            ++randCnt;
        }
    }
    let weights = rewardObj.SREWARD.deepMap("RATE");
    for (let i = 0; i < randCnt; i++) {
        let obj = rewardObj.SREWARD[ctx.random.inweight(weights)];
        reward.push(obj);
    }
    reward = reward.arrange();
    ctx.role.addItemsNoSave(reward);
    ctx.body = {
        items:reward
    }
    
    let roleShop = ctx.role.dltp.shop[type][pos];
    if (!roleShop && ctx.random.hit(rewardObj.SHOP[0].CHANCE + rewardObj.SHOP[1].CHANCE)) {
        let rates = rewardObj.SHOP.deepMap("CHANCE");
        let merchant = rewardObj.SHOP[ctx.random.inweight(rates)];
        ctx.assert(merchant,"invalid shop");
        roleShop = {
            expire: Date.now() + rewardObj.TIME * 3600000,
            type: merchant.TYPE,
            buy:[],
            shop:[]
        }
        let ids = [], chances = [], cnt = merchant.TYPE == 0 ? 10 : 6, index = 0;
        ctx.config.SHOP[0].forEach(value=>{
            ids.push(value.ID);
            chances.push(value.CHANCE);
        });
        let shopIds = [];
        while(shopIds.length < cnt && chances.length) {
            index = ctx.random.inweight(chances);
            ctx.assert(ids[index], 'config error');
            shopIds.push({ID:ids[index], type:0});
            chances.splice(index, 1);
            ids.splice(index, 1);
        }
        if (merchant.TYPE == 1) {
            ids.splice(0);
            chances.splice(0);
            ctx.config.SHOP[1].forEach(value=>{
                ids.push(value.ID);
                chances.push(value.CHANCE);
            });
            while(shopIds.length < 9 && chances.length) {
                index = ctx.random.inweight(chances);
                ctx.assert(ids[index], 'config error');
                shopIds.push({ID:ids[index], type:1});
                chances.splice(index, 1);
                ids.splice(index, 1);
            }
        }
        shopIds.forEach(info=>{
            let data = ctx.config.SHOP[info.type].find(value=> value.ID == info.ID);
            let obj = {type:info.type, items:data.ITEMS, limit:data.LIMIT, buy:0};
            if (info.type == 1) {
                obj.price = data.PRICE;
                obj.exp = data.EXP;
                obj.name = data.NAME;
            }
            else {
                obj.cost = data.COST;
            }
            roleShop.shop.push(obj);
        })
        ctx.fixshop = true;
        ctx.role.dltp.shop[type][pos] = roleShop;
    }
    ctx.body.mopup = ctx.role.dltp.mopup[type - 1];
    ctx.body.shop = {};
    let dlshop = ctx.role.dltp.shop[type];
    for (let pos in dlshop) {
        ctx.body.shop[pos] = {
            expire: dlshop[pos].expire,
            type: dlshop[pos].type,
            items:dlshop[pos].shop.map((info) =>{
                let obj = {type: info.type, bought:info.limit - info.buy, items:info.items};
                if (info.type == 1) {
                    obj.price = info.price;
                    obj.name = info.name;
                } else {
                    obj.cost = info.cost;
                }
                return obj;
            })
        };
    }
}