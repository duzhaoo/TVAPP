const axios = require('axios');

// 缓存token
let accessToken = '';
let tokenExpireTime = 0;

// 确保环境变量可用
const getEnvVar = (name) => {
  const value = process.env[name];
  if (!value) {
    console.warn(`环境变量 ${name} 不可用`);
  }
  return value;
};

// 获取环境变量
const FEISHU_APP_ID = getEnvVar('FEISHU_APP_ID');
const FEISHU_APP_SECRET = getEnvVar('FEISHU_APP_SECRET');
const FEISHU_APP_TOKEN = getEnvVar('FEISHU_APP_TOKEN');
const FEISHU_TABLE_ID = getEnvVar('FEISHU_TABLE_ID');

// 打印环境变量用于调试
console.log('飞书API工具类中的环境变量:', {
  FEISHU_APP_ID,
  FEISHU_APP_TOKEN,
  FEISHU_TABLE_ID
});

/**
 * 获取飞书访问令牌
 * @returns {Promise<string>} 访问令牌
 */
async function getAccessToken() {
  // 检查缓存的token是否有效
  if (accessToken && tokenExpireTime > Date.now()) {
    return accessToken;
  }
  
  try {
    console.log('开始获取飞书访问令牌...');
    const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      app_id: FEISHU_APP_ID,
      app_secret: FEISHU_APP_SECRET
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('飞书访问令牌响应:', response.data);
    
    if (response.data.code === 0) {
      accessToken = response.data.tenant_access_token;
      // 提前5分钟过期，避免边界问题
      tokenExpireTime = Date.now() + (response.data.expire - 300) * 1000;
      return accessToken;
    } else {
      throw new Error(`获取飞书访问令牌失败: ${response.data.msg}`);
    }
  } catch (error) {
    console.error('获取飞书访问令牌出错:', error);
    throw error;
  }
}

/**
 * 从多维表格查询记录
 * @param {string} filter - 查询条件
 * @param {number} pageSize - 每页记录数
 * @param {string} pageToken - 分页标记
 * @returns {Promise<object>} 查询结果
 */
async function queryRecords(filter, pageSize = 100, pageToken = '') {
  const token = await getAccessToken();
  
  try {
    console.log('开始查询飞书多维表格记录...');
    console.log('查询参数:', {
      app_token: FEISHU_APP_TOKEN,
      table_id: FEISHU_TABLE_ID,
      filter: filter
    });
    
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${FEISHU_TABLE_ID}/records`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          filter: filter,
          page_size: pageSize,
          page_token: pageToken || undefined
        }
      }
    );
    
    console.log('查询响应状态码:', response.status);
    console.log('查询响应数据:', response.data);
    
    if (response.data.code === 0 && response.data.data) {
      return {
        items: response.data.data.items,
        page_token: response.data.data.page_token,
        has_more: response.data.data.has_more,
        total: response.data.data.total
      };
    } else {
      throw new Error(`查询记录失败: ${response.data.msg}`);
    }
  } catch (error) {
    console.error('查询记录出错:', error);
    throw error;
  }
}

/**
 * 向多维表格添加记录
 * @param {object} fields - 记录数据
 * @returns {Promise<object>} 添加结果
 */
async function addRecord(fields) {
  const token = await getAccessToken();
  
  try {
    console.log('开始添加飞书多维表格记录...');
    console.log('添加记录参数:', {
      app_token: FEISHU_APP_TOKEN,
      table_id: FEISHU_TABLE_ID,
      fields: fields
    });
    
    const response = await axios.post(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${FEISHU_TABLE_ID}/records`,
      {
        fields: fields
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('添加记录响应状态码:', response.status);
    console.log('添加记录响应数据:', response.data);
    
    if (response.data.code === 0 && response.data.data) {
      return {
        record_id: response.data.data.record_id,
        success: true
      };
    } else {
      throw new Error(`添加记录失败: ${response.data.msg}`);
    }
  } catch (error) {
    console.error('添加记录出错:', error);
    throw error;
  }
}

/**
 * 更新多维表格记录
 * @param {string} recordId - 记录ID
 * @param {object} fields - 更新数据
 * @returns {Promise<object>} 更新结果
 */
async function updateRecord(recordId, fields) {
  const token = await getAccessToken();
  
  try {
    console.log('开始更新飞书多维表格记录...');
    console.log('更新记录参数:', {
      app_token: FEISHU_APP_TOKEN,
      table_id: FEISHU_TABLE_ID,
      record_id: recordId,
      fields: fields
    });
    
    const response = await axios.put(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${FEISHU_TABLE_ID}/records/${recordId}`,
      {
        fields: fields
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('更新记录响应状态码:', response.status);
    console.log('更新记录响应数据:', response.data);
    
    if (response.data.code === 0 && response.data.data) {
      return {
        record_id: response.data.data.record_id,
        success: true
      };
    } else {
      throw new Error(`更新记录失败: ${response.data.msg}`);
    }
  } catch (error) {
    console.error('更新记录出错:', error);
    throw error;
  }
}

/**
 * 删除多维表格记录
 * @param {string} recordId - 记录ID
 * @returns {Promise<boolean>} 删除结果
 */
async function deleteRecord(recordId) {
  const token = await getAccessToken();
  
  try {
    const response = await axios.delete(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_TABLE_ID}/records/${recordId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.data.code === 0) {
      return true;
    } else {
      throw new Error(`删除记录失败: ${response.data.msg}`);
    }
  } catch (error) {
    console.error('删除记录出错:', error);
    throw error;
  }
}

module.exports = {
  getAccessToken,
  queryRecords,
  addRecord,
  updateRecord,
  deleteRecord
};
