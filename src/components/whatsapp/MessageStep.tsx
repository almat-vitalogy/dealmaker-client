import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBlastStore } from "@/store/blast";

const MessageStep = () => {
  const { message, setMessage } = useBlastStore();
  const [theme, setTheme] = useState("");
  return (
    <div className="-mt-6">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>AI Message Generator</CardTitle>
        </CardHeader>
        <CardContent className="-mt-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="theme" className="block text-sm font-medium mb-1 text-muted-foreground"></label>
              <Input
                id="theme"
                placeholder="Message Theme (Birthday greeting, Promo reminder)"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>
            <Button className="w-full">Generate Message</Button>
          </div>
        </CardContent>
        <div className="mb-5"></div>
        <CardHeader>
          <CardTitle>Message Editor</CardTitle>
        </CardHeader>
        <CardContent className="-mt-5">
          <div className="space-y-4 max-h-[440px] overflow-y-auto">
            <textarea
              className="w-full h-32 p-3 border rounded-md"
              placeholder="Generated or custom message will appear here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex w-full">
              <Button className="w-full">Save as Template</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageStep;
