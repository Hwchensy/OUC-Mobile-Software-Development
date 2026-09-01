// pages/setting/setting.js

Page({

  data: {

    isLogin: false

  },


  // =========================
  // 页面显示
  // =========================
  onShow: function () {

    let userInfo = wx.getStorageSync('userInfo')

    this.setData({

      isLogin: !!userInfo

    })

  },


  // =========================
  // 个人资料
  // =========================
  goProfile: function () {

    wx.switchTab({

      url: '../my/my'

    })

  },


  // =========================
  // 我的收藏
  // =========================
  goFavorites: function () {

    wx.switchTab({

      url: '../my/my'

    })

  },


  // =========================
  // 最近浏览
  // =========================
  goLogs: function () {

    wx.navigateTo({

      url: '../logs/logs'

    })

  },


  // =========================
  // 关于新闻网
  // =========================
  showAbout: function () {

    wx.showModal({

      title: '关于新闻网',

      content:
        '我的新闻网\n\n' +
        '中国海洋大学校园新闻信息平台\n\n' +
        '提供新闻浏览、搜索、收藏、最近浏览等功能。',

      showCancel: false,

      confirmText: '知道了'

    })

  },


  // =========================
  // 清除浏览记录
  // =========================
  clearLogs: function () {

    wx.showModal({

      title: '清除浏览记录',

      content: '确定要删除所有最近浏览记录吗？',

      confirmText: '确定',

      cancelText: '取消',

      success: function (res) {

        if (res.confirm) {

          wx.removeStorageSync('recent_1')
          wx.removeStorageSync('recent_2')
          wx.removeStorageSync('recent_3')
          wx.removeStorageSync('recent_4')
          wx.removeStorageSync('recent_5')

          wx.showToast({

            title: '已清除',

            icon: 'success'

          })

        }

      }

    })

  },


  // =========================
  // 退出登录
  // =========================
  logout: function () {

    wx.showModal({

      title: '退出登录',

      content: '退出后需要重新选择头像和填写昵称，确定退出吗？',

      confirmText: '退出',

      cancelText: '取消',

      success: function (res) {

        if (res.confirm) {

          wx.removeStorageSync('userInfo')

          wx.showToast({

            title: '已退出登录',

            icon: 'success'

          })

          // 返回“我的”页面
          setTimeout(function () {

            wx.switchTab({

              url: '../my/my'

            })

          }, 500)

        }

      }

    })

  }

})