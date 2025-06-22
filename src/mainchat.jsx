import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

const CoachRaman = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const sendMessage = async (messageText) => {
    if (!apiKey) {
      alert('Please enter your OpenAI API key first');
      setShowSettings(true);
      return;
    }

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = `You are Coach Raman, a warm and compassionate AI assistant who helps families communicate better with loved ones who have dementia. You speak with patience, understanding, and practical wisdom gained from years of caregiving experience. Keep responses conversational and supportive.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
            userMessage
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = { 
        role: 'assistant', 
        content: data.choices[0].message.content 
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (input.trim()) {
      sendMessage(input.trim());
    }
  };

  if (showSettings) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
        <h2>Enter OpenAI API Key</h2>
        <input 
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc' }}
        />
        <button 
          onClick={() => setShowSettings(false)}
          disabled={!apiKey}
          style={{ width: '100%', padding: '10px', backgroundColor: apiKey ? '#007bff' : '#ccc', color: 'white', border: 'none' }}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Coach Raman</h1>
        <button onClick={() => setShowSettings(true)} style={{ padding: '5px 10px' }}>
          Settings
        </button>
      </div>
      
      <div style={{ height: '400px', border: '1px solid #ccc', padding: '10px', marginBottom: '10px', overflowY: 'scroll' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '15px', padding: '10px', backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5', borderRadius: '5px' }}>
            <strong>{msg.role === 'user' ? 'You' : 'Coach Raman'}:</strong> 
            <div style={{ marginTop: '5px' }}>{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
            Coach Raman is thinking...
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
          placeholder="Type your message..."
          style={{ flex: 1, padding: '10px', border: '1px solid #ccc' }}
          disabled={isLoading}
        />
        <button 
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
          style={{ padding: '10px 20px', backgroundColor: (!isLoading && input.trim()) ? '#007bff' : '#ccc', color: 'white', border: 'none' }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<CoachRaman />);