import { useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import VoiceButton, { VoiceStatus } from "@/components/VoiceButton";
import ConversationPanel, { Message } from "@/components/ConversationPanel";
import ProductComparisonTable, { ComparisonProduct } from "@/components/ProductComparisonTable";
import StatusIndicator from "@/components/StatusIndicator";
import SuggestedPrompts from "@/components/SuggestedPrompts";
import { useToast } from "@/hooks/use-toast";
import { useSpeechToText } from "@/hooks/useSpeechToText";

// Eco-friendly cleaner comparison data
const ecoCleanerProducts: ComparisonProduct[] = [
  {
    id: "1",
    name: "Steel-Safe Eco Cleaner",
    brand: "Brand X",
    price: 12.49,
    rating: 4.6,
    reviews: 1847,
    ingredients: "Plant-based surfactants, citric acid",
    sourceType: "doc",
    sourceLabel: "Product Spec #2847",
    isTopPick: true,
  },
  {
    id: "2",
    name: "GreenShine Stainless Polish",
    brand: "EcoHome",
    price: 9.99,
    rating: 4.3,
    reviews: 923,
    ingredients: "Coconut oil derivatives, aloe vera",
    sourceType: "link",
    sourceLabel: "Amazon",
    sourceUrl: "#",
  },
  {
    id: "3",
    name: "Nature's Steel Cleaner",
    brand: "PureClean",
    price: 14.99,
    rating: 4.7,
    reviews: 2156,
    ingredients: "Essential oils, plant enzymes",
    sourceType: "link",
    sourceLabel: "Target",
    sourceUrl: "#",
  },
];

const Index = () => {
  const { toast } = useToast();
  const { isRecording, isProcessing, startRecording, stopAndTranscribe, error } = useSpeechToText();
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [isConnected] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Sync voice status with recording/processing state
  useEffect(() => {
    if (isRecording) {
      setVoiceStatus("listening");
    } else if (isProcessing) {
      setVoiceStatus("processing");
    }
  }, [isRecording, isProcessing]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleVoiceClick = useCallback(async () => {
    if (voiceStatus === "idle") {
      // Start recording
      await startRecording();
    } else if (voiceStatus === "listening") {
      // Stop recording and transcribe
      const text = await stopAndTranscribe();
      
      if (text) {
        // Add user message with transcribed text
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "user",
            content: text,
            timestamp: new Date(),
          },
        ]);

        // Simulate assistant response (replace with actual API call later)
        setVoiceStatus("speaking");
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: "Here are three options that fit your budget and material. My top pick is Brand X Steel-Safe Eco Cleaner—plant-based surfactants, 4.6★ average rating, typically $12.49. I compared this with two alternatives. I've sent details and sources to your screen. Would you like the most affordable or the highest rated?",
              timestamp: new Date(),
            },
          ]);
          setShowProducts(true);
          setVoiceStatus("idle");
        }, 1500);
      } else {
        setVoiceStatus("idle");
      }
    } else {
      // Cancel/stop any ongoing process
      setVoiceStatus("idle");
    }
  }, [voiceStatus, startRecording, stopAndTranscribe]);

  const handlePromptSelect = (prompt: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: prompt,
        timestamp: new Date(),
      },
    ]);
    setVoiceStatus("processing");

    setTimeout(() => {
      setVoiceStatus("speaking");
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Great choice! I'm searching for "${prompt.toLowerCase()}". Here are some recommendations I think you'll love.`,
          timestamp: new Date(),
        },
      ]);
      // Products already showing
    }, 1500);

    setTimeout(() => {
      setVoiceStatus("idle");
    }, 3000);
  };

  const handleSelectProduct = (product: ComparisonProduct) => {
    setCartCount((prev) => prev + 1);
    toast({
      title: "Added to cart",
      description: `${product.name} by ${product.brand} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen gradient-surface">
      <Header cartCount={cartCount} />

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8 min-h-[calc(100vh-8rem)]">
          {/* Left Panel - Voice Interface */}
          <div className="flex flex-col">
            {/* Status bar */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                AI Assistant
              </h2>
              <StatusIndicator
                isConnected={isConnected}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted(!isMuted)}
              />
            </div>

            {/* Conversation area */}
            <div className="flex-1 glass rounded-2xl mb-6 min-h-[300px] max-h-[400px] overflow-hidden">
              <ConversationPanel
                messages={messages}
                isLoading={voiceStatus === "processing"}
              />
            </div>

            {/* Voice button section */}
            <div className="flex flex-col items-center gap-8 py-8">
              <VoiceButton status={voiceStatus} onClick={handleVoiceClick} />
              
              {/* Suggested prompts */}
              {messages.length === 0 && (
                <div className="mt-8 w-full">
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    Or try one of these:
                  </p>
                  <SuggestedPrompts onSelect={handlePromptSelect} />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Product Comparison */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Top 3 Eco-Friendly Cleaners
              </h2>
              <span className="text-xs text-muted-foreground">Under $15</span>
            </div>

            {/* Comparison Table */}
            {showProducts && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <ProductComparisonTable
                  products={ecoCleanerProducts}
                  onSelectProduct={handleSelectProduct}
                />
              </div>
            )}

            {/* Quick action buttons */}
            <div className="mt-6 flex gap-3">
              <button className="flex-1 py-3 px-4 rounded-xl glass border border-border/50 text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors">
                Most Affordable
              </button>
              <button className="flex-1 py-3 px-4 rounded-xl gradient-primary text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                Highest Rated
              </button>
            </div>

            {/* Feature highlights */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: "Free Shipping", value: "Orders $50+" },
                { label: "Easy Returns", value: "30 Days" },
                { label: "Secure Pay", value: "Encrypted" },
              ].map((feature) => (
                <div
                  key={feature.label}
                  className="glass rounded-xl p-4 text-center"
                >
                  <p className="text-primary font-semibold text-sm">
                    {feature.label}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {feature.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
