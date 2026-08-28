import { useState } from 'react';
import './App.css';
import SpriteSheetCharacter from './components/SpriteSheetCharacter';

// SVG Icon Components
const ContentGridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#6b9bef" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28}}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const EcommerceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28}}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
    <path d="M10 12a2 2 0 00-2 2v2h4v-2a2 2 0 00-2-2z" fill="#8b5cf6" opacity="0.3"/>
  </svg>
);

const UIIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28}}>
    <rect x="2" y="3" width="20" height="4" rx="1" />
    <rect x="2" y="7" width="20" height="14" rx="1.5" />
    <circle cx="5" cy="5" r="0.5" fill="#3b82f6" />
    <circle cx="8" cy="5" r="0.5" fill="#3b82f6" />
    <circle cx="11" cy="5" r="0.5" fill="#3b82f6" />
    <rect x="5" y="11" width="6" height="2" rx="0.5" fill="#3b82f6" opacity="0.3"/>
    <rect x="5" y="15" width="4" height="2" rx="0.5" fill="#3b82f6" opacity="0.2"/>
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28}}>
    <path d="M4 4h16v16H4z" rx="2" />
    <path d="M4 8l16-4M4 12l16 4M4 16l16-4" opacity="0.4"/>
    <polygon points="10,9 10,15 15,12" fill="#10b981" opacity="0.6"/>
  </svg>
);

const BrandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28}}>
    <path d="M12 2L3 7v10l9 5 9-5V7z" />
    <path d="M12 22V10" />
    <path d="M3 7l9 5 9-5" opacity="0.5"/>
    <polygon points="12,10 10,14 14,14" fill="#f59e0b" opacity="0.5"/>
  </svg>
);

const AIIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28}}>
    <circle cx="12" cy="12" r="9" />
    <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)" opacity="0.5"/>
    <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" opacity="0.5"/>
    <text x="12" y="15" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#6366f1" stroke="none">AI</text>
  </svg>
);

function SmartCard({ icon, title, children, className }) {
  return (
    <div className={`card ${className || ''}`}>
      <div className="card-icon-wrap">{icon}</div>
      <div className="card-title">{title}</div>
      <ul className="card-list">{children}</ul>
    </div>
  );
}

function App() {
  const [activeNav, setActiveNav] = useState(0);

  return (
    <div className="page-wrapper">
      {/* Navigation */}
      <nav className="nav-bar">
        <span
          className={`nav-pill ${activeNav === 0 ? 'active' : ''}`}
          onClick={() => setActiveNav(0)}
        >
          导航栏
        </span>
        <span
          className={`nav-pill ${activeNav === 1 ? 'active' : ''}`}
          onClick={() => setActiveNav(1)}
        >
          导航栏
        </span>
      </nav>

      {/* Title Area */}
      <div className="title-area">
        <div className="title-pill">标题区</div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Mouse-following Character */}
        <div className="character-area">
          <SpriteSheetCharacter size={360} />
        </div>

        {/* Floating Cards */}
        <div className="cards-container">
          <div className="card card-content-group">
            <div className="card-icon-wrap icon-blue">
              <ContentGridIcon />
            </div>
            <div className="card-title">内容卡片组</div>
            <div className="mini-grid">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="mini-grid-item" />
              ))}
            </div>
          </div>

          <SmartCard
            className="card-ecommerce"
            icon={<EcommerceIcon />}
            title="电商设计卡片"
          >
            <li>商品详情页设计</li>
            <li>活动 Banner 制作</li>
            <li>店铺装修美化</li>
          </SmartCard>

          <SmartCard
            className="card-ui"
            icon={<UIIcon />}
            title="UI设计卡片"
          >
            <li>移动端界面设计</li>
            <li>网页交互原型</li>
            <li>图标与视觉规范</li>
          </SmartCard>

          <SmartCard
            className="card-video"
            icon={<VideoIcon />}
            title="视频设计卡片"
          >
            <li>短视频封面设计</li>
            <li>动态视觉特效</li>
            <li>片头片尾制作</li>
          </SmartCard>

          <SmartCard
            className="card-brand"
            icon={<BrandIcon />}
            title="品牌设计卡片"
          >
            <li>Logo 设计与品牌识别</li>
            <li>VI 视觉系统搭建</li>
            <li>品牌物料延展</li>
          </SmartCard>

          <SmartCard
            className="card-ai"
            icon={<AIIcon />}
            title="AI定制卡片"
          >
            <li>AI 图像生成创作</li>
            <li>智能文案生成</li>
            <li>个性化设计推荐</li>
          </SmartCard>
        </div>
      </div>
    </div>
  );
}

export default App;