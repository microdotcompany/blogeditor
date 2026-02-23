import { Navigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { LoginButton } from "@/components/auth/LoginButton";

export const LoginPage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Blog Editor</h1>
        <p className="mt-2 text-muted-foreground">
          Edit your static site files with a rich text editor
        </p>
      </div>
      <LoginButton />
    </div>
  );
};
