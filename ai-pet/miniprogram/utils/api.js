// utils/api.js — 统一请求封装
// 职责：注入 token、统一错误处理、超时设置
// 注意：getApp() 必须在函数内部懒调用，模块加载时 App 尚未初始化

/**
 * 封装 wx.request，返回 Promise
 * @param {object} options
 * @param {string} options.url        - 接口路径，如 '/api/pet/mine'
 * @param {'GET'|'POST'|'PUT'|'DELETE'} [options.method='GET']
 * @param {object} [options.data]     - 请求体
 * @param {number} [options.timeout]  - 超时毫秒，默认 60000
 * @returns {Promise<any>}            - 返回 data 字段，失败则 reject { statusCode, message }
 */
function request({ url, method = 'GET', data, timeout = 60000 }) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    const baseUrl = getApp().globalData.apiBase

    wx.request({
      url: `${baseUrl}${url}`,
      method,
      data,
      timeout,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          // 将 HTTP 错误状态码传给调用方，方便区分 404/403/500
          reject({
            statusCode: res.statusCode,
            message: res.data?.message || `请求失败 (${res.statusCode})`
          })
        }
      },
      fail(err) {
        // 网络错误 / 超时
        const isTimeout = err.errMsg?.includes('timeout')
        reject({
          statusCode: isTimeout ? 408 : 0,
          message: isTimeout ? '请求超时，请重试' : '网络异常，请检查网络'
        })
      }
    })
  })
}

/**
 * 上传文件（用于宠物照片上传）
 * @param {string} filePath  - wx.chooseMedia 返回的临时路径
 * @param {string} url       - 上传接口路径
 * @returns {Promise<any>}
 */
function uploadFile(filePath, url) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    const baseUrl = getApp().globalData.apiBase

    const task = wx.uploadFile({
      url: `${baseUrl}${url}`,
      filePath,
      name: 'photo',
      timeout: 60000,
      header: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(typeof res.data === 'string' ? JSON.parse(res.data) : res.data)
          } catch {
            resolve(res.data)
          }
        } else {
          reject({
            statusCode: res.statusCode,
            message: `上传失败 (${res.statusCode})`
          })
        }
      },
      fail(err) {
        const isTimeout = err.errMsg?.includes('timeout')
        reject({
          statusCode: isTimeout ? 408 : 0,
          message: isTimeout ? '上传超时，请重试' : '上传失败，请检查网络'
        })
      }
    })

    // 返回上传任务，方便调用方监听进度（可选）
    return task
  })
}

module.exports = { request, uploadFile }
