from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
from services.ai_service import GeminiNegotiationService
from database import get_db, init_db
from models import NegotiationSession, UserFeedback, MarketData

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
    allow_origins=["http://localhost:3088", "http://127.0.0.1:3088"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化AI服务
ai_service = GeminiNegotiationService()

# 初始化数据库
init_db()

# 数据模型
class PropertyInfo(BaseModel):
    location: Optional[str] = None  # 位置（已改为可选）
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
    session_id: int  # 会话ID
    suggested_price: int  # 建议砍价到的价格
    negotiation_strategy: str  # 谈判策略
    talking_points: List[str]  # 谈判话术
    risk_assessment: str  # 风险评估
    success_probability: float  # 成功概率
    market_insights: str  # 市场洞察

class FeedbackRequest(BaseModel):
    session_id: int
    success: str  # "success", "failed", "partial"
    actual_price: Optional[int] = None
    feedback_text: Optional[str] = None
    rating: Optional[int] = None

@app.get("/")
async def root():
    return {"message": "租房谈判助手 API 运行中"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/negotiate", response_model=NegotiationAdvice)
async def get_negotiation_advice(request: NegotiationRequest, db: Session = Depends(get_db)):
    """
    获取租房谈判建议
    """
    try:
        # 保存谈判会话到数据库
        session = NegotiationSession(
            location=request.property_info.location,
            current_price=request.property_info.current_price,
            property_type=request.property_info.property_type,
            area=request.property_info.area,
            description=request.property_info.description,
            landlord_type=request.property_info.landlord_type,
            user_budget=request.user_budget,
            urgency=request.urgency,
            additional_info=request.additional_info
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
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
        
        # 更新会话记录，保存AI建议
        session.suggested_price = advice_data["suggested_price"]
        session.negotiation_strategy = advice_data["negotiation_strategy"]
        session.talking_points = advice_data["talking_points"]
        session.risk_assessment = advice_data["risk_assessment"]
        session.success_probability = advice_data["success_probability"]
        session.market_insights = advice_data["market_insights"]
        db.commit()
        
        return NegotiationAdvice(session_id=session.id, **advice_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成谈判建议失败: {str(e)}")

@app.post("/feedback")
async def submit_feedback(feedback: FeedbackRequest, db: Session = Depends(get_db)):
    """
    提交用户反馈
    """
    try:
        user_feedback = UserFeedback(
            session_id=feedback.session_id,
            success=feedback.success,
            actual_price=feedback.actual_price,
            feedback_text=feedback.feedback_text,
            rating=feedback.rating
        )
        db.add(user_feedback)
        db.commit()
        
        return {"message": "反馈提交成功", "feedback_id": user_feedback.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"提交反馈失败: {str(e)}")

@app.get("/market-analysis/{location}")
async def get_market_analysis(location: str, db: Session = Depends(get_db)):
    """
    获取区域市场行情分析
    """
    try:
        # 查询该区域的历史数据
        sessions = db.query(NegotiationSession).filter(
            NegotiationSession.location.contains(location)
        ).all()
        
        if sessions:
            prices = [s.current_price for s in sessions if s.current_price]
            suggested_prices = [s.suggested_price for s in sessions if s.suggested_price]
            
            if prices:
                avg_price = sum(prices) // len(prices)
                if suggested_prices:
                    avg_discount = sum((p - sp) for p, sp in zip(prices, suggested_prices) if sp) // len(suggested_prices)
                    discount_percent = (avg_discount / avg_price * 100) if avg_price > 0 else 0
                else:
                    discount_percent = 5  # 默认值
                    
                return {
                    "location": location,
                    "average_price": avg_price,
                    "sample_size": len(sessions),
                    "average_discount": f"{discount_percent:.1f}%",
                    "analysis": f"{location}地区平均租金{avg_price}元，建议砍价幅度{discount_percent:.1f}%"
                }
        
        # 没有历史数据时返回默认分析
        return {
            "location": location,
            "average_price": 4500,
            "sample_size": 0,
            "average_discount": "5-10%",
            "analysis": f"{location}地区暂无足够数据，建议砍价幅度5-10%"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取市场分析失败: {str(e)}")

@app.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """
    获取平台统计数据
    """
    try:
        total_sessions = db.query(NegotiationSession).count()
        total_feedback = db.query(UserFeedback).count()
        successful_negotiations = db.query(UserFeedback).filter(
            UserFeedback.success == "success"
        ).count()
        
        success_rate = (successful_negotiations / total_feedback * 100) if total_feedback > 0 else 0
        
        return {
            "total_sessions": total_sessions,
            "total_feedback": total_feedback,
            "success_rate": f"{success_rate:.1f}%",
            "successful_negotiations": successful_negotiations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取统计数据失败: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8088)