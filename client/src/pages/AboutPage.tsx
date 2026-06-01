import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Building2, MapPin, Briefcase, User, Calendar, ShieldCheck, Phone, Mail } from "lucide-react";

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Dhriti Enterprise</title>
        <meta name="description" content="Learn more about Dhriti Enterprise, a leading wholesaler and distributor of premium hardware and bathroom fittings based in Faridabad, Haryana." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 bg-brand-dark border-b border-brand-dark-border overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-gold/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-brand-gold/5 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <p className="text-brand-gold font-semibold uppercase tracking-widest mb-4">Our Story</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">Dhriti Enterprise</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We are a premier trader, wholesaler, and distributor specializing in high-quality door hardware, bathroom accessories, and home fittings. Dedicated to bringing excellence to every home and office.
          </p>
        </div>
      </section>

      {/* Company Info Grid */}
      <section className="py-16 bg-brand-dark-lighter">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Info Card 1 */}
            <div className="bg-brand-dark border border-brand-dark-border p-8 rounded-2xl flex flex-col items-center text-center hover:border-brand-gold/50 transition-colors group">
              <div className="w-16 h-16 bg-brand-dark-lighter rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-gold/10 transition-colors">
                <Briefcase className="w-8 h-8 text-brand-gold" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Business Type</h3>
              <p className="text-gray-400">Trader - Wholesaler / Distributor</p>
            </div>

            {/* Info Card 2 */}
            <div className="bg-brand-dark border border-brand-dark-border p-8 rounded-2xl flex flex-col items-center text-center hover:border-brand-gold/50 transition-colors group">
              <div className="w-16 h-16 bg-brand-dark-lighter rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-gold/10 transition-colors">
                <MapPin className="w-8 h-8 text-brand-gold" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Location</h3>
              <p className="text-gray-400">Faridabad, Haryana, India</p>
            </div>

            {/* Info Card 3 */}
            <div className="bg-brand-dark border border-brand-dark-border p-8 rounded-2xl flex flex-col items-center text-center hover:border-brand-gold/50 transition-colors group">
              <div className="w-16 h-16 bg-brand-dark-lighter rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-gold/10 transition-colors">
                <User className="w-8 h-8 text-brand-gold" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Leadership</h3>
              <p className="text-gray-400">CEO: K Goswami</p>
            </div>

          </div>
        </div>
      </section>

      {/* Detailed Overview */}
      <section className="py-20 bg-brand-dark border-y border-brand-dark-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Built on Trust & Quality</h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Since our establishment, Dhriti Enterprise has been committed to supplying top-tier hardware solutions across India. Whether it's robust stainless steel door handles, sleek glass fittings, or durable bathroom accessories, we ensure every product meets rigorous quality standards.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                Operating out of Faridabad, Haryana, our extensive catalog caters to diverse requirements, ensuring that businesses, retailers, and end-consumers receive unmatched value and service.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-semibold text-white">November 2024</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">GST Verification</p>
                    <p className="font-semibold text-white">Verified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Abstract visual or image placeholder */}
            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden border border-brand-dark-border group">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-dark to-brand-dark-lighter z-10 opacity-80 group-hover:opacity-60 transition-opacity"></div>
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
                alt="Office Space" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center">
                <Building2 className="w-16 h-16 text-brand-gold mb-6 opacity-80" />
                <h3 className="text-2xl font-bold text-white mb-2">Connecting Markets</h3>
                <p className="text-gray-300">Delivering quality hardware directly from manufacturers to your doorstep.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Contact Banner */}
      <section className="py-16 bg-brand-gold">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-dark mb-6">Ready to upgrade your inventory?</h2>
          <p className="text-brand-dark/80 font-medium mb-10 max-w-2xl mx-auto">
            Get in touch with us for bulk orders, wholesale inquiries, and the best deals on premium hardware fittings.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <a href="tel:+918043831621" className="flex items-center gap-3 bg-brand-dark text-white px-8 py-4 rounded-full font-bold hover:bg-black transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <Phone className="w-5 h-5 text-brand-gold" />
              +91-8043831621
            </a>
            <Link to="/products" className="flex items-center gap-3 bg-white text-brand-dark px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
