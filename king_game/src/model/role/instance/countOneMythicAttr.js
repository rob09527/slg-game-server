
'use strict'

// 计算单一神兽的天赋加成
module.exports = exports = function (mythic = {}) {
    let _mythic = mythic;
    // 如果talent为空,则直接返回
    if (!_mythic.talent) return _mythic;
    // 获取配置
    const config = global.gameconfig.mythicaltalentattr || [];
    if (config.length == 0) {
        console.error('mythicaltalentattr config err');
        return _mythic;
    };

    let talent = _mythic.talent || [];
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
                attr[inner.ID] = attr[inner.ID] || 0;
                attr[inner.ID] = inner.NUM * talent[i][k].pro;
            });
            // 计算完的属性
            talent[i][k].attr = attr;
        }
    }
    // 重新赋值
    _mythic.talent = talent;
    console.log("_mythic", _mythic);
    return _mythic;
}
