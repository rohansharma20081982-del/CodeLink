"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Code, Smile, Download, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date
  isCode?: boolean
  isSystem?: boolean
  file?: {
    name: string
    url: string
    size: number
  }
}

interface ChatPanelProps {
  currentUser: string
  otherUser: string
}

const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    icon: "😀",
    emojis: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😔", "😪"]
  },
  {
    name: "Gestures",
    icon: "👋",
    emojis: ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🙏", "💪", "🦾", "🖕"]
  },
  {
    name: "Reactions",
    icon: "❤️",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "⭐", "🌟", "✨", "⚡", "🔥", "💯", "✅", "❌", "⚠️", "🎉", "🎊", "🏆", "🥇", "🎯"]
  },
  {
    name: "Coding",
    icon: "💻",
    emojis: ["💻", "🖥️", "⌨️", "🖱️", "🖨️", "📱", "💾", "📀", "🧮", "🔧", "🔨", "🛠️", "⚙️", "🔗", "📝", "📋", "📌", "📍", "🔎", "🔬", "🧪", "🧬", "💡", "📊", "📈", "📉", "🗂️", "📁", "📂", "🗃️", "🐛", "🐞"]
  }
]

export function ChatPanel({ currentUser, otherUser }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "System",
      content: "Interview session started. Good luck!",
      timestamp: new Date(Date.now() - 300000),
      isSystem: true
    },
    {
      id: "2",
      sender: otherUser,
      content: "Hi! Welcome to the interview. Let me share the problem we'll be working on today.",
      timestamp: new Date(Date.now() - 240000)
    },
    {
      id: "3",
      sender: otherUser,
      content: "We'll be solving the Two Sum problem. Take your time to read through it and let me know when you're ready.",
      timestamp: new Date(Date.now() - 180000)
    }
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isCodeMode, setIsCodeMode] = useState(false)
  const [emojiCategory, setEmojiCategory] = useState(0)
  const [isEmojiOpen, setIsEmojiOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      sender: currentUser,
      content: newMessage,
      timestamp: new Date(),
      isCode: isCodeMode
    }

    setMessages(prev => [...prev, message])
    setNewMessage("")
    setIsCodeMode(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileUrl = URL.createObjectURL(file)

    const message: Message = {
      id: Date.now().toString(),
      sender: currentUser,
      content: `📎 Attached file: ${file.name}`,
      timestamp: new Date(),
      isCode: false,
      file: {
        name: file.name,
        url: fileUrl,
        size: file.size
      }
    }

    setMessages(prev => [...prev, message])
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // reset input
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const insertEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    inputRef.current?.focus()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-medium">Chat</h3>
        <p className="text-xs text-muted-foreground">Messages are saved with the recording</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col",
                message.isSystem && "items-center",
                message.sender === currentUser && !message.isSystem && "items-end"
              )}
            >
              {message.isSystem ? (
                <div className="px-3 py-1.5 bg-muted rounded-full text-xs text-muted-foreground">
                  {message.content}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {message.sender === currentUser ? "You" : message.sender}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      message.sender === currentUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                      message.isCode && "font-mono bg-sidebar border border-border text-foreground"
                    )}
                  >
                    {message.file ? (
                      <div className="flex flex-col gap-2 mt-1 p-2 bg-background/50 rounded-md border border-border text-foreground">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4" />
                          <span className="text-sm font-medium truncate max-w-[150px]">{message.file.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                            {(message.file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button size="sm" variant="secondary" className="flex-1 text-xs h-7" asChild>
                            <a href={message.file.url} target="_blank" rel="noreferrer">Open</a>
                          </Button>
                          <Button size="sm" variant="default" className="flex-1 text-xs h-7 gap-1" asChild>
                            <a href={message.file.url} download={message.file.name}>
                              <Download className="h-3 w-3" /> Save
                            </a>
                          </Button>
                        </div>
                      </div>
                    ) : message.isCode ? (
                      <pre className="whitespace-pre-wrap">{message.content}</pre>
                    ) : (
                      message.content
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
          <div ref={bottomRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Button
            variant={isCodeMode ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => setIsCodeMode(!isCodeMode)}
            title="Send as code"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isCodeMode ? "Type code..." : "Type a message..."}
            className={cn(
              "flex-1 h-9",
              isCodeMode && "font-mono"
            )}
          />
          {/* Emoji Picker */}
          <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={isEmojiOpen ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                title="Insert emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="end"
              className="w-72 p-0"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="flex flex-col">
                {/* Category tabs */}
                <div className="flex items-center border-b border-border px-1 py-1.5 gap-0.5">
                  {EMOJI_CATEGORIES.map((cat, i) => (
                    <button
                      key={cat.name}
                      onClick={() => setEmojiCategory(i)}
                      className={cn(
                        "flex-1 flex items-center justify-center py-1.5 rounded-md text-base transition-colors",
                        emojiCategory === i
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted"
                      )}
                      title={cat.name}
                    >
                      {cat.icon}
                    </button>
                  ))}
                </div>
                {/* Category label */}
                <div className="px-3 pt-2 pb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {EMOJI_CATEGORIES[emojiCategory].name}
                  </span>
                </div>
                {/* Emoji grid */}
                <ScrollArea className="h-48 px-2 pb-2">
                  <div className="grid grid-cols-8 gap-0.5">
                    {EMOJI_CATEGORIES[emojiCategory].emojis.map((emoji, i) => (
                      <button
                        key={`${emoji}-${i}`}
                        onClick={() => insertEmoji(emoji)}
                        className="h-8 w-8 flex items-center justify-center rounded-md text-lg hover:bg-accent hover:scale-110 transition-all duration-150"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>
          <Button 
            size="icon" 
            className="h-8 w-8 flex-shrink-0"
            onClick={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {isCodeMode && (
          <p className="text-xs text-muted-foreground mt-2">
            Code mode enabled - message will be formatted as code
          </p>
        )}
      </div>
    </div>
  )
}
