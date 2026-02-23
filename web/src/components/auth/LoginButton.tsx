import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL || "";

export const LoginButton = () => (
  <Button size="lg" asChild>
    <a href={`${API_URL}/api/auth/github`}>Sign in with GitHub</a>
  </Button>
);
