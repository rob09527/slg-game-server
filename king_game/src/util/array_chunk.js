
'use strict'

function chunk(array, size) {//array需要操作的数组，size分块后每一块元素个数
    size = Math.max(size, 0)//size不能小于0
    const length = array == null ? 0 : array.length//数组长度
    if (!length || size < 1) {//如果数组长度为0或者分块元素个数为0，就返回空数组
        return []
    }
    let index = 0//循环数组索引
    let resIndex = 0//结果数组索引
    const result = new Array(Math.ceil(length / size))//数组长度 / 分块大小 向上取整得到结果数组的长度，然后创建这个长度的数组作为结果数组初始化

    while (index < length) {//循环array数组
        result[resIndex++] = slice(array, index, (index += size))//循环并且给result结果数组的第resIndex项赋值
    }
    return result
}

function slice(array, start, end) {//array要操作的数组，start起始索引，end结束索引
    let length = array == null ? 0 : array.length//数组长度
    if (!length) {//如果数组长度为0，就返回空数组
        return []
    }
    start = start == null ? 0 : start//start起始索引，默认值是0
    end = end === undefined ? length : end//end结束索引，默认是数组长度

    if (start < 0) {//起始索引是负数处理，是负数就相当于从末尾往开头数，也就是和lengh相加
        start = -start > length ? 0 : (length + start)//和length相加后如果还是小于0就等于0
    }
    end = end > length ? length : end//结束索引如果大于length就让它等于length
    if (end < 0) {//处理结束索引是负数
        end += length
    }
    length = start > end ? 0 : ((end - start) >>> 0)//根据start和end计算这个切片的长度，如果起始在结束后面那么切片长度为0，否则相减并且取整
    start >>>= 0//start取整

    let index = -1//循环索引
    const result = new Array(length)//创建切片长度的数组作为结果数组
    while (++index < length) {//循环切片长度的次数，给结果数组每一项赋值
        result[index] = array[index + start]
    }
    return result
}

module.exports = exports = function (array,size) {
    //数组分块
    /**
     * chunk(['a', 'b', 'c', 'd'], 2);
        => [['a', 'b'], ['c', 'd']]
        chunk(['a', 'b', 'c', 'd'], 3);
        => [['a', 'b', 'c'], ['d']]
     */
    return chunk(array,size)
}
