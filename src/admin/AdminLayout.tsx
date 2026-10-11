import React, { useState } from 'react';
import { User, Category } from '../types/news';
import { DashboardOverview } from './DashboardOverview';
import { ArticleList } from './ArticleList';
import { ArticleEditor } from './ArticleEditor';
import { CategoryManager } from './CategoryManager';
import { BreakingManager } from './BreakingManager';
import { MediaLibrary } from './MediaLibrary';
import { AdManager } from './AdManager';
import { SocialPublishing } from './SocialPublishing';
import { SettingsManager } from './SettingsManager';
import {
  LayoutDashboard,
  FileText,
  Folder,
  Flame,
  Image as ImageIcon,
  DollarSign,
  Share2,
  Sliders,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';

interface AdminLayoutProps {
  currentUser: User;
  categories: Category[];
  onLogout: () => void;
  onViewLiveSite: () => void;
  onViewArticleLive: (slug: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  categories,
  onLogout,
  onViewLiveSite,
  onViewArticleLive,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleEditArticle = (id: number) => {
    setEditingArticleId(id);
    setActiveTab('article_edit');
  };

  const handleNewArticle = () => {
    setEditingArticleId(null);
    setActiveTab('article_new');
  };

  const handleSavedArticle = () => {
    setActiveTab('articles');
  };

  const navItems = [
    { id: 'overview', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, roles: ['super_admin', 'editor', 'reporter'] },
    { id: 'articles', label: 'সংবাদ ব্যবস্থাপনা', icon: FileText, roles: ['super_admin', 'editor', 'reporter'] },
    { id: 'breaking', label: 'ব্রেকিং নিউজ', icon: Flame, roles: ['super_admin', 'editor'] },
    { id: 'categories', label: 'বিভাগসমূহ', icon: Folder, roles: ['super_admin', 'editor'] },
    { id: 'media', label: 'মিডিয়া লাইব্রেরি', icon: ImageIcon, roles: ['super_admin', 'editor', 'reporter'] },
    { id: 'ads', label: 'বিজ্ঞাপন ও Adsterra', icon: DollarSign, roles: ['super_admin'] },
    { id: 'social', label: 'ফেসবুক ও সোশ্যাল', icon: Share2, roles: ['super_admin', 'editor'] },
    { id: 'settings', label: 'পত্রিকার সেটিংস ও লোগো', icon: Sliders, roles: ['super_admin'] },
  ];

  const allowedNavItems = navItems.filter((item) => item.roles.includes(currentUser.role));

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview
            onNavigateTab={setActiveTab}
            onEditArticle={handleEditArticle}
          />
        );
      case 'articles':
        return (
          <ArticleList
            onNewArticle={handleNewArticle}
            onEditArticle={handleEditArticle}
            onViewLive={onViewArticleLive}
            userRole={currentUser.role}
          />
        );
      case 'article_new':
      case 'article_edit':
        return (
          <ArticleEditor
            articleId={activeTab === 'article_edit' ? editingArticleId : null}
            categories={categories}
            userRole={currentUser.role}
            userFullName={currentUser.fullName}
            onBack={() => setActiveTab('articles')}
            onSaved={handleSavedArticle}
          />
        );
      case 'categories':
        return <CategoryManager />;
      case 'breaking':
        return <BreakingManager />;
      case 'media':
        return <MediaLibrary />;
      case 'ads':
        return <AdManager />;
      case 'social':
        return <SocialPublishing />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <DashboardOverview onNavigateTab={setActiveTab} onEditArticle={handleEditArticle} />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'প্রধান সম্পাদক (Super Admin)';
      case 'editor':
        return 'বার্তা সম্পাদক (Editor)';
      case 'reporter':
        return 'প্রতিনিধি (Reporter)';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-bangla">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" />
          <span className="font-headline font-bold text-base text-white">কুষ্টিয়া দিগন্ত নিউজরুম</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-30`}
      >
        {/* Brand Lockup */}
        <div className="p-5 border-b border-slate-800 hidden md:block">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider font-sans">Newsroom Admin</span>
          </div>
          <h1 className="text-xl font-headline font-bold text-white">দৈনিক কুষ্টিয়া দিগন্ত</h1>
        </div>

        {/* Current User Info */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {currentUser.fullName.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-white text-xs truncate">{currentUser.fullName}</div>
            <div className="text-[10px] text-amber-400 truncate">{getRoleBadge(currentUser.role)}</div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="p-3 flex-1 space-y-1 text-xs">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === 'articles' && (activeTab === 'article_new' || activeTab === 'article_edit'));
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-red-700 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1 text-xs">
          <button
            type="button"
            onClick={onViewLiveSite}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>মূল পত্রিকা দেখুন</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};
