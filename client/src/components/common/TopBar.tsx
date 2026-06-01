import { MapPin, Truck, Phone, Mail } from "lucide-react";

const TopBar = () => {
  return (
    <div className="bg-black border-b border-brand-dark-border text-gray-300 text-xs py-2 px-4 hidden md:block">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-brand-gold" />
            Faridabad, Haryana, India
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="w-3 h-3" />
            Free Delivery on orders above ₹4999
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a href="tel:+919876543210" className="flex items-center gap-1.5 hover:text-brand-gold transition-colors">
            <Phone className="w-3 h-3" />
            +91 98765 43210
          </a>
          <a href="mailto:support@deenterprise.com" className="flex items-center gap-1.5 hover:text-brand-gold transition-colors">
            <Mail className="w-3 h-3" />
            support@deenterprise.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
