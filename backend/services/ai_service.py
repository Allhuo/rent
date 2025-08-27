import google.generativeai as genai
import json
import re
from typing import Dict, Any, Optional
import os

class GeminiNegotiationService:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        # 使用最新的Gemini 2.5 Pro模型，性能最强
        self.model = genai.GenerativeModel('gemini-2.5-pro')
    
    async def get_negotiation_advice(self, property_info: Dict[str, Any], user_budget: int, urgency: str = "normal", additional_info: Optional[str] = None) -> Dict[str, Any]:
        """
        获取租房谈判建议
        """
        prompt = self._build_negotiation_prompt(property_info, user_budget, urgency, additional_info)
        
        try:
            response = self.model.generate_content(prompt)
            return self._parse_response(response.text)
        except Exception as e:
            # 如果AI解析失败，返回基础建议
            return self._get_fallback_advice(property_info, user_budget)
    
    def _build_negotiation_prompt(self, property_info: Dict[str, Any], user_budget: int, urgency: str, additional_info: Optional[str]) -> str:
        current_price = property_info.get('current_price', 0)
        price_gap = current_price - user_budget
        landlord_type = property_info.get('landlord_type', '未知')
        
        return f"""
        你是中国顶级的租房谈判专家，有15年实战经验。你需要分析每个具体案例，给出深度、个性化的建议。

        **核心情况分析**：
        - 当前报价：{current_price}元/月
        - 用户预算：{user_budget}元/月  
        - 价格差距：{price_gap}元/月 ({price_gap/current_price*100:.1f}%)
        - 房东类型：{landlord_type}
        - 位置：{property_info.get('location', '未知')}
        - 房屋：{property_info.get('property_type', '未知')}，{property_info.get('area', '未知')}平米
        - 房屋描述：{property_info.get('description', '无')}
        - 紧急程度：{urgency}
        - 用户补充：{additional_info or '无'}

        **深度分析要求**：
        1. 价格分析：{price_gap}元的差距是否合理？在什么情况下可以砍到用户预算？
        2. 房东心理：{landlord_type}类型的房东有什么特点？如何针对性沟通？
        3. 房屋特征：根据"{property_info.get('description', '无')}"这个描述，房屋有什么优劣势？
        4. 谈判时机：根据"{urgency}"程度，什么时候谈最合适？
        5. 用户优势：从"{additional_info or '无'}"中发现用户有什么谈判筹码？

        **回复格式（严格JSON）**：
        {{
            "suggested_price": 具体价格数字,
            "negotiation_strategy": "深度策略分析：包括谈判心理、时机选择、筹码运用、预期管理，至少200字",
            "talking_points": [
                "开场话术：如何建立信任和表达诚意",
                "核心论点：基于房屋/市场/用户情况的具体论据",  
                "价格锚点：如何巧妙提出目标价格",
                "增值论述：强调用户作为租客的价值",
                "成交催化：促成协议的关键话术"
            ],
            "risk_assessment": "具体风险点和应对策略，考虑房东可能的反应",
            "success_probability": 基于实际情况的成功率评估,
            "market_insights": "针对该区域和房屋类型的深度市场分析"
        }}

        **关键要求**：
        - 每条建议都要结合具体情况，不要模板化
        - 话术要真实可用，符合中国租房市场习惯
        - 分析要深入，体现专业水准
        - 成功概率要基于{price_gap}元差距的现实性
        - 如果差距过大（>20%），要给出阶段性策略
        """
    
    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        解析AI响应，提取JSON数据
        """
        try:
            # 尝试直接解析JSON
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                return json.loads(json_str)
            else:
                raise ValueError("未找到有效的JSON响应")
        except (json.JSONDecodeError, ValueError) as e:
            # JSON解析失败，尝试从文本中提取信息
            return self._extract_info_from_text(response_text)
    
    def _extract_info_from_text(self, text: str) -> Dict[str, Any]:
        """
        从文本中提取关键信息（作为JSON解析失败的备选方案）
        """
        # 简单的正则提取（实际项目中可以更复杂）
        suggested_price_match = re.search(r'建议.*?(\d+)', text)
        success_prob_match = re.search(r'成功.*?(\d+\.?\d*)%', text)
        
        return {
            "suggested_price": int(suggested_price_match.group(1)) if suggested_price_match else 0,
            "negotiation_strategy": "基于房屋条件和市场行情制定合理的谈判策略",
            "talking_points": [
                "您好，我很喜欢这套房子，价格能否商量一下？",
                "我可以长期租住，签一年合同",
                "现在就能决定，价格合适的话马上签约",
                "我是稳定租客，会爱护房屋",
                "如果价格不合适，我再看看其他房源"
            ],
            "risk_assessment": "需要根据房东反应调整策略，避免过度强硬",
            "success_probability": float(success_prob_match.group(1))/100 if success_prob_match else 0.6,
            "market_insights": "市场行情分析需要更多数据支撑"
        }
    
    def _get_fallback_advice(self, property_info: Dict[str, Any], user_budget: int) -> Dict[str, Any]:
        """
        当AI服务不可用时的后备建议
        """
        current_price = property_info.get('current_price', 5000)
        price_gap = current_price - user_budget
        
        if price_gap <= 0:
            suggested_price = user_budget
            success_prob = 0.9
        elif price_gap <= 500:
            suggested_price = current_price - int(price_gap * 0.8)
            success_prob = 0.7
        else:
            suggested_price = current_price - min(price_gap // 2, 1000)
            success_prob = 0.5
        
        return {
            "suggested_price": suggested_price,
            "negotiation_strategy": f"当前报价{current_price}元，您的预算{user_budget}元，建议从{suggested_price}元开始谈判",
            "talking_points": [
                "您好，我对这套房很感兴趣",
                "价格方面能否再优惠一些？",
                "我可以长期租住，减少您的空置风险",
                "如果价格合适，我们现在就可以签约",
                "这是我能承受的最高价格了"
            ],
            "risk_assessment": "注意观察房东态度，适时调整策略",
            "success_probability": success_prob,
            "market_insights": "建议多了解周边同类房源价格"
        }