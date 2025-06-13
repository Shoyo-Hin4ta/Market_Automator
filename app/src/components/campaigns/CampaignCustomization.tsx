'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Send, Rocket, Sparkles } from 'lucide-react'
import { useToast } from '@/app/src/hooks/use-toast'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface CampaignCustomizationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDesign: any
  campaignName: string
  selectedChannels: string[]
  onLaunchCampaign: (content: any) => void
}

export function CampaignCustomization({
  open,
  onOpenChange,
  selectedDesign,
  campaignName,
  selectedChannels,
  onLaunchCampaign
}: CampaignCustomizationProps) {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [emailContent, setEmailContent] = useState<string>('')
  const [landingContent, setLandingContent] = useState<string>('')
  const [activeTab, setActiveTab] = useState('email')
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  
  // Add initial greeting when dialog opens
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm here to help you create an amazing campaign for "${campaignName}". To get started, could you tell me a bit about what you're promoting and who your target audience is?`
      }])
    }
  }, [open, campaignName, messages.length])
  
  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return
    
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/refine-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName,
          designUrl: selectedDesign.thumbnail?.url,
          messages: [...messages, { role: 'user', content: userMessage }],
          currentEmail: emailContent,
          currentLanding: landingContent,
          selectedChannels
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      // Check if we need more info
      if (data.needsMoreInfo) {
        // Assistant is asking clarifying questions
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.message
        }])
      } else {
        // We have content!
        if (data.email) setEmailContent(data.email)
        if (data.landing) setLandingContent(data.landing)
        setHasGeneratedContent(true)
        
        // Add assistant response
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.message
        }])
      }
      
      // Scroll to bottom
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleLaunch = () => {
    if (!emailContent && selectedChannels.includes('email')) {
      toast({
        title: 'Missing content',
        description: 'Please describe your campaign first',
        variant: 'destructive'
      })
      return
    }
    
    onLaunchCampaign({
      email: emailContent ? { html: emailContent } : null,
      landing: landingContent ? { html: landingContent } : null
    })
  }
  
  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setMessages([])
      setEmailContent('')
      setLandingContent('')
      setHasGeneratedContent(false)
      setActiveTab('email')
    }
  }, [open])
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[90vw] max-w-7xl h-[85vh] min-h-[650px] min-w-[1000px] overflow-hidden"
      >
        <VisuallyHidden>
          <DialogTitle>Customize Campaign with AI</DialogTitle>
        </VisuallyHidden>
        <div className="grid grid-cols-2 gap-4 h-full p-6">
          {/* Preview Side */}
          <div className="flex flex-col h-full">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              Preview
              {hasGeneratedContent && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Ready
                </span>
              )}
            </h3>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" disabled={!hasGeneratedContent && selectedChannels.includes('email')}>
                  Email
                </TabsTrigger>
                <TabsTrigger value="landing" disabled={!hasGeneratedContent && (selectedChannels.includes('github') || selectedChannels.includes('landing'))}>
                  Landing Page
                </TabsTrigger>
              </TabsList>
              <TabsContent value="email" className="flex-1 mt-4">
                {emailContent ? (
                  <iframe
                    srcDoc={emailContent}
                    className="w-full h-full border rounded-lg"
                    title="Email Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>Chat with me to generate email content</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="landing" className="flex-1 mt-4">
                {landingContent ? (
                  <iframe
                    srcDoc={landingContent}
                    className="w-full h-full border rounded-lg"
                    title="Landing Page Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>Chat with me to generate landing page content</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Chat Side */}
          <div className="flex flex-col h-full">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Campaign Assistant
            </h3>
            <div className="flex-1 border rounded-lg p-4 overflow-y-auto mb-4 bg-muted/10">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-lg max-w-[85%] ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="text-left">
                    <div className="inline-block p-3 rounded-lg bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={hasGeneratedContent ? "Request changes or improvements..." : "Answer the questions or describe your campaign..."}
                disabled={isGenerating}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isGenerating || !input.trim()}
                size="icon"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <Button 
              onClick={handleLaunch} 
              className="mt-4 w-full"
              disabled={!hasGeneratedContent || isGenerating}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Launch Campaign to the Moon! 🚀
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}