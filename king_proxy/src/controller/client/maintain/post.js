"user strict"


module.exports = exports = async function (ctx, next) {
    // let { bundle = "" } = ctx.request.body;
    // let maintain = await ctx.dao.maintain.find({type:0}).sort({_id: -1}).limit(1);
    // maintain = maintain[0];
    let maintain = global.CACHE.maintain[0];
    if (!maintain) {
        ctx.body = {
            server_time: Date.now()
        }
        return;
    }
    ctx.body = {
        content: maintain.content,
        etime: maintain.etime,
        server_time: Date.now()
    }
}
