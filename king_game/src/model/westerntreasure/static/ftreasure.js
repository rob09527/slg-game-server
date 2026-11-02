"use strict"

const { inweight } = require("../../../util/random")

// 生成宝藏地宫初始数据
module.exports = async function (rid) {
    const { MAPS } = global.gameconfig.western_treasure
    const item = MAPS[inweight(MAPS.deepMap("WEIGH"))]
    let map = item.MAP
        .map(item => item.map(event => ({
            event,
            // 起点默认打开并完成
            open: event != "start" ? false : true,
            finish: event != "start" ? false : true,
            lock: true,
        })))
    // 解锁起点和其周围四个格子
    let rowLen = map.length
    let guardCount = 0
    for (let i = 0; i < rowLen; i++) {
        let columnLen = map[i].length
        for (let j = 0; j < columnLen; j++) {
            if (map[i][j].event == "guard") guardCount++
            if (map[i][j].event != "start") continue
            map[i][j].lock = false
            // 正上
            if (i - 1 >= 0) {
                map[i - 1][j].lock = false
            }
            // 正下
            if (i + 1 < rowLen) {
                map[i + 1][j].lock = false
            }
            // 正左
            if (j - 1 >= 0) {
                map[i][j - 1].lock = false
            }
            // 正右
            if (j + 1 < columnLen) {
                map[i][j + 1].lock = false
            }
        }
    }
    return await this.create({
        rid, type: "treasure",
        buff: [],
        locks: [],
        map,
        mapID: item.ID,
        guardCount,
    })
}