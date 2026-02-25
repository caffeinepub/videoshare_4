import type { Comment } from "../backend.d.ts";
import { formatRelativeTime } from "../utils/format";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useDeleteComment } from "../hooks/useQueries";
import { toast } from "sonner";

interface CommentListProps {
  comments: Comment[];
  videoId: string;
}

export function CommentList({ comments, videoId }: CommentListProps) {
  const { identity } = useInternetIdentity();
  const deleteCommentMutation = useDeleteComment();

  const handleDelete = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync({ videoId, commentId });
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
      console.error("Delete comment error:", error);
    }
  };

  const isCommentAuthor = (comment: Comment): boolean => {
    if (!identity) return false;
    return comment.userId.toString() === identity.getPrincipal().toString();
  };

  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="group flex gap-3 animate-fade-in">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
            {comment.username[0].toUpperCase()}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{comment.username}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.timestamp)}
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{comment.text}</p>
          </div>
          {isCommentAuthor(comment) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(comment.id)}
              disabled={deleteCommentMutation.isPending}
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
