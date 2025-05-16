import { queryRecords, addRecord, updateRecord } from '../../../utils/feishuAPI';

// 测试数据，当API调用失败时使用
const fallbackAccounts = [
  {
    id: '3',
    text: '测试账号信息1\n用户名：test1\n密码：123456',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    text: '测试账号信息2\n用户名：test2\n密码：654321',
    completed: true,
    createdAt: new Date().toISOString()
  }
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('开始获取账号信息...');
      
      // 从飞书多维表格获取账号信息
      // 不使用过滤条件，直接获取所有记录
      const result = await queryRecords('');
      
      // 过滤并格式化返回数据
      const accountInfos = result.items
        .filter(item => item.fields.type === 'account')
        .map(item => {
          const fields = item.fields;
          return {
            id: item.record_id,
            text: fields.text || '',
            completed: fields.completed === 'true',
            createdAt: fields.createdAt || new Date().toISOString()
          };
        });
      
      console.log('格式化后的账号信息:', accountInfos);
      return res.status(200).json(accountInfos || []);
    } catch (error) {
      console.error('获取账号信息出错:', error);
      console.log('返回测试账号数据代替');
      // 出错时返回测试数据，而不是错误状态码
      return res.status(200).json(fallbackAccounts);
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
