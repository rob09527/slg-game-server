/**
 * 查询当前所有灵宠
 * @return {Promise<[]>}
 */
module.exports = async function () {
    const petMap = await this.findPets();

    const pets = Object.values(petMap);
    const now = Date.now();
    const expirePet = [];
    let pet = []
    pets.forEach(g => {
        if (g.expireAt && g.expireAt < now) {
            // 过期了的
            expirePet.push(g);
            return null;
        }
        const info = g.base();
        pet.push(info);
    });
    // 处理过期武的
    if (expirePet.length > 0) {
        for (const g of expirePet) { 
            await g.remove();
        }
    }

    return pet;
}
