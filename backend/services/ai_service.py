import google.generativeai as genai
import json
import re
from typing import Dict, Any, Optional
import os

class GeminiNegotiationService:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-pro')
    
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
        return f"""
        你是中国最专业的租房谈判专家，有10年经验，成功帮助过数千人砍价。请根据以下信息给出专业建议。

        **房屋信息**：
        - 位置：{property_info.get('location', '未知')}
        - 当前报价：{property_info.get('current_price', 0)}元/月
        - 房屋类型：{property_info.get('property_type', '未知')}
        - 面积：{property_info.get('area', '未知')}平米
        - 描述：{property_info.get('description', '无')}
        - 房东类型：{property_info.get('landlord_type', '未知')}

        **租客情况**：
        - 预算：{user_budget}元/月
        - 紧急程度：{urgency}
        - 补充信息：{additional_info or '无'}

        请按以下JSON格式精确回复（不要有任何多余的文字）：

        {{
            "suggested_price": 建议的最终价格数字,
            "negotiation_strategy": "具体的谈判策略，包含心理分析和时机把握",
            "talking_points": [
                "具体话术1 - 开场白",
                "具体话术2 - 价格谈判",
                "具体话术3 - 条件交换",
                "具体话术4 - 成交促进",
                "具体话术5 - 备用方案"
            ],
            "risk_assessment": "风险评估和注意事项",
            "success_probability": 0.0到1.0之间的成功概率,
            "market_insights": "该区域市场行情分析"
        }}

        **要求**：
        1. 建议价格要基于市场合理性，通常砍价幅度3-15%
        2. 话术要符合中国人的沟通习惯，礼貌但有技巧
        3. 考虑房东心理：个人房东vs中介的不同应对策略
        4. 成功概率要实事求是
        5. 只返回JSON，不要任何解释文字
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