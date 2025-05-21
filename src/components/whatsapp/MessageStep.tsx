import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBlastStore } from "@/store/blast";
import { Send, Loader2, CheckCircle, XCircle } from "lucide-react";

const MessageStep = () => {
  const { message, setMessage, composeMessage, composeMessageStatus } = useBlastStore();
  const [theme, setTheme] = useState("");
  const [title, setTitle] = useState("");
  return (
    <div className="-mt-6">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent className="-mt-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1 text-muted-foreground"></label>
              <Input id="title" placeholder="Give a title to this blast" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>
        </CardContent>

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
            <Button className="w-full" onClick={() => composeMessage(theme)}>
              {!composeMessageStatus && <Send className="mr-2" size={16} />}
              {composeMessageStatus === "loading" && <Loader2 className="mr-2 animate-spin" size={16} />}
              {composeMessageStatus === "success" && <CheckCircle className="mr-2" size={16} />}
              {composeMessageStatus === "error" && <XCircle className="mr-2" size={16} />}
              {composeMessageStatus === "loading" ? "Generating..." : composeMessageStatus === "success" ? "Generated" : "Generate Message"}
            </Button>
          </div>
        </CardContent>

        {/* <div className="mb-5"></div> */}
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
              <Button className="w-full">Save Blast</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageStep;
