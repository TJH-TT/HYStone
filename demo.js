// ==UserScript==
// @name         虎牙抢码助手
// @version      3.7
// @description  支持虎牙平台的自动抢码，附带一些页面优化功能
// @namespace    https://github.com/TJH-TT/HYStone.git
// @author       TJH-TT
// @match        *://zt.huya.com/*/pc/index.html
// @icon         https://ys.mihoyo.com/main/favicon.ico
// @grant        unsafeWindow
// @grant        GM_log
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @license      GPL-3.0 license
// ==/UserScript==

(function () {
  'use strict'

  // 配置初始化
  if (!GM_getValue('gh_reward_progress')) {
    GM_setValue('gh_reward_progress', 1)
  }
  if (!GM_getValue('gh_start_time')) {
    GM_setValue('gh_start_time', '02:00:20')
  }
  if (!GM_getValue('gh_interval')) {
    GM_setValue('gh_interval', '1000')
  }
  if (!GM_getValue('gh_autoExpand')) {
    GM_setValue('gh_autoExpand', false)
  }
  if (!GM_getValue('gh_pagePurify')) {
    GM_setValue('gh_pagePurify', false)
  }

  // 变量初始化
  let platform = (function () {
    if (document.title.includes('原神')) {
      if (location.href.includes('huya') && document.title.includes('直播季')) return '虎牙'
    }
    return ''
  })()

  let interval = (function () {
    let group = GM_getValue('gh_interval').split(',')
    switch (platform) {
      case '虎牙':
        return group[0]
    }
  })()

  // 注册菜单
  GM_registerMenuCommand(`设定里程碑进度：${GM_getValue('gh_reward_progress')}（点击修改）`, set_reward_progress)
  GM_registerMenuCommand(`设定抢码时间：${GM_getValue('gh_start_time')}（点击修改）`, set_start_time)
  GM_registerMenuCommand(`设定抢码间隔：${interval} 毫秒（点击修改）`, set_interval)
  GM_registerMenuCommand(`${GM_getValue('gh_autoExpand') ? '✅' : '❌'}自动打开里程碑（点击切换）`, switch_autoExpand)
  GM_registerMenuCommand(`${GM_getValue('gh_pagePurify') ? '✅' : '❌'}页面净化（点击切换）`, switch_pagePurify)

  function set_reward_progress() {
    let temp = prompt('请输入里程碑进度，输入范围1~6，天数从小到大对应相关奖励', GM_getValue('gh_reward_progress'))
    if (temp == null) return
    if (parseInt(temp) > 0 || parseInt(temp) < 7) {
      GM_setValue('gh_reward_progress', temp)
      alert('设置成功，即将刷新页面使之生效')
      location.reload()
    } else {
      alert('格式错误，请重新输入')
    }
  }

  function set_start_time() {
    let temp = prompt('请输入抢码时间，格式示例：02:00:20', GM_getValue('gh_start_time'))
    if (temp == null) return
    if (/^(\d{2}):(\d{2}):(\d{2})$/.test(temp)) {
      GM_setValue('gh_start_time', temp)
      alert('设置成功，即将刷新页面使之生效')
      location.reload()
    } else {
      alert('格式错误，请重新输入')
    }
  }

  function set_interval() {
    let temp = prompt('请输入抢码间隔，格式示例：1000，虎牙平台间隔为1000毫秒', GM_getValue('gh_interval'))
    if (temp == null) return
    if (/^(\d+),(\d+),(\d+)$/.test(temp)) {
      GM_setValue('gh_interval', temp)
      alert('设置成功，即将刷新页面使之生效')
      location.reload()
    } else {
      alert('格式错误，请重新输入')
    }
  }

  function switch_autoExpand() {
    GM_setValue('gh_autoExpand', !GM_getValue('gh_autoExpand'))
    alert('切换成功，即将刷新页面使之生效')
    location.reload()
  }

  function switch_pagePurify() {
    GM_setValue('gh_pagePurify', !GM_getValue('gh_pagePurify'))
    alert('切换成功，即将刷新页面使之生效')
    location.reload()
  }

  // Run
  if (platform) {
    log(`当前直播平台为${platform}，助手开始运行`)
    run_purify_process()
    run_rob_process()
    log('感谢你的使用，如本项目对你有帮助可以帮忙点个Star，有能力的可以从下方项目地址找到爱发电点个赞助，维持一下失业带专生的生计')
    log('https://github.com/TJH-TT/HYStone.git')
  }

  // 运行净化进程
  function run_purify_process() {
    if (GM_getValue('gh_autoExpand')) {
      switch (platform) {
        case '虎牙':
          document.querySelectorAll('.J_item')[1].click()
          setTimeout(() => {
            document.querySelectorAll('.J_expBox')[0].scrollIntoView()
          }, 5000)
          break
      }
    }
  }

  // 运行抢码进程
  function run_rob_process() {
    // 显示注意事项
    if (!GM_getValue('gh_autoExpand')) {
      switch (platform) {
        case '虎牙':
          log('★请手动打开里程碑页面★')
          break
          break
      }
    }

    // 变量初始化
    let level = parseInt(GM_getValue('gh_reward_progress'))
    let start_time = GM_getValue('gh_start_time').split(':')

    log(`助手计划于${parseInt(start_time[0])}点${parseInt(start_time[1])}分${parseInt(start_time[2])}秒开始领取第${level}档的里程碑奖励（如有误请自行通过菜单修改配置）`)

    // 等待开抢
    let timer = setInterval(() => {
      let date = new Date()
      if (date.getHours() == parseInt(start_time[0]) && date.getMinutes() == parseInt(start_time[1]) && date.getSeconds() >= parseInt(start_time[2])) {
        clearInterval(timer)
        rob()
      }
    }, 100)

    // 抢码实现
    function rob() {
      log('助手开始领取，如若出现数据异常为正常情况')
      if (platform == '虎牙') {
        let timer = setInterval(() => {
          document.querySelectorAll('div[title="10经验值"]+button')[0].click()
          document.querySelectorAll('.exp-award .reload')[0].click()
          if (document.querySelectorAll('div[title="10经验值"]+button')[0].innerText == '已领取') {
            clearInterval(timer)
            setTimeout(() => {
              for (let e of document.querySelectorAll('.J_dcpConfirm')) {
                e.click()
              }
            }, 1000)
          }
        }, interval)
      }
      setInterval(() => {
        switch (platform) {
          case '虎牙':
            document.querySelectorAll('.exp-award li button')[level - 1].click()
            break
        }
      }, interval)
    }
  }

  // 移除元素
  function clearElement(el) {
    el.parentNode.removeChild(el)
  }

  // 日志
  function log(msg) {
    console.info(`【虎牙抢码助手】${msg}`)
  }
})()
