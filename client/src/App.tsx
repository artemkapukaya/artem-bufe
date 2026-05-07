import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout"; // Bizim jilet gibi yaptýðýmýz sayfa
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Menu from "./pages/Menu";
import Kurumsal from "./pages/Kurumsal";
import Alerjenler from "./pages/Alerjenler";
import Iletisim from "./pages/Iletisim";
import LoyaltyProfile from "./pages/LoyaltyProfile";
import OrderTracking from "./pages/OrderTracking";
import Login from "./pages/Login";
import ProfilePage from "./pages/ProfilePage";

function Router() {
    return (
        <Switch>
            <Route path={"/"} component={Home} />
            <Route path={"/login"} component={Login} />
            <Route path={"/product/:id"} component={ProductDetail} />

            {/* SEPET VE ÖDEME AYNI SÝSTEMDE BÝRLEÞTÝRÝLDÝ */}
            <Route path={"/sepet"} component={Checkout} />
            <Route path={"/checkout"} component={Checkout} />

            <Route path={"/admin-login"} component={AdminLogin} />
            <Route path={"/admin/login"} component={AdminLogin} />
            <Route path={"/admin"} component={AdminDashboard} />
            <Route path={"/menu"} component={Menu} />
            <Route path={"/kurumsal"} component={Kurumsal} />
            <Route path={"/alerjenler"} component={Alerjenler} />
            <Route path={"/iletisim"} component={Iletisim} />
            <Route path={"/loyalty"} component={LoyaltyProfile} />

            {/* PROFÝL, ADRESLER VE SÝPARÝÞLER ROTALARI */}
            <Route path={"/profile"} component={ProfilePage} />
            <Route path={"/addresses"} component={ProfilePage} />
            <Route path={"/orders"} component={ProfilePage} />

            <Route path={"/404"} component={NotFound} />
            <Route component={NotFound} />
        </Switch>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider defaultTheme="light">
                <CartProvider>
                    <TooltipProvider>
                        <Toaster />
                        <Router />
                    </TooltipProvider>
                </CartProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;