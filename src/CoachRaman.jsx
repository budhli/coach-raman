import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Settings, Play, Pause, RotateCcw, Heart, Brain, Users, Award, Mic, MicOff, Volume2, VolumeX, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const LocalizationContext = React.createContext();

const LocalizationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Hardcoded English translations for testing
  const englishTranslations = {
    "app": {
      "title": "Raman",
      "subtitle": "Learning to communicate with someone who has dementia"
    },
    "setup": {
      "greeting": "Hello. I'm Raman.",
      "description": "I have dementia... but I'm still here. And I want to help you connect with people like me.",
      "audioSetupSubtitle": "Let's set up your audio experience so you can hear how I really speak.",
      "testSoundButton": "Test Sound",
      "testSoundSuccess": "Audio Working!",
      "microphoneAvailable": "Microphone Available",
      "microphoneAvailableDesc": "You can type or speak during lessons",
      "microphoneUnavailable": "Typing Only",
      "microphoneUnavailableDesc": "You can type your responses",
      "startButton": "Start Learning with Raman",
      "testAudioPhrase": "Can you hear this?",
      "apiKeyTitle": "Choose your API key option:",
      "apiKeyInfo": "Education mode is free! I use OpenAI's GPT-4o-mini model for Training and Live Chat modes. If you have your own API key, please use it. It helps keep costs low while I help more people. Thank you. 💙",
      "apiKeyEmbedded": "Use demo API key (Recommended)",
      "apiKeyEmbeddedDesc": "Quick start - no setup required",
      "apiKeyOwn": "Use my own API key",
      "apiKeyOwnDesc": "For unlimited usage",
      "apiKeyPlaceholder": "sk-..."
    },
    "welcome": {
      "greeting": "Hello. I'm Raman.",
      "description": "I have dementia, but I'm still here. I want to help you connect with people like me.",
      "audioSetupTitle": "Let's Set Up Your Audio",
      "audioSetupDescription": "You'll need to hear how I really speak to understand my experience",
      "testSoundTitle": "Test Sound",
      "testSoundDescription": "Hear how Raman speaks",
      "testSoundButton": "Test Audio",
      "audioExperienceTitle": "Audio Experience",
      "audioExperienceOn": "ON",
      "audioExperienceOff": "OFF",
      "modes": {
        "education": {
          "title": "Education Mode",
          "description": "Watch and listen as Raman teaches you about dementia communication",
          "learnThrough": "Learn through:",
          "features": [
            "Real dementia speech patterns",
            "Visual thinking demonstrations",
            "Interactive lessons",
            "No pressure - just observe"
          ],
          "button": "Start Learning"
        }
      },
      "apiKeyTitle": "Choose your API key option:",
      "apiKeyInfo": "Education mode is free! I use OpenAI's GPT-4o-mini model for Training and Live Chat modes. If you have your own API key, please use it. It helps keep costs low while I help more people. Thank you. 💙",
      "apiKeyEmbedded": "Use demo API key (Recommended)",
      "apiKeyEmbeddedDesc": "Quick start - no setup required",
      "apiKeyOwn": "Use my own API key",
      "apiKeyOwnDesc": "For unlimited usage"
    },
    "education": {
      "title": "Education Mode",
      "progressLabel": "Progress",
      "lessonCounter": "Lesson {current} of {total}",
      "listenButton": "Listen to Raman",
      "speakingStatus": "Speaking...",
      "nextButton": "Next Lesson",
      "previousButton": "Previous",
      "completeButton": "Complete Education",
      "backToMenu": "Back to Menu",
      "stopSpeaking": "Stop Speaking",
      "speechTiming": "Speech: 7x slower • Pauses: 4x longer",
      "lessons": [
        {
          "title": "Meet Raman",
          "content": "Hello. I'm Raman. I have dementia. I want to help you understand me.",
          "thinking": "Let me introduce myself slowly...",
          "emotion": "calm"
        },
        {
          "title": "Why I Need Time",
          "content": "When you talk to me. I need time. My brain works slower now. Please wait for me.",
          "thinking": "Explaining why I'm slow...",
          "emotion": "thoughtful"
        },
        {
          "title": "One Thing at a Time",
          "content": "Too many instructions. I get confused. Tell me one thing. Then wait.",
          "thinking": "Trying to explain overload...",
          "emotion": "overwhelmed"
        },
        {
          "title": "Don't Interrupt My Thoughts",
          "content": "Sometimes I stop talking. but I'm still thinking. Please don't jump in. Let me finish.",
          "thinking": "Finding the right words...",
          "emotion": "focused"
        },
        {
          "title": "How Words Make Me Feel",
          "content": "When you say 'Don't forget your medicine'. I feel bad. Instead say, 'Here's your medicine'. I feel good. Same message. Different feeling.",
          "thinking": "Sharing my emotions...",
          "emotion": "emotional"
        }
      ]
    },
    "emotions": {
      "calm": "😌 Calm",
      "thoughtful": "🤔 Thoughtful",
      "overwhelmed": "😵 Overwhelmed",
      "focused": "🎯 Focused",
      "emotional": "💙 Sharing feelings"
    },
    "timer": {
      "speaking": "Speaking...",
      "pause": "Pause...",
      "total": "Total:",
      "complete": "Complete"
    },
    "thinking": {
      "speaking": "Speaking...",
      "thinking": "Thinking..."
    }
  };

  const getNestedValue = (obj, key) => {
    return key.split('.').reduce((o, k) => o?.[k], obj);
  };

  const t = (key, params = {}) => {
    const value = getNestedValue(translations, key);
    if (!value) {
      console.warn(`Translation key "${key}" not found`);
      return key;
    }
    
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return Object.keys(params).reduce((str, param) => {
        return str.replace(new RegExp(`{${param}}`, 'g'), params[param]);
      }, value);
    }
    
    return value;
  };

useEffect(() => {
  const loadTranslations = async () => {
    try {
      // Load from en-US.json file instead of hardcoded object
      
      const response = await fetch('locales/en-US.json');
      const translationData = await response.json();
      console.log('✅ SUCCESS: Loaded from JSON file');
      console.log('📊 JSON data:', translationData);
      console.log('📚 Lessons from JSON:', translationData?.education?.lessons);
      setTranslations(translationData);
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to hardcoded translations if file fails
      setTranslations(englishTranslations);
    }
    setIsLoading(false);
  };
  
  loadTranslations();
}, []);

  return (
    <LocalizationContext.Provider value={{ t, currentLanguage, isLoading, translations }}>
      {children}
    </LocalizationContext.Provider>
  );
};

const useLocalization = () => {
  const context = React.useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
};

const CoachRaman = () => {
  const { t } = useLocalization();
  
  const [currentScreen, setCurrentScreen] = useState('setup');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentInsight, setCurrentInsight] = useState(0);
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
  
  const [brainTimer, setBrainTimer] = useState(0);
  const [brainTimerActive, setBrainTimerActive] = useState(false);
  const [totalCommunicationTime, setTotalCommunicationTime] = useState(0);
  const [timerPhase, setTimerPhase] = useState('');
  const [isEducationSpeaking, setIsEducationSpeaking] = useState(false);
  
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const EMBEDDED_API_KEY = 'your-embedded-api-key-here';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let interval;
    if (brainTimerActive) {
      interval = setInterval(() => {
        setBrainTimer(prev => prev + 1);
        setTotalCommunicationTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [brainTimerActive]);

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

  const startBrainTimer = (phase) => {
    setBrainTimer(0);
    setTimerPhase(phase);
    setBrainTimerActive(true);
  };

  const speakText = (text, emotion = 'calm', isEducation = false) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    setEmotionState(emotion);
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    setIsEducationSpeaking(isEducation);
    
    if (isEducation) {
      startBrainTimer('speaking');
    }
    
    const cleanText = text
      .replace(/\.\.\./g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/pause/gi, '')
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
      
      const phrases = cleanText.split(/[.!?]+/).filter(phrase => phrase.trim().length > 0);
      
      const speakPhrases = (index) => {
        if (index >= phrases.length) {
          setIsSpeaking(false);
          setRamanThinking('');
          setEmotionState('calm');
          if (isEducation) {
            setTimeout(() => {
              setTimerPhase('complete');
            }, 100);
          }
          return;
        }
        
        const phrase = phrases[index].trim();
        if (!phrase) {
          speakPhrases(index + 1);
          return;
        }
        
        setRamanThinking(t('thinking.speaking'));
        
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.rate = 0.15;
        utterance.pitch = ramanVoice && ramanVoice.name.toLowerCase().includes('female') ? 0.4 : 0.6;
        utterance.volume = 0.8;
        
        if (ramanVoice) {
          utterance.voice = ramanVoice;
        }

        utterance.onend = () => {
          setRamanThinking(t('thinking.thinking'));
          if (isEducation) setBrainTimerActive(false);
          
          if (index < phrases.length - 1) {
            if (isEducation) {
              setTimeout(() => {
                startBrainTimer('pause');
                setTimeout(() => {
                  startBrainTimer('speaking');
                  speakPhrases(index + 1);
                }, 4000);
              }, 100);
            } else {
              setTimeout(() => {
                speakPhrases(index + 1);
              }, 4000);
            }
          } else {
            setIsSpeaking(false);
            setRamanThinking('');
            setEmotionState('calm');
            if (isEducation) {
              setTimeout(() => {
                setTimerPhase('complete');
              }, 100);
            }
          }
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
    setBrainTimerActive(false);
    setTimerPhase('');
    setBrainTimer(0);
    setIsEducationSpeaking(false);
  };

  const testAudio = () => {
    speakText(t('setup.testAudioPhrase'));
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

  // Get lessons from translations
  const educationLessons = t('education.lessons') || [];

  const startEducationLesson = (lessonIndex) => {
    const lesson = educationLessons[lessonIndex];
    if (!lesson) return;
    
    setEducationStep(lessonIndex);
    setRamanThinking(lesson.thinking);
    
    setBrainTimer(0);
    setTotalCommunicationTime(0);
    setTimerPhase('');
    setBrainTimerActive(false);
    
    /*
    setTimeout(() => {
      speakText(lesson.content, lesson.emotion, true);
    }, 1000);
      */


  };

  const nextEducationStep = () => {
    if (educationStep < educationLessons.length - 1) {
      startEducationLesson(educationStep + 1);
    }
  };

  const BrainTimer = () => {
    if (!isEducationSpeaking) return null;
    
    if (timerPhase === 'complete') {
      return (
        <div className="absolute top-2 right-full mr-6">
          <div className="bg-white border-2 border-gray-300 rounded-lg p-2 shadow-lg">
            <div className="flex items-center gap-1">
              <Brain size={20} className="text-blue-600" />
              <span className="text-xs font-medium text-gray-800">{t('timer.total')}</span>
              <span className="text-xs font-mono text-blue-600 min-w-[15px]">
                {totalCommunicationTime}s
              </span>
            </div>
            <div className="absolute top-2 right-0 transform translate-x-2 w-0 h-0 border-t-3 border-b-3 border-l-3 border-transparent border-l-white"></div>
          </div>
        </div>
      );
    }
    
    if (timerPhase === 'speaking' || timerPhase === 'pause') {
      return (
        <div className="absolute top-2 right-full mr-6 bg-white border-2 border-blue-200 rounded-lg p-1 shadow-lg">
          <div className="flex items-center gap-1">
            <Brain size={20} className="text-blue-600" />
            <span className="text-xs font-medium text-gray-800">
              {timerPhase === 'speaking' ? t('timer.speaking') : t('timer.pause')}
            </span>
            <span className="text-xs font-mono text-blue-600 min-w-[15px]">
              {brainTimer}s
            </span>
          </div>
          <div className="absolute top-2 right-0 transform translate-x-2 w-0 h-0 border-t-3 border-b-3 border-l-3 border-transparent border-l-white"></div>
        </div>
      );
    }
    
    return null;
  };

  const EnhancedTakeaway = ({ lesson }) => {
  if (!lesson || !lesson.insights || lesson.insights.length === 0) {
    return (
      <div className="text-sm text-purple-600 font-medium mb-4">
        {t('education.speechTiming')}
      </div>
    );
  }

  const currentInsightData = lesson.insights[currentInsight];

  return (
    <div 
      className="bg-purple-50 rounded-lg p-3 cursor-pointer hover:bg-purple-100 transition-colors border border-purple-200 mb-4"
      onClick={() => {
        const lesson = educationLessons[educationStep];
        if (lesson && lesson.insights) {
          setCurrentInsight(prev => (prev + 1) % lesson.insights.length);
        }
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl">{currentInsightData.icon}</span>
        <span className="text-sm font-medium text-purple-800 flex-1">
          {currentInsightData.text}
        </span>
      </div>
      
      <div className="flex justify-center gap-2">
        {lesson.insights.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentInsight(index);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentInsight 
                ? 'bg-purple-600' 
                : 'bg-purple-300 hover:bg-purple-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

  const SetupScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Heart className="text-blue-500 mx-auto mb-4" size={48} />
          <h1 className="text-3xl font-bold text-teal-700 mb-2">{t('setup.greeting')}</h1>
          <p className="text-gray-600 mb-4">{t('setup.description')}</p>
          <p className="text-sm text-gray-500">{t('setup.audioSetupSubtitle')}</p>
        </div>

        <div className="space-y-6 mb-8">
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
              {audioTest ? t('setup.testSoundSuccess') : t('setup.testSoundButton')}
            </button>
            
            {speechSupported ? (
              <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-700 border border-green-200 rounded-md">
                <CheckCircle size={20} />
                <div className="text-center">
                  <div className="font-medium">{t('setup.microphoneAvailable')}</div>
                  <div className="text-xs">{t('setup.microphoneAvailableDesc')}</div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 border border-blue-200 rounded-md">
                <MessageCircle size={20} />
                <div className="text-center">
                  <div className="font-medium">{t('setup.microphoneUnavailable')}</div>
                  <div className="text-xs">{t('setup.microphoneUnavailableDesc')}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            setSetupComplete(true);
            setCurrentScreen('welcome');
          }}
          disabled={!audioTest}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-8"
        >
          {t('setup.startButton')}
        </button>

        <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <h3 className="font-semibold text-gray-800 mb-2">{t('setup.apiKeyTitle')}</h3>
          <div className="bg-blue-50/70 backdrop-blur-sm border border-blue-200/50 rounded-md p-3 mb-4">
            <p className="text-xs text-blue-800">
              {t('setup.apiKeyInfo')}
            </p>
          </div>
          <div className="space-y-3">
            <label className="flex items-center p-4 border border-white/30 rounded-lg cursor-pointer hover:bg-white/30 transition-colors backdrop-blur-sm">
              <input
                type="radio"
                checked={useEmbeddedKey}
                onChange={() => setUseEmbeddedKey(true)}
                className="mr-3"
              />
              <div>
                <div className="font-medium">{t('setup.apiKeyEmbedded')}</div>
                <div className="text-sm text-gray-500">{t('setup.apiKeyEmbeddedDesc')}</div>
              </div>
            </label>
            
            <label className="flex items-center p-4 border border-white/30 rounded-lg cursor-pointer hover:bg-white/30 transition-colors backdrop-blur-sm">
              <input
                type="radio"
                checked={!useEmbeddedKey}
                onChange={() => setUseEmbeddedKey(false)}
                className="mr-3"
              />
              <div>
                <div className="font-medium">{t('setup.apiKeyOwn')}</div>
                <div className="text-sm text-gray-500">{t('setup.apiKeyOwnDesc')}</div>
              </div>
            </label>
          </div>

          {!useEmbeddedKey && (
            <div className="mt-4">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t('setup.apiKeyPlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm"
              />
            </div>
          )}
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
            <h1 className="text-2xl font-medium text-gray-800">{t('app.title')}</h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            {t('app.subtitle')}
          </p>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{t('welcome.greeting')}</h2>
            <p className="text-gray-600">{t('welcome.description')}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div 
            onClick={() => {
              setSessionMode('education');
              setCurrentScreen('education');
              setEducationStep(0);
            }}
            className="bg-white/25 backdrop-blur-xl rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-translate-y-2"
          >
            <Brain className="text-blue-600 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2 text-gray-800">{t('welcome.modes.education.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('welcome.modes.education.description')}
            </p>
            <div className="bg-white/40 backdrop-blur-sm p-3 rounded-2xl text-sm">
              <strong className="text-gray-800">{t('welcome.modes.education.learnThrough')}</strong>
              <ul className="mt-2 space-y-1 text-gray-700">
                {t('welcome.modes.education.features').map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-2xl font-medium text-center hover:bg-blue-700 transition-colors">
              {t('welcome.modes.education.button')}
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 shadow-lg opacity-60 cursor-not-allowed">
            <Users className="text-gray-400 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2 text-gray-500">Training Mode</h3>
            <p className="text-gray-500 mb-4">
              Coming soon - Practice conversations with guidance
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 shadow-lg opacity-60 cursor-not-allowed">
            <MessageCircle className="text-gray-400 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2 text-gray-500">Live Chat Mode</h3>
            <p className="text-gray-500 mb-4">
              Coming soon - Open conversation with Raman
            </p>
          </div>
        </div>

        <div className="bg-orange-50/25 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
          <h3 className="font-semibold text-gray-800 mb-2">{t('welcome.apiKeyTitle')}</h3>
          <div className="bg-blue-50/40 backdrop-blur-sm rounded-2xl p-3 mb-4">
            <p className="text-xs text-blue-800">
              {t('welcome.apiKeyInfo')}
            </p>
          </div>
          <div className="space-y-3">
            <label className="flex items-center p-4 rounded-2xl cursor-pointer hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
              <input
                type="radio"
                checked={useEmbeddedKey}
                onChange={() => setUseEmbeddedKey(true)}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-gray-800">{t('welcome.apiKeyEmbedded')}</div>
                <div className="text-sm text-gray-600">{t('welcome.apiKeyEmbeddedDesc')}</div>
              </div>
            </label>
            
            <label className="flex items-center p-4 rounded-2xl cursor-pointer hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
              <input
                type="radio"
                checked={!useEmbeddedKey}
                onChange={() => setUseEmbeddedKey(false)}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-gray-800">{t('welcome.apiKeyOwn')}</div>
                <div className="text-sm text-gray-600">{t('welcome.apiKeyOwnDesc')}</div>
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
                className="w-full px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-white/40 backdrop-blur-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const EducationScreen = () => {
    const currentLesson = educationLessons[educationStep];
    
    if (!currentLesson) {
      return <div>No lesson available</div>;
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center">
              <Brain className="text-blue-500 mr-3" size={24} />
              <div>
                <h1 className="font-semibold text-gray-800">{t('education.title')}</h1>
                <p className="text-sm text-gray-500">{t('education.lessonCounter', { 
                  current: educationStep + 1, 
                  total: educationLessons.length 
                })}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                  title={t('education.stopSpeaking')}
                >
                  <Pause size={20} />
                </button>
              )}
              <button
                onClick={() => setCurrentScreen('welcome')}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                {t('education.backToMenu')}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 pb-6">
          <div className="max-w-4xl w-full">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">{t('education.progressLabel')}</span>
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
                  
                  <BrainTimer />
                </div>
                
                <h2 className="text-2xl font-bold text-teal-700 mb-2">{currentLesson.title}</h2>
                
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-3 ${
                  emotionState === 'calm' ? 'bg-blue-100 text-blue-800' :
                  emotionState === 'thoughtful' ? 'bg-yellow-100 text-yellow-800' :
                  emotionState === 'overwhelmed' ? 'bg-red-100 text-red-800' :
                  emotionState === 'focused' ? 'bg-green-100 text-green-800' :
                  emotionState === 'emotional' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {t(`emotions.${emotionState}`)}
                </div>
               
                
              

              <EnhancedTakeaway lesson={currentLesson} />


              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                <p className="text-lg sm:text-xl text-gray-800 leading-relaxed text-center">
                  {currentLesson.content}
                </p>
              </div>
              <div className="space-y-4">
            {/* iOS-style Raman Control Buttons */}
            <div className="flex justify-center gap-3">
              <button
              
                onClick={() => speakText(educationLessons[educationStep].content, educationLessons[educationStep].emotion, true)}
                disabled={isSpeaking}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 transition-all duration-200 text-sm font-medium shadow-sm"
              >
                <Volume2 size={16} />
                Raman Speak
              </button>
              
              <button
                onClick={stopSpeaking}
                disabled={!isSpeaking}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 disabled:opacity-50 transition-all duration-200 text-sm font-medium shadow-sm"
              >
                <VolumeX size={16} />
                Raman Stop  
              </button>
            </div>
            {/* Add this navigation section */}
{/* Previous/Next buttons - iOS style like the others */}
<div className="flex gap-3 justify-center">
  {educationStep > 0 && (
    <button
      onClick={() => startEducationLesson(educationStep - 1)}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-200 text-sm font-medium shadow-sm"
    >
      Previous
    </button>
  )}
  
  {educationStep < educationLessons.length - 1 ? (
    <button
      onClick={() => startEducationLesson(educationStep + 1)}
      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200 text-sm font-medium shadow-sm"
    >
      Next   
    </button>
  ) : (
    <button
      onClick={() => setCurrentScreen('welcome')}
      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200 text-sm font-medium shadow-sm"
    >
      Complete
    </button>
  )}
</div>
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

const App = () => {
  return (
    <LocalizationProvider>
      <CoachRaman />
    </LocalizationProvider>
  );
};

export default App;