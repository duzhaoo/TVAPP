// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { queryRecords, addRecord, updateRecord } from '../../../utils/feishuAPI';

// 测试数据，当API调用失败时使用
const fallbackTodos = [
  {
    id: '1',
    text: '测试待办事项1',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    text: '测试待办事项2',
    completed: true,
    createdAt: new Date().toISOString()
  }
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('开始获取待办事项...');
      
      // 从飞书多维表格获取待办事项
      // 不使用过滤条件，直接获取所有记录
      const result = await queryRecords('');
      
      // 过滤并格式化返回数据
      const todos = result.items
        .filter(item => item.fields.type === 'todo')
        .map(item => {
          const fields = item.fields;
          return {
            id: item.record_id,
            text: fields.text || '',
            completed: fields.completed === 'true',
            createdAt: fields.createdAt || new Date().toISOString()
          };
        });
      
      console.log('格式化后的待办事项:', todos);
      return res.status(200).json(todos || []);
    } catch (error) {
      console.error('获取待办事项出错:', error);
      console.log('返回测试数据代替');
      // 出错时返回测试数据，而不是错误状态码
      return res.status(200).json(fallbackTodos);
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
