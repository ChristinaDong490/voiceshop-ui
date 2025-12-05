import { useState, useCallback } from "react";
import Header from "@/components/Header";
import VoiceButton, { VoiceStatus } from "@/components/VoiceButton";
import ConversationPanel, { Message } from "@/components/ConversationPanel";
import ProductCard, { Product } from "@/components/ProductCard";
import StatusIndicator from "@/components/StatusIndicator";
import SuggestedPrompts from "@/components/SuggestedPrompts";
import { useToast } from "@/hooks/use-toast";

// Sample products data
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Noise-Canceling Headphones",
    price: 249.99,
    originalPrice: 349.99,
    rating: 4.8,
    reviews: 2847,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    category: "Electronics",
    inStock: true,
  },
  {
    id: "2",
    name: "Smart Fitness Watch with Heart Rate Monitor",
    price: 199.99,
    originalPrice: 279.99,
    rating: 4.6,
    reviews: 1523,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    category: "Wearables",
    inStock: true,
  },
  {
    id: "3",
    name: "Minimalist Leather Crossbody Bag",
    price: 89.99,
    rating: 4.9,
    reviews: 892,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
    category: "Fashion",
    inStock: true,
  },
  {
    id: "4",
    name: "Portable Bluetooth Speaker Waterproof",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.5,
    reviews: 3201,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    category: "Electronics",
    inStock: false,
  },
];

const Index = () => {
  const { toast } = useToast();
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [isConnected] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const handleVoiceClick = useCallback(() => {
    if (voiceStatus === "idle") {
      setVoiceStatus("listening");
      // Simulate voice interaction
      setTimeout(() => {
        setVoiceStatus("processing");
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "user",
            content: "Show me some trending products",
            timestamp: new Date(),
          },
        ]);
      }, 2000);

      setTimeout(() => {
        setVoiceStatus("speaking");
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "I found some great trending products for you! Here are our top picks including premium headphones, smart watches, and more. Would you like me to filter by category or price range?",
            timestamp: new Date(),
          },
        ]);
        setShowProducts(true);
      }, 3500);

      setTimeout(() => {
        setVoiceStatus("idle");
      }, 6000);
    } else {
      setVoiceStatus("idle");
    }
  }, [voiceStatus]);

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
      setShowProducts(true);
    }, 1500);

    setTimeout(() => {
      setVoiceStatus("idle");
    }, 3000);
  };

  const handleAddToCart = (product: Product) => {
    setCartCount((prev) => prev + 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleFavorite = (product: Product) => {
    toast({
      title: "Added to favorites",
      description: `${product.name} has been saved to your wishlist.`,
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

          {/* Right Panel - Product Recommendations */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {showProducts ? "Recommendations" : "Popular Today"}
              </h2>
              <button className="text-sm text-primary font-medium hover:underline">
                View All
              </button>
            </div>

            {/* Products grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {sampleProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onFavorite={handleFavorite}
                  />
                </div>
              ))}
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
