const md5 = require('md5')
const app = getApp()
Component({
    data: {
        showLogin: true,
        img: '', // captcha
        uuid: '', // captcha uuid
        error: '', // global error
        showTopTips: false,
        userNo: '',

        apps: ["移动营销", "业务审核", "随身宝", "大堂经理助手", "农商行大厦"],
        appIndex: 0,


        formData: {},
        rules: [
            {
                name: 'name',
                rules: [{
                    required: true,
                    message: '请填入您真实的中文姓名'
                }, {
                    rangelength: [2, 6],
                    message: '姓名格式不对'
                }],
            }, {
                name: 'usrNo',
                rules: [{
                    required: true,
                    message: '员工号必填'
                }, {
                    rangelength: [6, 6],
                    message: '员工号长度必须6位'
                }],
            }, {
                name: 'vcode',
                rules: [{
                    required: true,
                    message: '验证码必填'
                }, {
                    rangelength: [4, 6],
                    message: '验证码长度不对'
                }],
            }
        ]
    },
    methods: {
        formInputChange(e) {
            const {
                field
            } = e.currentTarget.dataset
            this.setData({
                [`formData.${field}`]: e.detail.value
            })
        },
        login() {
            this.submitForm(() => this.userAccess())
        },
        submitForm(cb) {
            this.selectComponent('#form').validate((valid, errors) => {
                console.log('valid', valid, errors)
                if (!valid) {
                    const firstError = Object.keys(errors)
                    if (firstError.length) {
                        this.setData({
                            error: errors[firstError[0]].message
                        })

                    }
                    return
                }
                cb()
            })
        },
        userAccess() {
            wx.request({
                url: 'https://emm.4001961200.com:9001/CRS/logon/userAccess',
                method: 'POST',
                data: {
                    code: this.data.formData.vcode,
                    userName: this.data.formData.name,
                    userNo: md5(this.data.formData.usrNo),
                    uuid: this.data.uuid,
                },
                header: {
                    'content-type': 'application/json' // 默认值
                },
                success: ({
                              data: {
                                  code,
                                  result,
                                  message,
                                  success: successFlag
                              }
                          }) => {
                    if (!successFlag || code !== 0) {
                        return wx.showModal({
                            content: '登录失败' + message
                        })
                    }
                    if (result) {
                        console.log('登录成功', result)
                        app.globalData.userNo = md5(this.data.formData.usrNo)
                        console.log({
                            app
                        })
                        // 查是否bind
                        this.isBind().then(data => {
                            console.log(88888888)
                            if (data.length === 1) {
                                console.log('正确绑定')
                                app.globalData.dbUser_id = data[0]._id
                                // 正确绑定
                                this.bindSuccess()
                            }
                            if (data.length > 1) {
                                console.error('多条绑定脏数据', data)
                            }
                            if (data.length < 1) {
                                console.log('未绑定')
                                this.bind().then(_id => {
                                    app.globalData.dbUser_id = _id
                                    this.bindSuccess()
                                })
                                // 未绑定
                            }
                        })
                    }
                },
                fail: (err) => {
                    wx.showModal({
                        content: '获取验证码请求失败'
                    })
                }
            })

        },
        getCheckCode() {
            wx.request({
                url: 'https://emm.4001961200.com:9001/CRS/logon/getCheckCode',
                header: {
                    'content-type': 'application/json' // 默认值
                },
                success: ({
                              data: {
                                  code,
                                  result,
                                  message,
                                  success: successFlag
                              }
                          }) => {
                    if (!successFlag || code !== 0) {
                        return wx.showModal({
                            content: '获取验证码交易失败' + message
                        })
                    }
                    if (result) {
                        console.log(result)
                        const {
                            info: {
                                img,
                                uuid
                            }
                        } = result
                        this.setData({
                            img,
                            uuid
                        })
                        this.setData({
                            [`formData.vcode`]: ''
                        })
                    }
                },
                fail: (err) => {
                    wx.showModal({
                        content: '获取验证码请求失败',
                    })
                }
            })
        },
        onGetOpenid: function () {
            // 调用云函数
            return new Promise((resolve, rej) => {
                wx.cloud.callFunction({
                    name: 'login',
                    data: {},
                    success: res => {
                        // console.log(`云函数res`,{res})
                        console.log('[云函数] [login] user openid: ', res.result.openid)
                        app.globalData.openid = res.result.openid
                        resolve(app.globalData.openid)
                        // wx.navigateTo({
                        //   url: '../userConsole/userConsole',
                        // })
                    },
                    fail: err => {
                        console.error('[云函数] [login] 调用失败', err)
                        rej(err)
                        // wx.navigateTo({
                        //   url: '../deployFunctions/deployFunctions',
                        // })
                    }
                })
            })
        },
        isBind: function () {
            return new Promise((resolve, rej) => {
                wx.showLoading()
                this.onGetOpenid().then(() => {
                    const _openid = app.globalData.openid
                    const db = wx.cloud.database()
                    db.collection('user').where({
                        _openid
                    }).get({
                        success: res => {
                            wx.hideLoading()
                            this.setData({
                                queryResult: JSON.stringify(res.data, null, 2)
                            })
                            console.log('user [数据库] [查询记录] 成功: ', res)
                            const {
                                data
                            } = res
                            // 如果有输入就匹配usrno，应对一个微信绑定多个员工的情况
                            // 没有输入匹配上次本地记住的绑定过的usrno
                            const lastBindUsrNo = this.data.formData.usrNo ?
                                md5(this.data.formData.usrNo) :
                                wx.getStorageSync('lastBindUsrNo')
                            if (lastBindUsrNo) {
                                const record = data.find(item => item.usrNo === lastBindUsrNo)
                                if (record) {
                                    app.globalData.userName = record.name
                                    resolve([record])
                                    return
                                }
                                resolve([])
                                return
                            }
                            if (data[0]) {
                                app.globalData.userName = data[0].name
                            }
                            resolve(data)
                        },
                        fail: err => {
                            wx.hideLoading()
                            wx.showModal({
                                content: '查询记录失败'
                            })
                            console.error('[数据库] [查询记录] 失败：', err)
                            rej()
                        }
                    })

                }).catch(rej)
            })
        },
        bind: function () {
            return new Promise((resolve, rej) => {
                const db = wx.cloud.database()
                db.collection('user').add({
                    data: {
                        usrNo: app.globalData.userNo,
                        name: this.data.formData.name,
                        codes: []
                    },
                    success: res => {
                        // 在返回结果中会包含新创建的记录的 _id
                        this.setData({
                            counterId: res._id,
                            count: 1
                        })
                        wx.showToast({
                            title: '绑定用户成功',
                        })
                        resolve(res._id)
                        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
                    },
                    fail: err => {
                        wx.showToast({
                            icon: 'none',
                            title: '绑定用户失败'
                        })
                        console.error('[数据库] [新增记录] 失败：', err)
                        rej(err)
                    }
                })

            })
        },
        bindSuccess: function () {
            console.log(`triggerEvent('bindSuccess'`, this.data.formData, app.globalData)
            this.triggerEvent('bindSuccess', {
                name: this.data.formData.name || app.globalData.userName
            })
            this.setData({
                showLogin: false
            })
            wx.setStorage({key: 'lastBindSuccess', data: new Date()})
            wx.setStorage({key: 'lastBindUsrNo', data: app.globalData.userNo})
        }

    },
    created: function () {
        const duration = 1000 * 60 * 60 * 24 * 30 // 天
        const lastBindSuccess = wx.getStorageSync('lastBindSuccess') || 0
        console.log(new Date() - lastBindSuccess)
        if (new Date() - lastBindSuccess > duration) {
            return this.getCheckCode()
        }
        // 查是否bind
        this.isBind().then(data => {
            if (data.length === 1) {
                console.log('正确绑定')
                app.globalData.dbUser_id = data[0]._id
                app.globalData.userNo = data[0].usrNo
                // 正确绑定
                this.bindSuccess()
            }
            if (data.length > 1) {
                console.error('多条绑定脏数据', data)
                wx.showModal({content: '多条绑定脏数据'})
            }
            if (data.length < 1) {
                console.log('未绑定')
            }
        })
    }
});
