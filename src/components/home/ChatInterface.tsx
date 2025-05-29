import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { aiIntroResponse, typingConfig } from '../../data/aiIntro';

const ChatInterface: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [inputValue, setInputValue] = useState("Give me a short intro of Fred Yang.");

  const startConversation = () => {
    setHasStarted(true);
    
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

  return (
    <section className="relative pt-16 pb-24">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-white dark:from-primary-950/30 dark:to-dark -z-10"></div>
      
      <div className="container-custom pt-16 pb-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {!hasStarted ? (
              <motion.div
                key="input-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Header */}
                <div className="text-center mb-12">
                  <div className="flex items-center justify-center mb-4">
                    <Sparkles className="text-primary-600 dark:text-primary-300 mr-2" size={32} />
                  </div>
                </div>

                {/* Input Field */}
                <div className="relative max-w-3xl mx-auto">
                  <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask me anything..."
                      readOnly
                      className="w-full p-6 pr-16 text-lg bg-transparent border-none outline-none resize-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                      rows={3}
                      style={{ minHeight: '120px' }}
                    />
                    
                    {/* Send Button */}
                    <motion.button
                      onClick={startConversation}
                      disabled={!inputValue.trim()}
                      className="absolute bottom-4 right-4 w-12 h-12 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center group disabled:cursor-not-allowed"
                      whileHover={{ scale: inputValue.trim() ? 1.05 : 1 }}
                      whileTap={{ scale: inputValue.trim() ? 0.95 : 1 }}
                    >
                      <Send 
                        size={20} 
                        className={`transition-transform ${inputValue.trim() ? 'group-hover:translate-x-0.5' : ''}`} 
                      />
                    </motion.button>
                  </div>
                  
                  {/* Subtle hint */}
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                    Press the send button to start the conversation
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Chat Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-2">
                    <Sparkles className="text-primary-600 dark:text-primary-300 mr-2" size={24} />
                  </div>
                </div>

                {/* Chat Container */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-6 md:p-8 space-y-6">
                    
                    {/* User Message */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="flex justify-end"
                    >
                      <div className="max-w-[80%] relative">
                        <div className="bg-primary-600 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-lg">
                          <p className="text-sm md:text-base">{inputValue}</p>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
                          You
                        </div>
                      </div>
                    </motion.div>

                    {/* AI Response */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[90%] relative">
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                              <Sparkles size={16} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm md:text-base text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                                {displayedText}
                                {isTyping && (
                                  <motion.span
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                                    className="inline-block w-2 h-5 bg-primary-600 ml-1"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          ChatGPT {isTyping && (
                            <span className="inline-flex items-center ml-2">
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-1 h-1 bg-primary-500 rounded-full mr-1"
                              />
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                className="w-1 h-1 bg-primary-500 rounded-full mr-1"
                              />
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                className="w-1 h-1 bg-primary-500 rounded-full"
                              />
                              <span className="ml-2 text-primary-600 dark:text-primary-400">typing...</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Disclaimer */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="mt-6 text-left"
                >
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                    Unedited responses from ChatGPT based on the following prompt: <br />
                    "Based on our past interactions, please introduce me to a visitor to my personal website who doesn't know me before." <br />
                    Retrieved May 28, 2025.
                  </p>
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