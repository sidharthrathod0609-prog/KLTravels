import { useState } from "react";
import { Phone, MessageCircle, MapPin, Clock, Send, Mail, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { sanitizeInput, validateName, validatePhone, validateTravelDate, validateLocation, checkRateLimit, recordSubmit } from "@/lib/security";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pickupArea: "",
    destination: "",
    dates: "",
    passengers: "",
    notes: ""
  });

  const [isOpen, setIsOpen] = useState(false);
  const [dateInputVal, setDateInputVal] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const maskDateInput = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 8);
    let formatted = "";
    if (clean.length > 0) {
      formatted += clean.slice(0, 2);
    }
    if (clean.length > 2) {
      formatted += "-" + clean.slice(2, 4);
    }
    if (clean.length > 4) {
      formatted += "-" + clean.slice(4, 8);
    }
    return formatted;
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        const [y, m, d] = parts;
        return `${d}-${m}-${y}`;
      }
    }
    return dateStr;
  };

  const isPastDate = (dateStr: string) => {
    if (!dateStr) return false;
    let y = 0, m = 0, d = 0;
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        y = Number(parts[0]);
        m = Number(parts[1]) - 1;
        d = Number(parts[2]);
      } else if (parts[2].length === 4) {
        d = Number(parts[0]);
        m = Number(parts[1]) - 1;
        y = Number(parts[2]);
      } else {
        return false;
      }
    } else {
      const timestamp = Date.parse(dateStr);
      if (isNaN(timestamp)) return false;
      const parsed = new Date(timestamp);
      y = parsed.getFullYear();
      m = parsed.getMonth();
      d = parsed.getDate();
    }
    if (isNaN(y) || isNaN(m) || isNaN(d)) return false;
    const selectedDate = new Date(y, m, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today;
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedVal = maskDateInput(e.target.value);
    setDateInputVal(maskedVal);
    
    if (!maskedVal) {
      setFormData(prev => ({ ...prev, dates: "" }));
      return;
    }

    if (maskedVal.length === 10) {
      const [d, m, y] = maskedVal.split("-");
      setFormData(prev => ({ ...prev, dates: `${y}-${m}-${d}` }));
    }
  };

  const handleCall = () => {
    window.open("tel:+919908590094", "_self");
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/919908590094?text=Hi! I'd like to book a cab", "_blank");
  };

  const handleQuickWhatsApp = (message: string) => {
    window.open(`https://wa.me/919908590094?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Bot Protection Token Check
    if (!turnstileToken) {
      toast.error("Please complete the security check.");
      return;
    }

    // 2. Client-side Rate Limiting check
    const limit = checkRateLimit("contact");
    if (!limit.allowed) {
      toast.error(`Please wait ${limit.remaining} seconds before submitting another request.`);
      return;
    }

    // 3. Strict Input Validation (Prevents Injection)
    if (!validateName(formData.name)) {
      toast.error("Please enter a valid name (letters and spaces only, 2-50 characters).");
      return;
    }

    if (!validatePhone(formData.phone)) {
      toast.error("Please enter a valid phone number (10-15 digits).");
      return;
    }

    if (!validateLocation(formData.pickupArea)) {
      toast.error("Pickup location contains invalid characters.");
      return;
    }

    if (!formData.dates) {
      toast.error("Please select a travel date.");
      setIsOpen(true);
      return;
    }

    if (!validateTravelDate(formData.dates)) {
      toast.error("Please select a current or future travel date.");
      setIsOpen(true);
      return;
    }

    // 4. Strict Input Sanitization (Prevents XSS / HTML Injection)
    const cleanName = sanitizeInput(formData.name);
    const cleanPhone = sanitizeInput(formData.phone);
    const cleanPickup = sanitizeInput(formData.pickupArea);
    const cleanDestination = sanitizeInput(formData.destination);
    const cleanDate = formData.dates ? formatDateDisplay(formData.dates) : "";
    
    // Construct passengers string from numeric counter state
    const passengersText = `${adults} Adults, ${children} Children`;
    const cleanPassengers = sanitizeInput(passengersText);
    const cleanNotes = formData.notes.trim() ? sanitizeInput(formData.notes) : "None";

    const message = `Hi! I'd like to book a cab.
Name: ${cleanName}
Phone: ${cleanPhone}
Pickup: ${cleanPickup}
Destination: ${cleanDestination}
Dates: ${cleanDate}
Passengers: ${cleanPassengers}
Notes: ${cleanNotes}`;
    
    handleQuickWhatsApp(message);
    recordSubmit("contact");
  };

  const quickBookingOptions = [
    {
      title: "Temple Tours",
      description: "Srisailam, Tirupati, Shirdi",
      message: "Hi! I'm interested in temple tour packages. Please share details."
    },
    {
      title: "Coastal Trips",
      description: "Goa, Pondicherry, Gokarna",
      message: "Hi! I'd like to book a coastal trip. Please send me quotes."
    },
    {
      title: "City Sightseeing",
      description: "Hyderabad full day tour",
      message: "Hi! I want to book Hyderabad city sightseeing. Please share itinerary."
    },
    {
      title: "Airport Transfer",
      description: "Pickup/Drop service",
      message: "Hi! I need airport transfer service. Please share rates."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-divine">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-white animate-fade-in">
              Contact & Book
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto animate-fade-in">
              Ready to start your journey? Get in touch with us for personalized quotes and bookings
            </p>
          </div>
        </section>

        {/* Quick Contact */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-8 mb-16">
              <Card className="card-spiritual hover-lift cursor-pointer p-0 flex flex-col justify-between" onClick={handleCall}>
                <CardContent className="p-2.5 sm:p-8 text-center">
                  <Phone className="w-6 h-6 sm:w-12 sm:h-12 text-primary mx-auto mb-1.5 sm:mb-4" />
                  <h3 className="text-xs xs:text-sm sm:text-2xl font-bold mb-0.5 sm:mb-2 text-divine">Call Now</h3>
                  <p className="text-[9px] xs:text-xs sm:text-lg text-primary font-semibold mb-0.5 sm:mb-2">+91 9908590094</p>
                  <p className="text-[8px] xs:text-[10px] sm:text-base text-muted-foreground leading-normal line-clamp-1 sm:line-clamp-none">Instant support and booking</p>
                </CardContent>
              </Card>

              <Card className="card-spiritual hover-lift cursor-pointer p-0 flex flex-col justify-between" onClick={handleWhatsApp}>
                <CardContent className="p-2.5 sm:p-8 text-center">
                  <MessageCircle className="w-6 h-6 sm:w-12 sm:h-12 text-primary mx-auto mb-1.5 sm:mb-4" />
                  <h3 className="text-xs xs:text-sm sm:text-2xl font-bold mb-0.5 sm:mb-2 text-divine">WhatsApp</h3>
                  <p className="text-[9px] xs:text-xs sm:text-lg text-primary font-semibold mb-0.5 sm:mb-2">+91 9908590094</p>
                  <p className="text-[8px] xs:text-[10px] sm:text-base text-muted-foreground leading-normal line-clamp-1 sm:line-clamp-none">Quick quotes and easy booking</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Booking Options */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-8 text-divine">Quick Booking</h2>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {quickBookingOptions.map((option, index) => (
                  <Card 
                    key={index} 
                    className="card-spiritual hover-lift cursor-pointer p-0 flex flex-col justify-between"
                    onClick={() => handleQuickWhatsApp(option.message)}
                  >
                    <CardHeader className="p-2.5 sm:p-6 pb-1 sm:pb-4">
                      <CardTitle className="text-xs xs:text-sm sm:text-xl font-bold text-divine line-clamp-1">{option.title}</CardTitle>
                      <CardDescription className="text-[9px] xs:text-[10px] sm:text-sm text-muted-foreground line-clamp-2 min-h-[2.25rem] sm:min-h-0">{option.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2.5 sm:p-6 pt-0 sm:pt-0">
                      <Button variant="outline" className="w-full btn-outline-divine text-[9px] xs:text-[10px] sm:text-sm h-7 xs:h-8 px-1 sm:px-2">
                        Get Quote
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20 bg-secondary/20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold mb-8 text-divine">Book Your Trip</h2>
                <Card className="card-spiritual">
                  <CardHeader>
                    <CardTitle className="text-divine">Trip Details</CardTitle>
                    <CardDescription>We'll reply quickly with the best quote</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Enter your name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            placeholder="Your phone number"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pickup">Pickup Area *</Label>
                          <Input
                            id="pickup"
                            value={formData.pickupArea}
                            onChange={(e) => setFormData({...formData, pickupArea: e.target.value})}
                            placeholder="e.g., LB Nagar, Airport"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="destination">Destination *</Label>
                          <Select onValueChange={(value) => setFormData({...formData, destination: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="srisailam">Srisailam</SelectItem>
                              <SelectItem value="tirupati">Tirupati</SelectItem>
                              <SelectItem value="pondicherry">Pondicherry</SelectItem>
                              <SelectItem value="goa">Goa</SelectItem>
                              <SelectItem value="hyderabad">Hyderabad Sightseeing</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Number of Passengers (Optional) - Left side (7 columns) */}
                        <div className="space-y-2 col-span-12 md:col-span-7">
                          <Label>Number of Passengers (Optional)</Label>
                          <div className="flex items-center justify-around bg-secondary/10 rounded-lg border border-border h-10 px-2 mt-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-muted-foreground">Adults</span>
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  className="h-6 w-6 rounded-full border border-border flex items-center justify-center text-xs hover:bg-secondary active:scale-95 transition-all text-foreground"
                                  onClick={() => setAdults(prev => Math.max(0, prev - 1))}
                                >
                                  -
                                </button>
                                <span className="text-xs font-semibold w-4 text-center text-foreground">{adults}</span>
                                <button
                                  type="button"
                                  className="h-6 w-6 rounded-full border border-border flex items-center justify-center text-xs hover:bg-secondary active:scale-95 transition-all text-foreground"
                                  onClick={() => setAdults(prev => prev + 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            
                            <div className="w-px h-5 bg-border" />
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-muted-foreground">Children</span>
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  className="h-6 w-6 rounded-full border border-border flex items-center justify-center text-xs hover:bg-secondary active:scale-95 transition-all text-foreground"
                                  onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                                >
                                  -
                                </button>
                                <span className="text-xs font-semibold w-4 text-center text-foreground">{children}</span>
                                <button
                                  type="button"
                                  className="h-6 w-6 rounded-full border border-border flex items-center justify-center text-xs hover:bg-secondary active:scale-95 transition-all text-foreground"
                                  onClick={() => setChildren(prev => prev + 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Travel Date * - Right side (5 columns) */}
                        <div className="space-y-2 col-span-12 md:col-span-5">
                          <Label htmlFor="dates">Travel Date *</Label>
                          <Popover open={isOpen} onOpenChange={setIsOpen}>
                            <PopoverTrigger asChild>
                              <div className="relative cursor-pointer">
                                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                                <Input
                                  id="dates"
                                  type="text"
                                  placeholder="DD-MM-YYYY"
                                  value={dateInputVal}
                                  onChange={handleDateInputChange}
                                  className="pl-10 pr-10 cursor-pointer"
                                  required
                                />
                                <span className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer z-10">
                                  <CalendarIcon className="h-4 w-4" />
                                </span>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border border-border bg-card" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={formData.dates ? new Date(formData.dates + "T00:00:00") : undefined}
                                onSelect={(date) => {
                                  if (!date) {
                                    setFormData(prev => ({ ...prev, dates: "" }));
                                    setDateInputVal("");
                                    return;
                                  }
                                  const y = date.getFullYear();
                                  const m = String(date.getMonth() + 1).padStart(2, '0');
                                  const d = String(date.getDate()).padStart(2, '0');
                                  const dateStr = `${y}-${m}-${d}`;
                                  setFormData(prev => ({ ...prev, dates: dateStr }));
                                  setDateInputVal(`${d}-${m}-${y}`);
                                  setIsOpen(false);
                                }}
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  return date < today;
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {formData.dates && isPastDate(formData.dates) && (
                            <div className="text-red-500 text-xs mt-1.5 flex items-center justify-between bg-red-500/10 border border-red-500/20 p-2 rounded-md animate-fade-in-up">
                              <span className="flex items-center gap-1.5 font-medium">
                                ⚠️ Travel date cannot be in the past.
                              </span>
                              <button
                                type="button"
                                className="text-primary hover:underline font-bold text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsOpen(true);
                                }}
                              >
                                Fix Date
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          placeholder="Any special requirements, timing preferences, etc."
                          rows={3}
                        />
                      </div>

                      {/* Bot Protection Widget */}
                      <TurnstileWidget onVerify={setTurnstileToken} />

                      <Button 
                        type="submit" 
                        className="btn-divine w-full"
                        disabled={!turnstileToken}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send via WhatsApp
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold mb-8 text-divine">Contact Information</h2>
                
                <div className="space-y-6">
                  <Card className="card-spiritual">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Phone className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <h3 className="font-semibold text-foreground">Phone</h3>
                          <p className="text-primary font-semibold">+91 9908590094</p>
                          <p className="text-muted-foreground text-sm">Available 24/7 for bookings</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-spiritual">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <MessageCircle className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <h3 className="font-semibold text-foreground">WhatsApp</h3>
                          <p className="text-primary font-semibold">+91 9908590094</p>
                          <p className="text-muted-foreground text-sm">Quick quotes and instant booking</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-spiritual">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <MapPin className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <h3 className="font-semibold text-foreground">Location</h3>
                          <p className="text-foreground">LB Nagar, Hyderabad</p>
                          <p className="text-muted-foreground text-sm">Telangana, India</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-spiritual">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Clock className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <h3 className="font-semibold text-foreground">Operating Hours</h3>
                          <p className="text-foreground">Open 24/7</p>
                          <p className="text-muted-foreground text-sm">Advance booking recommended</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="card-spiritual mt-6">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-divine mb-3">Important Notes</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Prices shared on request - no per-km rates online</li>
                      <li>• All trips include drop + return with waiting time</li>
                      <li>• Pre-booking recommended for better service</li>
                      <li>• Pickup available from anywhere in Hyderabad</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;