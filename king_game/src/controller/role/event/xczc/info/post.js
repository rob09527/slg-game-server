// 新春招财聚宝---信息获取
module.exports = exports = async function (ctx) {
    const {
        FREE_MARK:freeMark,
        YB_RANG:ybRang,
        EXTRACT_MARK:extractMark,
        MULTIPLES:multiplesConfig,
    } = ctx.config;
    ctx.assert(freeMark,'freeMark config not exists');
    ctx.assert(ybRang,'ybRang config not exists');
    ctx.assert(extractMark,'extractMark config not exists');
    ctx.assert(multiplesConfig,'extractMark config not exists');
    let extractCount = ctx.role.getProp(extractMark);
    let multiples = ctx.role.xczc.multiples;
    let freeCount = ctx.role.xczc.freeCount;
    let multipleInfo = multiplesConfig.map((m,i)=>{
        return {
            multiple:m.MULTIPLE,
            status:multiples[i]
        };
    });
    let ybCount = ctx.role.getProp(ybRang.MARK);
    ctx.body = {
        multipleInfo,
        freeCount,
        extractCount,
        ybRang:{
            mark:ybRang.MARK,
            ybCount,
            minCount:ybRang.MINCOUNT,
            maxCount:ybRang.MAXCOUNT
        }
    }
}