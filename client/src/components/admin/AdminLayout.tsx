import { Link, Outlet, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings } from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Panel | Dhriti Enterprise</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-brand-dark rounded-xl border border-brand-dark-border shadow-sm overflow-hidden sticky top-24">
              <div className="p-4 bg-brand-dark-lighter border-b border-brand-dark-border">
                <h2 className="font-bold text-white text-lg">Admin Panel</h2>
              </div>
              <nav className="flex flex-col py-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-brand-gold/10 text-brand-gold border-r-2 border-brand-gold"
                          : "text-gray-400 hover:bg-brand-dark-lighter hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>

        </div>
      </div>
    </>
  );
};

export default AdminLayout;
