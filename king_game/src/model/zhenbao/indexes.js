'use strict'

module.exports = [
    {
        keys: { // 角色同一ID的阵法只能有一个
            rid: 1,
            zbId: 1,
        },
        opts: {
            unique: 1,
            background: 1,
        }
    },
    {
        keys: {
            rid: 1,
        },
        opts: {}
    },
    {
        keys: {
            zbId: 1,
        },
        opts: {}
    }
]
