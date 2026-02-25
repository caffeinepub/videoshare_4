import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { usePostComment } from "../hooks/useQueries";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CommentFormProps {
  videoId: string;
}

export function CommentForm({ videoId }: CommentFormProps) {
  const [text, setText] = useState("");
  const postCommentMutation = usePostComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await postCommentMutation.mutateAsync({ videoId, text: text.trim() });
      setText("");
      toast.success("Comment posted");
    } catch (error) {
      toast.error("Failed to post comment");
      console.error("Post comment error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Add a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="resize-none"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!text.trim() || postCommentMutation.isPending}
          className="min-w-24"
        >
          {postCommentMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            "Comment"
          )}
        </Button>
      </div>
    </form>
  );
}
