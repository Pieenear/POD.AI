import React, { useState } from 'react';
import { MessageSquare, Send, Users } from 'lucide-react';

export const StudentMessages: React.FC = () => {
  const [threads, setThreads] = useState([
    {
      id: 'thread-1',
      name: 'Placement cell Notice Group',
      lastMsg: 'Dr. Aris: Please verify your CGPA before July 10.',
      unread: true,
      members: ['Dr. Aris Thorne', 'All Batches'],
      messages: [
        { sender: 'Dr. Aris Thorne', role: 'Placement Officer', body: 'Welcome batches. Notice alerts regarding incoming recruiter registration will be shared here.', time: 'July 1, 10:00 AM' },
        { sender: 'Dr. Aris Thorne', role: 'Placement Officer', body: 'Please review and verify your CGPA and branch specialization inputs in your Profile before July 10. Incomplete registrations will be locked.', time: 'Today, 2:15 PM' }
      ]
    },
    {
      id: 'thread-2',
      name: 'Cognizant Drive Coordinator',
      lastMsg: 'Cognizant HR: Coding test keys will be released soon.',
      unread: false,
      members: ['Cognizant HR', 'CSE Coordinate Staff'],
      messages: [
        { sender: 'System Coordinator', role: 'CareerFlow Bot', body: 'Cognizant drive activated. Student resumes matching CSE eligibility criteria have been synced.', time: 'Yesterday, 9:00 AM' },
        { sender: 'Cognizant HR', role: 'Hiring Recruiter', body: 'Welcome shortlisted candidates. Coding test keys will be released inside the Assessments portal soon. Please keep default resumes vetted.', time: 'Yesterday, 4:40 PM' }
      ]
    }
  ]);

  const [activeThreadId, setActiveThreadId] = useState('thread-1');
  const [messageText, setMessageText] = useState('');

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    // Add message
    const newMsg = {
      sender: 'You',
      role: 'Student Candidate',
      body: messageText.trim(),
      time: 'Just now'
    };

    setThreads(prev => prev.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          lastMsg: `You: ${messageText.trim()}`,
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    }));
    setMessageText('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col border bg-card text-card-foreground rounded-2xl overflow-hidden shadow-sm select-none">
      
      <div className="flex-grow flex divide-x divide-border">
        
        {/* Left Side: Threads list */}
        <div className="w-full md:w-80 flex flex-col justify-between bg-secondary/10">
          <div className="p-4 border-b text-left bg-secondary/20">
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
              <MessageSquare className="h-4.5 w-4.5 text-primary" />
              Direct Discussions
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Communication channels for active drives.</p>
          </div>
          
          <div className="flex-grow overflow-y-auto divide-y divide-border/60">
            {threads.map((t) => {
              const active = t.id === activeThreadId;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveThreadId(t.id);
                    // Mark as read
                    setThreads(prev => prev.map(th => th.id === t.id ? { ...th, unread: false } : th));
                  }}
                  className={`p-4 text-left cursor-pointer transition-colors relative hover:bg-secondary/35 ${
                    active ? 'bg-primary/5 text-primary' : 'bg-card'
                  }`}
                >
                  {t.unread && (
                    <span className="absolute top-4 right-4 h-2 w-2 bg-accent rounded-full animate-pulse" />
                  )}
                  <p className="font-extrabold text-xs text-foreground line-clamp-1">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1 font-semibold">{t.lastMsg}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="hidden md:flex flex-grow flex-col justify-between">
          
          {/* Thread Header */}
          <div className="p-4 border-b flex justify-between items-center bg-secondary/10">
            <div className="text-left">
              <h4 className="font-extrabold text-xs text-foreground">{activeThread.name}</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {activeThread.members.length} participants connected
              </p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-secondary px-3 py-1 rounded-lg">
              <Users className="h-3.5 w-3.5" />
              <span>Group Chat</span>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4 text-xs font-semibold">
            {activeThread.messages.map((msg, idx) => {
              const isMe = msg.sender === 'You';
              return (
                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-200">{msg.sender}</span>
                    <span className="text-[8px] text-muted-foreground uppercase bg-secondary px-1.5 py-0.5 rounded">{msg.role}</span>
                  </div>
                  <div className={`p-3 rounded-2xl max-w-md text-left font-medium leading-relaxed shadow-xxs ${
                    isMe 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-secondary/40 text-foreground border rounded-tl-none'
                  }`}>
                    {msg.body}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">{msg.time}</span>
                </div>
              );
            })}
          </div>

          {/* Text Input Panel */}
          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-3 bg-card">
            <input
              type="text"
              placeholder="Write a message..."
              className="flex-grow border rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-secondary/15"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
            />
            <button
              type="submit"
              className="h-9 w-9 bg-primary hover:bg-primary/95 text-primary-foreground flex items-center justify-center rounded-xl shadow-sm transition-transform active:scale-95 shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
export default StudentMessages;
