const lotNumber = require("../../../../../model/ssdbRole/instance/lotNumber");

//付费攀爬 pay=true 激活游戏 act=true
module.exports = async (ctx) => {
    const { pay, act } = ctx.request.body;
    let result = await lotNumber(ctx, pay, act)
    ctx.body = result

};
