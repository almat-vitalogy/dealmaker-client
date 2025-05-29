import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBlastStore } from "@/store/blast";
import { Sparkles, Loader2, CheckCircle, XCircle } from "lucide-react";

const MessageStep = ({ user }: any) => {
  const { message, setMessage, composeMessage, composeMessageStatus, title, setTitle } = useBlastStore();

  const userEmail = user?.email || "";

  const handleRewrite = async () => {
    if (!message.trim()) return;
    await composeMessage(message, userEmail);
  };

  return (
    <div className="-mt-6">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle className="mx-auto">2. Write a message you want to blast or rewrite using AI</CardTitle>
        </CardHeader>

        {/* Title Input */}
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent className="-mt-5">
          <div className="space-y-4">
            <Input id="title" placeholder="Give a title to this blast" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
        </CardContent>

        {/* Message Editor */}
        <CardHeader>
          <CardTitle>Message Editor</CardTitle>
        </CardHeader>
        <CardContent className="-mt-5">
          <div className="relative space-y-2 max-h-[440px]">
            <textarea
              className="w-full h-48 p-3 pr-28 border rounded-md resize-none"
              placeholder="Type your message here, or use AI to rewrite it..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="absolute bottom-8 left-3">
              <Button variant="outline" size="sm" onClick={handleRewrite} disabled={composeMessageStatus === "loading"}>
                {composeMessageStatus === "loading" ? (
                  <>
                    <Loader2 className="mr-2 animate-spin w-4 h-4" />
                    Rewriting...
                  </>
                ) : composeMessageStatus === "success" ? (
                  <>
                    <CheckCircle className="mr-2 w-4 h-4" />
                    Rewritten
                  </>
                ) : composeMessageStatus === "error" ? (
                  <>
                    <XCircle className="mr-2 w-4 h-4" />
                    Retry
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 w-4 h-4" />
                    Rewrite with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageStep;
