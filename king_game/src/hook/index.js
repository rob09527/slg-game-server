exports.pre = require('./event_pre');
exports.end = require('./event_end');

const event_enum = {
    /* 多队演武 */
    get MULTIPVP() {
        return 'MULTIPVP';
    },
    /* 天运值招募 */
    get PUB() {
        return 'PUB';
    },
    /* 装备升级 */
    get FUSION() {
        return 'FUSION';
    },
    /* 每日商店 */
    get SHOP() {
        return 'SHOP';
    },
    /* 武将分解 */
    get RELIVE() {
        return 'RELIVE';
    },
    /* 个人悬赏 */
    get ITNMISSION_PERS() {
        return 'ITNMISSION_PERS';
    },
    get OFFICIAL() {
        return 'OFFICIAL';
    },
    get BIGBATTLE() {
        return 'BIGBATTLE';
    },
    /* 普通观星 */
    get LOOKSTAR() {
        return 'LOOKSTAR';
    },
    /* 高级观星 */
    get LOOKSTAR_PREMIUM() {
        return 'LOOKSTAR_PREMIUM';
    },
    /* 试炼塔 */
    get TOWER() {
        return 'TOWER';
    },
    /* 单人演武 */
    get PVP() {
        return 'PVP';
    },
    /* 点将 */
    get DRAW() {
        return 'DRAW';
    },
    /* 远征 @deprecated */
    get EXPEDITION() {
        return 'EXPEDITION';
    },
    /* 神兽 */
    get MYTHICAL() {
        return 'MYTHICAL';
    },
    /* 军团 */
    get LEGION() {
        return 'LEGION';
    },
    /* 私人邮件 */
    get PRIVATEMAIL() {
        return 'PRIVATEMAIL';
    },
    /* 组队演武 */
    get PVP_TEAM() {
        return 'PVP_TEAM';
    },
    /* 封地 */
    get MANOR() {
        return 'MANOR';
    },

    /* 好友切磋 */
    get FRIENDPVP() {
        return 'FRIENDPVP';
    },
    /* 职业试炼塔 */
    get TOWER_OCC() {
        return 'TOWER_OCC';
    },
    /* 新远征 */
    get MAZE() {
        return 'MAZE';
    },
    /* 坐骑 */
    get GENER_MOUNT() {
        return 'GENER_MOUNT';
    },
    /* 王者演武 */
    get PVP_KING() {
        return 'PVP_KING';
    },
    /* 一骑单千 */
    get DUNGEON() {
        return 'DUNGEON';
    },
    /* 征战晋级 */
    get CHAPTER_UP() {
        return 'CHAPTER_UP';
    },

    /* 标志位改变 */
    get TAG_CHANGE() {
        return 'TAG_CHANGE';
    },

    /* 七天签到 */
    get SEVEN_LOGIN() {
        return 'SEVEN_LOGIN';
    },

    /* 快速挂机 */
    get WORLD_QUICK() {
        return 'WORLD_QUICK';
    },

    /* 征战事件 */
    get WORLD_EVENT() {
        return 'WORLD_EVENT';
    },

    /* 宝物栏 */
    get GENER_TERA() {
        return 'GENER_TERA';
    },
    /* 超值基金 */
    get WORTH_FUND() {
        return 'WORTH_FUND';
    },
    /* 困难模式的征战 */
    get DIFF_CHAPTER_UP() {
        return 'DIFF_CHAPTER_UP';
    },
    /* 奇门幻阵 */
    get FANTASY() {
        return 'FANTASY'
    },
    /* 天机试炼 */
    get SECRET_TRIAL() {
        return 'SECRET_TRIAL'
    },
    /* 新春活动 */
    get NEW_YEARS() {
        return 'NEW_YEARS'
    },
    /**寻宝活动 */
    get ACTIVITY_ZHD_XUNBAO() {
        return 'ACTIVITY_ZHD_XUNBAO'
    }
};

Object.defineProperty(global, 'EVENT_ENUM', {
    set(v) { throw new Error('readonly') },
    get() { return event_enum }
})

