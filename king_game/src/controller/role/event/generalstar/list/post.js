

module.exports = async ctx => {
    ctx.body = {};
	let {GIFT} = global.gameconfig.generalstar;

    let data = GIFT.map(({ PRICE, LIMIT, ITEMS}, index)=>{
        return {
            price: PRICE,
            items: ITEMS,
            buylimit: Math.max(0, LIMIT - (ctx.record.buylimit[index]||0))
        }
    })
	ctx.body = {
		data,
	}
}
