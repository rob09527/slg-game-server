const nodeFetch = require('node-fetch');

const fs = require('fs');

const http = {
    /**
     *
     * @param url {string}
     * @param method {string}
     * @param body {object}
     * @param query {object}
     * @param header {object}
     */
    fetch: async (url, method, body = undefined, query = undefined, header = undefined) => {
        const headers = Object.assign({'Content-Type': 'application/json', 'x-kaihei': 1}, header);
        if (header && header['x-kaihei'] === 0) {
            delete header['x-kaihei'];
        }
        if (query && Object.keys(query).length) {
            url += ('?' + Object.keys(query).map(k => `${k}=${query[k]}`).join('&'));
        }
        return nodeFetch(url, {
            method,
            body: JSON.stringify(body),
            timeout: 30000,
            headers,
        }).then(res => res.json())
    },
    /**
     *
     * @param url {string}
     * @param query {object}
     * @param header {object}
     * @return {Promise<*>}
     */
    get: (url, query, header) => http.fetch(url, 'GET', undefined, query, header),
    /**
     *
     * @param url {string}
     * @param body {object}
     * @param query {object}
     * @param header {object}
     * @return {Promise<*>}
     */
    post: (url, body, query, header) => http.fetch(url, 'POST', body, query, header),
    /**
     *
     * @param url {string}
     * @param body {object}
     * @param query {object}
     * @param header {object}
     * @return {Promise<*>}
     */
    put: (url, body, query, header) => http.fetch(url, 'PUT', body, query, header),
    /**
     *
     * @param url {string}
     * @param body {object}
     * @param query {object}
     * @param header {object}
     * @return {Promise<*>}
     */
    del: (url, body, query, header) => http.fetch(url, 'DELETE', body, query, header),
}
let util;
/**
 *
 * @description 自定义 util, 默认拥有 lineToUpper md5 sleep 3个工具函数
 *
 */
module.exports = util = {
    // lineToUpper(str){ }, // this is default, _a to A
    // md5(str){}, // this is default
    // sleep(time){}, // this is default
    http,

    /**
     * 获取 奖励设置的正则
     * @param forceSet
     */
    rewardRequire(forceSet = true) {
        return `function(value){
                    if(!value){
                        return {ok: ${forceSet}}
                    } else if(!value.split(',').every(a => /(^\\d{5}$)|(^\\d{5}\\*\\d+$)/.test(a))){
                         return {ok: false}
                    }
                    return {ok: true }
                }`;
    },

    /**
     * 解析奖励字符串
     * @param rewardStr {string} 38005*1,38006*20
     * @return { [{GSID: number, COUNT: number}] }
     */
    parseRewardStr(rewardStr) {
        return (rewardStr + '').split(',').map(a => {
            a = a.split('*');
            return {GSID: +a[0], COUNT: a[1] ? +a[1] : 1}
        });
    },

    /**
     * 包装邮件对象
     * @param title {title}
     * @param content {string}
     * @param setreward {boolean}
     * @param reward {string}
     * @param isanno {boolean}
     * @param comment {string}

     */
    createMail(title, content, setreward, reward, isanno, comment ='', day = 30) {
        const mail = {};
        if (!title) throw '邮件内容不能为空';

        if (setreward) {
            if (!reward) {
                throw '请设置奖励内容'
            }
            mail.reward = util.parseRewardStr(reward);
            mail.type = 2;
        } else {
            if (reward) {
                throw '非奖励类型邮件，请不要设置奖励'
            }
            mail.type = 1;
        }

        if (!content) {
            throw '邮件内容不能为空'
        }
        if (isanno) {
            mail.from = {
                type: 'anno'
            }
        } else {
            mail.from = {
                type: 'sys'
            }
        }

        mail.title = title;
        mail.content = content;
        mail.comment = comment;
        mail.state = 0;
        mail.create = Date.now() - (30 - day) * 24 * 60 * 60 * 1000;
        return mail;
    },

    getMailForm() {
        return [
            {
                name: '标题',
                key: 'title',
                require: true
            },
            {
                name: '引导公告',
                key: 'isanno',
                type: 'switch',
            },
            {
                name: '奖励邮件?',
                key: 'setreward',
                type: 'switch',
                require: `function(value) {  
                const rw =this.props.form.find(a => a.key === 'reward');
                rw.show = !!value;
                this.setState({});
                return {ok: true}}`
            },
            {
                name: '邮件奖励',
                key: 'reward',
                show: false,
                placeholder: '例如: 38005*100,38006*10000',
                require: util.rewardRequire()
            },
            {
                name: '邮件内容',
                key: 'content',
                type: 'textarea',
                require: true
            },
            {
                name: '邮件备注',
                key: 'comment',
                type: 'textarea'
            },
            {
                name: '删除时间', 
                type: "select", 
                require: true,
                showSearch: true,
                key: 'day', options:[
                    {name: '30天', value: 30},
                    {name: '15天', value: 15},
                    {name: '7天', value: 7},
                    {name: '3天', value: 3},
                    {name: '1天', value: 1}
                ]
            }          
        ];
    },
    /**
     * 构建 角色查询时 vip 和 exp 以及 maxmapid 的管道field
     * @param gameconfig
     * @param opt {{level?: number, vip?: number, maxmapid?: number}}
     * @return {{level?: object, vip?: object, maxmapid?: object}}
     */
    getRoleVipAndExpAgg(gameconfig, opt = {level: 1}) {
        if (!this.pro) { // 做一下缓存判断

            const vipExp = gameconfig.vip.EXP;
            const pro = {};
            pro.vip = {
                $switch: {
                    branches: [],
                    default: 0
                }
            }
            for (let i = vipExp.length - 1; i >= 0; i--) {
                pro.vip.$switch.branches.push({
                    "case": {
                        "$gte": [
                            "$hide.38003.count",
                            vipExp[i]
                        ]
                    },
                    "then": i
                });
            }

            const levelExp = [];
            for (let exp of gameconfig.roleexp) {
                levelExp.push(exp + (levelExp.length ? levelExp[levelExp.length - 1] : 0));
            }
            pro.level = {
                $switch: {
                    branches: [],
                    default: 0
                }
            }

            for (let i = levelExp.length - 1; i >= 0; i--) {
                pro.level.$switch.branches.push({
                    "case": {
                        "$gte": [
                            "$hide.38001.count",
                            levelExp[i]
                        ]
                    },
                    "then": i + 1
                });
            }

            pro.maxmapid = {
                $switch: {
                    branches: [],
                    default: 10101
                }
            };
            const chapters = Object.keys(gameconfig.chapter);
            for (let i = 0; i < chapters.length; i++) {
                pro.maxmapid.$switch.branches.push({
                    "case": {
                        "$eq": [
                            "$_maxmapid",
                            i
                        ]
                    },
                    "then": chapters[i]
                });
            }
            this.pro = pro;
        }

        if (opt.level) {
            opt.level = this.pro.level
        }
        if (opt.vip) {
            opt.vip = this.pro.vip
        }

        if (opt.maxmapid) {
            opt.maxmapid = this.pro.maxmapid
        }
        return opt;
    },
    /**
     *
     * @param gsid {number}
     * @return {string}
     */
    gsidType(gsid) {
        let num = parseInt(gsid) / 10000;
        switch (Math.floor(num)) {
            case 1:
                return 'general';
            case 9:
                return 'others';
            case 5:
                if (num * 10 >= 51 && num * 10 < 52) { // 头像框
                    return '_frames';
                }else if (num * 10 >= 54 && num * 10 < 55) {    // 54000 ~ 54999 兵书
                    return 'book';		
                }else if (num * 10 >= 56 && num * 10 < 57) {	// 56000 ~ 56999 魂石
                    return 'soulstone';
                // }else if (num * 10 >= 57 && num * 10 < 58) {	// 57000 ~ 57999 珍宝
                // 	return 'zhenbao';
                }else if (num * 10 >= 58 && num * 10 < 59) {	// 58000 ~ 58999 珍宝碎片
                    return 'zbpiece';
                }else if (num * 10 >= 59 && num * 10 < 60){
                    return 'props';
                }
            case 6:	// 兵书
                if(gsid >= 60000 && gsid <= 60499){         //印记
                    return 'signet'
                }else if (gsid >= 60500 && gsid < 61000) {   // 称号
                    return '_titles';
                }else if (gsid >= 61000 && gsid < 62000) {   // 灵宠
                    return 'pet';
                }else if (gsid >= 62000 && gsid < 63000) {   // 新坐骑
                    return 'horse';
                }
            default:
                if (num * 10 >= 38 && num * 10 <= 39) {
                    return 'hide';
                } else {
                    return 'props';
                }
        }
    },

    sendByRobot(title, content) {
        if (!global.config.game.robot) {
            return;
        }

        const data = {
            msgtype: "markdown",
            markdown: {
                content: `
## ${title}
\`\`\`
${content}
\`\`\`
            `
            }
        }

        return http.post(global.config.game.robot, data, {}, {'x-kaihei': 0});
    }
}
