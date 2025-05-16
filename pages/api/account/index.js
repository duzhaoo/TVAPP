import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    // 处理GET请求 - 获取账号信息
    if (req.method === 'GET') {
      const accountInfo = await kv.get('accountInfo') || '';
      return res.status(200).json({ accountInfo });
    }
    
    // 处理POST请求 - 更新账号信息
    if (req.method === 'POST') {
      const { accountInfo } = req.body;
      
      // 保存账号信息
      await kv.set('accountInfo', accountInfo || '');
      
      return res.status(200).json({ accountInfo });
    }
    
    // 处理DELETE请求 - 清空账号信息
    if (req.method === 'DELETE') {
      await kv.del('accountInfo');
      return res.status(200).json({ accountInfo: '' });
    }
    
    // 不支持的请求方法
    return res.status(405).json({ error: '不支持的请求方法' });
  } catch (error) {
    console.error('处理账号信息请求时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
