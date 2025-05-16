// 测试飞书API连接的简单脚本
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testFeishuAPI() {
  console.log('开始测试飞书API连接...');
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
    
    console.log('令牌响应:', tokenResponse.data);
    
    if (tokenResponse.data.code !== 0) {
      throw new Error(`获取令牌失败: ${tokenResponse.data.msg}`);
    }
    
    const token = tokenResponse.data.tenant_access_token;
    console.log('成功获取访问令牌:', token.substring(0, 10) + '...');
    
    // 2. 尝试获取多维表格元数据
    console.log('\n2. 尝试获取多维表格元数据...');
    const metaResponse = await axios.get(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('多维表格元数据响应:', metaResponse.data);
    
    // 3. 尝试获取表格记录
    console.log('\n3. 尝试获取表格记录...');
    const recordsResponse = await axios.get(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_TABLE_ID}/records`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('表格记录响应:', recordsResponse.data);
    
    console.log('\n测试完成，飞书API连接正常！');
  } catch (error) {
    console.error('测试失败:', error);
    if (error.response) {
      console.error('错误响应数据:', error.response.data);
    }
  }
}

testFeishuAPI();
