"""
数据库模型定义
"""

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

class NegotiationSession(Base):
    """
    谈判会话记录
    """
    __tablename__ = "negotiation_sessions"

    id = Column(Integer, primary_key=True, index=True)
    
    # 房屋信息
    location = Column(String, nullable=False)
    current_price = Column(Integer, nullable=False)
    property_type = Column(String, nullable=False)
    area = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    landlord_type = Column(String, nullable=True)
    
    # 用户信息
    user_budget = Column(Integer, nullable=False)
    urgency = Column(String, default="normal")
    additional_info = Column(Text, nullable=True)
    
    # AI建议结果
    suggested_price = Column(Integer, nullable=True)
    negotiation_strategy = Column(Text, nullable=True)
    talking_points = Column(JSON, nullable=True)  # 存储JSON数组
    risk_assessment = Column(Text, nullable=True)
    success_probability = Column(Float, nullable=True)
    market_insights = Column(Text, nullable=True)
    
    # 元数据
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class UserFeedback(Base):
    """
    用户反馈记录
    """
    __tablename__ = "user_feedback"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, nullable=False)  # 关联的谈判会话ID
    
    # 反馈内容
    success = Column(String, nullable=True)  # "success", "failed", "partial"
    actual_price = Column(Integer, nullable=True)  # 实际成交价格
    feedback_text = Column(Text, nullable=True)  # 用户反馈文字
    rating = Column(Integer, nullable=True)  # 评分 1-5
    
    # 时间戳
    created_at = Column(DateTime, server_default=func.now())

class MarketData(Base):
    """
    市场数据缓存
    """
    __tablename__ = "market_data"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, nullable=False, unique=True)
    
    # 市场数据
    average_price = Column(Integer, nullable=True)
    price_trend = Column(String, nullable=True)  # "rising", "falling", "stable"
    market_heat = Column(String, nullable=True)  # "hot", "moderate", "cold"
    sample_size = Column(Integer, default=0)  # 数据样本数量
    
    # 元数据
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime, server_default=func.now())