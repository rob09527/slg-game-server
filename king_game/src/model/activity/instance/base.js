'use strict'

const hide_chk = require('./../common/hide');

module.exports = exports =  function (role) {
    const tmp = this.toJSON();
    delete tmp.__v;
    delete tmp._id;
    delete tmp.mtitle;
    delete tmp.mcontent;
    tmp.canget = 0;
    if(role){ // 有传递角色信息
        const {start, etime} = this.getInterval(role);
        tmp.time = [start, etime];
        if(!tmp.params) return tmp;
        if(tmp.params.reward && Object.keys(tmp.params.reward).length > 0){ // 判断奖励领取条件是否已经达到
            tmp.params.reward.only_require = this.requireCheck(role);
            tmp.params.reward.require = tmp.params.reward.only_require  && this.consumeCheck(role); // 默认奖励项
            tmp.params.consume = this.calConsume(role , undefined, "reward");


            let rw = tmp.params.reward;
            if (rw.items && rw.items.length ){ // 有默认奖励配置 计算可领取 + 1
                tmp.canget++;
            }
            const info =  role.act[this.type]; // 默认 奖励是设置在最外层的
            if (rw.require && rw.limit !== -1 && info && info.times >= rw.limit){
                rw.fulllimit = true; // 达到了限制
                tmp.canget--;
            } else if( !rw.require ){
                tmp.canget--;
            }
            for (let k in tmp.params.reward){
                const rw = tmp.params.reward[k];
                if(!rw.items){ // 证明不是奖励子项
                    continue;
                }
                tmp.canget++;
                // 返回 true 则表示条件达到
                rw.only_require = this.requireCheck(role, k);
                rw.require = rw.only_require && this.consumeCheck(role, k);
                rw.consume = this.calConsume(role , k , "reward");
                const info =  role.act[this.type];
                rw.fulllimit = false;
                if (rw.require && rw.limit !== -1 && info && info[k] && info[k].times >= rw.limit){
                    rw.fulllimit = true; // 达到了限制
                    tmp.canget--;
                } else if( !rw.require ){
                    tmp.canget--;
                } else if (tmp.type === 'xcfl' && rw.consume && rw.consume.length > 0){ // 新春福利的补签 不计红点
                    tmp.canget--;
                }
            }
        }
        if(tmp.params.sppack && Object.keys(tmp.params.sppack).length > 0){
            for (let k in tmp.params.sppack){
                const rw = tmp.params.sppack[k];

                // 返回 true 则表示条件达到
                rw.require = this.requireCheck(role, k, 'sppack') && this.consumeCheck(role, k , 'sppack');
                const info =  role.act[this.type];
                rw.fulllimit = false;
                tmp.canget ++;
                // 判断触发限制达到上限
                if (rw.require && rw.limit !== -1 && info && info[k] && info[k].times >= rw.limit){
                    rw.fulllimit = true; // 达到了限制
                    tmp.canget --;
                } else if(!rw.require ){
                    tmp.canget --;
                }
            }
        }
        // 抽奖类活动
        if(tmp.params.lucky && tmp.params.lucky.items){
            // 返回 true 则表示条件达到
            tmp.params.lucky.require = this.requireCheck(role, null, 'lucky') && this.consumeCheck(role, null, 'lucky');
            const info =  role.act[this.type];
            tmp.params.lucky.consume = this.calConsume(role , undefined, "lucky");

            tmp.canget ++;
            if(tmp.params.lucky.require &&  tmp.params.lucky.limit !== -1 && info && info.lucky && info.lucky.times >= tmp.params.lucky.limit) {
                tmp.params.lucky.fulllimit = true; // 达到限制
            } else if(!tmp.params.lucky.require) {
                tmp.canget --;
            }
        }
        const chk_fn = hide_chk[this.type.toLowerCase()];
        // 是否能判断入口关闭
        if (typeof chk_fn === 'function') tmp.hide = chk_fn.call(this, role);
    }
    return tmp;
}
