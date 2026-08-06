import React from 'react';
import { BrainCircuit, Send } from 'lucide-react';

const StudentAIAssistantTab = ({ aiChat, handleSendAi, aiInput, setAiInput }) => {
  return (
    <div className="tab-pane">
      <div className="ai-chat-section card-box" style={{ height: '560px' }}>
        <div className="ai-chat-header" style={{ paddingBottom: '16px', marginBottom: '16px' }}>
          <BrainCircuit size={24} style={{ color: 'var(--accent-orange)' }} />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Assistant Pédagogique IA</h3>
            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 700 }}>● En ligne - Conseil personnalisé</span>
          </div>
        </div>

        <div className="ai-chat-messages" style={{ padding: '12px 4px' }}>
          {aiChat.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role}`}>
              <div className="bubble-content">
                <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendAi} className="ai-chat-input-form" style={{ marginTop: '12px', paddingTop: '16px' }}>
          <input 
            type="text" 
            placeholder="Posez une question sur votre orientation post-BAC, vos révisions, vos notes..." 
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            style={{ borderRadius: '10px', padding: '12px 16px', fontSize: '13px' }}
          />
          <button type="submit" style={{ background: 'linear-gradient(135deg, #131e6c, #2a3a9e)', color: 'white', borderRadius: '10px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentAIAssistantTab;
