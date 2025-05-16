import { queryRecords, addRecord, updateRecord } from '../../../utils/feishuAPI';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // 从飞书多维表格获取账号信息
      const result = await queryRecords('type = "account"');
      
      // 格式化返回数据
      const accountInfos = result.items.map(item => {
        const fields = item.fields;
        return {
          id: item.record_id,
          text: fields.text || '',
          completed: fields.completed === 'true',
          createdAt: fields.createdAt || new Date().toISOString()
        };
      });
      
      return res.status(200).json(accountInfos || []);
    } catch (error) {
      console.error('获取账号信息出错:', error);
      return res.status(500).json({ error: '获取账号信息失败' });
    }
  } else if (req.method === 'POST') {
    try {
      const { accountInfo } = req.body;
      
      if (!accountInfo || accountInfo.trim() === '') {
        return res.status(400).json({ error: '账号信息不能为空' });
      }
      
      // 创建新的账号信息数据
      const accountData = {
        type: 'account',
        text: accountInfo,
        completed: 'false',
        createdAt: new Date().toISOString()
      };
      
      // 添加到飞书多维表格
      const result = await addRecord(accountData);
      
      if (result.success) {
        const newAccountInfo = {
          id: result.record_id,
          text: accountInfo,
          completed: false,
          createdAt: accountData.createdAt
        };
        
        return res.status(201).json(newAccountInfo);
      } else {
        throw new Error('添加账号信息失败');
      }
    } catch (error) {
      console.error('创建账号信息出错:', error);
      return res.status(500).json({ error: '创建账号信息失败' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, completed } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: '缺少账号信息ID' });
      }
      
      // 更新飞书多维表格中的账号信息
      const updateData = {
        completed: String(completed)
      };
      
      const result = await updateRecord(id, updateData);
      
      if (result.success) {
        // 获取更新后的记录
        const accountResult = await queryRecords(`record_id = "${id}"`);
        
        if (accountResult.items && accountResult.items.length > 0) {
          const updatedAccount = {
            id: accountResult.items[0].record_id,
            text: accountResult.items[0].fields.text || '',
            completed: accountResult.items[0].fields.completed === 'true',
            createdAt: accountResult.items[0].fields.createdAt || ''
          };
          
          return res.status(200).json(updatedAccount);
        }
        
        // 如果无法获取更新后的记录，返回基本更新信息
        return res.status(200).json({
          id,
          completed
        });
      } else {
        throw new Error('更新账号信息失败');
      }
    } catch (error) {
      console.error('更新账号信息出错:', error);
      return res.status(500).json({ error: '更新账号信息失败' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
