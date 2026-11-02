const updateRoleseat = require("../../role/instance/updateRoleseat");

//入狱
module.exports = exports = async function (ctx, id, clientSeatIndex) {
    let prisonerlist = await ctx.dao.prisoner.find({ rid: ctx.role._id, type: 1, state: 3 });
    const ryawait = [];
    let targetPrisoner = null;
    for (const prisoner of prisonerlist) {
        if (prisoner._id.toString() == id) {
            targetPrisoner = prisoner; // 标记特殊目标 
        } else {
            ryawait.push(prisoner);    // 常规目标入队 
        }

    }

    // 特殊对象置顶队列末尾
    targetPrisoner && ryawait.push(targetPrisoner);
    let result = []
    let clientseat
    for (let index = ryawait.length; index--; index >= 0) {
        let x = ryawait[index]
        if ((Date.now() - x.create > 1000 * 60 * 30 || x._id == id)) {
            x.state = 0;
            let config = global.gameconfig.surrender.deepQueryOne('GSID', x.gsid);
            if (!config) {
                throw ('error config')
            }
            x.imprisonmentTime = Date.now() + (config.CD * 60000)

            clientseat = await updateRoleseat(ctx.role._id.toString(), x._id, "add", clientSeatIndex)
            if (clientseat) {
                const r = await ctx.dao.prisoner.updateOne({ _id: x._id }, { $set: { state: 0, imprisonmentTime: x.imprisonmentTime } });
            } else {
                console.log("入狱操作位置不足")
                break;
            }
            result.push(x._doc)
            result.forEach(e => {
                e.seat = clientseat
            })
            //暂时只执行一个
            break;
        }

    }



    return result
}

