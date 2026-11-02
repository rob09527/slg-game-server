
'use strict'

module.exports = exports = async (ctx, next) => {
    let list = []
    for (let x = 1; x < 10; x++) {
        let insert = {
            "servid": 1000,
            "name": `rob巅峰赛测试`,
            "groupid": 100,
            "room": 1,
            "start": Date.now(),
            "sno": 1,
            "info": {
                "filter": [
                    "all"
                ]
            },
            "area": {
                "name": `rob巅峰赛服务器${x}`,
                "id": x
            },
            "create": 0,
            "status": 1,
            "type": 0,
            "auto_num": "3000",
            "auto_pay": null,
            "auto_create": 1
        }
        insert.servid += x
        insert.groupid += x
        insert.room += x
        insert.name = `${insert.name}${x}`
        insert.area.name = `${insert.area.name}${x}`
        insert.area.id = x
        list.push(insert)
    }
    await ctx.dao.gameserver.insertMany(list)

    ctx.body = { result: "ok" };
}