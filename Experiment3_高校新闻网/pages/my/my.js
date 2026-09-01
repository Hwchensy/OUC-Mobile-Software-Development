// pages/my/my.js

Page({

  data: {

    // =========================
    // 登录信息
    // =========================

    isLogin: false,

    src: '',

    nickName: '',


    // =========================
    // 收藏
    // =========================

    number: 0,

    newsList: [],


    // =========================
    // 登录窗口
    // =========================

    showLoginPanel: false,

    tempAvatar: '',

    tempNickName: '',


    // =========================
    // 设置窗口
    // =========================

    showSettingPanel: false,


    // =========================
    // 账号管理窗口
    // =========================

    showAccountPanel: false

  },


  // ==================================================
  // 页面加载
  // ==================================================

  onLoad: function () {

    this.loadUserInfo()

  },


  // ==================================================
  // 页面显示
  // ==================================================

  onShow: function () {

    this.loadUserInfo()

  },


  // ==================================================
  // 加载用户信息
  // ==================================================

  loadUserInfo: function () {

    let userInfo = wx.getStorageSync('userInfo')


    if (userInfo) {

      this.setData({

        isLogin: true,

        src: userInfo.avatarUrl,

        nickName: userInfo.nickName

      })

      this.getMyFavorites()

    } else {

      this.setData({

        isLogin: false,

        src: '',

        nickName: '',

        number: 0,

        newsList: []

      })

    }

  },


  // ==================================================
  // 打开登录窗口
  // ==================================================

  showLogin: function () {

    this.setData({

      showLoginPanel: true,

      tempAvatar: '',

      tempNickName: ''

    })

  },


  // ==================================================
  // 选择头像
  // ==================================================

  onChooseAvatar: function (e) {

    this.setData({

      tempAvatar: e.detail.avatarUrl

    })

  },


  // ==================================================
  // 输入昵称
  // ==================================================

  onNicknameInput: function (e) {

    this.setData({

      tempNickName: e.detail.value

    })

  },


  // ==================================================
  // 取消登录
  // ==================================================

  cancelLogin: function () {

    this.setData({

      showLoginPanel: false,

      tempAvatar: '',

      tempNickName: ''

    })

  },


  // ==================================================
  // 确定登录
  // ==================================================

  confirmLogin: function () {

    let avatar = this.data.tempAvatar

    let nickname = this.data.tempNickName


    if (!avatar) {

      wx.showToast({

        title: '请选择头像',

        icon: 'none'

      })

      return

    }


    if (!nickname || nickname.trim() === '') {

      wx.showToast({

        title: '请输入昵称',

        icon: 'none'

      })

      return

    }


    let userInfo = {

      avatarUrl: avatar,

      nickName: nickname.trim()

    }


    wx.setStorageSync(

      'userInfo',

      userInfo

    )


    this.setData({

      isLogin: true,

      src: avatar,

      nickName: nickname.trim(),

      showLoginPanel: false,

      tempAvatar: '',

      tempNickName: ''

    })


    this.getMyFavorites()


    wx.showToast({

      title: '登录成功',

      icon: 'success'

    })

  },


  // ==================================================
  // 获取收藏
  // ==================================================

  getMyFavorites: function () {

    let info = wx.getStorageInfoSync()

    let keys = info.keys

    let myList = []


    for (let i = 0; i < keys.length; i++) {

      if (keys[i].indexOf('favorite_') === 0) {

        let obj = wx.getStorageSync(keys[i])

        if (obj) {

          myList.push(obj)

        }

      }

    }


    this.setData({

      newsList: myList,

      number: myList.length

    })

  },


  // ==================================================
  // 查看收藏新闻
  // ==================================================

  goToDetail: function (e) {

    let id = e.currentTarget.dataset.id


    if (!id) {

      return

    }


    wx.navigateTo({

      url: '../detail/detail?id=' + id

    })

  },


  // ==================================================
  // 打开设置
  // ==================================================

  openSetting: function () {

    console.log('点击设置')

    this.setData({

      showSettingPanel: true

    })

  },


  // ==================================================
  // 关闭设置
  // ==================================================

  closeSetting: function () {

    this.setData({

      showSettingPanel: false

    })

  },


  // ==================================================
  // 打开账号管理
  // ==================================================

  openAccount: function () {

    console.log('点击管理账号')

    this.setData({

      showAccountPanel: true

    })

  },


  // ==================================================
  // 关闭账号管理
  // ==================================================

  closeAccount: function () {

    this.setData({

      showAccountPanel: false

    })

  },


  // ==================================================
  // 修改账号
  // ==================================================

  editAccount: function () {

    this.setData({

      showAccountPanel: false,

      showLoginPanel: true,

      tempAvatar: this.data.src,

      tempNickName: this.data.nickName

    })

  },


  // ==================================================
  // 清空收藏
  // ==================================================

  clearFavorites: function () {

    let that = this


    if (!this.data.isLogin) {

      wx.showToast({

        title: '请先登录',

        icon: 'none'

      })

      return

    }


    if (this.data.number === 0) {

      wx.showToast({

        title: '暂无收藏',

        icon: 'none'

      })

      return

    }


    wx.showModal({

      title: '清空收藏',

      content: '确定要清空全部收藏吗？',

      confirmText: '确定',

      cancelText: '取消',

      success: function (res) {

        if (res.confirm) {

          let info = wx.getStorageInfoSync()

          let keys = info.keys


          for (let i = 0; i < keys.length; i++) {

            if (keys[i].indexOf('favorite_') === 0) {

              wx.removeStorageSync(keys[i])

            }

          }


          that.setData({

            newsList: [],

            number: 0

          })


          wx.showToast({

            title: '收藏已清空',

            icon: 'success'

          })

        }

      }

    })

  },


  // ==================================================
  // 退出登录
  // ==================================================

  logout: function () {

    let that = this


    wx.showModal({

      title: '退出登录',

      content: '退出后收藏仍会保留，确定退出吗？',

      confirmText: '退出',

      cancelText: '取消',

      success: function (res) {

        if (res.confirm) {

          wx.removeStorageSync('userInfo')


          that.setData({

            isLogin: false,

            src: '',

            nickName: '',

            number: 0,

            newsList: [],

            showAccountPanel: false,

            showSettingPanel: false

          })


          wx.showToast({

            title: '已退出登录',

            icon: 'success'

          })

        }

      }

    })

  }

})