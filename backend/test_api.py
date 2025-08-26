#!/usr/bin/env python3
"""
测试租房谈判助手API的简单脚本
"""

import requests
import json
from pprint import pprint

API_BASE = "http://localhost:8000"

def test_health():
    """测试健康检查接口"""
    print("🔍 测试健康检查...")
    response = requests.get(f"{API_BASE}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_negotiation():
    """测试谈判建议接口"""
    print("🏠 测试谈判建议...")
    
    test_data = {
        "property_info": {
            "location": "北京朝阳区三里屯",
            "current_price": 6000,
            "property_type": "一居室",
            "area": 50,
            "description": "精装修，家具家电齐全，临近地铁",
            "landlord_type": "个人房东"
        },
        "user_budget": 5500,
        "urgency": "normal",
        "additional_info": "希望能长期租住，爱护房屋"
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/negotiate",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print("📋 谈判建议：")
            print(f"💰 建议价格: {result['suggested_price']}元/月")
            print(f"📊 成功概率: {result['success_probability']*100:.1f}%")
            print(f"🎯 谈判策略: {result['negotiation_strategy']}")
            print("💬 谈判话术:")
            for i, point in enumerate(result['talking_points'], 1):
                print(f"  {i}. {point}")
            print(f"⚠️  风险评估: {result['risk_assessment']}")
            print(f"📈 市场洞察: {result['market_insights']}")
        else:
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到API服务器。请确保后端服务正在运行。")
        print("启动命令: cd backend && uvicorn main:app --reload")
    except Exception as e:
        print(f"❌ 测试失败: {e}")
    
    print()

def test_market_analysis():
    """测试市场分析接口"""
    print("📊 测试市场分析...")
    
    try:
        response = requests.get(f"{API_BASE}/market-analysis/北京朝阳区")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            pprint(result)
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ 测试失败: {e}")
    
    print()

if __name__ == "__main__":
    print("🚀 开始测试租房谈判助手 API")
    print("=" * 50)
    
    test_health()
    test_negotiation()
    test_market_analysis()
    
    print("✅ 测试完成！")