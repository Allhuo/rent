from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
from services.ai_service import GeminiNegotiationService

# 加载环境变量
load_dotenv()

app = FastAPI(
    title="租房谈判助手 API",
    description="基于AI的智能租房砍价工具",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化AI服务
ai_service = GeminiNegotiationService()

# 数据模型
class PropertyInfo(BaseModel):
    location: str  # 位置
    current_price: int  # 当前报价
    property_type: str  # 房屋类型：一居室、两居室等
    area: Optional[int] = None  # 面积
    description: Optional[str] = None  # 房屋描述
    landlord_type: Optional[str] = None  # 房东类型：个人/中介
    
class NegotiationRequest(BaseModel):
    property_info: PropertyInfo
    user_budget: int  # 用户预算
    urgency: str = "normal"  # 紧急程度：urgent/normal/flexible
    additional_info: Optional[str] = None  # 额外信息

class NegotiationAdvice(BaseModel):
    suggested_price: int  # 建议砍价到的价格
    negotiation_strategy: str  # 谈判策略
    talking_points: List[str]  # 谈判话术
    risk_assessment: str  # 风险评估
    success_probability: float  # 成功概率
    market_insights: str  # 市场洞察

@app.get("/")
async def root():
    return {"message": "租房谈判助手 API 运行中"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/negotiate", response_model=NegotiationAdvice)
async def get_negotiation_advice(request: NegotiationRequest):
    """
    获取租房谈判建议
    """
    try:
        # 将property_info转换为字典
        property_dict = {
            "location": request.property_info.location,
            "current_price": request.property_info.current_price,
            "property_type": request.property_info.property_type,
            "area": request.property_info.area,
            "description": request.property_info.description,
            "landlord_type": request.property_info.landlord_type
        }
        
        # 调用AI服务
        advice_data = await ai_service.get_negotiation_advice(
            property_dict,
            request.user_budget,
            request.urgency,
            request.additional_info
        )
        
        return NegotiationAdvice(**advice_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成谈判建议失败: {str(e)}")

@app.get("/market-analysis/{location}")
async def get_market_analysis(location: str):
    """
    获取区域市场行情分析
    """
    # TODO: 实现真实的市场数据分析
    return {
        "location": location,
        "average_price": 4500,
        "price_trend": "stable",
        "market_heat": "moderate",
        "analysis": f"{location}地区租房市场相对稳定，议价空间约5-10%"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)