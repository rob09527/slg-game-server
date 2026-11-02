/* 获取队伍的最高战斗力武将 和 平均等级 */
module.exports = function (o) {
    let g = {power: -1};
    let totalLevel = 0;
    let count = 0;
    let totalPower = 0;
    for (const t of Object.values(o.team)) {
        count++;
        totalLevel += t.level;
        totalPower += t.power;
        if (t.power > g.power) {
            g = t;
        }
    }
    o.level = Math.floor(totalLevel / count);
    o.maxGsid = g.gsid;
    o.totalPower = totalPower;
}
