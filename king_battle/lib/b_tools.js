class bTools{
    constructor(){
        this._seed = 5;
    }

    setSeed (seed) {
        this._seed = seed;
    }

    getRandom () {
        this._seed = (this._seed * 9301 + 49297) % 233280;
        return this._seed / 233280.0;
    }

    getRandomInt (min, max) {
        var ratio = this.getRandom();
        return min + Math.floor((max+1 - min) * ratio);
    }
    // 随机取区间内几个数
    getRandomArr (min, max, count) {
        var result = [];
        var numarr = [];
        for(let i = min; i <= max; ++i) numarr.push(i);
        if(count > max - min + 1) return numarr;
        for(let i = 0; i < count; ++i) {
            let rinx = this.getRandomInt(0, numarr.length - 1 - i);
            result.push(numarr[rinx]);
            if(rinx == numarr.length - 1 - i) continue;
            let tmp = numarr[rinx];
            numarr[rinx] = numarr[numarr.length - 1 - i];
            numarr[numarr.length - 1 - i] = tmp;
        }
        return result;
    }

    // 攻强 防强
    getHurm (level, attval, defval, extra, pcr, vcr, tinc, inc, trdc, rdc, apower, dpower, can_crit) {
        defval = Math.max(defval, 0);
        let defpercent = Math.min(0.95, defval / (200 + 20 * (level -1)));
        defpercent = defpercent > 0.5 ? (0.5 + (defpercent - 0.5) / (2 + (defpercent - 0.5))) : defpercent;
        rdc = trdc + rdc;
        rdc = rdc > 0.5 ? (0.5 + (rdc - 0.5) / (2 + (rdc - 0.5))) : rdc; 
        let hurmval = attval * (1 - defpercent + extra * 0.7) * Math.max((1 + tinc + inc - rdc),0); 
        let isCrit = 0;
        vcr = Math.max(vcr, 1);
        if(can_crit == 2 && this.getRandom() < pcr){
            hurmval *= vcr;
            isCrit = 1;
        }
        hurmval = Math.max(1 + apower - dpower, 0) * hurmval;
        return {hurm: this.intergeNum(hurmval), crit: isCrit, vcr: vcr};
    }

    // getHurmval (atktype, deftype, attval, defval, rdm, cdr, increase, reduce, can_crit, avd) {
    //     let defexpect1 = Math.min(defval / 20 * 0.1, 20);
    //     let defexpect2 = Math.max(Math.min((defval - 4000) / 80 * 0.1, 20), 0);
    //     let defexpect3 = Math.max(Math.min((defval - 16000) / 160 * 0.1, 5), 0);
    //     let defexpect4 = Math.max(Math.min((defval - 24000) / 320 * 0.1, 50), 0);
    //     let defpercent = ((defexpect1 + defexpect2 + defexpect3 + defexpect4) / 100).toFixed(3);

    //     // let defpercent = defval/(200+20*(30-1)); 

    //     let hurmval = attval * (1 - defpercent);
    //     let isCrit  = 0;   
    //     if(can_crit == 2 && this.getRandom() < rdm) {
    //         hurmval *= cdr || 1;
    //         isCrit = 1;
    //     }
    //     // hurmval *= deftypeHurm[deftype][atktype] / 100;
    //     hurmval *= (1 + increase - reduce);
    //     if(!avd) avd = 0;
    //     if(this.getRandom() < avd) {
    //         return {hurm: 0, miss: 1, crit : isCrit};
    //     }

    //     return {hurm: Math.floor(hurmval), crit: isCrit};
    // }

    isRectArea(start, target, xrange, yrange) {
        let xdis = start.x - target.x;
        let ydis = start.y - target.y;
        return Math.abs(xdis) <= xrange && Math.abs(ydis) <= yrange;
    }

    isCircleArea(start, target, radius) {
        let xdis = start.x - target.x;
        let ydis = start.y - target.y;
        return xdis*xids + ydis*ydis <= radius*raduis;
    }

    intergeNum (num) {
        let last = Math.floor(num) % 10;        // 得到末尾数字
        let one = Math.floor(num * 10) % 10;    // 得到小数后第一位数字
        if(one <= 4 || (one == 5 && last % 2 == 0)) return Math.floor(num);
        else return Math.ceil(num);
    }

    // 根据传入的index数组 得到一个 乱序的index 数组
    getDisOrderIndex (tmparr) {
        let length = tmparr.length;
        for(let i = 0; i < length - 1; ++i) {
            let index = parseInt(this.getRandom() * (length - i));
            let temp  = tmparr[index];
            tmparr[index] = tmparr[length - 1 - i];
            tmparr[length - i - 1] = temp;
        }
        return tmparr;
    }
};

module.exports = bTools