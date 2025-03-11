import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Settings() {
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    // Load saved settings
    const savedBaseUrl = localStorage.getItem('openai_base_url') || '';
    const savedApiKey = localStorage.getItem('openai_api_key') || '';
    setBaseUrl(savedBaseUrl);
    setApiKey(savedApiKey);
  }, []);

  const handleSave = () => {
    try {
      // Save settings to localStorage
      localStorage.setItem('openai_base_url', baseUrl.trim());
      localStorage.setItem('openai_api_key', apiKey.trim());
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OpenAI Settings</CardTitle>
        <CardDescription>Configure OpenAI API connection parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="base-url">Base URL</Label>
          <Input
            id="base-url"
            placeholder="https://api.openai.com/v1"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Enter proxy server address if using one. Defaults to official OpenAI API endpoint.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Enter your OpenAI API key. Keep it secure and never share it with others.
          </p>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
} 
