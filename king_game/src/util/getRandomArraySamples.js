const _ = require('lodash');

module.exports = exports = function getRandomArraySamples(arr, size, sampleSize = 6) {
    if (!Array.isArray(arr) || arr.length === 0 || size <= 0) {
        return []; // 如果输入数组为空或size无效，直接返回空数组 
    }

    let copyArr = _.cloneDeep(arr);
    const results = [];

    for (let i = 0; i < size; i++) {
        if (copyArr.length === 0) {
            break; // 如果没有剩余元素，退出循环 
        }

        const currentSampleSize = Math.min(sampleSize, copyArr.length); // 根据剩余元素确定实际抽样数量 
        const shuffled = _.shuffle(copyArr);
        const sample = shuffled.slice(0, currentSampleSize);

        results.push(sample);

        // 移除已抽取的元素 
        copyArr = _.difference(copyArr, sample);
    }

    return results;
};