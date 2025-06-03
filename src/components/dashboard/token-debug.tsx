"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TokenDebug() {
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  
  const handleTestNotification = async () => {
    setIsLoading(true);
    
    try {
      // Send a test notification
      const response = await fetch('/api/test-notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: "Test Notification",
          body: "This is a test notification from the debug panel",
          topic: "news", // This is a required field
          token: token // Include token in body for testing
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Test notification sent successfully");
      } else {
        toast.error(`Failed to send test notification: ${data.message}`);
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error("An error occurred while sending the test notification");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
        <CardDescription>
          View and test your authentication token
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Current JWT Token</Label>
            <Input
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Token Status</Label>
            <div className="p-2 bg-muted rounded-md">
              <p className="text-sm">
                {token ? (
                  <>
                    Token is {token.length > 100 ? "valid length" : "possibly invalid (too short)"}.
                    {token.startsWith("ey") ? " Format appears correct." : " Format may be incorrect (should start with 'ey')."}
                  </>
                ) : (
                  "No token found. Please log in."
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleTestNotification} 
          disabled={isLoading || !token}
        >
          {isLoading ? "Sending..." : "Send Test Notification"}
        </Button>
      </CardFooter>
    </Card>
  );
}