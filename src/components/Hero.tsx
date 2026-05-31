import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  const handleCall = () => {
    window.open("tel:+919908590094", "_self");
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/919908590094?text=Hi! I'd like to book a cab for my journey", "_blank");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 hero-gradient opacity-90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          {/* Main Headline */}
          <h1 className="hero-title text-5xl lg:text-7xl font-bold mb-6 text-foreground">
            🚗 <span className="text-divine">Safe. Spiritual. Trusted</span> Since 2015.
          </h1>

          {/* Subheadline */}
          <p className="text-xl lg:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore temples, beaches, and cities with our driver-cum-owner cabs from Hyderabad — 
            <span className="text-primary font-semibold"> your journey, our devotion.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 w-full max-w-sm mx-auto sm:max-w-none">
            <Button 
              onClick={handleWhatsApp}
              size="lg" 
              className="btn-divine text-lg px-8 py-4 h-auto animate-slide-in-right"
            >
              <MessageCircle className="w-5 h-5 mr-3" />
              Book a Cab Now
            </Button>
            <Button 
              onClick={handleCall}
              variant="outline" 
              size="lg" 
              className="btn-outline-divine text-lg px-8 py-4 h-auto"
            >
              <Phone className="w-5 h-5 mr-3" />
              Call Now
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-2 sm:gap-8 max-w-2xl mx-auto border-t border-border/20 pt-6 sm:pt-0 sm:border-none">
            <div className="text-center animate-float" style={{ animationDelay: '0s' }}>
              <div className="text-lg xs:text-xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">9+ Years</div>
              <div className="text-[10px] xs:text-xs sm:text-base text-muted-foreground">Trusted Service</div>
            </div>
            <div className="text-center animate-float" style={{ animationDelay: '2s' }}>
              <div className="text-lg xs:text-xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">24/7</div>
              <div className="text-[10px] xs:text-xs sm:text-base text-muted-foreground">Available</div>
            </div>
            <div className="text-center animate-float" style={{ animationDelay: '4s' }}>
              <div className="text-lg xs:text-xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">100+</div>
              <div className="text-[10px] xs:text-xs sm:text-base text-muted-foreground">Happy Families</div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;