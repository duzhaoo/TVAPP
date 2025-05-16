import { kv } from '@vercel/kv';

// 本地存储备用方案
let localTodos = [];

export default async function handler(req, res) {
  try {
    // 检查Vercel KV是否可用
    const useLocalStorage = process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL;
    
    // 处理GET请求 - 获取所有待办事项
    if (req.method === 'GET') {
      if (useLocalStorage) {
        return res.status(200).json(localTodos);
      } else {
        const todos = await kv.get('todos') || [];
        return res.status(200).json(todos);
      }
    }
    
    // 处理POST请求 - 添加新的待办事项
    if (req.method === 'POST') {
      const { todo } = req.body;
      
      // 检查todo是否有效
      if (!todo) {
        return res.status(400).json({ error: '待办事项不能为空' });
      }
      
      // 兼容新旧两种格式
      const todoItem = typeof todo === 'string' 
        ? todo.trim() 
        : (todo.text && todo.text.trim() ? todo : null);
      
      if (!todoItem) {
        return res.status(400).json({ error: '待办事项不能为空' });
      }
      
      // 构造标准格式的待办事项对象
      const todoObject = typeof todoItem === 'string'
        ? { text: todoItem, completed: false }
        : todoItem;
      
      if (useLocalStorage) {
        // 使用本地存储
        // 将现有的字符串数组转换为对象数组
        const formattedTodos = Array.isArray(localTodos) 
          ? localTodos.map(item => typeof item === 'string' ? { text: item, completed: false } : item)
          : [];
          
        localTodos = [...formattedTodos, todoObject];
        return res.status(201).json(localTodos);
      } else {
        // 使用Vercel KV
        // 获取现有的待办事项
        const todos = await kv.get('todos') || [];
        
        // 将现有的字符串数组转换为对象数组
        const formattedTodos = Array.isArray(todos) 
          ? todos.map(item => typeof item === 'string' ? { text: item, completed: false } : item)
          : [];
        
        // 添加新的待办事项
        const updatedTodos = [...formattedTodos, todoObject];
        
        // 保存更新后的待办事项列表
        await kv.set('todos', updatedTodos);
        
        return res.status(201).json(updatedTodos);
      }
    }
    
    // 处理DELETE请求 - 清空所有待办事项
    if (req.method === 'DELETE') {
      if (useLocalStorage) {
        localTodos = [];
        return res.status(200).json([]);
      } else {
        await kv.del('todos');
        return res.status(200).json([]);
      }
    }
    
    // 不支持的请求方法
    return res.status(405).json({ error: '不支持的请求方法' });
  } catch (error) {
    console.error('处理待办事项请求时出错:', error);
    // 如果是Vercel KV错误，尝试使用本地存储
    if (req.method === 'GET') {
      return res.status(200).json(localTodos);
    } else if (req.method === 'POST') {
      const { todo } = req.body;
      if (todo && todo.trim() !== '') {
        localTodos = [...localTodos, todo];
      }
      return res.status(201).json(localTodos);
    } else if (req.method === 'DELETE') {
      localTodos = [];
      return res.status(200).json([]);
    }
    
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
