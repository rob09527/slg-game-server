'use strict'


/**
 * 红点
 * @type {RankService}
 */
class RemindService {
    async set(key,data,expireTime){
        try {
            if(typeof data == 'object') data = JSON.stringify(data);
            await global.cacheRedis.set(key,data);
            if(expireTime) await global.cacheRedis.expire(key,expireTime);
        } catch (error) {
            console.log(`RemindService---->set${key}--->error`,error.stack);
        }
    };
    async find(key){
        try {
            let res = await global.cacheRedis.get(key);
            if(res) res = JSON.parse(res);
            return res;
        } catch (error) {
            console.log(`RemindService---->find${key}--->error`,error.stack);
            return null;
        }
    }
}
module.exports = ()=>{
    if(!this.remindService){
        this.remindService = new RemindService();
    }
    return this.remindService
};
