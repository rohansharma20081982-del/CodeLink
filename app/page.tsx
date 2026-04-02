"use client"

import Link from "next/link"
import { 
  Video, 
  Code2, 
  Users, 
  Shield, 
  Monitor,
  Play,
  ArrowRight,
  Sparkles,
  LogIn,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export default function HomePage() {
  // Scroll animations
  const heroAnim = useScrollAnimation({ threshold: 0.1 })
  const cardsAnim = useScrollAnimation({ threshold: 0.1 })
  const featuresAnim = useScrollAnimation({ threshold: 0.1 })
  const previewAnim = useScrollAnimation({ threshold: 0.1 })

  const features = [
    {
      icon: Video,
      title: "HD Video Calls",
      description: "Crystal-clear 1080p video with noise cancellation and background blur"
    },
    {
      icon: Code2,
      title: "VS Code Editor",
      description: "Full-featured code editor with syntax highlighting and IntelliSense"
    },
    {
      icon: Play,
      title: "Run Code Live",
      description: "Execute Python, JavaScript, Java, C++, and TypeScript in real-time"
    },
    {
      icon: Users,
      title: "Real-time Collab",
      description: "See each other type with live cursors and instant sync"
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description: "1:1 locked sessions with end-to-end encryption"
    },
    {
      icon: Monitor,
      title: "Screen Share",
      description: "One-click screen sharing with picture-in-picture support"
    }
  ]

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">CL</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">CodeLink Interview</h1>
              <p className="text-xs text-muted-foreground">Technical interviews, simplified</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <a href="#features" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/login">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/sign-up">
                Get Started
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div 
            ref={heroAnim.ref}
            className="space-y-6"
          >
            {/* Badge */}
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm",
              heroAnim.isVisible && "animate-fade-up-blur"
            )}>
              <Sparkles className="h-4 w-4" />
              <span>No downloads required - works in your browser</span>
            </div>

            {/* Headline – each word slides in with a stagger */}
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-balance overflow-hidden">
              {["Technical", "Interviews,", "Reimagined"].map((word, i) => (
                <span
                  key={word}
                  className={cn(
                    "inline-block mr-4",
                    heroAnim.isVisible
                      ? i === 2
                        ? "text-primary animate-slide-up"
                        : "animate-slide-up"
                      : "opacity-0 translate-y-8"
                  )}
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  {word}
                </span>
              ))}
            </h2>

            {/* Subtitle */}
            <p className={cn(
              "text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty",
              heroAnim.isVisible && "animate-fade-up-blur delay-300"
            )}>
              Combine the power of Zoom video calls with a VS Code-like coding environment. 
              Everything you need for technical interviews in one browser tab.
            </p>

            {/* CTA Buttons */}
            <div className={cn(
              "flex flex-col sm:flex-row gap-4 justify-center mb-16",
              heroAnim.isVisible && "animate-slide-up delay-500"
            )}>
              <Button asChild size="lg" className="gap-2">
                <Link href="/auth/sign-up">
                  Start Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">
                  Sign In to Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Start Cards */}
          <div 
            id="start" 
            ref={cardsAnim.ref}
            className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
          >
            {/* For Interviewers */}
            <Card className={cn(
              "text-left transition-all duration-700 delay-100 ease-out",
              cardsAnim.isVisible 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-12"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-accent" />
                  For Interviewers
                </CardTitle>
                <CardDescription>
                  Create interview rooms and manage candidates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Create meetings with unique codes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Share code in real-time
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Record interview sessions
                  </li>
                </ul>
                <Button asChild className="w-full gap-2">
                  <Link href="/auth/sign-up">
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* For Candidates */}
            <Card className={cn(
              "text-left transition-all duration-700 delay-200 ease-out",
              cardsAnim.isVisible 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-12"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  For Candidates
                </CardTitle>
                <CardDescription>
                  Join interviews and showcase your skills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Join with a meeting code
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Code in a familiar VS Code environment
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Run and test your solutions
                  </li>
                </ul>
                <Button asChild variant="secondary" className="w-full gap-2">
                  <Link href="/auth/login">
                    Sign In to Join
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div 
            ref={featuresAnim.ref}
            className={cn(
              "text-center mb-12 transition-all duration-700 ease-out",
              featuresAnim.isVisible 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-8"
            )}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Everything You Need
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built specifically for technical coding interviews with all the tools you love
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={cn(
                  "bg-card/50 backdrop-blur-sm transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-lg",
                  featuresAnim.isVisible 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-8"
                )}
                style={{ 
                  transitionDelay: featuresAnim.isVisible ? `${150 + index * 100}ms` : "0ms"
                }}
              >
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div 
            ref={previewAnim.ref}
            className={cn(
              "text-center mb-8 transition-all duration-700 ease-out",
              previewAnim.isVisible 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-8"
            )}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              See It In Action
            </h3>
            <p className="text-muted-foreground">
              A seamless interview experience with video, code, and chat in one place
            </p>
          </div>

          {/* Mock Interface Preview */}
          <div className={cn(
            "max-w-5xl mx-auto rounded-xl border border-border overflow-hidden bg-card shadow-2xl transition-all duration-1000 delay-200 ease-out",
            previewAnim.isVisible 
              ? "opacity-100 translate-y-0 scale-100" 
              : "opacity-0 translate-y-12 scale-95"
          )}>
            {/* Mock Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">CL</span>
                </div>
                <span className="text-sm font-medium">Technical Interview</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-3 h-3 rounded-full bg-accent",
                  previewAnim.isVisible && "animate-pulse"
                )} />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>

            {/* Mock Content */}
            <div className="grid md:grid-cols-3 gap-px bg-border">
              {/* Video Area */}
              <div className={cn(
                "bg-muted p-4 aspect-video flex items-center justify-center transition-all duration-700 delay-300",
                previewAnim.isVisible 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-0 -translate-x-8"
              )}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                    <Video className="h-8 w-8 text-primary/60" />
                  </div>
                  <p className="text-sm text-muted-foreground">HD Video</p>
                </div>
              </div>

              {/* Code Area */}
              <div className={cn(
                "bg-sidebar p-4 aspect-video transition-all duration-700 delay-400",
                previewAnim.isVisible 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-8"
              )}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <div className="space-y-2 font-mono text-xs">
                  <div className="text-primary">def two_sum(nums, target):</div>
                  <div className="text-muted-foreground pl-4">seen = {"{}"}</div>
                  <div className="text-muted-foreground pl-4">for i, num in enumerate(nums):</div>
                  <div className="text-accent pl-8">if target - num in seen:</div>
                  <div className="text-muted-foreground pl-12">return [seen[target-num], i]</div>
                </div>
              </div>

              {/* Chat Area */}
              <div className={cn(
                "bg-card p-4 aspect-video transition-all duration-700 delay-500",
                previewAnim.isVisible 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-0 translate-x-8"
              )}>
                <p className="text-xs font-medium mb-3">Chat</p>
                <div className="space-y-2">
                  <div className={cn(
                    "bg-muted rounded px-2 py-1 text-xs transition-all duration-500 delay-700",
                    previewAnim.isVisible 
                      ? "opacity-100 translate-y-0" 
                      : "opacity-0 translate-y-4"
                  )}>
                    <span className="text-muted-foreground">Great approach!</span>
                  </div>
                  <div className={cn(
                    "bg-primary/20 rounded px-2 py-1 text-xs ml-4 transition-all duration-500 delay-[800ms]",
                    previewAnim.isVisible 
                      ? "opacity-100 translate-y-0" 
                      : "opacity-0 translate-y-4"
                  )}>
                    <span>Thanks, running it now...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            CodeLink Interview - Technical coding interviews made simple
          </p>
        </div>
      </footer>
    </div>
  )
}
