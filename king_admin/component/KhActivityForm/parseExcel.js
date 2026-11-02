export function parseExcel(data) {
    data = data[0].data;
    data.shift(); // 渠道无用的一行数据

    if (!data[0]) {
        return {};
    }
    let rewardAll;
    if (data[0].RWID) { // 直领奖励类型
        rewardAll = rewardParse(data);
    }
    return {
        rewardAll
    }
}

function rewardParse(data) {
    const obj = {};
    for (const item of data) {
        const consume = [];
        for (let i = 0; i < 10; i++) {
            if (!item[`CAST_GSID${i}`]) break;
            const GSID = item[`CAST_GSID${i}`];
            const COUNT = item[`CAST_COUNT${i}`];
            consume.push(`${GSID}*${COUNT}`);
        }
        const ritems = [];
        for (let i = 0; i < 10; i++) {
            if (!item[`GSID${i}`]) break;
            const GSID = item[`GSID${i}`];
            const COUNT = item[`COUNT${i}`];
            ritems.push(`${GSID}*${COUNT}`);
        }
        obj[item.RWID] = {
            ID: item.RWID,
            require: item.REQUIRE,
            consume: consume.join('|'),
            items: ritems.join('|'),
            limit: item.TIME_LIMIT,
        };
    }

    return obj;
}

