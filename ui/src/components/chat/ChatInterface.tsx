
import React, { useState } from 'react';
import { SendHorizontal, Bot, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hi there! How can I help you with your PII dashboard today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "I've analyzed your dashboard data. The number of PII detections has increased by 15% since yesterday. Would you like to see a detailed report?",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[500px] rounded-xl border border-border bg-card shadow-sm">
      <div className="p-4 border-b border-border bg-card flex items-center">
        <Bot className="h-5 w-5 text-primary mr-2" />
        <h3 className="font-display text-lg font-medium">Dashboard Assistant</h3>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex gap-3 max-w-[80%]", 
                message.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <Avatar className={cn(
                "h-8 w-8 border", 
                message.sender === 'user' 
                  ? "bg-primary text-primary-foreground border-primary/10" 
                  : "bg-muted text-foreground border-border"
              )}>
                {message.sender === 'user' ? 
                  <MessageSquare className="h-4 w-4" /> : 
                  <Bot className="h-4 w-4" />
                }
              </Avatar>
              
              <div className={cn(
                "rounded-lg py-2 px-3",
                message.sender === 'user' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-foreground border border-border"
              )}>
                <p className="text-sm font-sans">{message.text}</p>
                <span className="text-xs opacity-70 block mt-1">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage}
            size="icon"
            disabled={!input.trim()}
            className="shrink-0"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
