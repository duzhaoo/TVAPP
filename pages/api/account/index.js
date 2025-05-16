import { kv } from '@vercel/kv';

// 本地存储备用方案
let localAccountInfos = [];

export default async function handler(req, res) {
  try {
    // 检查Vercel KV是否可用
    const useLocalStorage = process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL;
    
    // 处理GET请求 - 获取账号信息
    if (req.method === 'GET') {
      if (useLocalStorage) {
        return res.status(200).json(localAccountInfos);
      } else {
        const accountInfos = await kv.get('accountInfos') || [];
        return res.status(200).json(accountInfos);
      }
    }
    
    // 处理POST请求 - 添加新的账号信息
    if (req.method === 'POST') {
      const { accountInfo } = req.body;
      
      if (!accountInfo || accountInfo.trim() === '') {
        return res.status(400).json({ error: '账号信息不能为空' });
      }
      
      // 创建新的账号信息对象
      const newAccountInfo = {
        id: Date.now().toString(),
        text: accountInfo,
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      if (useLocalStorage) {
        // 使用本地存储
        localAccountInfos = [...localAccountInfos, newAccountInfo];
        return res.status(201).json(localAccountInfos);
      } else {
        // 使用Vercel KV
        const accountInfos = await kv.get('accountInfos') || [];
        const updatedAccountInfos = [...accountInfos, newAccountInfo];
        await kv.set('accountInfos', updatedAccountInfos);
        return res.status(201).json(updatedAccountInfos);
      }
    }
    
    // 处理PUT请求 - 更新账号信息状态
    if (req.method === 'PUT') {
      const { id, completed } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: '缺少账号信息ID' });
      }
      
      if (useLocalStorage) {
        // 使用本地存储
        const updatedAccountInfos = localAccountInfos.map(info => 
          info.id === id ? { ...info, completed } : info
        );
        localAccountInfos = updatedAccountInfos;
        return res.status(200).json(updatedAccountInfos);
      } else {
        // 使用Vercel KV
        const accountInfos = await kv.get('accountInfos') || [];
        const updatedAccountInfos = accountInfos.map(info => 
          info.id === id ? { ...info, completed } : info
        );
        await kv.set('accountInfos', updatedAccountInfos);
        return res.status(200).json(updatedAccountInfos);
      }
    }
    
    // 处理DELETE请求 - 清空账号信息
    if (req.method === 'DELETE') {
      if (useLocalStorage) {
        localAccountInfos = [];
        return res.status(200).json([]);
      } else {
        await kv.del('accountInfos');
        return res.status(200).json([]);
      }
    }
    
    // 不支持的请求方法
    return res.status(405).json({ error: '不支持的请求方法' });
  } catch (error) {
    console.error('处理账号信息请求时出错:', error);
    // 如果是Vercel KV错误，尝试使用本地存储
    if (req.method === 'GET') {
      return res.status(200).json(localAccountInfos);
    } else if (req.method === 'POST') {
      const { accountInfo } = req.body;
      if (accountInfo && accountInfo.trim() !== '') {
        const newAccountInfo = {
          id: Date.now().toString(),
          text: accountInfo,
          completed: false,
          createdAt: new Date().toISOString()
        };
        localAccountInfos = [...localAccountInfos, newAccountInfo];
      }
      return res.status(201).json(localAccountInfos);
    } else if (req.method === 'PUT') {
      const { id, completed } = req.body;
      if (id) {
        localAccountInfos = localAccountInfos.map(info => 
          info.id === id ? { ...info, completed } : info
        );
      }
      return res.status(200).json(localAccountInfos);
    } else if (req.method === 'DELETE') {
      localAccountInfos = [];
      return res.status(200).json([]);
    }
    
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
