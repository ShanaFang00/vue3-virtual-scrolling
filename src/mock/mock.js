import Mock from 'mockjs'

const list = Mock.mock({
    "data|100000": [
        {
            "id|+1": 1,
            name: "@cname"
        }
    ]
})
export const userList = list.data