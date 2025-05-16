// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { queryRecords, addRecord, updateRecord } from '../../../utils/feishuAPI';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // 从飞书多维表格获取待办事项
      const result = await queryRecords('type = "todo"');
      
      // 格式化返回数据
      const todos = result.items.map(item => {
        const fields = item.fields;
        return {
          id: item.record_id,
          text: fields.text || '',
          completed: fields.completed === 'true',
          createdAt: fields.createdAt || new Date().toISOString()
        };
      });
      
      return res.status(200).json(todos || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      return res.status(500).json({ error: '获取待办事项失败' });
    }
  } else if (req.method === 'POST') {
    try {
      const { todo } = req.body;
      
      if (!todo) {
        return res.status(400).json({ error: 'Todo text is required' });
      }
      
      // 创建新的待办事项数据
      const todoData = {
        type: 'todo',
        text: todo,
        completed: 'false',
        createdAt: new Date().toISOString()
      };
      
      // 添加到飞书多维表格
      const result = await addRecord(todoData);
      
      if (result.success) {
        const newTodo = {
          id: result.record_id,
          text: todo,
          completed: false,
          createdAt: todoData.createdAt
        };
        
        return res.status(201).json(newTodo);
      } else {
        throw new Error('添加待办事项失败');
      }
    } catch (error) {
      console.error('Error creating todo:', error);
      return res.status(500).json({ error: '创建待办事项失败' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, completed } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Todo ID is required' });
      }
      
      // 更新飞书多维表格中的待办事项
      const updateData = {
        completed: String(completed)
      };
      
      const result = await updateRecord(id, updateData);
      
      if (result.success) {
        // 获取更新后的记录
        const todoResult = await queryRecords(`record_id = "${id}"`);
        
        if (todoResult.items && todoResult.items.length > 0) {
          const updatedTodo = {
            id: todoResult.items[0].record_id,
            text: todoResult.items[0].fields.text || '',
            completed: todoResult.items[0].fields.completed === 'true',
            createdAt: todoResult.items[0].fields.createdAt || ''
          };
          
          return res.status(200).json(updatedTodo);
        }
        
        // 如果无法获取更新后的记录，返回基本更新信息
        return res.status(200).json({
          id,
          completed
        });
      } else {
        throw new Error('更新待办事项失败');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      return res.status(500).json({ error: '更新待办事项失败' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
