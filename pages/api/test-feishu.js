// 测试飞书API连接
import { getAccessToken, queryRecords } from '../../utils/feishuAPI';

export default async function handler(req, res) {
  try {
    console.log('开始测试飞书API连接...');
    
    // 打印环境变量
    console.log('环境变量:', {
      FEISHU_APP_ID: process.env.FEISHU_APP_ID,
      FEISHU_APP_SECRET: process.env.FEISHU_APP_SECRET,
      FEISHU_APP_TOKEN: process.env.FEISHU_APP_TOKEN,
      FEISHU_TABLE_ID: process.env.FEISHU_TABLE_ID
    });
    
    // 测试获取访问令牌
    console.log('测试获取访问令牌...');
    const token = await getAccessToken();
    console.log('获取到的访问令牌:', token ? '成功' : '失败');
    
    // 测试查询记录
    console.log('测试查询记录...');
    const result = await queryRecords('');
    console.log('查询结果:', result);
    
    // 返回测试结果
    return res.status(200).json({
      success: true,
      message: '飞书API连接测试成功',
      token: token ? '成功获取' : '获取失败',
      records: result
    });
  } catch (error) {
    console.error('测试飞书API连接失败:', error);
    
    // 返回详细的错误信息
    return res.status(500).json({
      success: false,
      message: '飞书API连接测试失败',
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    });
  }
}
