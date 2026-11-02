exports.name = '数据分析看板';
exports.type = 'N';
exports.view = true;
exports.open = true;

exports.exec = async function (body, query, ctx) {


    const menus = [
        ctx.actionSet.has('king-analyze-board-view') ? {
            name: '今日看板',
            id: `king-analyze-board-view`
        } : null,
        ctx.actionSet.has('king-analyze-hourboard-view') ? {
            name: '分时看板',
            id: `king-analyze-hourboard-view`
        } : null,
        ctx.actionSet.has('king-analyze-dally-view') ? {
            name: '运营日报',
            id: `king-analyze-dally-view`
        } : null,
        ctx.actionSet.has('king-analyze-report-view') ? {
            name: '运营报告',
            id: `king-analyze-report-view`
        } : null,
        ctx.actionSet.has('king-analyze-ltv-view') ? {
            name: '账号-付费转化',
            id: `king-analyze-ltv-view?id=addPayCount&type=0`
        } : null,
        ctx.actionSet.has('king-analyze-ltv-view') ? {
            name: '账号-LTV统计',
            id: `king-analyze-ltv-view?id=addPayTotal&type=0`
        } : null,
        ctx.actionSet.has('king-analyze-ltv-view') ? {
            name: '账号-留存统计',
            id: `king-analyze-ltv-view?id=todayActive&type=0`
        } : null,
        ctx.actionSet.has('king-analyze-ltv-view') ? {
            name: '角色-付费转化',
            id: `king-analyze-ltv-view?id=addPayCount&type=1`
        } : null,
        ctx.actionSet.has('king-analyze-ltv-view') ? {
            name: '角色-LTV统计',
            id: `king-analyze-ltv-view?id=addPayTotal&type=1`
        } : null,
        ctx.actionSet.has('king-analyze-ltv-view') ? {
            name: '角色-留存统计',
            id: `king-analyze-ltv-view?id=todayActive&type=1`
        } : null,
        ctx.actionSet.has('king-analyze-ltv-view') ? {
            name: '付费账号-LTV统计',
            id: `king-analyze-ltv-payview?id=addPayTotal&type=0`
        } : null,
        ctx.actionSet.has('king-analyze-ltv-view') ? {
            name: '付费账号-留存统计',
            id: `king-analyze-ltv-payview?id=todayActive&type=0`
        } : null,
        ctx.actionSet.has('king-analyze-ltv-view') ? {
            name: '付费账号-留存历史数据',
            id: `king-analyze-ltv-historyview?type=0`
        } : null,
        ctx.actionSet.has('king-analyze-jifeidian-view') ? {
            name: '计费点分布',
            id: `king-analyze-jifeidian-view`
        } : null,
        ctx.actionSet.has('king-analyze-onlinetime-view') ? {
            name: '在线时长',
            id: `king-analyze-onlinetime-view`
        } : null,
        ctx.actionSet.has('king-analyze-onlinetimeinfo-view') ? {
            name: '在线时长明细',
            id: `king-analyze-onlinetimeinfo-view`
        } : null,
        ctx.actionSet.has('king-analyze-onlinereport-view') ? {
            name: '在线详情',
            id: `king-analyze-onlinereport-view`
        } : null,
        ctx.actionSet.has('king-analyze-payrank-view') ? {
            name: '充值排行榜',
            id: `king-analyze-payrank-view`
        } : null,
        ctx.actionSet.has('king-analyze-vipfb-view') ? {
            name: 'VIP分布',
            id: `king-analyze-vipfb-view`
        } : null,
        ctx.actionSet.has('king-analyze-levelfb-view') ? {
            name: '等级分布',
            id: `king-analyze-levelfb-view`
        } : null,
        ctx.actionSet.has('king-analyze-mapidfb-view') ? {
            name: '停留关卡分布',
            id: `king-analyze-mapidfb-view`
        } : null,
        ctx.actionSet.has('king-analyze-general-view') ? {
            name: '武将分布',
            id: `king-analyze-general-view`
        } : null,
        ctx.actionSet.has('king-analyze-djtj-view') ? {
            name: '点将统计',
            id: `king-analyze-djtj-view`
        } : null,
        ctx.actionSet.has('king-analyze-zmtj-view') ? {
            name: '招募统计',
            id: `king-analyze-zmtj-view`
        } : null,
        ctx.actionSet.has('king-analyze-gxtj-view') ? {
            name: '观星统计',
            id: `king-analyze-gxtj-view`
        } : null,
        ctx.actionSet.has('king-analyze-vipkucun-view') ? {
            name: 'VIP库存',
            id: `king-analyze-vipkucun-view`
        } : null,
        ctx.actionSet.has('king-analyze-guild-view') ? {
            name: '新手引导流失',
            id: `king-analyze-guild-view`
        } : null,
        ctx.actionSet.has('king-analyze-towerrank-view') ? {
            name: '通天塔排行',
            id: `king-analyze-towerrank-view`
        } : null,
        ctx.actionSet.has('king-analyze-rbuild-view') ? {
            name: '角色封地',
            id: `king-analyze-rbuild-view`
        } : null,
        ctx.actionSet.has('king-analyze-maze-view') ? {
            name: '夺宝统计',
            id: `king-analyze-maze-view`
        } : null,
        ctx.actionSet.has('king-analyze-pvprank-view') ? {
            name: '单人擂台排行',
            id: `king-analyze-pvprank-view`
        } : null,
        ctx.actionSet.has('king-analyze-pvpking-view') ? {
            name: '排位赛排行',
            id: `king-analyze-pvpking-view`
        } : null,
        ctx.actionSet.has('king-analyze-pvpteam-view') ? {
            name: '组队赛排行',
            id: `king-analyze-pvpteam-view`
        } : null,
    ];


    return menus.filter(Boolean);
};

