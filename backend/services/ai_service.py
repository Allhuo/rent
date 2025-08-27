import google.generativeai as genai
import json
import re
from typing import Dict, Any, Optional
import os

class GeminiNegotiationService:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = None  # 不在初始化时创建模型
        
        # 可用模型列表
        self.available_models = [
            'gemini-2.5-pro',
            'gemini-2.5-flash', 
            'gemini-2.0-flash',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-pro'
        ]
    
    def get_model(self, model_name: str):
        """动态创建指定的模型"""
        try:
            model = genai.GenerativeModel(model_name)
            print(f"✅ 成功创建模型: {model_name}")
            return model
        except Exception as e:
            print(f"❌ 模型 {model_name} 创建失败: {str(e)}")
            raise e
    
    async def get_negotiation_advice(self, property_info: Dict[str, Any], user_budget: int, urgency: str = "normal", additional_info: Optional[str] = None, model_name: str = "gemini-1.5-pro") -> Dict[str, Any]:
        """
        获取租房谈判建议
        """
        prompt = self._build_negotiation_prompt(property_info, user_budget, urgency, additional_info)
        
        print("🤖 发送给Gemini的prompt:")
        print("=" * 50)
        print(prompt)
        print("=" * 50)
        
        try:
            # 动态创建指定模型
            model = self.get_model(model_name)
            response = model.generate_content(prompt)
            print("✅ Gemini响应结构:")
            print(f"Candidates数量: {len(response.candidates)}")
            
            # 正确获取响应文本
            if response.candidates and response.candidates[0].content.parts:
                response_text = ""
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'text'):
                        response_text += part.text
                
                print("✅ Gemini原始响应:")
                print(response_text)
                print("=" * 50)
                
                parsed_result = self._parse_response(response_text)
                print("✅ 解析后结果:")
                print(parsed_result)
                print("=" * 50)
                
                return parsed_result
            else:
                raise ValueError("响应中没有文本内容")
        except Exception as e:
            print(f"❌ AI服务失败: {str(e)}")
            print("🔄 使用fallback建议")
            # 如果AI解析失败，返回基础建议
            return self._get_fallback_advice(property_info, user_budget)
    
    def _build_negotiation_prompt(self, property_info: Dict[str, Any], user_budget: int, urgency: str, additional_info: Optional[str]) -> str:
        current_price = property_info.get('current_price', 0)
        price_gap = current_price - user_budget
        price_gap_percent = (price_gap/current_price*100) if current_price > 0 else 0
        landlord_type = property_info.get('landlord_type', '未知')
        
        # 解析additional_info中的关键信息
        city = ""
        similar_properties = ""
        property_advantages = ""
        property_disadvantages = ""
        tenant_status = ""
        rental_history = ""
        personal_advantages = ""
        communication_preference = ""
        
        if additional_info:
            for info in additional_info.split('；'):
                if '位置：' in info:
                    city = info.replace('位置：', '').strip()
                elif '同类房源价格：' in info:
                    similar_properties = info.replace('同类房源价格：', '').strip()
                elif '房屋优势：' in info:
                    property_advantages = info.replace('房屋优势：', '').strip()
                elif '房屋劣势：' in info:
                    property_disadvantages = info.replace('房屋劣势：', '').strip()
                elif '租客身份：' in info:
                    tenant_status = info.replace('租客身份：', '').strip()
                elif '租住历史：' in info:
                    rental_history = info.replace('租住历史：', '').strip()
                elif '个人优势：' in info:
                    personal_advantages = info.replace('个人优势：', '').strip()
                elif '沟通方式：' in info:
                    communication_preference = info.replace('沟通方式：', '').strip()
        
        return f"""
        你是中国顶级的租房谈判专家，有15年实战经验。基于租房谈判4大核心要素框架，对每个案例进行系统化分析。

        **【核心要素分析框架】**

        **第一层：基础信息框架**
        - 当前报价：{current_price}元/月
        - 目标价格：{user_budget}元/月  
        - 价格差距：{price_gap}元/月 ({price_gap_percent:.1f}%)
        - 所在位置：{city or '未指定'}
        - 房屋信息：{property_info.get('description', '无')}
        - 房东类型：{landlord_type}（决定谈判对象和策略基调）
        
        **第二层：市场对比武器**
        - 同类房源价格：{similar_properties or '无对比数据'}
        - 房屋优势：{property_advantages or '未明确'}
        - 房屋劣势：{property_disadvantages or '未明确'}
        ⚠️ 这是砍价的核心武器！如果缺乏对比数据，必须在策略中强调收集市场信息的重要性
        
        **第三层：关系筹码分析**
        - 租客身份：{tenant_status or '未知'}（新租客vs续租，策略完全不同）
        - 租住历史：{rental_history or '无'}
        - 个人筹码：{personal_advantages or '无'}
        ⚠️ 续租老租客拥有巨大优势：稳定性、省心、避免空置期等
        
        **第四层：执行优化**  
        - 时间压力：{urgency}
        - 沟通渠道：{communication_preference or '未指定'}
        - 补充信息：{additional_info or '无'}

        **【系统化分析要求】**（基于4层要素框架，每项都要深度分析）：
        1. **基础框架分析**：{price_gap}元差距（{price_gap_percent:.1f}%）在{city or '该城市'}是否现实？{landlord_type}的决策模式？
        2. **市场武器分析**：基于"{similar_properties or '缺乏对比数据'}"制定砍价依据和论证逻辑
        3. **关系筹码分析**：{tenant_status or '租客身份'}的核心优势是什么？如何量化稳定性价值？
        4. **执行优化分析**：{communication_preference or '沟通方式'}的最佳话术和{urgency}时机把握
        5. **风险应对分析**：房东可能的3种反应（接受/还价/拒绝）及对应策略
        6. **成功率评估**：基于市场对比强度、租客优势、价格差距的综合评估

        **回复格式（严格JSON）**：
        {{
            "suggested_price": 具体建议价格数字,
            "negotiation_strategy": "基于4层要素的系统化策略：\n【基础策略】基于{landlord_type}特点的整体方向\n【市场武器】如何运用价格对比数据作为核心论据\n【关系筹码】{tenant_status or '租客身份'}的价值最大化策略\n【执行优化】{communication_preference or '沟通方式'}下的最佳实施方案\n至少400字深度分析，每个要素都要具体阐述",
            "talking_points": [
                "开场信任建立 - 适合{communication_preference or '该沟通方式'}：[具体开场话术，体现对房东的尊重和对房屋的认可]",
                "市场对比引入 - 基于收集的数据：[如何自然地提出'{similar_properties or '市场行情'}'作为砍价依据]",
                "关系优势强化 - {tenant_status or '租客身份'}价值：[强调稳定性、省心度的具体经济价值]",
                "价格锚定成交 - 目标{user_budget}元策略：[如何提出目标价格并促成达成一致]",
                "异议应对预案 - 房东拒绝时：[应对房东可能的反驳和还价策略]"
            ],
            "risk_assessment": "详细风险分析：\n1. 最可能遇到的3个阻力点\n2. 每个阻力点的具体应对策略\n3. 谈判破裂的信号识别\n4. 底线策略建议",
            "success_probability": 基于价格差距和具体情况的数字概率,
            "market_insights": "深度市场分析：\n1. {city or '该城市'}该价位房源的供需情况和地域特点\n2. {city or '当地'}房东出租压力和决策习惯分析\n3. {city or '该地区'}租房季节性规律和时机因素\n4. 同类竞品在{city or '当地'}市场的优劣势对比\n5. {city or '该城市'}租客市场地位和议价空间评估\n6. 基于{communication_preference or '沟通方式'}的成功率提升建议"
        }}

        **【核心要求】**：
        - **系统化分析**：必须基于4层要素框架，每层都要深度分析，不能跳过
        - **个性化策略**：基于租客身份（{tenant_status or '新/续租'}）制定完全不同的策略
        - **数据驱动**：市场对比是砍价核心，如果数据不足要明确指出影响
        - **可执行性**：所有话术要真实可用，符合{communication_preference or '沟通方式'}特点
        - **风险预案**：必须提供房东拒绝、还价、接受三种情况的应对方案
        - **量化价值**：续租老租客要量化省心、稳定、避免空置的经济价值
        - **阶梯策略**：如果价格差距>15%，提供分步骤砍价方案
        
        ⚠️ 特别注意：续租老租客和新租客的策略完全不同，必须区别对待！
        - 每条talking_point都要包含具体的话术示例
        - success_probability必须是0.1-0.9之间的数字
        """
    
    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        解析AI响应，提取JSON数据 - 多层降级兼容方案
        """
        print("🔍 开始解析AI响应...")
        
        # 方案1: 尝试直接JSON解析
        try:
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                parsed_data = json.loads(json_str)
                print("✅ 方案1成功: 直接JSON解析")
                return self._process_parsed_data(parsed_data)
        except Exception as e:
            print(f"⚠️ 方案1失败: {str(e)}")
        
        # 方案2: 清理控制字符后再解析
        try:
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                # 清理各种控制字符
                json_str = self._clean_json_string(json_str)
                parsed_data = json.loads(json_str)
                print("✅ 方案2成功: 清理控制字符后解析")
                return self._process_parsed_data(parsed_data)
        except Exception as e:
            print(f"⚠️ 方案2失败: {str(e)}")
        
        # 方案3: 从代码块中提取JSON
        try:
            code_block_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
            if code_block_match:
                json_str = code_block_match.group(1)
                json_str = self._clean_json_string(json_str)
                parsed_data = json.loads(json_str)
                print("✅ 方案3成功: 从代码块提取JSON")
                return self._process_parsed_data(parsed_data)
        except Exception as e:
            print(f"⚠️ 方案3失败: {str(e)}")
        
        # 方案4: 结构化文本提取
        try:
            structured_data = self._extract_structured_info(response_text)
            print("✅ 方案4成功: 结构化文本提取")
            return structured_data
        except Exception as e:
            print(f"⚠️ 方案4失败: {str(e)}")
        
        # 方案5: 基础文本提取（最后的降级方案）
        print("🔄 使用最终降级方案: 基础文本提取")
        return self._extract_info_from_text(response_text)
    
    def _clean_json_string(self, json_str: str) -> str:
        """清理JSON字符串中的问题字符"""
        # 处理换行符
        json_str = json_str.replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
        
        # 移除控制字符 (保留基本的转义字符)
        json_str = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', json_str)
        
        # 修复常见的JSON格式问题
        json_str = json_str.replace('\\\\n', '\\n')  # 防止双重转义
        json_str = json_str.replace('\\"', '"')      # 修复引号转义
        
        return json_str
    
    def _process_parsed_data(self, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        """处理解析后的数据，标准化格式"""
        # 处理success_probability字段
        if isinstance(parsed_data.get('success_probability'), str):
            prob_text = parsed_data['success_probability'].lower()
            if '高' in prob_text or 'high' in prob_text:
                if '中' in prob_text or 'moderate' in prob_text:
                    parsed_data['success_probability'] = 0.7  # 中高
                else:
                    parsed_data['success_probability'] = 0.8  # 高
            elif '中' in prob_text or 'medium' in prob_text:
                parsed_data['success_probability'] = 0.6  # 中等
            elif '低' in prob_text or 'low' in prob_text:
                parsed_data['success_probability'] = 0.4  # 低
            else:
                parsed_data['success_probability'] = 0.6  # 默认中等
        
        # 确保所有必需字段存在
        required_fields = {
            'suggested_price': 0,
            'negotiation_strategy': '',
            'talking_points': [],
            'risk_assessment': '',
            'success_probability': 0.6,
            'market_insights': ''
        }
        
        for field, default_value in required_fields.items():
            if field not in parsed_data or parsed_data[field] is None:
                parsed_data[field] = default_value
        
        print(f"🔧 标准化后的数据: success_probability={parsed_data.get('success_probability')}")
        return parsed_data
    
    def _extract_structured_info(self, text: str) -> Dict[str, Any]:
        """从结构化文本中提取信息（更智能的备选方案）"""
        result = {
            'suggested_price': 0,
            'negotiation_strategy': '',
            'talking_points': [],
            'risk_assessment': '',
            'success_probability': 0.6,
            'market_insights': ''
        }
        
        # 提取建议价格
        price_patterns = [
            r'suggested_price["\']?\s*:\s*(\d+)',
            r'建议.*?价格.*?(\d+)',
            r'目标价格.*?(\d+)'
        ]
        for pattern in price_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                result['suggested_price'] = int(match.group(1))
                break
        
        # 提取策略内容
        strategy_patterns = [
            r'negotiation_strategy["\']?\s*:\s*["\']([^"\']+)["\']',
            r'谈判策略[:：]([^\\n]+)',
            r'【基础策略】([^【]+)'
        ]
        for pattern in strategy_patterns:
            match = re.search(pattern, text, re.DOTALL)
            if match:
                result['negotiation_strategy'] = match.group(1).strip()
                break
        
        # 提取话术要点
        talking_points = []
        talking_patterns = [
            r'talking_points.*?\[(.*?)\]',
            r'话术[:：](.*?)(?=风险|success|$)',
        ]
        for pattern in talking_patterns:
            match = re.search(pattern, text, re.DOTALL)
            if match:
                points_text = match.group(1)
                # 简单分割提取要点
                points = re.findall(r'["\']([^"\']+)["\']', points_text)
                if points:
                    talking_points = points[:5]  # 最多5个要点
                break
        
        if not talking_points:
            # 如果没有找到，提供默认话术
            talking_points = [
                "您好，我对这套房很感兴趣",
                "价格方面能否再商量一下？",
                "我可以长期租住，减少您的空置风险",
                "如果价格合适，我们现在就可以签约"
            ]
        
        result['talking_points'] = talking_points
        
        # 提取成功概率
        prob_match = re.search(r'success_probability.*?(\d+\.?\d*)', text)
        if prob_match:
            result['success_probability'] = float(prob_match.group(1))
        
        return result
    
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