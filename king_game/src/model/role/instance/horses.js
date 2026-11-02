/**
 * 查询当前所有新坐骑
 * @return {Promise<[]>}
 */
module.exports = async function () {

    const horseMap = await this.findHorses();

    const horses = Object.values(horseMap);
    const now = Date.now();
    const expireHorse = [];
    let horse = []
    horses.forEach(g => {
        if (g.expireAt && g.expireAt < now) {
            // 过期了的
            expireHorse.push(g);
            return null;
        }
        const info = g.base();
        horse.push(info);
    });
    // 处理过期武的
    if (expireHorse.length > 0) {
        for (const g of expireHorse) { 
            await g.remove();
        }
    }

    return horse;
}
