import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  Paper, 
  Box, 
  TextField, 
  IconButton, 
  Typography, 
  Avatar,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Initialize Gemini API with the environment variable
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const newMessages = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Get response from Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-pro"});
      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();

      // Add bot response to chat
      setMessages([...newMessages, { text, sender: 'bot' }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, { 
        text: "Sorry, I encountered an error. Please try again.", 
        sender: 'bot',
        error: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f5f5'
      }}
    >
      {/* Chat Header */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: 'primary.main', 
        color: 'white',
        boxShadow: 1
      }}>
        <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
          Gemini AI Chat
        </Typography>
      </Box>

      {/* Messages Area */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              maxWidth: '85%'
            }}>
              <Avatar 
                sx={{ 
                  bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                  width: 28,
                  height: 28
                }}
              >
                {message.sender === 'user' ? <PersonIcon sx={{ fontSize: 16 }}/> : <SmartToyIcon sx={{ fontSize: 16 }}/>}
              </Avatar>
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  backgroundColor: message.sender === 'user' ? 'primary.main' : 'white',
                  color: message.sender === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  ...(message.error && {
                    backgroundColor: '#ffebee',
                    color: '#c62828'
                  })
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {message.text}
                </Typography>
              </Paper>
            </Box>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={20} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box sx={{ 
        p: 1.5, 
        backgroundColor: 'white', 
        borderTop: 1, 
        borderColor: 'divider'
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          position: 'relative'
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              }
            }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            sx={{
              position: 'absolute',
              right: 4,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Chatbot; 