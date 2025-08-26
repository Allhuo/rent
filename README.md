# 🏠 租房谈判助手

基于AI的智能租房砍价工具，帮助租房者获得更优惠的租金价格。

## 项目特点

- 🤖 基于Gemini AI的智能谈判建议
- 💡 个性化砍价策略生成  
- 📊 实时房租行情分析
- 🎯 针对不同房东类型的话术优化
- 📱 简洁易用的Web界面

## 技术栈

**后端**:
- Python + FastAPI
- Google Gemini API
- PostgreSQL数据库

**前端**:
- React + TypeScript
- Tailwind CSS

## 功能规划

### MVP功能
- [ ] 房源信息输入
- [ ] 基础谈判建议生成
- [ ] 砍价幅度推荐
- [ ] 谈判话术生成

### 进阶功能
- [ ] 实时对话指导
- [ ] 成功案例数据库
- [ ] 区域行情分析
- [ ] 房东心理分析

## 快速开始

```bash
# 后端
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8088

# 前端
cd frontend  
npm install
PORT=3088 npm start
```

## 环境变量

```bash
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://user:pass@localhost/rent_db
```

## 端口配置

- 后端API: 8088
- 前端界面: 3088