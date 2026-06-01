import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white border-t border-brand-dark-border">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-brand-gold rounded-lg flex items-center justify-center">
                <span className="text-brand-dark font-extrabold text-lg">DE</span>
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">DHRITI</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight">
                  Enterprise
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Your one-stop destination for premium sanitary hardwares. Quality,
              style and durability for every bathroom.
            </p>
            <div className="flex items-center gap-3">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold hover:text-black transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-5 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Products", href: "/products" },
                { label: "About Us", href: "/about" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-brand-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-sm mb-5 uppercase tracking-wider">
              Customer Service
            </h4>
            <ul className="space-y-3">
              {[
                { label: "My Account", href: "/profile" },
                { label: "Order Tracking", href: "/orders" },
                { label: "Wishlist", href: "/wishlist" },
                { label: "Returns & Refunds", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-brand-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-sm mb-5 uppercase tracking-wider">
              Newsletter
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to get updates on new arrivals and offers.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-0"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-l-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-brand-gold text-brand-dark rounded-r-lg text-sm font-bold hover:bg-brand-gold-light transition-colors"
              >
                →
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Dhriti Enterprise. All Rights Reserved.
          </p>
          <p className="text-xs text-gray-500">
            Designed with <span className="text-red-400">❤</span> by Pixelcraft
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
