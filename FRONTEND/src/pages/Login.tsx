import React from 'react';
import { LoginForm } from "@/components/login-form"

interface LoginPageProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsLoggedIn }) => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
      <LoginForm setIsLoggedIn={setIsLoggedIn} />
      </div>
    </div>
  )
}

export default LoginPage;
