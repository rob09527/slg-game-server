
'use strict'

//微信入口
async function other_90232(){
    let ret = await global.dao.role.updateMany({}, {$unset:{"others.90232":1, "others.90233":1}})
    console.log(ret)
}

//关闭新服累充
async function close_xflc(){
    let ret = await global.dao.role.updateMany({xflc:{$exists:1}}, {$set:{"xflc.money":0}})
    console.log(ret)
}

//天命修复
async function destiny(){
    let LIMIT = global.gameconfig.deftiny.COST.LIMIT;
    let ret = await global.dao.role.updateMany({destiny:{$exists:0}}, {$set:{destiny:{
        val: 0,
        general: [],
        temprefersh:{},
        refersh:[LIMIT,LIMIT,LIMIT]
    }}})
    console.log(ret)
}

async function mjxw() {
    let nModified = 0;
    let ok = 0;
    const roles = await global.dao.role.find({mjxw:{$exists:1}},{mjxw:1, rno:1});
    let n = roles.length;
    roles.forEach(element => {
        console.log(element)
        let data = {"others.90735":{count:element.mjxw}}
        global.dao.role.updateOne({rno:element.rno},{$set:data}).then(res=>{
            if(res.nModified)
                nModified++;
            ok++;
            if(n==ok){
                console.log({n, nModified, ok})
            }
        }).catch(
            err=>console.log(err)
        )
    });
    console.log({n, nModified, ok})
}

/*
上面是各种修复函数
开服时间大于修复时间的函数，不处理
下面是配置：修复时间，处理函数
*/
const exec = {
    '1680105600000': other_90232,
    '1681228800000': close_xflc,
    '1682352000000': destiny,
    '1682438400000': mjxw,
}

module.exports = async function () {
    const servs = await global.dao.gameserver.find({type: {$ne : 1}}).sort({start:1});
    const serv = servs[0]
    if(!serv) return;
    
    // 已经执行的修复
    const set = new Set();
    try{
        const repairs = await global.dao.repair.find({});
        for (const repair of repairs) {
            set.add(repair.version)
        }

        console.log("begin repair:+++")
        let now = Date.now();
        for (const key in exec) {
            const time = +key;
            if (time > serv.start && !set.has(key)){
                console.log("repair:",key)
                await exec[key]();
                await global.dao.repair.create({version:key,time:now});
            }
        }
        console.log("end repair:===")
    }
    catch(e){
        console.log("err repair:",e);
    }
}

