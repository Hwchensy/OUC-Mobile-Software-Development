Page({
  data: {
    worlding: 'girl',
    animationClass: ''
  },

  onClick: function () {

    // 第一步：缩小、淡出
    this.setData({
      animationClass: 'animate-out'
    })

    // 300毫秒以后切换内容
    setTimeout(() => {

      // girl 和 boy 互相切换
      if (this.data.worlding === 'girl') {
        this.setData({
          worlding: 'boy',
          animationClass: ''
        })
      } else {
        this.setData({
          worlding: 'girl',
          animationClass: ''
        })
      }

      // 稍微等待一下，再执行进入动画
      setTimeout(() => {
        this.setData({
          animationClass: 'animate-in'
        })

        // 动画结束后清除class
        setTimeout(() => {
          this.setData({
            animationClass: ''
          })
        }, 400)

      }, 30)

    }, 300)
  }
})