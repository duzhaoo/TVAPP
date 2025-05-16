// 调试飞书API连接的详细脚本
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function debugFeishuAPI() {
  console.log('======= 开始调试飞书API连接 =======');
  console.log('环境变量:');
  console.log('FEISHU_APP_ID:', process.env.FEISHU_APP_ID);
  console.log('FEISHU_APP_SECRET:', process.env.FEISHU_APP_SECRET);
  console.log('FEISHU_APP_TOKEN:', process.env.FEISHU_APP_TOKEN);
  console.log('FEISHU_TABLE_ID:', process.env.FEISHU_TABLE_ID);
  
  try {
    // 1. 获取访问令牌
    console.log('\n1. 尝试获取访问令牌...');
    const tokenResponse = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      app_id: process.env.FEISHU_APP_ID,
      app_secret: process.env.FEISHU_APP_SECRET
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('令牌响应:', JSON.stringify(tokenResponse.data, null, 2));
    
    if (tokenResponse.data.code !== 0) {
      throw new Error(`获取令牌失败: ${tokenResponse.data.msg}`);
    }
    
    const token = tokenResponse.data.tenant_access_token;
    console.log('成功获取访问令牌:', token);
    
    // 2. 获取多维表格元数据
    console.log('\n2. 尝试获取多维表格元数据...');
    try {
      const metaResponse = await axios.get(
        `https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('多维表格元数据响应:', JSON.stringify(metaResponse.data, null, 2));
    } catch (metaError) {
      console.error('获取多维表格元数据失败:', metaError.message);
      if (metaError.response) {
        console.error('错误响应数据:', JSON.stringify(metaError.response.data, null, 2));
        console.error('错误状态码:', metaError.response.status);
      }
    }
    
    // 3. 获取表格列表
    console.log('\n3. 尝试获取表格列表...');
    try {
      const tablesResponse = await axios.get(
        `https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('表格列表响应:', JSON.stringify(tablesResponse.data, null, 2));
    } catch (tablesError) {
      console.error('获取表格列表失败:', tablesError.message);
      if (tablesError.response) {
        console.error('错误响应数据:', JSON.stringify(tablesError.response.data, null, 2));
        console.error('错误状态码:', tablesError.response.status);
      }
    }
    
    // 4. 尝试获取表格记录
    console.log('\n4. 尝试获取表格记录...');
    try {
      const recordsResponse = await axios.get(
        `https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_TABLE_ID}/records`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('表格记录响应:', JSON.stringify(recordsResponse.data, null, 2));
    } catch (recordsError) {
      console.error('获取表格记录失败:', recordsError.message);
      if (recordsError.response) {
        console.error('错误响应数据:', JSON.stringify(recordsError.response.data, null, 2));
        console.error('错误状态码:', recordsError.response.status);
      }
    }
    
    console.log('\n======= 调试完成 =======');
  } catch (error) {
    console.error('调试过程中发生错误:', error.message);
    if (error.response) {
      console.error('错误响应数据:', JSON.stringify(error.response.data, null, 2));
      console.error('错误状态码:', error.response.status);
    }
  }
}

debugFeishuAPI();
