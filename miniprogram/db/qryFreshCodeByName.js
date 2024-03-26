// 查codes表中对应app_name的limit条记录
function qryFreshCodeByName(app_name, limit = 1) { // todo 云操作
    const db = wx.cloud.database()
    const _ = db.command
    // 查询所有codes，用户端只能读不能写，云函数才能写
    return db.collection('codes').where({
        link: _.neq('redeemed'),
        app_name,
        used: _.eq('').or(_.exists(false))
    })
        .limit(limit) //只查一条
        .get().then(({data, errMsg}) => {
            console.log('useCode [数据库] [查询记录] 成功: ', data)
            return data
        }, err => {
            wx.showToast({
                icon: 'none',
                title: '查询记录失败'
            })
            console.error('useCode [数据库] [查询记录] 失败：', err)
            return Promise.reject(err)
        })
}

export {
    qryFreshCodeByName
}