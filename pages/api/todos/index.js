import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    // 处理GET请求 - 获取所有待办事项
    if (req.method === 'GET') {
      const todos = await kv.get('todos') || [];
      return res.status(200).json(todos);
    }
    
    // 处理POST请求 - 添加新的待办事项
    if (req.method === 'POST') {
      const { todo } = req.body;
      
      if (!todo || todo.trim() === '') {
        return res.status(400).json({ error: '待办事项不能为空' });
      }
      
      // 获取现有的待办事项
      const todos = await kv.get('todos') || [];
      
      // 添加新的待办事项
      const updatedTodos = [...todos, todo];
      
      // 保存更新后的待办事项列表
      await kv.set('todos', updatedTodos);
      
      return res.status(201).json(updatedTodos);
    }
    
    // 处理DELETE请求 - 清空所有待办事项
    if (req.method === 'DELETE') {
      await kv.del('todos');
      return res.status(200).json([]);
    }
    
    // 不支持的请求方法
    return res.status(405).json({ error: '不支持的请求方法' });
  } catch (error) {
    console.error('处理待办事项请求时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
