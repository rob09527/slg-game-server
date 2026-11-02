// 新春招财聚宝---元宝兑换
module.exports = exports = async function (ctx) {
    let {yb} = ctx.request.body;
    ctx.assert(yb != null && yb != undefined,'params error')
    const {
        YB_RANG:ybRang,
        MULTIPLES:multiplesConfig,
    } = ctx.config;
    ctx.assert(multiplesConfig,'extractMark config not exists');
    ctx.assert(ybRang,'ybRang config not exists');

    let multiples = ctx.role.xczc.multiples;

    let muIndex = multiples.findIndex(m=>m == 1);
    ctx.assert(muIndex >= 0, 'exdmul no fail');
     
    ctx.assert(yb >= ybRang.MINCOUNT && yb <= ybRang.MAXCOUNT,'yb no rang ')

    let ybCount = ctx.role.getProp(ybRang.MARK);

    ctx.assert( ybCount >= yb,'yb no enough ');
   
    //获得的元宝 需要减去投入元宝
    let revYb = parseInt(multiplesConfig[muIndex].MULTIPLE  * yb);

    //减去投入元宝 真实元宝
    let ybGet = parseInt(revYb - yb);

    ctx.role.addItemsNoSave([{GSID:ybRang.MARK,COUNT:ybGet}])

    ybCount = ctx.role.getProp(ybRang.MARK);
    
    multiples[muIndex] = 2;

    ctx.role.markModified('xczc');
    await ctx.role.save();

    ctx.body = {
        index:muIndex,
        status:2,
        items:[{
            gsid:ybRang.MARK,
            count:revYb
        }],
        ybCount
    }

}