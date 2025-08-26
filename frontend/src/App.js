import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [formData, setFormData] = useState({
    location: '',
    current_price: '',
    property_type: '一居室',
    area: '',
    description: '',
    landlord_type: '个人房东',
    user_budget: '',
    urgency: 'normal',
    additional_info: ''
  });

  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const requestData = {
        property_info: {
          location: formData.location,
          current_price: parseInt(formData.current_price),
          property_type: formData.property_type,
          area: formData.area ? parseInt(formData.area) : null,
          description: formData.description || null,
          landlord_type: formData.landlord_type
        },
        user_budget: parseInt(formData.user_budget),
        urgency: formData.urgency,
        additional_info: formData.additional_info || null
      };

      const response = await axios.post('/negotiate', requestData);
      setAdvice(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || '获取建议失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏠 AI租房谈判助手
          </h1>
          <p className="text-gray-600">
            让AI帮你制定专业的砍价策略，省钱租到心仪房屋
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 表单区域 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">填写房屋信息</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  房屋位置 *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：北京朝阳区三里屯"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    当前报价 (元/月) *
                  </label>
                  <input
                    type="number"
                    name="current_price"
                    value={formData.current_price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="6000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    您的预算 (元/月) *
                  </label>
                  <input
                    type="number"
                    name="user_budget"
                    value={formData.user_budget}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    房屋类型
                  </label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>一居室</option>
                    <option>两居室</option>
                    <option>三居室</option>
                    <option>整租</option>
                    <option>合租</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    面积 (平米)
                  </label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  房东类型
                </label>
                <select
                  name="landlord_type"
                  value={formData.landlord_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>个人房东</option>
                  <option>中介</option>
                  <option>不确定</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  房屋描述
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：精装修，家具家电齐全，临近地铁..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  补充信息
                </label>
                <textarea
                  name="additional_info"
                  value={formData.additional_info}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：希望长期租住，爱护房屋..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🤖 AI分析中...' : '🎯 获取谈判建议'}
              </button>
            </form>
          </div>

          {/* 结果区域 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">谈判建议</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {advice ? (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                  <h3 className="font-semibold text-green-800 mb-2">💰 建议价格</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {advice.suggested_price} 元/月
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    成功概率：{Math.round(advice.success_probability * 100)}%
                  </p>
                </div>

                <div className="border border-gray-200 p-4 rounded-md">
                  <h3 className="font-semibold text-gray-800 mb-2">🎯 谈判策略</h3>
                  <p className="text-gray-700">{advice.negotiation_strategy}</p>
                </div>

                <div className="border border-gray-200 p-4 rounded-md">
                  <h3 className="font-semibold text-gray-800 mb-3">💬 谈判话术</h3>
                  <ol className="space-y-2">
                    {advice.talking_points.map((point, index) => (
                      <li key={index} className="flex">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mr-3 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="border border-orange-200 bg-orange-50 p-4 rounded-md">
                  <h3 className="font-semibold text-orange-800 mb-2">⚠️ 风险评估</h3>
                  <p className="text-orange-700">{advice.risk_assessment}</p>
                </div>

                <div className="border border-gray-200 p-4 rounded-md">
                  <h3 className="font-semibold text-gray-800 mb-2">📈 市场洞察</h3>
                  <p className="text-gray-700">{advice.market_insights}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="text-6xl mb-4">🤖</div>
                <p>填写房屋信息，让AI为您制定专业的谈判策略</p>
              </div>
            )}
          </div>
        </div>

        <footer className="text-center text-gray-500 mt-12">
          <p>💡 提示：谈判时保持礼貌和耐心，合理砍价更容易成功</p>
        </footer>
      </div>
    </div>
  );
}

export default App;