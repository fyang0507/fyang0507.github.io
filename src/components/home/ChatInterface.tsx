import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot } from 'lucide-react';
import { aiIntroResponse, typingConfig } from '../../data/aiIntro';

interface ChatInterfaceProps {
  onStart?: () => void;
  autoStart?: boolean;
  forceCompleted?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onStart, autoStart, forceCompleted }) => {
  const [hasStarted, setHasStarted] = useState(!!forceCompleted);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState(forceCompleted ? aiIntroResponse : '');
  const [inputValue, setInputValue] = useState("Give me a short intro of Fred Yang.");

  const startConversation = () => {
    setHasStarted(true);
    if (onStart) onStart();
    
    // Start typing after the transition animation
    setTimeout(() => {
      setIsTyping(true);
      
      let currentIndex = 0;
      const text = aiIntroResponse;
      
      const typeNextCharacter = () => {
        if (currentIndex < text.length) {
          const currentChar = text[currentIndex];
          setDisplayedText(text.substring(0, currentIndex + 1));
          
          let delay = typingConfig.baseSpeed;
          
          // Add delays for natural typing rhythm
          if (currentChar === '.' || currentChar === '!' || currentChar === '?') {
            delay += typingConfig.sentenceDelay;
          } else if (currentChar === ',' || currentChar === ';' || currentChar === ':') {
            delay += typingConfig.punctuationDelay;
          }
          
          // Add paragraph delays
          if (currentChar === '\n' && text[currentIndex + 1] === '\n') {
            delay += typingConfig.paragraphDelay;
          }
          
          currentIndex++;
          setTimeout(typeNextCharacter, delay);
        } else {
          setIsTyping(false);
        }
      };
      
      typeNextCharacter();
    }, 600); // Wait for transition to complete
  };

  useEffect(() => {
    if (autoStart && !hasStarted && !forceCompleted) {
      startConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, forceCompleted]);

  useEffect(() => {
    if (forceCompleted) {
      setHasStarted(true);
      setIsTyping(false);
      setDisplayedText(aiIntroResponse);
    }
  }, [forceCompleted]);

  return (
    <section className="relative pt-20 pb-12">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-dark -z-10"></div>
      
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {!hasStarted ? (
              <motion.div
                key="input-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Minimal Header */}
                <div className="text-center space-y-3">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 shadow-lg shadow-primary-500/25"
                  >
                    <Sparkles className="text-white" size={24} />
                  </motion.div>
                </div>

                {/* Modern Input Field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="relative"
                >
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask me anything about Fred..."
                        readOnly
                        className="w-full p-4 pr-14 text-base bg-transparent border-none outline-none resize-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed"
                        rows={2}
                        style={{ minHeight: '70px' }}
                      />
                      
                      {/* Send Button */}
                      <motion.button
                        onClick={startConversation}
                        disabled={!inputValue.trim()}
                        className="absolute bottom-3 right-3 w-10 h-10 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center group disabled:cursor-not-allowed"
                        whileHover={{ scale: inputValue.trim() ? 1.05 : 1 }}
                        whileTap={{ scale: inputValue.trim() ? 0.95 : 1 }}
                      >
                        <Send 
                          size={16} 
                          className={`transition-transform ${inputValue.trim() ? 'group-hover:translate-x-0.5' : ''}`} 
                        />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="chat-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Chat Header */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">From ChatGPT's memory</span>
                  </div>
                </motion.div>

                {/* Chat Container */}
                <div className="space-y-4">
                  
                  {/* User Message */}
                  <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                    className="flex justify-end"
                  >
                    <div className="flex items-end space-x-3 max-w-[85%]">
                      <div className="bg-primary-500 text-white rounded-2xl rounded-br-md px-2.5 shadow-sm">
                        <p className="text-sm leading-relaxed">{inputValue}</p>
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <User size={14} className="text-slate-600 dark:text-slate-400" />
                      </div>
                    </div>
                  </motion.div>

                  {/* AI Response */}
                  <motion.div
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-3 max-w-[90%]">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-sm">
                        <Bot size={14} className="text-white" />
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-3 py-2.5 shadow-sm">
                        <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line">
                          {displayedText}
                          {isTyping && (
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                              className="inline-block w-0.5 h-4 bg-primary-500 ml-1 rounded-full"
                            />
                          )}
                        </div>
                        {isTyping && (
                          <div className="flex items-center space-x-1 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="w-1 h-1 bg-primary-500 rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                              className="w-1 h-1 bg-primary-500 rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                              className="w-1 h-1 bg-primary-500 rounded-full"
                            />
                            <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">AI is typing...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Disclaimer */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="text-left"
                >
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Unedited responses from ChatGPT based on the prompt: <br />
                      <span className="font-medium">"Based on our past interactions, please introduce me to a visitor to my personal website who doesn't know me before."</span> <br />
                      <br />
                      Retrieved May 28, 2025.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ChatInterface; 