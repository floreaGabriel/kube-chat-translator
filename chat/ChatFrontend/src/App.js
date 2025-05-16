import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import './App.css';

function App() {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');
  const [connectionState, setConnectionState] = useState('connecting'); // 'connecting', 'connected', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Create a SignalR connection
    const connect = async () => {
      try {
        // Clear any existing connection
        if (connection) {
          await connection.stop();
        }
        
        setConnectionState('connecting');
        setErrorMessage('');
        
        // Debugging information
        console.log(`Window location: ${window.location.href}`);
        
        // MODIFICARE CRUCIALĂ: Folosim direct '/chatHub' fără niciun prefix
        // Aceasta se va potrivi cu configurația Nginx
        const hubUrl = '/chatHub';
        
        console.log(`Using direct hub URL for SignalR: ${hubUrl}`);
        
        const newConnection = new HubConnectionBuilder()
          .withUrl(hubUrl, {
            skipNegotiation: true,
            transport: HttpTransportType.WebSockets
          })
          .withAutomaticReconnect([0, 2000, 5000, 10000, 15000, 30000])
          .configureLogging(LogLevel.Debug)
          .build();

        // FOARTE IMPORTANT: Înregistrăm handler-ul pentru ReceiveMessage ÎNAINTE de a porni conexiunea
        console.log("Registering ReceiveMessage handler");
        newConnection.on('ReceiveMessage', (message) => {
          console.log('Received message from server:', message);
          // Verificăm că message are structura corectă
          if (message && message.user && message.message) {
            setMessages(prevMessages => [...prevMessages, message]);
            console.log('Message added to state, messages count:', messages.length + 1);
          } else {
            console.warn('Received invalid message structure:', message);
          }
        });

        // Handle chat history
        console.log("Registering ReceiveHistory handler");
        newConnection.on('ReceiveHistory', (messages) => {
          console.log('Received history from server:', messages);
          if (Array.isArray(messages)) {
            setMessages(messages);
            console.log('History set in state, message count:', messages.length);
          } else {
            console.warn('Received invalid history structure:', messages);
          }
        });

        // Set up connection event handlers
        newConnection.onreconnecting(error => {
          console.warn('Connection lost, attempting to reconnect...', error);
          setConnectionState('connecting');
          setErrorMessage('Connection lost, attempting to reconnect...');
        });
        
        newConnection.onreconnected(() => {
          console.log('Successfully reconnected!');
          setConnectionState('connected');
          setErrorMessage('');
        });
        
        newConnection.onclose(error => {
          console.error('Connection closed:', error);
          setConnectionState('error');
          setErrorMessage('Connection closed. Please reload the page.');
          
          // Try to reconnect after a delay
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        });

        console.log('Starting connection...');
        await newConnection.start();
        console.log('Connection started successfully!');
        
        setConnection(newConnection);
        setConnectionState('connected');
      } catch (error) {
        console.error('Error connecting to SignalR hub:', error);
        setConnectionState('error');
        setErrorMessage(`Failed to connect: ${error.message || 'Unknown error'}`);
        
        // Try to reconnect after a delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    
    if (connectionState !== 'connected') {
      console.log('Cannot send message: Not connected');
      return;
    }
    
    if (!user || !message) {
      console.log('Cannot send message: User or message is empty', { user, message });
      return;
    }
    
    if (!connection) {
      console.log('Cannot send message: No connection object');
      return;
    }

    try {
      console.log(`Sending message: "${user}: ${message}"`);
      
      // Verificăm starea conexiunii
      console.log('Connection state:', connection.state);
      
      // Încercăm să trimitem mesajul
      await connection.send('SendMessage', user, message);
      console.log('Message sent successfully via send method');
      
      // Curățăm câmpul de mesaj după trimitere
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorMessage(`Failed to send message: ${error.message || 'Unknown error'}`);
      
      // Încercăm metoda invoke ca fallback
      try {
        console.log('Trying invoke method as fallback');
        await connection.invoke('SendMessage', user, message);
        console.log('Message sent successfully via invoke method');
        setMessage('');
      } catch (invokeError) {
        console.error('Error using invoke method:', invokeError);
      }
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Try to reconnect
  const handleRetryConnection = () => {
    // Force reconnection attempt
    if (connection) {
      connection.stop();
    }
    
    // Refresh page as a simple way to restart everything
    window.location.reload();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Live Chat</h2>
        <div className="connection-status">
          {connectionState === 'connected' ? (
            <span className="status-connected">Connected</span>
          ) : connectionState === 'connecting' ? (
            <span className="status-connecting">Connecting...</span>
          ) : (
            <span className="status-error">Disconnected</span>
          )}
        </div>
      </div>
      
      {connectionState !== 'connected' && (
        <div className="connecting-overlay">
          <div className="connecting-message">
            {connectionState === 'connecting' ? (
              <>Connecting to chat server...</>
            ) : (
              <>
                <p>Connection Error</p>
                <p className="error-details">{errorMessage}</p>
                <button className="retry-button" onClick={handleRetryConnection}>
                  Retry Connection
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="messages-container">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className="message">
              <div className="message-header">
                <span className="username">{msg.user}</span>
                <span className="timestamp">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        ) : (
          <div className="no-messages">No messages yet. Be the first to say hello!</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="message-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Your Name"
          className="name-input"
          required
          disabled={connectionState !== 'connected'}
        />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
          required
          disabled={connectionState !== 'connected'}
        />
        <button 
          type="submit" 
          className="send-button" 
          disabled={connectionState !== 'connected'}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default App;