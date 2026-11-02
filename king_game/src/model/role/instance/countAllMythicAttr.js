
'use strict'

// 计算全部神兽的天赋加成
module.exports = exports = function () {
    let mythicals = this.mythical;
    // 获取配置
    const config = global.gameconfig.mythicaltalentattr || [];
    if (config.length == 0) {
        console.error('mythicaltalentattr config err');
        return mythicals;
    };

    for (let _mythic in mythicals) {
        if (!mythicals[_mythic].talent) continue;
        let talent = mythicals[_mythic].talent || [];
        for (let i = 0; i < talent.length; i++) {
            if (!talent[i]) continue;
            // 每个天赋
            for (let k = 0; k < talent[i].length; k++) {
                if (!talent[i][k]) continue;
                // 下标对应的配置
                let _config = config[k];
                // 天赋的每个技能
                let attr = {};
                _config.forEach(inner => {
                    // 加成赋值
                    attr[inner.ID] = attr[inner.ID] || 0;
                    attr[inner.ID] += inner.NUM * talent[i][k].pro;
                });
                // 计算完的属性
                talent[i][k].attr = attr;
            }
        }
        mythicals[_mythic].talent = talent;
    }
    return mythicals;
}
