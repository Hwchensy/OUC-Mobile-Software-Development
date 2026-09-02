// ================================
// 推箱子游戏页面
// ================================

const gameData = require("../../utils/data.js");

Page({

  // ================================
  // 页面数据
  // ================================

  data: {

    // 当前关卡
    level: 0,

    // 当前步数
    steps: 0,

    // 最佳成绩
    bestScore: 0,

    // 推箱次数
    pushCount: 0,

    // 剩余目标
    remainingTargets: 0,

    // 是否通关
    gameWin: false,

    // 是否可以撤销
    canUndo: false,

    // 是否已经使用炸弹
    bombUsed: false,

    // 关卡名称
    levelName: "基础训练",

    // 当前提示
    currentTip: "将所有箱子推到目标位置"

  },


  // ================================
  // 页面加载
  // ================================

  onLoad(options) {

    let level = 0;

    // 首页传来的关卡
    if (options.level !== undefined) {
      level = parseInt(options.level);
    }

    // 防止关卡越界
    if (isNaN(level)) {
      level = 0;
    }

    if (level < 0) {
      level = 0;
    }

    if (level > 3) {
      level = 3;
    }

    this.setData({
      level: level
    });

    // Canvas大小
    this.tileSize = 40;

    // 历史记录
    this.history = [];

    // 触摸起点
    this.touchStartX = 0;
    this.touchStartY = 0;

    // 炸弹是否使用
    this.bombUsed = false;

    // 加载关卡
    this.loadLevel(level);

  },


  // ================================
  // 页面显示
  // ================================

  onShow() {

    this.enableKeyboard();

  },


  // ================================
  // 加载关卡
  // ================================

  loadLevel(level) {

    const sourceMap = gameData.maps[level];

    if (!sourceMap) {

      wx.showToast({
        title: "关卡不存在",
        icon: "none"
      });

      return;
    }

    // 保存原始地图
    this.sourceMap = sourceMap;

    // 地图尺寸
    this.rows = sourceMap.length;
    this.cols = sourceMap[0].length;

    // ================================
    // 基础地图
    // ================================

    this.baseMap = [];

    // ================================
    // 箱子
    // ================================

    this.boxes = [];

    // ================================
    // 玩家
    // ================================

    this.player = {
      x: 0,
      y: 0
    };

    // ================================
    // 猪目标
    //
    // 记录哪些猪已经被箱子消灭
    // 一旦消灭，不会重新出现
    // ================================

    this.deadTargets = [];

    // ================================
    // 目标数量
    // ================================

    this.targetCount = 0;

    // ================================
    // 解析地图
    // ================================

    for (let y = 0; y < this.rows; y++) {

      this.baseMap[y] = [];

      for (let x = 0; x < this.cols; x++) {

        const value = sourceMap[y][x];

        // ========================================
        // 地图底层
        //
        // 现在整个地图区域默认都是冰块。
        //
        // 包括 data.js 中的 0，
        // 也不再把 0 当成空白区域。
        // ========================================

        if (value === 1) {

          // 石头
          this.baseMap[y][x] = 1;

        }
        else if (value === 3) {

          // 猪所在位置
          this.baseMap[y][x] = 3;

          this.targetCount++;

        }
        else {

          // 0、2、4、5
          // 底层全部使用冰块
          this.baseMap[y][x] = 2;

        }

        // ============================
        // 箱子
        // ============================

        if (value === 4) {

          this.boxes.push({
            x: x,
            y: y
          });

        }

        // ============================
        // 玩家
        // ============================

        if (value === 5) {

          this.player = {
            x: x,
            y: y
          };

        }

      }

    }

    // ================================
    // 关卡名称
    // ================================

    const names = [
      "基础训练",
      "进阶挑战",
      "思维训练",
      "终极挑战"
    ];

    // ================================
    // 每关重新获得一次炸弹
    // ================================

    this.bombUsed = false;

    this.history = [];

    this.setData({

      levelName: names[level],

      steps: 0,

      pushCount: 0,

      gameWin: false,

      canUndo: false,

      bombUsed: false,

      remainingTargets: this.targetCount,

      currentTip: "将所有箱子推到猪身上即可消灭猪"

    });

    // 读取最佳成绩
    this.loadBestScore(level);

    // 绘制地图
    this.drawMap();

  },


  // ================================
  // 读取最佳成绩
  // ================================

  loadBestScore(level) {

    const scores =
      wx.getStorageSync("sokoban_best_scores") || {};

    const best = scores[level] || 0;

    this.setData({
      bestScore: best
    });

  },


  // ================================
  // 保存最佳成绩
  // ================================

  saveBestScore() {

    const level = this.data.level;

    const scores =
      wx.getStorageSync("sokoban_best_scores") || {};

    const currentBest = scores[level] || 0;

    if (
      currentBest === 0 ||
      this.data.steps < currentBest
    ) {

      scores[level] = this.data.steps;

      wx.setStorageSync(
        "sokoban_best_scores",
        scores
      );

      this.setData({
        bestScore: this.data.steps
      });

      return true;
    }

    return false;

  },


  // ================================
  // 绘制地图
  // ================================

  drawMap() {

    const ctx =
      wx.createCanvasContext(
        "myCanvas",
        this
      );

    // ================================
    // 清空 Canvas
    // ================================

    ctx.clearRect(
      0,
      0,
      this.cols * this.tileSize,
      this.rows * this.tileSize
    );

    // ================================
    // 绘制地图基础部分
    // ================================

    for (
      let y = 0;
      y < this.rows;
      y++
    ) {

      for (
        let x = 0;
        x < this.cols;
        x++
      ) {

        const value =
          this.baseMap[y][x];

        const px =
          x * this.tileSize;

        const py =
          y * this.tileSize;

        // ========================================
        // 所有非石头位置首先绘制冰块
        //
        // 这样整个地图区域不会出现空白。
        // ========================================

        if (value !== 1) {

          this.drawImage(
            ctx,
            "../../images/ice.png",
            px,
            py
          );

        }

        // ============================
        // 墙
        // ============================

        if (value === 1) {

          this.drawImage(
            ctx,
            "../../images/stone.png",
            px,
            py
          );

        }

        // ============================
        // 猪目标
        //
        // 如果猪没有被消灭
        // 显示猪
        // ============================

        if (value === 3) {

          const dead =
            this.isTargetDead(x, y);

          if (!dead) {

            this.drawImage(
              ctx,
              "../../images/pig.png",
              px,
              py
            );

          }
          else {

            // 猪已经被消灭
            // 底层保持冰块
            this.drawImage(
              ctx,
              "../../images/ice.png",
              px,
              py
            );

          }

        }

      }

    }

    // ================================
    // 绘制箱子
    // ================================

    for (
      let i = 0;
      i < this.boxes.length;
      i++
    ) {

      const box =
        this.boxes[i];

      // ============================
      // 如果箱子进入猪的位置
      //
      // 猪已经被消灭
      //
      // 箱子也不显示
      // ============================

      if (
        this.isTargetDead(
          box.x,
          box.y
        )
      ) {

        continue;

      }

      this.drawImage(
        ctx,
        "../../images/box.png",
        box.x * this.tileSize,
        box.y * this.tileSize
      );

    }

    // ================================
    // 绘制玩家
    // ================================

    this.drawImage(
      ctx,
      "../../images/bird.png",
      this.player.x * this.tileSize,
      this.player.y * this.tileSize
    );

    ctx.draw();

  },


  // ================================
  // Canvas画图片
  // ================================

  drawImage(
    ctx,
    path,
    x,
    y
  ) {

    ctx.drawImage(
      path,
      x,
      y,
      this.tileSize,
      this.tileSize
    );

  },


  // ================================
  // 判断猪是否已经被消灭
  // ================================

  isTargetDead(x, y) {

    for (
      let i = 0;
      i < this.deadTargets.length;
      i++
    ) {

      if (
        this.deadTargets[i].x === x &&
        this.deadTargets[i].y === y
      ) {

        return true;

      }

    }

    return false;

  },


  // ================================
  // 消灭猪
  // ================================

  killTarget(x, y) {

    if (
      !this.isTargetDead(x, y)
    ) {

      this.deadTargets.push({
        x: x,
        y: y
      });

    }

  },


  // ================================
  // 判断是否是墙
  // ================================

  isWall(x, y) {

    if (
      x < 0 ||
      x >= this.cols ||
      y < 0 ||
      y >= this.rows
    ) {

      return true;

    }

    return this.baseMap[y][x] === 1;

  },


  // ================================
  // 判断某位置是不是猪
  // ================================

  isAliveTarget(x, y) {

    return (
      this.baseMap[y] &&
      this.baseMap[y][x] === 3 &&
      !this.isTargetDead(x, y)
    );

  },


  // ================================
  // 查找箱子
  // ================================

  getBoxIndex(x, y) {

    for (
      let i = 0;
      i < this.boxes.length;
      i++
    ) {

      if (
        this.boxes[i].x === x &&
        this.boxes[i].y === y
      ) {

        return i;

      }

    }

    return -1;

  },


  // ================================
  // 保存历史
  // ================================

  saveHistory() {

    const state = {

      player: {
        x: this.player.x,
        y: this.player.y
      },

      boxes: this.boxes.map(
        box => ({
          x: box.x,
          y: box.y
        })
      ),

      deadTargets:
        this.deadTargets.map(
          target => ({
            x: target.x,
            y: target.y
          })
        ),

      steps: this.data.steps,

      pushCount:
        this.data.pushCount,

      bombUsed:
        this.bombUsed

    };

    this.history.push(state);

  },


  // ================================
  // 移动
  // ================================

  move(dx, dy) {

    if (this.data.gameWin) {
      return;
    }

    const nextX =
      this.player.x + dx;

    const nextY =
      this.player.y + dy;

    // ================================
    // 墙
    // ================================

    if (
      this.isWall(
        nextX,
        nextY
      )
    ) {

      return;

    }

    // ================================
    // 猪的位置
    //
    // 小鸟不能直接走到猪的位置
    // ================================

    if (
      this.isAliveTarget(
        nextX,
        nextY
      )
    ) {

      wx.showToast({
        title: "这里有一只猪，不能直接走过去",
        icon: "none"
      });

      return;

    }

    // ================================
    // 箱子
    // ================================

    const boxIndex =
      this.getBoxIndex(
        nextX,
        nextY
      );

    // ================================
    // 没有箱子
    // ================================

    if (boxIndex === -1) {

      this.saveHistory();

      this.player.x = nextX;

      this.player.y = nextY;

      this.setData({

        steps:
          this.data.steps + 1,

        canUndo:
          this.history.length > 0

      });

    }

    // ================================
    // 有箱子
    // ================================

    else {

      const boxNextX =
        nextX + dx;

      const boxNextY =
        nextY + dy;

      // 箱子后面是墙
      if (
        this.isWall(
          boxNextX,
          boxNextY
        )
      ) {

        return;

      }

      // 箱子后面还有箱子
      const anotherBox =
        this.getBoxIndex(
          boxNextX,
          boxNextY
        );

      if (
        anotherBox !== -1
      ) {

        return;

      }

      // ================================
      // 箱子后面是活着的猪
      //
      // 可以推动箱子过去
      // 但是不能让鸟进入猪的位置
      // ================================

      const hitTarget =
        this.isAliveTarget(
          boxNextX,
          boxNextY
        );

      // ================================
      // 保存历史
      // ================================

      this.saveHistory();

      // ================================
      // 推箱子
      // ================================

      if (hitTarget) {

        // 猪被消灭
        this.killTarget(
          boxNextX,
          boxNextY
        );

        // 箱子也消失
        this.boxes.splice(
          boxIndex,
          1
        );

      }
      else {

        // 普通情况下箱子正常移动

        this.boxes[boxIndex].x =
          boxNextX;

        this.boxes[boxIndex].y =
          boxNextY;

      }

      // ================================
      // 玩家移动到原箱子的位置
      // ================================

      this.player.x = nextX;

      this.player.y = nextY;

      this.setData({

        steps:
          this.data.steps + 1,

        pushCount:
          this.data.pushCount + 1,

        canUndo:
          this.history.length > 0

      });

    }

    // 更新剩余目标
    this.updateRemainingTargets();

    // 重画
    this.drawMap();

    // 检查通关
    this.checkWin();

  },


  // ================================
  // 撤销
  // ================================

  undo() {

    if (
      this.history.length === 0
    ) {

      wx.showToast({
        title: "没有可以撤销的操作",
        icon: "none"
      });

      return;

    }

    const state =
      this.history.pop();

    // 恢复玩家
    this.player = {
      x: state.player.x,
      y: state.player.y
    };

    // 恢复箱子
    this.boxes =
      state.boxes.map(
        box => ({
          x: box.x,
          y: box.y
        })
      );

    // 恢复已经消灭的猪
    this.deadTargets =
      state.deadTargets.map(
        target => ({
          x: target.x,
          y: target.y
        })
      );

    // 恢复炸弹状态
    this.bombUsed =
      state.bombUsed;

    this.setData({

      steps:
        state.steps,

      pushCount:
        state.pushCount,

      bombUsed:
        this.bombUsed,

      canUndo:
        this.history.length > 0,

      gameWin: false

    });

    this.updateRemainingTargets();

    this.drawMap();

  },


  // ================================
  // 更新剩余目标
  // ================================

  updateRemainingTargets() {

    let completed = 0;

    for (
      let i = 0;
      i < this.deadTargets.length;
      i++
    ) {

      completed++;

    }

    let remaining =
      this.targetCount - completed;

    if (remaining < 0) {
      remaining = 0;
    }

    this.setData({
      remainingTargets: remaining
    });

  },


  // ================================
  // 检查通关
  // ================================

  checkWin() {

    if (
      this.deadTargets.length >=
      this.targetCount
    ) {

      this.winGame();

    }

  },


  // ================================
  // 通关
  // ================================

  winGame() {

    if (
      this.data.gameWin
    ) {

      return;

    }

    const newRecord =
      this.saveBestScore();

    this.setData({

      gameWin: true,

      canUndo: false,

      remainingTargets: 0,

      currentTip:
        newRecord
          ? "🏆 恭喜你创造了新的纪录！"
          : "🎉 恭喜你成功通关！"

    });

    setTimeout(() => {

      let content =
        "本次完成：" +
        this.data.steps +
        " 步";

      if (newRecord) {

        content +=
          "\n🏆 新纪录！";

      }
      else {

        content +=
          "\n最佳成绩：" +
          this.data.bestScore +
          " 步";

      }

      wx.showModal({

        title: "🎉 恭喜通关！",

        content: content,

        confirmText:
          this.data.level < 3
            ? "下一关"
            : "再玩一次",

        cancelText:
          "返回首页",

        success: (res) => {

          if (res.confirm) {

            if (
              this.data.level < 3
            ) {

              this.nextLevel();

            }
            else {

              this.restartGame();

            }

          }
          else {

            this.backHome();

          }

        }

      });

    }, 300);

  },


  // ================================
  // 炸弹技能
  // ================================

  useBomb() {

    // 已经使用
    if (this.bombUsed) {

      wx.showToast({
        title: "本关炸弹已经使用过了",
        icon: "none"
      });

      return;

    }

    if (this.data.gameWin) {
      return;
    }

    wx.showModal({

      title: "💣 使用炸弹",

      content:
        "炸弹可以炸掉小鸟附近的一块墙。\n\n每关只有一次机会，确定使用吗？",

      confirmText: "使用",

      cancelText: "取消",

      success: (res) => {

        if (!res.confirm) {
          return;
        }

        this.bombUsed = true;

        // ================================
        // 炸弹炸小鸟附近的墙
        // ================================

        const directions = [
          {
            dx: 0,
            dy: -1
          },
          {
            dx: 0,
            dy: 1
          },
          {
            dx: -1,
            dy: 0
          },
          {
            dx: 1,
            dy: 0
          }
        ];

        let destroyed = false;

        for (
          let i = 0;
          i < directions.length;
          i++
        ) {

          const d =
            directions[i];

          const x =
            this.player.x + d.dx;

          const y =
            this.player.y + d.dy;

          if (
            x >= 0 &&
            x < this.cols &&
            y >= 0 &&
            y < this.rows &&
            this.baseMap[y][x] === 1
          ) {

            this.saveHistory();

            // 石头变成冰块
            this.baseMap[y][x] = 2;

            destroyed = true;

            break;

          }

        }

        if (!destroyed) {

          this.bombUsed = false;

          wx.showToast({

            title:
              "小鸟附近没有可以炸掉的墙",

            icon: "none"

          });

          return;

        }

        this.setData({

          bombUsed: true,

          currentTip:
            "💣 炸弹已使用，本关不能再次使用"

        });

        this.drawMap();

        wx.showToast({

          title: "💥 墙壁已炸开！",

          icon: "success"

        });

      }

    });

  },


  // ================================
  // 重新开始
  // ================================

  restartGame() {

    wx.showModal({

      title: "重新开始",

      content:
        "确定要重新开始这一关吗？",

      success: (res) => {

        if (res.confirm) {

          this.history = [];

          this.bombUsed = false;

          this.loadLevel(
            this.data.level
          );

        }

      }

    });

  },


  // ================================
  // 下一关
  // ================================

  nextLevel() {

    if (
      this.data.level >= 3
    ) {

      wx.showToast({

        title:
          "已经是最后一关",

        icon:
          "none"

      });

      return;

    }

    const next =
      this.data.level + 1;

    this.history = [];

    this.bombUsed = false;

    this.setData({

      level: next

    });

    this.loadLevel(next);

  },


  // ================================
  // 返回首页
  // ================================

  backHome() {

    wx.navigateBack({
      delta: 1
    });

  },


  // ================================
  // 游戏提示
  // ================================

  showHint() {

    const tips = [

      [
        "先观察箱子和目标的位置。",
        "不要把箱子推到角落里。",
        "尝试从箱子的后方进行推动。"
      ],

      [
        "这一关需要注意箱子的先后顺序。",
        "不要急着推动中间的箱子。",
        "给箱子留出移动空间。"
      ],

      [
        "多个箱子之间可能互相影响。",
        "先解决阻挡其他箱子的箱子。",
        "推动前先观察箱子后方的位置。"
      ],

      [
        "这是最终挑战。",
        "不要把箱子推入无法移动的位置。",
        "先规划路线，再开始推动。"
      ]

    ];

    const levelTips =
      tips[this.data.level];

    const randomIndex =
      Math.floor(
        Math.random() *
        levelTips.length
      );

    this.setData({

      currentTip:
        "💡 " +
        levelTips[randomIndex]

    });

  },


  // ================================
  // 方向键
  // ================================

  up() {
    this.move(0, -1);
  },

  down() {
    this.move(0, 1);
  },

  left() {
    this.move(-1, 0);
  },

  right() {
    this.move(1, 0);
  },


  // ================================
  // 触摸开始
  // ================================

  touchStart(e) {

    const touch =
      e.changedTouches[0];

    this.touchStartX =
      touch.clientX;

    this.touchStartY =
      touch.clientY;

  },


  // ================================
  // 触摸结束
  // ================================

  touchEnd(e) {

    const touch =
      e.changedTouches[0];

    const endX =
      touch.clientX;

    const endY =
      touch.clientY;

    const dx =
      endX -
      this.touchStartX;

    const dy =
      endY -
      this.touchStartY;

    // 滑动太短
    if (
      Math.abs(dx) < 20 &&
      Math.abs(dy) < 20
    ) {

      return;

    }

    // 横向
    if (
      Math.abs(dx) >
      Math.abs(dy)
    ) {

      if (dx > 0) {

        this.right();

      }
      else {

        this.left();

      }

    }

    // 纵向
    else {

      if (dy > 0) {

        this.down();

      }
      else {

        this.up();

      }

    }

  },


  // ================================
  // 键盘
  // ================================

  enableKeyboard() {

    // 微信开发者工具主要使用页面方向按钮
    // 手机端使用方向键和滑动控制

  }

});