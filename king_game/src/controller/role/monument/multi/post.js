
'use strict'

module.exports = exports = async function (ctx, next) {
	
	const monument = ["shu","wei","wu","qun","main","tower", "shen", "mo", "power"];
    let benefits = [];
    let others = {};
    for (let i = 0; i < monument.length; i++) {
        const m = monument[i];
        const config = global.gameconfig.rankmission[m];
        if(config){
            for (let index = 0; index < config.length; index++) {
                const c = config[index];
                const {
                    MARK,
                    BENEFIT,
                } = c;
                if(ctx.role.getItems(MARK).count <= 0){
                    let record = await ctx.dao.rankmission.findOne({type: m, missionIndex: index, groupid: ctx.role._gameserv.groupid});
                    if(record){
                        // for (let j = 0; j < BENEFIT.length; j++) {
                        //     const benefit = BENEFIT[j];
                        //     const bi = benefits.findIndex((b)=>b.GSID == benefit.GSID);
                        //     if(bi >= 0){
                        //         benefits[bi].COUNT += benefit.COUNT;
                        //     }else{
                        //         benefits.push(benefit);
                        //     }
                        // }
                        benefits.push(...BENEFIT);
                        ctx.role.addItemsNoSave([...BENEFIT, MARK]);
                        others[MARK] = ctx.role.getItems(MARK);
                    };
                };
            };
        };
    }
   
    ctx.assert(benefits.length > 0,"invalid take");
	await ctx.role.save();
    global.pushClient(ctx.role, {type: 'monument', content: {others}});
	ctx.body = benefits;
}
