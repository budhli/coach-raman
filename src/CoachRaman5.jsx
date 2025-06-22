import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Settings, Play, Pause, RotateCcw, Heart, Brain, Users, Award, Mic, MicOff, Volume2, VolumeX, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const CoachRaman = () => {
  const [currentScreen, setCurrentScreen] = useState('setup');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [useEmbeddedKey, setUseEmbeddedKey] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);
  const [audioTest, setAudioTest] = useState(false);
  const [micTest, setMicTest] = useState(false);
  const [sessionMode, setSessionMode] = useState('education');
  const [educationStep, setEducationStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [ramanThinking, setRamanThinking] = useState('');
  const [emotionState, setEmotionState] = useState('calm');
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Embedded API key (you'll replace this with your actual key)
  const EMBEDDED_API_KEY = 'your-embedded-api-key-here';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
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

  const speakText = (text, emotion = 'calm') => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    setEmotionState(emotion);
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    
    // Clean text - remove ellipses and formatting
    const cleanText = text
      .replace(/\.\.\./g, '') // Remove ellipses
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/pause/gi, '') // Remove literal "pause" words
      .trim();
    
    const getVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length === 0) {
        setTimeout(getVoiceAndSpeak, 100);
        return;
      }
      
      let ramanVoice = voices.find(voice => {
        const name = voice.name.toLowerCase();
        return name.includes('alex') || 
               name.includes('male') ||
               name.includes('david') ||
               name.includes('daniel') ||
               name.includes('tom') ||
               name.includes('mark');
      });
      
      if (!ramanVoice) {
        ramanVoice = voices.find(voice => voice.lang.startsWith('en'));
      }
      
      console.log('Raman using voice:', ramanVoice ? ramanVoice.name : 'default');
      
      const phrases = cleanText.split(/[.!?]+/).filter(phrase => phrase.trim().length > 0);
      
      const speakPhrases = (index) => {
        if (index >= phrases.length) {
          setIsSpeaking(false);
          setRamanThinking('');
          setEmotionState('calm');
          return;
        }
        
        const phrase = phrases[index].trim();
        if (!phrase) {
          speakPhrases(index + 1);
          return;
        }
        
        // Show thinking state before speaking
        setRamanThinking('Speaking...');
        
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.rate = 0.15; // Even slower for dementia
        utterance.pitch = ramanVoice && ramanVoice.name.toLowerCase().includes('female') ? 0.4 : 0.6;
        utterance.volume = 0.8;
        
        if (ramanVoice) {
          utterance.voice = ramanVoice;
        }

        utterance.onend = () => {
          setRamanThinking('Thinking...');
          // Long pause between phrases (dementia processing time)
          setTimeout(() => {
            speakPhrases(index + 1);
          }, 4000); // Longer 4-second pauses
        };
        
        utterance.onerror = () => {
          console.error('Speech error');
          setIsSpeaking(false);
          setRamanThinking('');
        };

        window.speechSynthesis.speak(utterance);
      };
      
      speakPhrases(0);
    };
    
    getVoiceAndSpeak();
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setRamanThinking('');
  };

  const testAudio = () => {
    speakText("Can you hear this? This is how Raman speaks.");
    setAudioTest(true);
  };

  const testMicrophone = () => {
    if (speechSupported) {
      startListening();
      setMicTest(true);
    }
  };

  const getActiveApiKey = () => {
    return useEmbeddedKey ? EMBEDDED_API_KEY : apiKey;
  };

  const educationLessons = [
    {
      title: "Meet Raman",
      content: "Hello. I'm Raman. I have dementia. I want to help you understand me.",
      thinking: "Introducing myself slowly...",
      emotion: "calm"
    },
    {
      title: "Why I Need Time",
      content: "When you talk to me. I need time. My brain works slower now. Please wait for me.",
      thinking: "Explaining why I'm slow...",
      emotion: "thoughtful"
    },
    {
      title: "One Thing at a Time", 
      content: "Too many instructions. I get confused. Tell me one thing. Then wait.",
      thinking: "Trying to explain overload...",
      emotion: "overwhelmed"
    },
    {
      title: "Don't Interrupt My Thoughts",
      content: "Sometimes I stop talking. but I'm still thinking. Please don't jump in. Let me finish.",
      thinking: "Finding the right words...",
      emotion: "focused"
    },
    {
      title: "How Words Make Me Feel",
      content: "When you say 'Don't forget your medicine'. I feel bad. Instead say, 'Here's your medicine'. I feel good. Same message. Different feeling.",
      thinking: "Sharing my emotions...",
      emotion: "emotional"
    }
  ];

  const startEducationLesson = (lessonIndex) => {
    const lesson = educationLessons[lessonIndex];
    setEducationStep(lessonIndex);
    setRamanThinking(lesson.thinking);
    
    setTimeout(() => {
      speakText(lesson.content, lesson.emotion);
    }, 1000);
  };

  const nextEducationStep = () => {
    if (educationStep < educationLessons.length - 1) {
      startEducationLesson(educationStep + 1);
    }
  };

  const SetupScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Heart className="text-blue-500 mx-auto mb-4" size={48} />
          <h1 className="text-3xl font-bold text-teal-700 mb-2">Hello. I'm Raman.</h1>
          <p className="text-gray-600 mb-4">I have dementia... but I'm still here. And I want to help you connect with people like me.</p>
          <p className="text-sm text-gray-500">Let's set up your audio experience so you can hear how I really speak.</p>
        </div>

        {/* API Key Selection */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-800 mb-2">Choose your API key option:</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-xs text-blue-800">
             Education mode is free!  I use OpenAI's GPT-4o-mini model for Training and Live Chat modes. If you have your own API key, please use it. It helps keep costs low while I help more people. Thank you. 💙
            </p>
          </div>
          <div className="space-y-3">
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                checked={useEmbeddedKey}
                onChange={() => setUseEmbeddedKey(true)}
                className="mr-3"
              />
              <div>
                <div className="font-medium">Use demo API key (Recommended)</div>
                <div className="text-sm text-gray-500">Quick start - no setup required</div>
              </div>
            </label>
            
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                checked={!useEmbeddedKey}
                onChange={() => setUseEmbeddedKey(false)}
                className="mr-3"
              />
              <div>
                <div className="font-medium">Use my own API key</div>
                <div className="text-sm text-gray-500">For unlimited usage</div>
              </div>
            </label>
          </div>

          {!useEmbeddedKey && (
            <div className="mt-4">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Audio Setup */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Audio Setup</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>📱 Mobile:</strong> Turn up volume, allow microphone access<br/>
                <strong>💻 Computer:</strong> Check speakers/headphones, allow microphone
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={testAudio}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors ${
                audioTest 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {audioTest ? <CheckCircle size={20} /> : <Volume2 size={20} />}
              {audioTest ? 'Audio Working!' : 'Test Sound'}
            </button>
            
            {speechSupported ? (
              <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-700 border border-green-200 rounded-md">
                <CheckCircle size={20} />
                <div className="text-center">
                  <div className="font-medium">Microphone Available</div>
                  <div className="text-xs">You can type or speak during lessons</div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 border border-blue-200 rounded-md">
                <MessageCircle size={20} />
                <div className="text-center">
                  <div className="font-medium">Typing Only</div>
                  <div className="text-xs">You can type your responses</div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setSetupComplete(true);
              setCurrentScreen('welcome');
            }}
            disabled={!audioTest}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Start Learning with Raman
          </button>
        </div>
      </div>
    </div>
  );

  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Heart className="text-blue-500 mr-3" size={48} />
            <h1 className="text-2xl font-medium text-gray-800">Raman</h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            Learning to communicate with someone who has dementia
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Hello. I'm Raman. I have dementia... but I'm still here. And I want to help you connect with people like me.
          </p>
        </div>

        {/* Speaker Icon - Prominent */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setCurrentScreen('setup')}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Settings className="mr-2" size={20} />
              Audio Settings
            </button>
            
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <Volume2 className="text-green-600" size={24} />
              <label className="text-sm font-medium text-green-800">Audio Experience ON</label>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div 
            onClick={() => {
              setSessionMode('education');
              setCurrentScreen('education');
              setEducationStep(0);
            }}
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200"
          >
            <Brain className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Education Mode</h3>
            <p className="text-gray-600 mb-4">
              Watch and listen as Raman teaches you about dementia communication
            </p>
            <div className="bg-blue-50 p-3 rounded text-sm">
              <strong>Learn through:</strong>
              <ul className="mt-2 space-y-1">
                <li>• Real dementia speech patterns</li>
                <li>• Visual thinking demonstrations</li>
                <li>• Interactive lessons</li>
                <li>• No pressure - just observe</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg opacity-50 cursor-not-allowed border-2 border-gray-200">
            <Users className="text-gray-400 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2 text-gray-500">Training Mode</h3>
            <p className="text-gray-500 mb-4">
              Coming soon - Practice conversations with guidance
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong className="text-gray-400">Will include:</strong>
              <ul className="mt-2 space-y-1 text-gray-400">
                <li>• Real-time feedback</li>
                <li>• Guided scenarios</li>
                <li>• Mistake corrections</li>
                <li>• Safe learning space</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg opacity-50 cursor-not-allowed border-2 border-gray-200">
            <MessageCircle className="text-gray-400 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2 text-gray-500">Live Chat Mode</h3>
            <p className="text-gray-500 mb-4">
              Coming soon - Open conversation with Raman
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong className="text-gray-400">Will include:</strong>
              <ul className="mt-2 space-y-1 text-gray-400">
                <li>• Specific conversations</li>
                <li>• Real situations</li>
                <li>• Ongoing support</li>
                <li>• Applied learning</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const EducationScreen = () => {
    const currentLesson = educationLessons[educationStep];
    
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center">
              <Brain className="text-blue-500 mr-3" size={24} />
              <div>
                <h1 className="font-semibold text-gray-800">Education Mode</h1>
                <p className="text-sm text-gray-500">Lesson {educationStep + 1} of {educationLessons.length}</p>
              </div>
            </div>
            <div className="flex gap-2">
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
                onClick={() => setCurrentScreen('welcome')}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Lesson Progress */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">Progress</span>
                  <span className="text-sm font-medium text-gray-500">
                    {educationStep + 1} / {educationLessons.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((educationStep + 1) / educationLessons.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Raman's Avatar and State */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl transition-colors ${
                    emotionState === 'calm' ? 'bg-blue-100' :
                    emotionState === 'thoughtful' ? 'bg-yellow-100' :
                    emotionState === 'overwhelmed' ? 'bg-red-100' :
                    emotionState === 'focused' ? 'bg-green-100' :
                    emotionState === 'emotional' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    🧓
                  </div>
                  
                  {/* Thinking Bubble */}
                  {ramanThinking && (
                    <div className="absolute top-0 left-full ml-4 bg-white border-2 border-gray-200 rounded-lg p-3 shadow-lg">
                      <div className="text-sm text-gray-600 whitespace-nowrap flex items-center gap-2">
                        {isSpeaking ? (
                          <>
                            <Volume2 size={16} className="text-blue-500" />
                            {ramanThinking}
                          </>
                        ) : (
                          <>
                            <Clock size={16} className="text-yellow-500 animate-pulse" />
                            {ramanThinking}
                          </>
                        )}
                      </div>
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white"></div>
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentLesson.title}</h2>
                
                {/* Emotion Indicator */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  emotionState === 'calm' ? 'bg-blue-100 text-blue-800' :
                  emotionState === 'thoughtful' ? 'bg-yellow-100 text-yellow-800' :
                  emotionState === 'overwhelmed' ? 'bg-red-100 text-red-800' :
                  emotionState === 'focused' ? 'bg-green-100 text-green-800' :
                  emotionState === 'emotional' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {emotionState === 'calm' && '😌 Calm'}
                  {emotionState === 'thoughtful' && '🤔 Thoughtful'}
                  {emotionState === 'overwhelmed' && '😵 Overwhelmed'}
                  {emotionState === 'focused' && '🎯 Focused'}
                  {emotionState === 'emotional' && '💙 Sharing feelings'}
                </div>
              </div>

              {/* Lesson Content */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <p className="text-lg text-gray-800 leading-relaxed text-center">
                  {currentLesson.content}
                </p>
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => startEducationLesson(educationStep)}
                  disabled={isSpeaking}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  <Volume2 size={20} />
                  {isSpeaking ? 'Speaking...' : 'Listen to Raman'}
                </button>

                <div className="flex gap-3">
                  {educationStep > 0 && (
                    <button
                      onClick={() => startEducationLesson(educationStep - 1)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Previous
                    </button>
                  )}
                  
                  {educationStep < educationLessons.length - 1 ? (
                    <button
                      onClick={nextEducationStep}
                      className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Next Lesson
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentScreen('welcome')}
                      className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Complete Education
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans">
      {currentScreen === 'setup' && <SetupScreen />}
      {currentScreen === 'welcome' && <WelcomeScreen />}
      {currentScreen === 'education' && <EducationScreen />}
    </div>
  );
};

export default CoachRaman;