import { Outlet } from "react-router-dom";
import Header from "./Header";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
    
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="page-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

