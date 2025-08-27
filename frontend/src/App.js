import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

// 格式化文本显示组件
const FormattedText = ({ content, colorScheme = "blue" }) => {
  if (!content) return null;
  
  // 颜色方案配置
  const colors = {
    blue: {
      title: "bg-gradient-to-r from-blue-500 to-blue-600",
      titleBorder: "border-blue-200",
      titleBg: "bg-blue-50",
      number: "bg-gradient-to-r from-blue-500 to-blue-600",
      card: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100",
      subCard: "bg-white border-blue-200",
      highlight: "bg-blue-100 text-blue-800"
    },
    orange: {
      title: "bg-gradient-to-r from-orange-500 to-red-500",
      titleBorder: "border-orange-200",
      titleBg: "bg-orange-50",
      number: "bg-gradient-to-r from-orange-500 to-red-500",
      card: "bg-gradient-to-br from-orange-50 to-red-50 border-orange-100",
      subCard: "bg-white border-orange-200",
      highlight: "bg-orange-100 text-orange-800"
    },
    green: {
      title: "bg-gradient-to-r from-green-500 to-emerald-500",
      titleBorder: "border-green-200",
      titleBg: "bg-green-50",
      number: "bg-gradient-to-r from-green-500 to-emerald-500",
      card: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-100",
      subCard: "bg-white border-green-200",
      highlight: "bg-green-100 text-green-800"
    },
    purple: {
      title: "bg-gradient-to-r from-purple-500 to-indigo-500",
      titleBorder: "border-purple-200",
      titleBg: "bg-purple-50",
      number: "bg-gradient-to-r from-purple-500 to-indigo-500",
      card: "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100",
      subCard: "bg-white border-purple-200",
      highlight: "bg-purple-100 text-purple-800"
    }
  };
  
  const currentColors = colors[colorScheme] || colors.blue;
  
  // 处理文本格式化
  const formatText = (text) => {
    // 先处理换行符，确保正确分段
    text = text.replace(/\n/g, '<br>');
    
    // 处理【标题】格式 - 更美观的渐变标题
    text = text.replace(/【([^】]+)】/g, 
      `<div class="mt-6 mb-4 rounded-xl overflow-hidden shadow-sm border ${currentColors.titleBorder}">
        <div class="${currentColors.title} text-white p-4">
          <h4 class="text-lg font-bold flex items-center">
            <span class="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></span>
            $1
          </h4>
        </div>
      </div>`);
    
    // 处理**粗体**格式 - 更突出的高亮
    text = text.replace(/\*\*([^*]+)\*\*/g, `<span class="font-semibold ${currentColors.highlight} px-2 py-1 rounded-md shadow-sm">$1</span>`);
    
    // 处理主要的数字编号列表（1. 2. 3.） - 更现代的卡片设计
    text = text.replace(/^(\d+\.)\s+\*\*([^*]+)\*\*[:：]?\s*([^]*?)(?=^\d+\.|$)/gm, 
      `<div class="mb-6 rounded-xl overflow-hidden shadow-lg border ${currentColors.card}">
        <div class="p-5">
          <div class="flex items-start mb-4">
            <div class="flex-shrink-0 mr-4">
              <span class="${currentColors.number} text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                $1
              </span>
            </div>
            <div class="flex-1">
              <h5 class="font-bold text-gray-900 text-lg mb-3 leading-tight">$2</h5>
            </div>
          </div>
          <div class="text-gray-700 leading-relaxed pl-12 space-y-2">$3</div>
        </div>
      </div>`);
    
    // 处理缩进的子项目（带*号的） - 更精致的子卡片
    text = text.replace(/^\s{4,}\*\s+\*\*([^*]+)\*\*[:：]?\s*([^]*?)(?=^\s{4,}\*|^\S|$)/gm, 
      `<div class="ml-8 mb-4 p-4 ${currentColors.subCard} rounded-lg border shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-start">
          <span class="flex-shrink-0 w-2 h-2 ${currentColors.title} rounded-full mr-3 mt-2"></span>
          <div class="flex-1">
            <div class="font-semibold text-gray-800 mb-2 text-sm">$1</div>
            <div class="text-gray-600 text-sm leading-relaxed">$2</div>
          </div>
        </div>
      </div>`);
    
    // 处理简单的编号段落 - 更清晰的分隔
    text = text.replace(/^(\d+\.)\s+([^<][^]*?)(?=^\d+\.|$)/gm, 
      `<div class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div class="flex items-start">
          <span class="flex-shrink-0 font-bold text-gray-800 mr-3">$1</span>
          <span class="text-gray-700 leading-relaxed">$2</span>
        </div>
      </div>`);
    
    // 清理多余的<br>标签
    text = text.replace(/<br>\s*<br>/g, '<br>');
    text = text.replace(/(<\/div>)<br>/g, '$1');
    text = text.replace(/<br>(\s*<div)/g, '$1');
    
    return text;
  };

  return (
    <div 
      className="space-y-4" 
      dangerouslySetInnerHTML={{ __html: formatText(content) }}
    />
  );
};

function App() {
  const [formData, setFormData] = useState({
    // 第一层：基础信息（必填）
    current_price: '',
    target_price: '',
    city: '',
    district: '',
    property_type: '一居室',
    area: '',
    decoration_level: '简装',
    landlord_type: '个人房东',
    
    // 第二层：市场对比（关键）
    similar_properties_price: '',
    property_advantages: [],
    property_advantages_custom: '',
    property_disadvantages: [],
    property_disadvantages_custom: '',
    
    // 第三层：关系筹码（决定性）
    tenant_status: 'new', // new, renewing
    rental_duration_years: '',
    rental_duration_months: '',
    rental_behaviors: [],
    personal_advantages: [],
    personal_advantages_custom: '',
    
    // 第四层：执行细节（可选）
    urgency: 'normal',
    communication_preference: 'any',
    
    // 技术配置
    model_name: 'gemini-2.5-flash'
  });

  const [availableModels, setAvailableModels] = useState([]);
  const [modelDescriptions, setModelDescriptions] = useState({});

  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    success: 'success',
    actual_price: '',
    feedback_text: '',
    rating: 5
  });

  // 获取可用模型列表
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get('/models');
        setAvailableModels(response.data.models);
        setModelDescriptions(response.data.descriptions);
      } catch (err) {
        console.error('获取模型列表失败:', err);
      }
    };
    fetchModels();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 构建详细的上下文信息
      const location = `${formData.city}${formData.district ? formData.district : ''}`;
      const propertyDesc = `${formData.property_type}，${formData.area}平米，${formData.decoration_level}`;
      
      // 处理多选数据
      const propertyAdvantages = [...(formData.property_advantages || []), formData.property_advantages_custom].filter(Boolean).join('、');
      const propertyDisadvantages = [...(formData.property_disadvantages || []), formData.property_disadvantages_custom].filter(Boolean).join('、');
      
      let rentalHistory = '';
      if (formData.tenant_status === 'renewing') {
        const duration = formData.rental_duration_years ? 
          `${formData.rental_duration_years}年${formData.rental_duration_months ? formData.rental_duration_months + '个月' : ''}` : '';
        const behaviors = (formData.rental_behaviors || []).join('、');
        rentalHistory = [duration, behaviors].filter(Boolean).join('，');
      }
      
      const personalAdvantages = [...(formData.personal_advantages || []), formData.personal_advantages_custom].filter(Boolean).join('、');
      
      const contextInfo = [
        `位置：${location}`,
        `房屋：${propertyDesc}`,
        `同类房源价格：${formData.similar_properties_price}`,
        propertyAdvantages && `房屋优势：${propertyAdvantages}`,
        propertyDisadvantages && `房屋劣势：${propertyDisadvantages}`,
        `租客身份：${formData.tenant_status === 'new' ? '新租客' : '续租老租客'}`,
        rentalHistory && `租住历史：${rentalHistory}`,
        personalAdvantages && `个人优势：${personalAdvantages}`,
        `沟通方式：${formData.communication_preference}`
      ].filter(Boolean).join('；');

      const requestData = {
        property_info: {
          location: location,
          current_price: parseInt(formData.current_price),
          property_type: formData.property_type,
          area: parseInt(formData.area) || null,
          description: propertyDesc,
          landlord_type: formData.landlord_type
        },
        user_budget: parseInt(formData.target_price),
        urgency: formData.urgency,
        additional_info: contextInfo,
        model_name: formData.model_name
      };

      const response = await axios.post('/negotiate', requestData);
      setAdvice(response.data);
      setShowFeedback(false);
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

  const handleCheckboxChange = (category, value) => {
    const currentValues = formData[category] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    setFormData({
      ...formData,
      [category]: newValues
    });
  };

  // 勾选组件
  const CheckboxGroup = ({ title, category, options, customFieldName, placeholder, colorClass = "blue" }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">{title}</label>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => (
            <label
              key={option}
              className={`flex items-center cursor-pointer p-3 rounded-lg border-2 transition-all ${
                formData[category]?.includes(option)
                  ? `border-${colorClass}-500 bg-${colorClass}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData[category]?.includes(option) || false}
                onChange={() => handleCheckboxChange(category, option)}
                className="sr-only"
              />
              <span className="text-sm">{option}</span>
              {formData[category]?.includes(option) && (
                <span className={`ml-auto text-${colorClass}-500`}>✓</span>
              )}
            </label>
          ))}
        </div>
        {customFieldName && (
          <div className="mt-3">
            <input
              type="text"
              name={customFieldName}
              value={formData[customFieldName] || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${colorClass}-500 text-sm`}
              placeholder={placeholder}
            />
          </div>
        )}
      </div>
    </div>
  );

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!advice || !advice.session_id) return;

    try {
      const feedbackRequest = {
        session_id: advice.session_id,
        success: feedbackData.success,
        actual_price: feedbackData.actual_price ? parseInt(feedbackData.actual_price) : null,
        feedback_text: feedbackData.feedback_text || null,
        rating: parseInt(feedbackData.rating)
      };

      await axios.post('/feedback', feedbackRequest);
      alert('谢谢您的反馈！这将帮助我们改进服务。');
      setShowFeedback(false);
      
      setFeedbackData({
        success: 'success',
        actual_price: '',
        feedback_text: '',
        rating: 5
      });
    } catch (err) {
      alert('提交反馈失败，请稍后重试');
    }
  };

  const handleFeedbackChange = (e) => {
    setFeedbackData({
      ...feedbackData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI租房砍价助手
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            基于核心谈判要素的系统化分析，为您制定最优砍价策略
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center"><span className="text-green-500 mr-2">✓</span>系统化分析</div>
            <div className="flex items-center"><span className="text-green-500 mr-2">✓</span>核心要素覆盖</div>
            <div className="flex items-center"><span className="text-green-500 mr-2">✓</span>个性化策略</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 表单区域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">谈判要素分析</h2>
                <p className="text-gray-500">系统填写核心信息，AI基于专业框架制定策略</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 第一层：基础信息 */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                    基础信息 <span className="ml-2 text-sm text-red-500">*必填</span>
                  </h3>
                  
                  {/* 价格对比 */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        当前报价 *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="current_price"
                          value={formData.current_price}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                          placeholder="6000"
                          required
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">元/月</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        目标价格 *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="target_price"
                          value={formData.target_price}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                          placeholder="5200"
                          required
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">元/月</span>
                      </div>
                    </div>
                  </div>

                  {/* 位置信息 */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        城市 *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="北京"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        区域
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="朝阳区"
                      />
                    </div>
                  </div>

                  {/* 房屋信息 */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        户型 *
                      </label>
                      <select
                        name="property_type"
                        value={formData.property_type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="一居室">一居室</option>
                        <option value="两居室">两居室</option>
                        <option value="三居室">三居室</option>
                        <option value="整租">整租</option>
                        <option value="合租">合租</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        面积 *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="area"
                          value={formData.area}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="54"
                          required
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">㎡</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        装修 *
                      </label>
                      <select
                        name="decoration_level"
                        value={formData.decoration_level}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="简装">简装</option>
                        <option value="精装">精装</option>
                        <option value="豪装">豪装</option>
                        <option value="毛坯">毛坯</option>
                      </select>
                    </div>
                  </div>

                  {/* 房东类型 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      房东类型 *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: '个人房东', desc: '直接与房东沟通' },
                        { value: '中介', desc: '通过中介代理' }
                      ].map(option => (
                        <label key={option.value} className={`relative flex cursor-pointer rounded-lg p-4 border-2 transition-all ${
                          formData.landlord_type === option.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            name="landlord_type"
                            value={option.value}
                            checked={formData.landlord_type === option.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className="text-center w-full">
                            <div className="text-sm font-medium text-gray-900">{option.value}</div>
                            <div className="text-xs text-gray-500">{option.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 第二层：市场对比 */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                    市场对比 <span className="ml-2 text-sm text-red-500">*砍价核心依据</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        同类房源价格范围 *
                      </label>
                      <textarea
                        name="similar_properties_price"
                        value={formData.similar_properties_price}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="例如：同小区同户型在2500-2800元，某某房源2600元但带家具，某某房源2400元但在1楼"
                        required
                      />
                      <p className="text-xs text-gray-600 mt-1">💡 这是砍价的核心武器！请提供3-5个具体价格对比</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <CheckboxGroup
                        title="房屋优势"
                        category="property_advantages"
                        options={[
                          "临近地铁",
                          "家具家电齐全",
                          "南向采光好",
                          "精装修",
                          "安静环境",
                          "有电梯",
                          "停车方便",
                          "周边配套完善"
                        ]}
                        customFieldName="property_advantages_custom"
                        placeholder="其他优势（可自定义）"
                        colorClass="green"
                      />
                      
                      <CheckboxGroup
                        title="房屋劣势"
                        category="property_disadvantages"
                        options={[
                          "客厅无空调",
                          "老小区无电梯",
                          "噪音较大",
                          "采光一般",
                          "商用水电",
                          "步梯房",
                          "朝北户型",
                          "设施老旧"
                        ]}
                        customFieldName="property_disadvantages_custom"
                        placeholder="其他劣势（可自定义）"
                        colorClass="red"
                      />
                    </div>
                  </div>
                </div>

                {/* 第三层：关系筹码 */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                    关系筹码 <span className="ml-2 text-sm text-red-500">*决定策略方向</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        租客身份 *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'new', label: '新租客', desc: '首次租房，看房阶段' },
                          { value: 'renewing', label: '续租老租客', desc: '已居住，准备续约' }
                        ].map(option => (
                          <label key={option.value} className={`relative flex cursor-pointer rounded-lg p-4 border-2 transition-all ${
                            formData.tenant_status === option.value 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <input
                              type="radio"
                              name="tenant_status"
                              value={option.value}
                              checked={formData.tenant_status === option.value}
                              onChange={handleInputChange}
                              className="sr-only"
                            />
                            <div className="text-center w-full">
                              <div className="text-sm font-medium text-gray-900">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {formData.tenant_status === 'renewing' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            租住时长
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <select
                                name="rental_duration_years"
                                value={formData.rental_duration_years}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="">选择年份</option>
                                <option value="0">不满1年</option>
                                <option value="1">1年</option>
                                <option value="2">2年</option>
                                <option value="3">3年</option>
                                <option value="4">4年</option>
                                <option value="5">5年以上</option>
                              </select>
                            </div>
                            <div>
                              <select
                                name="rental_duration_months"
                                value={formData.rental_duration_months}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="">额外月份</option>
                                <option value="0">整年</option>
                                <option value="1">+1个月</option>
                                <option value="2">+2个月</option>
                                <option value="3">+3个月</option>
                                <option value="6">+半年</option>
                                <option value="9">+9个月</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        <CheckboxGroup
                          title="租住表现"
                          category="rental_behaviors"
                          options={[
                            "按时交租",
                            "爱护房屋", 
                            "从未投诉",
                            "主动维护",
                            "邻里和睦",
                            "配合检查",
                            "及时沟通",
                            "长期居住意愿"
                          ]}
                          colorClass="purple"
                        />
                      </div>
                    )}

                    <CheckboxGroup
                      title="个人谈判筹码"
                      category="personal_advantages"
                      options={[
                        "可立即签约",
                        "愿意长租2年",
                        "现金支付",
                        "稳定工作",
                        "收入证明齐全",
                        "无不良记录",
                        "可预付房租",
                        "灵活配合看房"
                      ]}
                      customFieldName="personal_advantages_custom"
                      placeholder="其他个人优势（可自定义）"
                      colorClass="purple"
                    />
                  </div>
                </div>

                {/* 第四层：执行细节 */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
                    执行细节 <span className="ml-2 text-sm text-gray-500">可选</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        时间压力
                      </label>
                      <select
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="flexible">不着急 - 可以慢慢谈</option>
                        <option value="normal">正常 - 一周内决定</option>
                        <option value="urgent">紧急 - 急需成交</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        沟通偏好
                      </label>
                      <select
                        name="communication_preference"
                        value={formData.communication_preference}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="any">均可 - 灵活沟通</option>
                        <option value="wechat">微信 - 文字沟通</option>
                        <option value="phone">电话 - 语音沟通</option>
                        <option value="face_to_face">面谈 - 当面沟通</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 高级设置 */}
                <details className="border border-gray-200 rounded-lg">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    ⚙️ 高级设置
                  </summary>
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI模型选择
                    </label>
                    <select
                      name="model_name"
                      value={formData.model_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {availableModels.map(model => (
                        <option key={model} value={model}>
                          {model} - {modelDescriptions[model] || ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </details>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all transform hover:scale-105 disabled:hover:scale-100"
                >
                  {loading ? '🤖 AI正在分析中...' : '🚀 获取专业砍价策略'}
                </button>
                
                <p className="text-center text-xs text-gray-500 mt-3">
                  ⚡ 基于4层核心要素分析，通常在5-10秒内生成专业建议
                </p>
              </form>
            </div>
          </div>

          {/* 侧边栏说明 */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 核心要素说明</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                  <div>
                    <div className="font-medium text-gray-900">基础信息</div>
                    <div className="text-gray-600">确定谈判框架和对象类型</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                  <div>
                    <div className="font-medium text-gray-900">市场对比</div>
                    <div className="text-gray-600">砍价的核心武器和理由</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                  <div>
                    <div className="font-medium text-gray-900">关系筹码</div>
                    <div className="text-gray-600">决定整体策略方向</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</div>
                  <div>
                    <div className="font-medium text-gray-900">执行细节</div>
                    <div className="text-gray-600">优化沟通方式和时机</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💡 填写技巧</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div>• <strong>同类房源对比</strong>：提供3-5个具体案例，包含价格和条件差异</div>
                <div>• <strong>续租优势</strong>：强调稳定性和省心程度的经济价值</div>
                <div>• <strong>房屋劣势</strong>：客观描述，不要过度夸大</div>
                <div>• <strong>个人筹码</strong>：量化优势，如"可签2年"、"现金支付"</div>
              </div>
            </div>
          </div>
        </div>

        {/* 结果区域 */}
        {advice && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">🎯 专业砍价策略</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <div className="space-y-8">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-4 translate-x-4"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-4 -translate-x-4"></div>
                <div className="relative">
                  <h3 className="font-bold mb-4 text-xl flex items-center">
                    💰 <span className="ml-2">AI 建议价格</span>
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-bold mb-2">
                        {advice.suggested_price} <span className="text-lg font-normal">元/月</span>
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-sm font-medium">
                            成功概率：{Math.round(advice.success_probability * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                        <div className="text-sm font-medium mb-1">预估收益</div>
                        <div className="text-lg font-bold">
                          ↓ {parseInt(formData.current_price) - advice.suggested_price} 元/月
                        </div>
                        <div className="text-xs opacity-90">
                          年省 {((parseInt(formData.current_price) - advice.suggested_price) * 12).toLocaleString()} 元
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
                  <h3 className="font-bold text-blue-800 mb-4 text-lg flex items-center">
                    🎯 <span className="ml-2">谈判策略</span>
                  </h3>
                  <div className="text-gray-700 text-sm leading-relaxed">
                    <FormattedText content={advice.negotiation_strategy} colorScheme="blue" />
                  </div>
                </div>

                <div className="border border-orange-100 bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl shadow-sm">
                  <h3 className="font-bold text-orange-800 mb-4 text-lg flex items-center">
                    ⚠️ <span className="ml-2">风险评估</span>
                  </h3>
                  <div className="text-orange-700 text-sm leading-relaxed">
                    <FormattedText content={advice.risk_assessment} colorScheme="orange" />
                  </div>
                </div>
              </div>

              <div className="border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-green-800 mb-4 text-lg flex items-center">
                  💬 <span className="ml-2">谈判话术</span>
                </h3>
                <div className="space-y-4">
                  {advice.talking_points.map((point, index) => {
                    // 提取话术标题和内容
                    const colonIndex = point.indexOf('：');
                    const title = colonIndex > 0 ? point.substring(0, colonIndex) : `第${index + 1}步`;
                    const content = colonIndex > 0 ? point.substring(colonIndex + 1) : point;
                    
                    return (
                      <div key={index} className="border border-green-200 bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-green-100 px-4 py-2 border-b border-green-200">
                          <div className="flex items-center">
                            <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full mr-3">
                              {index + 1}
                            </span>
                            <h4 className="font-semibold text-green-800 text-sm">{title}</h4>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="text-gray-700 text-sm leading-relaxed">
                            <FormattedText content={content} colorScheme="green" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-purple-800 mb-4 text-lg flex items-center">
                  📈 <span className="ml-2">市场洞察</span>
                </h3>
                <div className="text-purple-700 text-sm leading-relaxed">
                  <FormattedText content={advice.market_insights} colorScheme="purple" />
                </div>
              </div>

              {/* 反馈区域保持不变 */}
              {!showFeedback ? (
                <div className="text-center">
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="bg-blue-100 text-blue-700 px-6 py-2 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    💬 分享您的谈判结果
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    您的反馈将帮助我们改进AI建议的准确性
                  </p>
                </div>
              ) : (
                <div className="border border-blue-200 bg-blue-50 p-4 rounded-md">
                  <h3 className="font-semibold text-blue-800 mb-3">💬 谈判结果反馈</h3>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        谈判结果
                      </label>
                      <select
                        name="success"
                        value={feedbackData.success}
                        onChange={handleFeedbackChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="success">成功砍价</option>
                        <option value="partial">部分成功</option>
                        <option value="failed">砍价失败</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        实际成交价格 (元/月)
                      </label>
                      <input
                        type="number"
                        name="actual_price"
                        value={feedbackData.actual_price}
                        onChange={handleFeedbackChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="如果成交，请填写实际价格"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        评分 (1-5分)
                      </label>
                      <select
                        name="rating"
                        value={feedbackData.rating}
                        onChange={handleFeedbackChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ 非常有用</option>
                        <option value="4">⭐⭐⭐⭐ 比较有用</option>
                        <option value="3">⭐⭐⭐ 一般</option>
                        <option value="2">⭐⭐ 不太有用</option>
                        <option value="1">⭐ 没有帮助</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        补充说明 (可选)
                      </label>
                      <textarea
                        name="feedback_text"
                        value={feedbackData.feedback_text}
                        onChange={handleFeedbackChange}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请分享您的谈判经历或对AI建议的看法..."
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        提交反馈
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowFeedback(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        取消
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="text-center text-gray-400 mt-12 text-sm">
          <p>🎯 基于专业谈判要素的系统化分析，让砍价更科学更有效</p>
        </footer>
      </div>
    </div>
  );
}

export default App;