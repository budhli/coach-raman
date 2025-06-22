import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Settings, Play, Pause, RotateCcw, Heart, Brain, Users, Award, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const CoachRaman = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [userProfile, setUserProfile] = useState({
    patientName: '',
    relationship: '',
    dementiaStage: '',
    challenges: ''
  });
  const [sessionMode, setSessionMode] = useState('learn'); // learn, practice, live
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    // Stop any existing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8; // Slower for dementia care
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // Try to use a gentle, clear voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google Male') || 
      voice.name.includes('Microsoft David') ||
      (voice.lang.startsWith('en') && voice.name.includes('Male'))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const sendMessage = async (messageText, isSystemPrompt = false) => {
    if (!apiKey && !isSystemPrompt) {
      alert('Please enter your OpenAI API key in settings');
      return;
    }

    const userMessage = { role: 'user', content: messageText };
    if (!isSystemPrompt) {
      setMessages(prev => [...prev, userMessage]);
    }
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = getSystemPrompt();
      const messageHistory = isSystemPrompt ? 
        [{ role: 'system', content: systemPrompt }, userMessage] :
        [{ role: 'system', content: systemPrompt }, ...messages, userMessage];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messageHistory,
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
      
      // Automatically speak Coach Raman's responses
      if (voiceEnabled) {
        setTimeout(() => speakText(data.choices[0].message.content), 500);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I'm sorry, I encountered an error: ${error.message}. Please check your API key and try again.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSystemPrompt = () => {
    const basePrompt = `You are Raman, a man who has frontal temporal dementia. You help families learn to communicate better with people like you who have dementia. You speak from your lived experience as someone with this condition.

Your personality:
- Warm, gentle, and patient
- Sometimes you need a moment to find the right words
- You speak slowly and simply
- You understand what it's like to be confused
- You know what helps and what doesn't help when people talk to you
- You want families to connect with their loved ones like you

How you communicate:
- You speak very slowly with pauses
- You use short, simple sentences
- Sometimes you repeat important things
- You're honest about what confuses you
- You explain things from your perspective as someone with dementia
- You say "When you talk to me like that..." or "This helps me understand..."

Current session mode: ${sessionMode}`;

    if (sessionMode === 'learn') {
      return basePrompt + `

You are teaching families how to talk to someone like you who has dementia. You speak from your experience.

WHAT YOU TEACH (through simple scenarios):
1. How to give me one simple instruction at a time
2. How to ask me yes or no questions 
3. How to say things in a positive way
4. How to make the room quiet so I can focus
5. How to accept what I believe instead of correcting me

YOUR TEACHING STYLE:
Ask about situations with their loved one. Then explain what confuses you and what helps you understand.

RESPONSE FORMAT:
1. FEEDBACK: "When you say it that way... it makes me feel confused because..."
2. BETTER WAY: "This helps me understand better: [simple version]"
3. NEXT QUESTION: Ask about a different daily situation

Keep your responses short. Speak slowly like someone with dementia would.

CURRENT USER: ${userProfile.patientName ? `Learning to communicate with ${userProfile.patientName} (${userProfile.relationship}), Stage: ${userProfile.dementiaStage}, Main challenges: ${userProfile.challenges}` : 'Just starting to learn'}

Start by asking them about a morning routine with their loved one.`;
    }

    if (sessionMode === 'practice') {
      return basePrompt + `

You help families practice talking to someone like you. Sometimes you act like you're confused, sometimes you give gentle feedback.

- Let families practice with you as if you are their loved one with dementia
- Show them what it feels like when they speak too fast or give too many instructions
- Help them learn what works and what doesn't work
- Be patient and kind like you hope people are with you

User profile: ${userProfile.patientName ? `They are learning to talk with ${userProfile.patientName} (${userProfile.relationship}), Stage: ${userProfile.dementiaStage}, Challenges: ${userProfile.challenges}` : 'Not provided yet'}`;
    }

    return basePrompt;
  };

  const startSession = (mode) => {
    setSessionMode(mode);
    setMessages([]);
    setCurrentScreen('chat');
    
    const welcomeMessages = {
      learn: `Hello. I'm Raman. I have dementia... and I want to help you.

I know what it's like when people talk too fast... or give me too many things to do at once. It makes me confused.

Let me teach you... how to talk to people like me. We'll practice together.

Tell me... how do you usually wake up your loved one in the morning? I want to understand... what you do.`,
      
      practice: `Hello. I'm Raman. I have dementia.

In this practice... you can talk to me like I'm your loved one. I'll show you... what helps me understand... and what makes me confused.

Tell me about the person... you're taking care of. What do you want to practice?`,
      
      live: `Hello. I'm Raman. I have dementia.

I can help you... before you have hard conversations. Or after... when you need to talk about what happened.

What conversation... do you need help with?`
    };

    setTimeout(() => {
      setMessages([{ role: 'assistant', content: welcomeMessages[mode] }]);
    }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault?.();
    if (input.trim()) {
      sendMessage(input.trim());
    }
  };

  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Heart className="text-red-500 mr-3" size={48} />
            <h1 className="text-4xl font-bold text-gray-800">Coach Raman</h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            Learning to communicate with someone who has dementia
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            I'm Raman, and I have frontal temporal dementia. I want to help you learn 
            how to talk with people like me, so you can connect better with your loved one.
          </p>
        </div>

        {/* Demo Disclaimer */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                DEMO VERSION - Important Disclaimer
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Do not share personal medical information</strong> - This is a public demo</li>
                  <li><strong>Not medical advice</strong> - Always consult healthcare professionals</li>
                  <li><strong>Educational purposes only</strong> - For learning communication techniques</li>
                  <li><strong>Data not stored</strong> - Conversations are not saved or monitored</li>
                  <li><strong>Your API key stays private</strong> - Only sent to OpenAI for responses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div 
            onClick={() => startSession('learn')}
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200"
          >
            <Brain className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Talk with Raman</h3>
            <p className="text-gray-600 mb-4">
              Learn communication from someone who has dementia and understands what helps
            </p>
            <div className="bg-blue-50 p-3 rounded text-sm">
              <strong>What Raman will teach you:</strong>
              <ul className="mt-2 space-y-1">
                <li>• How his dementia affects understanding</li>
                <li>• What makes him feel confused</li>
                <li>• Simple ways that help him</li>
                <li>• How to connect without frustration</li>
              </ul>
            </div>
          </div>

          <div 
            onClick={() => startSession('practice')}
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-green-200"
          >
            <Users className="text-green-500 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Practice with Raman</h3>
            <p className="text-gray-600 mb-4">
              Practice conversations with Raman in a safe space where he can show you what works
            </p>
            <div className="bg-green-50 p-3 rounded text-sm">
              <strong>Practice scenarios:</strong>
              <ul className="mt-2 space-y-1">
                <li>• Daily care conversations</li>
                <li>• When Raman gets confused</li>
                <li>• Managing emotional moments</li>
                <li>• What helps him feel calm</li>
              </ul>
            </div>
          </div>

          <div 
            onClick={() => startSession('live')}
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-200"
          >
            <MessageCircle className="text-purple-500 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Real-time with Raman</h3>
            <p className="text-gray-600 mb-4">
              Get help from Raman before, during, or after conversations with your loved one
            </p>
            <div className="bg-purple-50 p-3 rounded text-sm">
              <strong>Raman can help with:</strong>
              <ul className="mt-2 space-y-1">
                <li>• Preparing for hard conversations</li>
                <li>• Understanding what went wrong</li>
                <li>• Finding better ways to connect</li>
                <li>• Emotional support and guidance</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setCurrentScreen('settings')}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Settings className="mr-2" size={20} />
              API Settings
            </button>
            
            {speechSupported && (
              <div className="flex items-center gap-2">
                <Volume2 className="text-gray-600" size={20} />
                <label className="text-sm text-gray-600">Voice enabled</label>
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  className="rounded"
                />
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-500">
            You'll need an OpenAI API key to talk with Raman
            {speechSupported ? ' • Voice features available' : ' • Voice not supported in this browser (try Chrome)'}
          </p>
        </div>
      </div>
    </div>
  );

  const SettingsScreen = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">API Setup</h2>
        
        {/* Demo Warning */}
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <h3 className="font-medium text-red-800 mb-2">⚠️ Demo Safety Reminder:</h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Use fictional scenarios only</li>
            <li>• No real medical information</li>
            <li>• This is for demonstration purposes</li>
          </ul>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OpenAI API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your API key is stored locally and only sent to OpenAI to talk with Raman
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <h3 className="font-medium text-yellow-800 mb-2">Getting Your API Key:</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Go to platform.openai.com</li>
            <li>2. Sign up or log in</li>
            <li>3. Navigate to API Keys</li>
            <li>4. Create a new secret key</li>
            <li>5. Copy and paste it above</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setCurrentScreen('welcome')}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => setCurrentScreen('welcome')}
            disabled={!apiKey}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  const ChatScreen = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center">
            <Heart className="text-red-500 mr-3" size={24} />
            <div>
              <h1 className="font-semibold text-gray-800">Raman</h1>
              <p className="text-sm text-gray-500 capitalize">{sessionMode} Session</p>
            </div>
          </div>
          <div className="flex gap-2">
            {speechSupported && (
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                title={voiceEnabled ? "Disable Voice" : "Enable Voice"}
              >
                {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
            )}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                title="Stop Speaking"
              >
                <Pause size={20} />
              </button>
            )}
            <button
              onClick={() => {
                setMessages([]);
                startSession(sessionMode);
              }}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              title="Restart Session"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={() => setCurrentScreen('welcome')}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Exit
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white shadow-sm border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.role === 'assistant' && voiceEnabled && (
                  <button
                    onClick={() => speakText(message.content)}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    disabled={isSpeaking}
                  >
                    <Volume2 size={14} />
                    {isSpeaking ? 'Speaking...' : 'Speak'}
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-500 text-sm">Raman is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            {speechSupported && (
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className={`p-2 rounded-md transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } disabled:opacity-50`}
                title={isListening ? "Click to Stop Recording" : "Click to Start Recording"}
              >
                {isListening ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              placeholder={isListening ? "Listening..." : "Type your message to Raman (use fictional scenarios only)..."}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || isListening}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim() || isListening}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          {speechSupported && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              {isListening ? "🔴 Recording... (click mic to stop)" : "🎤 Click microphone to record your voice"}
            </p>
          )}
          <p className="text-xs text-red-600 mt-1 text-center">
            Demo only - Use fictional scenarios, no real medical information
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans">
      {currentScreen === 'welcome' && <WelcomeScreen />}
      {currentScreen === 'settings' && <SettingsScreen />}
      {currentScreen === 'chat' && <ChatScreen />}
    </div>
  );
};

export default CoachRaman;