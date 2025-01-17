import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

// Props now include the setIsLoggedIn function
interface LoginFormProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export function LoginForm({ setIsLoggedIn, ...props }: LoginFormProps) {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();
      // console.log(data);

      if (response.ok) {
        // Save token to local storage
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userRoll", data.roll_no);
        setIsLoggedIn(true); // Update login state
        navigate("/rating");
      } else {
        setErrorMessage(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6")} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Keshav Cup 2025</h1>
                <p className="text-muted-foreground text-sm">
                  Login using your registered phone number
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center">
                  <span className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-l-md">
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="text"
                    maxLength={10}
                    placeholder="9876543210"
                    pattern="\d{10}"
                    title="Please enter a valid 10-digit phone number."
                    required
                    className="rounded-l-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              {errorMessage && (
                <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
              )}
              <div className="text-center text-sm">
                The responses you are about to give will decide the base price
                of the players for the auction.
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:flex items-center justify-center">
            <img
              src="https://res.cloudinary.com/dkvtnjc2f/image/upload/f_auto,q_auto/v1736683940/keshav-cup-2025-logo_3x_ijcn3k.png"
              alt="Image"
              className="max-w-full max-h-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
