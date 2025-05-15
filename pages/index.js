import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  // 定义状态
  const [activeTab, setActiveTab] = useState(0);
  const [todoItems, setTodoItems] = useState([]);
  const [accountInfo, setAccountInfo] = useState('');
  const [todoInput, setTodoInput] = useState('');
  const [accountInput, setAccountInput] = useState('');

  // 标签页标题
  const tabs = ['待办', '账号', '输入'];

  // 处理标签页切换
  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  // 处理待办输入提交
  const handleTodoSubmit = (e) => {
    e.preventDefault();
    if (todoInput.trim()) {
      setTodoItems([...todoItems, todoInput]);
      setTodoInput('');
    }
  };

  // 处理账号信息提交
  const handleAccountSubmit = (e) => {
    e.preventDefault();
    setAccountInfo(accountInput);
    setAccountInput('');
  };

  // 渲染标签页内容
  const renderTabContent = () => {
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
                />
                <button type="submit" className="button" style={{ marginTop: '10px' }}>
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
                />
                <button type="submit" className="button" style={{ marginTop: '10px' }}>
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
