// 查codes表中used为自己userNo的记录 // todo 优化成查user表
const app = getApp()

function qryMyCodesViaUser() { // todo 云操作
    if (!app.globalData.userNo) return Promise.reject('未登录不能进行qryMyCodes')
    const db = wx.cloud.database()
    const _ = db.command
    // 查询所有codes，找到属于自己的codes
    return db.collection('user').where({
        usrNo: app.globalData.userNo
    })
        .get().then(({data, errMsg}) => {
            console.log('qryMyCodesViaUser [数据库] [查询记录] 成功: ', data)
            if (data.length) return data[0].codes
            return []
        }, err => {
            wx.showToast({
                icon: 'none',
                title: '查询记录失败'
            })
            console.error('qryMyCodesViaUser [数据库] [查询记录] 失败：', err)
            return Promise.reject(err)
        })
}

export {
    qryMyCodesViaUser
}