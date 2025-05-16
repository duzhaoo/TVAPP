import { kv } from '@vercel/kv';

// 本地存储备用方案
let localAccountInfo = '';

export default async function handler(req, res) {
  try {
    // 检查Vercel KV是否可用
    const useLocalStorage = process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL;
    
    // 处理GET请求 - 获取账号信息
    if (req.method === 'GET') {
      if (useLocalStorage) {
        return res.status(200).json({ accountInfo: localAccountInfo });
      } else {
        const accountInfo = await kv.get('accountInfo') || '';
        return res.status(200).json({ accountInfo });
      }
    }
    
    // 处理POST请求 - 更新账号信息
    if (req.method === 'POST') {
      const { accountInfo } = req.body;
      
      if (useLocalStorage) {
        // 使用本地存储
        localAccountInfo = accountInfo || '';
        return res.status(200).json({ accountInfo: localAccountInfo });
      } else {
        // 使用Vercel KV
        await kv.set('accountInfo', accountInfo || '');
        return res.status(200).json({ accountInfo });
      }
    }
    
    // 处理DELETE请求 - 清空账号信息
    if (req.method === 'DELETE') {
      if (useLocalStorage) {
        localAccountInfo = '';
        return res.status(200).json({ accountInfo: '' });
      } else {
        await kv.del('accountInfo');
        return res.status(200).json({ accountInfo: '' });
      }
    }
    
    // 不支持的请求方法
    return res.status(405).json({ error: '不支持的请求方法' });
  } catch (error) {
    console.error('处理账号信息请求时出错:', error);
    // 如果是Vercel KV错误，尝试使用本地存储
    if (req.method === 'GET') {
      return res.status(200).json({ accountInfo: localAccountInfo });
    } else if (req.method === 'POST') {
      const { accountInfo } = req.body;
      localAccountInfo = accountInfo || '';
      return res.status(200).json({ accountInfo: localAccountInfo });
    } else if (req.method === 'DELETE') {
      localAccountInfo = '';
      return res.status(200).json({ accountInfo: '' });
    }
    
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
