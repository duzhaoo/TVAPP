import { kv } from '@vercel/kv';

// 本地存储备用方案
let localTodos = [];

export default async function handler(req, res) {
  try {
    // 检查Vercel KV是否可用
    const useLocalStorage = process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL;
    
    // 只处理POST请求 - 更新待办事项列表
    if (req.method === 'POST') {
      const { todos } = req.body;
      
      if (!todos || !Array.isArray(todos)) {
        return res.status(400).json({ error: '无效的待办事项数据' });
      }
      
      if (useLocalStorage) {
        // 使用本地存储
        localTodos = todos;
        return res.status(200).json(localTodos);
      } else {
        // 使用Vercel KV
        await kv.set('todos', todos);
        return res.status(200).json(todos);
      }
    }
    
    // 不支持的请求方法
    return res.status(405).json({ error: '不支持的请求方法' });
  } catch (error) {
    console.error('处理待办事项更新请求时出错:', error);
    // 如果是Vercel KV错误，尝试使用本地存储
    if (req.method === 'POST') {
      const { todos } = req.body;
      if (todos && Array.isArray(todos)) {
        localTodos = todos;
        return res.status(200).json(localTodos);
      }
    }
    
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
