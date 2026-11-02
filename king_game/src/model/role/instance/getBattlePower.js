
'use strict'
// 获取阵容战斗力
module.exports =  function (type) {
    let power = 0;
    // 国王战
    if (type.startsWith('wangpvp')) {
        for (let i = 1; i <= 3; i++) {
            power += this._powerbattleset[`${type}${i}`] || 0;
        }
        return power;
    }
    // 王者演武
    if (type.startsWith('kingpvp')) {
        for (let i = 1; i <= 3; i++) {
            if(!this.battlearr[`kingpvp${i}`])continue;
            power += this._powerbattleset[`kingpvp${i}`] || 0;
        }
        return power;
    }
    // 巅峰赛阵容
    if (type.startsWith('topkingpvp')) {
        for (let i = 1; i <= 3; i++) {
            power += this._powerbattleset[`topkingpvp${i}`] || 0;
        }
        return power;
    }
    // 国战阵容
    if (type.startsWith('nationwar')) {
        for (let i = 1; i <= 3; i++) {
            power += this._powerbattleset[`nationwar${i}`] || 0;
        }
        return power;
    }
    // 国战擂台阵容
    if (type.startsWith('ringpvp')) {
        for (let i = 1; i <= 3; i++) {
            power += this._powerbattleset[`ringpvp${i}`] || 0;
        }
        return power;
    }
    return this._powerbattleset[`${type}`] || 0;
}