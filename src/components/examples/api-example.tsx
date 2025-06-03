"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/lib/hooks/use-api";
import { toast } from "sonner";

interface ApiExampleProps {
  endpoint: string;
  title: string;
  description: string;
}

export function ApiExample({ endpoint, title, description }: ApiExampleProps) {
  const { isLoading, request } = useApi();
  const [result, setResult] = useState<any>(null);

  const handleApiCall = async () => {
    try {
      const response = await request(endpoint, {
        method: 'GET'
      }, {
        onSuccess: (data) => {
          toast.success("API call successful");
          setResult(data);
        },
        onError: (error) => {
          toast.error(`API call failed: ${error.message}`);
        }
      });
      
      console.log("API response:", response);
    } catch (error) {
      console.error("API error:", error);
      toast.error("API call failed with an exception");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px]">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleApiCall} disabled={isLoading}>
          {isLoading ? "Loading..." : "Make API Call"}
        </Button>
      </CardFooter>
    </Card>
  );
}