/**
 * randomconfig:随机数据
 * count:随机次数
 * type：权重字段
 * remove 每次随机是否移除当前选中目标
 */
module.exports = exports = function (randomconfig, count, type, remove) {
    let items = JSON.parse(JSON.stringify(randomconfig))
    let result = weightedRandom(items, count, type, remove)
    return result
}

function weightedRandom(items, count, type, remove) {
    // 计算权重总和
    let totalWeight = 0;
    for (let i = 0; i < items.length; i++) {
        totalWeight += items[i][type];
    }

    // 存储抽取结果的数组
    let results = [];

    // 抽取指定次数的元素
    while (count > 0) {
        // 生成一个随机数
        let randomNum = Math.floor(Math.random() * totalWeight);

        // 遍历数组，找到随机数所在的权重范围
        let start = 0;
        for (let i = 0; i < items.length; i++) {
            if (randomNum < start + items[i][type]) {
                // 抽中元素
                let selectedItem = items[i];
                results.push(selectedItem);

                // 从数组中移除抽中的元素
                if (remove) {
                    items.splice(i, 1);
                }

                // 更新权重总和（因为移除了一个元素）
                totalWeight -= selectedItem[type];

                // 抽取次数减一
                count--;

                // 跳出循环
                break;
            }
            start += items[i][type];
        }

        // 如果没有抽中任何元素（理论上不应该发生，除非数组为空），则退出循环
        if (results.length === 0) break;
    }

    return results;
}


