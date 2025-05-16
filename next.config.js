/** @type {import('next').NextConfig} */
require('dotenv').config({ path: '.env.local' });

const nextConfig = {
  reactStrictMode: true,
  env: {
    FEISHU_APP_ID: process.env.FEISHU_APP_ID,
    FEISHU_APP_SECRET: process.env.FEISHU_APP_SECRET,
    FEISHU_APP_TOKEN: process.env.FEISHU_APP_TOKEN,
    FEISHU_TABLE_ID: process.env.FEISHU_TABLE_ID,
  },
  // 打印环境变量用于调试
  serverRuntimeConfig: {
    FEISHU_APP_ID: process.env.FEISHU_APP_ID,
    FEISHU_APP_SECRET: process.env.FEISHU_APP_SECRET,
    FEISHU_APP_TOKEN: process.env.FEISHU_APP_TOKEN,
    FEISHU_TABLE_ID: process.env.FEISHU_TABLE_ID,
  },
  publicRuntimeConfig: {
    // 只添加非敏感信息
    FEISHU_APP_TOKEN: process.env.FEISHU_APP_TOKEN,
    FEISHU_TABLE_ID: process.env.FEISHU_TABLE_ID,
  },
}

console.log('Next.js 配置中的环境变量:', {
  FEISHU_APP_ID: process.env.FEISHU_APP_ID,
  FEISHU_APP_TOKEN: process.env.FEISHU_APP_TOKEN,
  FEISHU_TABLE_ID: process.env.FEISHU_TABLE_ID,
});

module.exports = nextConfig
