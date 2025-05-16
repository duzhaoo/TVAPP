import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  // 定义状态
  const [activeTab, setActiveTab] = useState(0);
  const [todoItems, setTodoItems] = useState([]);
  const [accountInfo, setAccountInfo] = useState('');
  const [todoInput, setTodoInput] = useState('');
  const [accountInput, setAccountInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const accountData = await accountResponse.json();
        setAccountInfo(accountData.accountInfo);

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

  // 处理账号信息提交
  const handleAccountSubmit = async (e) => {
    e.preventDefault();
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
      const data = await response.json();
      setAccountInfo(data.accountInfo);
      setAccountInput('');
      setError(null);
    } catch (err) {
      console.error('保存账号信息失败:', err);
      setError('保存账号信息失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 渲染标签页内容
  const renderTabContent = () => {
    // 显示加载状态
    if (loading) {
      return <p>加载中...</p>;
    }

    // 显示错误信息
    if (error) {
      return <p style={{ color: 'red' }}>{error}</p>;
    }

    switch (activeTab) {
      case 0: // 待办标签页
        return (
          <div>
            {todoItems.length === 0 ? (
              <p>暂无待办事项</p>
            ) : (
              <div>
                {todoItems.map((item, index) => (
                  <div key={index} className="item">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 1: // 账号标签页
        return (
          <div>
            {accountInfo ? (
              <div className="item">{accountInfo}</div>
            ) : (
              <p>暂无账号信息</p>
            )}
          </div>
        );
      case 2: // 输入标签页
        return (
          <div>
            <div className="input-group">
              <form onSubmit={handleTodoSubmit}>
                <label>待办事项：</label>
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
                  style={{ marginTop: '10px' }}
                  disabled={loading}
                >
                  添加到待办
                </button>
              </form>
            </div>
            <div className="input-group" style={{ marginTop: '20px' }}>
              <form onSubmit={handleAccountSubmit}>
                <label>账号信息：</label>
                <textarea
                  value={accountInput}
                  onChange={(e) => setAccountInput(e.target.value)}
                  placeholder="输入账号信息"
                  rows={4}
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  className="button" 
                  style={{ marginTop: '10px' }}
                  disabled={loading}
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
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
