import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  ThumbsUp,
  Plus,
  X,
  User,
  ArrowLeft,
  LogOut,
  Tag,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const ForumBoard: React.FC = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsString, setTagsString] = useState('');

  // Replies states
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');

  const fetchForumPosts = async (tagFilter: string = '') => {
    try {
      setLoading(true);
      const url = tagFilter ? `/forum?tag=${tagFilter}` : '/forum';
      const res = await api.get(url);
      setPosts(res.data.data.posts || []);
    } catch {
      showNotice('Failed to load forum topics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForumPosts(selectedTag);
  }, [selectedTag]);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    try {
      const tags = tagsString
        ? tagsString.split(',').map(t => t.trim()).filter(t => t !== '')
        : [];
      
      const res = await api.post('/forum', { title, body, tags });
      setPosts(prev => [res.data.data.post, ...prev]);
      showNotice('Topic published successfully!');
      
      // Reset
      setTitle('');
      setBody('');
      setTagsString('');
      setCreateOpen(false);
    } catch {
      showNotice('Failed to publish forum topic', 'error');
    }
  };

  const handlePostReply = async (postId: string) => {
    if (!replyBody.trim()) return;

    try {
      const res = await api.post(`/forum/${postId}/replies`, { body: replyBody });
      setPosts(prev => prev.map(p => (p._id === postId ? res.data.data.post : p)));
      setReplyBody('');
      setActiveReplyPostId(null);
      showNotice('Reply posted successfully!');
    } catch {
      showNotice('Failed to publish reply', 'error');
    }
  };

  const handleToggleUpvote = async (postId: string) => {
    try {
      const res = await api.post(`/forum/${postId}/upvote`);
      setPosts(prev => prev.map(p => (p._id === postId ? res.data.data.post : p)));
    } catch {
      showNotice('Failed to toggle upvote', 'error');
    }
  };

  const popularTags = ['All', 'PlacementTips', 'InterviewPrep', 'JobFaqs', 'PrepMaterial'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      
      {/* Toast Alert */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm animate-fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400'
            : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-800 dark:text-rose-455'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">CF</div>
            <span className="font-bold text-base text-foreground">CareerFlow AI <span className="text-muted-foreground text-xs font-normal">Discussion Forum</span></span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground px-3.5 text-xs font-bold transition-all gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Console Home
            </Link>
            <ThemeToggle />
            <button
              onClick={() => logout()}
              className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground px-3.5 text-sm font-medium transition-colors gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-white dark:bg-slate-900 border-b py-8 text-left">
        <div className="container mx-auto px-6 max-w-5xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">University Community Forums</h2>
            <p className="text-sm text-indigo-650 dark:text-indigo-400 font-semibold">Share preparation resources, ask placement questions, and discuss prep strategies.</p>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 text-xs font-bold gap-1.5 shadow-sm shadow-indigo-600/10 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Start Discussion
          </button>
        </div>
      </section>

      {/* Main Boards Section */}
      <main className="flex-grow container mx-auto px-6 py-8 max-w-5xl grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Side Tag Filters */}
        <aside className="space-y-4 text-left order-2 md:order-1">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Tag className="h-3.5 w-3.5 text-indigo-500" /> Filter by Topics
          </h3>
          <div className="flex flex-wrap md:flex-col gap-2">
            {popularTags.map(tag => {
              const isActive = (tag === 'All' && !selectedTag) || selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === 'All' ? '' : tag)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border text-left transition-all ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-650 text-white shadow-sm shadow-indigo-600/10'
                      : 'bg-white dark:bg-slate-900 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
                  }`}
                >
                  {tag === 'All' ? 'All Threads' : `# ${tag}`}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Side Posts Feed */}
        <section className="md:col-span-3 space-y-4 order-1 md:order-2 text-left">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2.5 text-muted-foreground text-xs font-semibold">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <span>Loading forum topics...</span>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => {
              const isUpvoted = user ? post.upvotes?.includes(user.id) : false;
              const isReplying = activeReplyPostId === post._id;

              return (
                <div key={post._id} className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm space-y-4">
                  {/* Post Details */}
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg leading-tight">{post.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-0.5">
                      <span className="flex items-center gap-0.5"><User className="h-3 w-3" /> {post.author?.name} ({post.author?.role})</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">{post.body}</p>

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((t: string) => (
                        <span key={t} className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 px-2 py-0.5 border rounded-full text-slate-500">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Upvotes & Replies Footer Controls */}
                  <div className="border-t pt-3.5 flex items-center gap-4 text-xs font-bold">
                    <button
                      onClick={() => handleToggleUpvote(post._id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                        isUpvoted
                          ? 'border-indigo-200/50 bg-indigo-50 text-indigo-650 dark:bg-indigo-950/20'
                          : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>Upvote ({post.upvotes?.length || 0})</span>
                    </button>

                    <button
                      onClick={() => setActiveReplyPostId(isReplying ? null : post._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Reply ({post.replies?.length || 0})</span>
                    </button>
                  </div>

                  {/* Nested Replies Section */}
                  {(post.replies?.length > 0 || isReplying) && (
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 space-y-3">
                      
                      {/* Replies List */}
                      {post.replies?.length > 0 && (
                        <div className="space-y-3 divide-y divide-slate-200/50 dark:divide-slate-800/50">
                          {post.replies.map((reply: any, idx: number) => (
                            <div key={idx} className={`text-xs space-y-1 ${idx > 0 ? 'pt-3' : ''}`}>
                              <div className="flex justify-between items-baseline">
                                <span className="font-extrabold">{reply.author?.name} ({reply.author?.role})</span>
                                <span className="text-[9px] text-muted-foreground font-semibold">{new Date(reply.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-medium">{reply.body}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Submission Input */}
                      {isReplying && (
                        <div className="pt-2 flex gap-2">
                          <input
                            type="text"
                            className="flex-grow px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Type your reply message..."
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                          />
                          <button
                            onClick={() => handlePostReply(post._id)}
                            className="h-8 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shrink-0"
                          >
                            Post Reply
                          </button>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-xs text-muted-foreground border border-dashed rounded-2xl bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-2">
              <MessageSquare className="h-8 w-8 text-slate-300" />
              No discussions matching this tag filter have been posted.
            </div>
          )}
        </section>

      </main>

      {/* Create Post Dialog Overlay */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in text-left">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-base font-bold">Start Discussion Topic</h3>
              <button onClick={() => setCreateOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                  Thread Title
                </label>
                <input
                  type="text"
                  required
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Google Software Engineer Interview Process FAQ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                  Description Details
                </label>
                <textarea
                  rows={6}
                  required
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Elaborate on prep materials, questions, or details to start the thread..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                  Tags (comma separated list)
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. PlacementTips, InterviewPrep"
                  value={tagsString}
                  onChange={(e) => setTagsString(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="h-10 px-4 border rounded-lg hover:bg-muted text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                >
                  Publish Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default ForumBoard;
