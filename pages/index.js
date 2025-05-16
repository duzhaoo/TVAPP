import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  // 定义状态
  const [activeTab, setActiveTab] = useState(0);
  const [todoItems, setTodoItems] = useState([]);
  const [accountInfo, setAccountInfo] = useState('');
  const [todoInput, setTodoInput] = useState('');
  const [accountInput, setAccountInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextRefreshTime, setNextRefreshTime] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // 获取路由对象
  const router = useRouter();

  // 标签页标题
  const tabs = ['待办', '账号', '输入'];

  // 加载数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 获取待办事项
        const todosResponse = await fetch('/api/todos');
        if (!todosResponse.ok) throw new Error('获取待办事项失败');
        const todosData = await todosResponse.json();
        setTodoItems(todosData);

        // 获取账号信息
        const accountResponse = await fetch('/api/account');
        if (!accountResponse.ok) throw new Error('获取账号信息失败');
        const accountInfos = await accountResponse.json();
        setAccountInfo(accountInfos);

        setError(null);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // 每小时自动刷新页面
  useEffect(() => {
    // 计算下一次刷新的时间（1小时后）
    const calculateNextRefresh = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1);
      nextHour.setMinutes(0);
      nextHour.setSeconds(0);
      return nextHour;
    };
    
    // 设置下一次刷新时间
    const next = calculateNextRefresh();
    setNextRefreshTime(next);
    
    // 计算当前时间到下一个整点的毫秒数
    const now = new Date();
    const timeUntilRefresh = next.getTime() - now.getTime();
    
    // 设置定时器
    const refreshTimer = setTimeout(() => {
      // 刷新页面
      router.reload();
    }, timeUntilRefresh);
    
    // 清理函数
    return () => clearTimeout(refreshTimer);
  }, [router]);

  // 处理标签页切换
  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  // 处理待办输入提交
  const handleTodoSubmit = async (e) => {
    e.preventDefault();
    if (todoInput.trim()) {
      try {
        setLoading(true);
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ todo: todoInput }),
        });

        if (!response.ok) throw new Error('添加待办事项失败');
        const updatedTodos = await response.json();
        setTodoItems(updatedTodos);
        setTodoInput('');
        setError(null);
      } catch (err) {
        console.error('添加待办事项失败:', err);
        setError('添加待办事项失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // 处理待办事项状态切换
  const handleTodoToggle = async (id, currentStatus) => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, completed: !currentStatus }),
      });

      if (!response.ok) throw new Error('更新待办事项状态失败');
      const updatedTodos = await response.json();
      setTodoItems(updatedTodos);
      setError(null);
    } catch (err) {
      console.error('更新待办事项状态失败:', err);
      setError('更新待办事项状态失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 处理账号信息提交
  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    if (accountInput.trim()) {
      try {
        setLoading(true);
        const response = await fetch('/api/account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accountInfo: accountInput }),
        });

        if (!response.ok) throw new Error('保存账号信息失败');
        const updatedAccountInfos = await response.json();
        setAccountInfo(updatedAccountInfos);
        setAccountInput('');
        setError(null);
      } catch (err) {
        console.error('保存账号信息失败:', err);
        setError('保存账号信息失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // 处理账号信息状态切换
  const handleAccountToggle = async (id, currentStatus) => {
    try {
      setLoading(true);
      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, completed: !currentStatus }),
      });

      if (!response.ok) throw new Error('更新账号信息状态失败');
      const updatedAccountInfos = await response.json();
      setAccountInfo(updatedAccountInfos);
      setError(null);
    } catch (err) {
      console.error('更新账号信息状态失败:', err);
      setError('更新账号信息状态失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatDate = (date) => {
    return date.toLocaleString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  // 渲染标签页内容
  const renderTabContent = () => {
    // 显示加载状态
    if (loading) {
      return (
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>正在加载数据...</span>
        </div>
      );
    }

    // 显示错误信息
    if (error) {
      return <div className="error">{error}</div>;
    }

    switch (activeTab) {
      case 0: // 待办标签页
        return (
          <div>
            {todoItems.length === 0 ? (
              <div className="empty-state">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p style={{ marginTop: '10px' }}>暂无待办事项</p>
              </div>
            ) : (
              <div>
                {todoItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`item todo-item ${item.completed ? 'completed' : ''}`}
                  >
                    <div className="checkbox-container">
                      <input 
                        type="checkbox" 
                        className="checkbox" 
                        checked={item.completed} 
                        onChange={() => handleTodoToggle(item.id, item.completed)}
                        id={`todo-${item.id}`}
                      />
                    </div>
                    <span className="todo-text">{item.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 1: // 账号标签页
        return (
          <div>
            {accountInfo && accountInfo.length > 0 ? (
              <div>
                {accountInfo.map((item) => (
                  <div 
                    key={item.id} 
                    className={`item account-item ${item.completed ? 'completed' : ''}`}
                  >
                    <div className="checkbox-container">
                      <input 
                        type="checkbox" 
                        className="checkbox" 
                        checked={item.completed} 
                        onChange={() => handleAccountToggle(item.id, item.completed)}
                        id={`account-${item.id}`}
                      />
                    </div>
                    <span className="account-text">{item.text}</span>
                    <button 
                      className="copy-button" 
                      onClick={() => {
                        navigator.clipboard.writeText(item.text)
                          .then(() => {
                            setCopySuccess(true);
                            setTimeout(() => setCopySuccess(false), 2000);
                          })
                          .catch(err => console.error('复制失败:', err));
                      }}
                      title="复制账号信息"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.90625 20.2491C3.82834 18.6531 5.1542 17.3278 6.75064 16.4064C8.34708 15.485 10.1579 15 12.0011 15C13.8444 15 15.6552 15.4851 17.2516 16.4066C18.848 17.3281 20.1738 18.6533 21.0959 20.2494" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p style={{ marginTop: '10px' }}>暂无账号信息</p>
              </div>
            )}
          </div>
        );
      case 2: // 输入标签页
        return (
          <div>
            <div className="input-group">
              <form onSubmit={handleTodoSubmit}>
                <label>待办事项</label>
                <input
                  type="text"
                  value={todoInput}
                  onChange={(e) => setTodoInput(e.target.value)}
                  placeholder="输入待办事项"
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  className="button" 
                  style={{ marginTop: '15px' }}
                  disabled={loading || !todoInput.trim()}
                >
                  添加到待办列表
                </button>
              </form>
            </div>
            <div className="input-group" style={{ marginTop: '30px' }}>
              <form onSubmit={handleAccountSubmit}>
                <label>账号信息</label>
                <textarea
                  value={accountInput}
                  onChange={(e) => setAccountInput(e.target.value)}
                  placeholder="输入账号信息"
                  rows={8}
                  disabled={loading}
                  style={{ minHeight: '200px' }}
                />
                <button 
                  type="submit" 
                  className="button" 
                  style={{ marginTop: '15px' }}
                  disabled={loading || !accountInput.trim()}
                >
                  保存账号信息
                </button>
              </form>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <Head>
        <title>简易标签页应用</title>
        <meta name="description" content="一个简单的标签页应用" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {copySuccess && (
        <div className="copy-success">账号信息已复制到剪贴板</div>
      )}

      <main>
        {/* 标签页导航 */}
        <div className="tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`tab ${activeTab === index ? 'active' : ''}`}
              onClick={() => handleTabClick(index)}
              disabled={loading}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* 标签页内容 */}
        <div className="tab-content">
          {renderTabContent()}
        </div>
        

      </main>
    </div>
  );
}
