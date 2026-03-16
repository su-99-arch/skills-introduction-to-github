/**
 * LBS（位置服务）工具模块
 * 提供位置获取、逆地理编码、距离计算等功能
 */

/**
 * 获取当前地理位置
 * @returns {Promise} 解析为位置信息对象 { latitude, longitude, accuracy, ... }
 */
function getLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02', // 使用国测局坐标系，适配腾讯地图
      success(res) {
        const app = getApp();
        app.globalData.locationInfo = {
          latitude: res.latitude,
          longitude: res.longitude,
          accuracy: res.accuracy,
          speed: res.speed
        };
        wx.setStorageSync('locationInfo', app.globalData.locationInfo);
        resolve(res);
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

/**
 * 检查位置权限并在必要时请求授权
 * @returns {Promise} 解析为授权状态
 */
function checkAndRequestLocationAuth() {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userLocation']) {
          // 已授权
          resolve(true);
        } else if (res.authSetting['scope.userLocation'] === false) {
          // 已拒绝，引导用户去设置页开启
          wx.showModal({
            title: '位置授权',
            content: '需要您的位置权限才能使用附近农业服务功能，请在设置中开启位置权限',
            confirmText: '去设置',
            success(modalRes) {
              if (modalRes.confirm) {
                wx.openSetting({
                  success(settingRes) {
                    if (settingRes.authSetting['scope.userLocation']) {
                      resolve(true);
                    } else {
                      reject(new Error('用户拒绝授权位置信息'));
                    }
                  }
                });
              } else {
                reject(new Error('用户取消授权'));
              }
            }
          });
        } else {
          // 未申请过，发起授权
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              resolve(true);
            },
            fail(err) {
              reject(err);
            }
          });
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

/**
 * 通过腾讯地图API进行逆地理编码（坐标转地址）
 * @param {number} latitude 纬度
 * @param {number} longitude 经度
 * @param {string} key 腾讯地图 WebServiceAPI 密钥
 * @returns {Promise} 解析为地址信息
 */
function reverseGeocode(latitude, longitude, key) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      data: {
        location: `${latitude},${longitude}`,
        key: key,
        get_poi: 0
      },
      success(res) {
        if (res.data && res.data.status === 0) {
          resolve(res.data.result);
        } else {
          reject(new Error('逆地理编码失败：' + (res.data && res.data.message)));
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

/**
 * 搜索附近兴趣点（POI）
 * @param {number} latitude 纬度
 * @param {number} longitude 经度
 * @param {string} keyword 搜索关键词（如"农资店"、"农贸市场"）
 * @param {string} key 腾讯地图 WebServiceAPI 密钥
 * @param {number} radius 搜索半径（米），默认1000
 * @returns {Promise} 解析为附近POI列表
 */
function searchNearby(latitude, longitude, keyword, key, radius) {
  radius = radius || 1000;
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://apis.map.qq.com/ws/place/v1/search',
      data: {
        keyword: keyword,
        boundary: `nearby(${latitude},${longitude},${radius})`,
        key: key,
        page_size: 20,
        page_index: 1
      },
      success(res) {
        if (res.data && res.data.status === 0) {
          resolve(res.data.data || []);
        } else {
          reject(new Error('搜索附近地点失败：' + (res.data && res.data.message)));
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

/**
 * 计算两点之间的距离（使用 Haversine 公式）
 * @param {number} lat1 起点纬度
 * @param {number} lon1 起点经度
 * @param {number} lat2 终点纬度
 * @param {number} lon2 终点经度
 * @returns {number} 距离（米）
 */
function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // 地球半径（米）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 格式化距离显示
 * @param {number} meters 距离（米）
 * @returns {string} 格式化后的距离字符串
 */
function formatDistance(meters) {
  if (meters < 1000) {
    return Math.round(meters) + '米';
  }
  return (meters / 1000).toFixed(1) + '公里';
}

/**
 * 使用微信内置地图选择位置
 * @returns {Promise} 解析为选中的位置信息
 */
function chooseLocation() {
  return new Promise((resolve, reject) => {
    wx.chooseLocation({
      success(res) {
        resolve({
          name: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

module.exports = {
  getLocation,
  checkAndRequestLocationAuth,
  reverseGeocode,
  searchNearby,
  calcDistance,
  formatDistance,
  chooseLocation
};
