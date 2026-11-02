
const tagEvents = [
    require('./tagevents/officialmissionpvp'),
    require('./tagevents/officialmissionlvl'),
]

/**
 * 其他的一些特殊监听标记改变的逻辑处理
 * @param changeGsid {string|number}
 * @param change {number} // 改变数值
 * @param count {number} // 改变过后的数值
 */
module.exports = async function (...args) {
    let [
        tag,
    ] = args;
    for (let event of tagEvents) {
        if (!event.tags) continue;
        if (!event.tags[tag]) continue;
        if (!event.onChange) continue;
        await event.onChange.apply(this, args);
    }
};
