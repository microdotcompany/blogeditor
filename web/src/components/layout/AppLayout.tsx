import { Outlet } from "react-router";
import { Header } from "./Header";

export const AppLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);
