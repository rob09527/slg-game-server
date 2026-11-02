// 新春招财聚宝---抽取倍数
module.exports = exports = async function (ctx) {
    const {
        FREE_MARK:freeMark,
        YB_RANG:ybRang,
        EXTRACT_MARK:extractMark,
        MULTIPLES:multiplesConfig,
        EXTRACT_CAST_COUNT:extractCastCount
    } = ctx.config;
    ctx.assert(ybRang,'ybRang config not exists');
    ctx.assert(extractMark,'extractMark config not exists');
    ctx.assert(multiplesConfig,'extractMark config not exists');
    let multiples = ctx.role.xczc.multiples;
    let isMuled = multiples.some(m=>m==1);
    ctx.assert(!isMuled,'isMuled');
    let freeCount = ctx.role.xczc.freeCount;
    let extractCount = ctx.role.getProp(extractMark);
    let delProp = [];
    //免费次数不足 则判断是否有抽取次数 
    if(freeCount <= 0){
        ctx.assert(extractCount >= extractCastCount,'not enough');
        //扣除道具替换成凑趣次数
        delProp = [{
            GSID:extractMark,
            COUNT:extractCastCount
        }]
    }else{
        freeCount --;
        ctx.role.xczc.freeCount = freeCount;
    };
    //提出已经抽过的倍数并且是前四次 后四次才抽取
    let exdmuls = multiplesConfig.filter((m,i)=>multiples[i] == 0 && m.COD == 1);
    if(exdmuls.length <= 0){
        exdmuls = multiplesConfig.filter((m,i)=>multiples[i] == 0 && m.COD == 5);
    };
    ctx.assert(exdmuls && exdmuls.length > 0,'extract not enough');
    //根据权重来进行抽取 虽然这权重没啥用
    const totalWeight = exdmuls.reduce( (pre, cur)=> {
        cur.startW = pre;
        return cur.endW = pre + cur.CHANCE
    }, 0)
    let random = Math.floor(Math.random() * totalWeight);
    let  exdmul = exdmuls.find(mul => mul.startW < random && mul.endW >= random);
    //我在想要不要 如果没有获取到倍数 要不要进行 while 循环  
    //为避免死循环还是不这个搞先吧  也是基本不会出现这种情况 极端情况如果没有获取那就让用户再抽一次
    ctx.assert(exdmul, 'exdmul production fail');

    let muIndex = multiplesConfig.findIndex(m=>m.MULTIPLE == exdmul.MULTIPLE);
    
    ctx.assert(muIndex >= 0, 'exdmul production fail');
    if(delProp.length > 0)  ctx.role.castItemsNoSave(delProp);
    //记录状态值 此时还没有进行元宝兑换
    multiples[muIndex] = 1;

    ctx.role.markModified('xczc');
    await ctx.role.save();
    ctx.zhdpoint("XCZC_RED", ctx.role);
    ctx.body = {
        index:muIndex,
        status:1
    }

}