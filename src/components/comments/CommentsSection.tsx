import { useState, useEffect } from "react";
import { useLocation, Link } from "@tanstack/react-router";
import { MessageSquare, Send, Reply, Trash2, LogIn, Loader2, UserCheck } from "lucide-react";
import { useSession } from "~/lib/auth/auth-client";
import { getComments, createComment, deleteComment, type CommentItem } from "~/server/comments";
import { Button, buttonVariants } from "~/components/ui/button";
import { cn } from "cn";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";

interface CommentsSectionProps {
  postId: string;
  postAuthorId?: string;
}

function formatTimeAgo(dateInput: Date | string) {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(-2)
    .join("")
    .toUpperCase() || "U";
}

export function CommentsSection({ postId, postAuthorId }: CommentsSectionProps) {
  const { data: session } = useSession();
  const currentUser = session?.user;
  const location = useLocation();

  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rootContent, setRootContent] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load comments
  useEffect(() => {
    let isMounted = true;
    async function fetchComments() {
      try {
        setLoading(true);
        const data = await getComments({ data: postId });
        if (isMounted) {
          setCommentsList(data);
        }
      } catch (err: any) {
        toast.error("Không thể tải bình luận: " + (err?.message || "Lỗi không xác định"));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (postId) {
      fetchComments();
    }
    return () => {
      isMounted = false;
    };
  }, [postId]);

  // Submit root comment
  async function handleSubmitRoot(e: React.FormEvent) {
    e.preventDefault();
    if (!rootContent.trim()) return;

    try {
      setSubmitting(true);
      const newComment = await createComment({
        data: {
          postId,
          content: rootContent.trim(),
        },
      });

      setCommentsList((prev) => [...prev, newComment]);
      setRootContent("");
      toast.success("Bình luận của bạn đã được gửi!");
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi gửi bình luận");
    } finally {
      setSubmitting(false);
    }
  }

  // Submit reply
  async function handleSubmitReply(parentId: string) {
    if (!replyContent.trim()) return;

    try {
      setSubmittingReply(true);
      const newComment = await createComment({
        data: {
          postId,
          content: replyContent.trim(),
          parentId,
        },
      });

      setCommentsList((prev) => [...prev, newComment]);
      setReplyContent("");
      setReplyingToId(null);
      toast.success("Đã phản hồi bình luận!");
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi gửi phản hồi");
    } finally {
      setSubmittingReply(false);
    }
  }

  // Delete comment
  async function handleDeleteComment(commentId: string) {
    if (!window.confirm("Bạn có chắc chắn muốn xoá bình luận này?")) return;

    try {
      setDeletingId(commentId);
      await deleteComment({ data: commentId });
      // Remove the comment and any child replies
      setCommentsList((prev) =>
        prev.filter((c) => c.id !== commentId && c.parentId !== commentId)
      );
      toast.success("Đã xoá bình luận");
    } catch (err: any) {
      toast.error(err?.message || "Không thể xoá bình luận");
    } finally {
      setDeletingId(null);
    }
  }

  // Organize root comments & their replies
  const rootComments = commentsList.filter((c) => !c.parentId);
  const repliesByParent = commentsList.reduce<Record<string, CommentItem[]>>(
    (acc, comment) => {
      if (comment.parentId) {
        if (!acc[comment.parentId]) acc[comment.parentId] = [];
        acc[comment.parentId].push(comment);
      }
      return acc;
    },
    {}
  );

  return (
    <section className="mt-14 pt-8 border-t border-border" id="comments">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <MessageSquare className="size-6 text-primary" />
          Bình luận
          <span className="text-base font-medium text-muted-foreground ml-1">
            ({commentsList.length})
          </span>
        </h2>
      </div>

      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmitRoot} className="mb-8">
          <div className="flex gap-3">
            <Avatar className="size-9 ring-1 ring-border shrink-0 mt-0.5">
              <AvatarImage src={currentUser.image ?? undefined} alt={currentUser.name} />
              <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Bạn nghĩ gì về bài viết này? Viết bình luận của bạn..."
                value={rootContent}
                onChange={(e) => setRootContent(e.target.value)}
                className="min-h-20 resize-y bg-card text-sm"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || !rootContent.trim()}
                  className="gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      Gửi bình luận
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 rounded-xl border border-border bg-card/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-0.5">
            <p className="font-semibold text-sm text-foreground">
              Tham gia thảo luận cùng cộng đồng
            </p>
            <p className="text-xs text-muted-foreground">
              Đăng nhập để bình luận, đặt câu hỏi hoặc phản hồi bài viết.
            </p>
          </div>
          <Link
            to="/auth/sign-in"
            search={{ redirectTo: location.pathname }}
            className={cn(buttonVariants({ size: "sm", variant: "default" }), "gap-1.5")}
          >
            <LogIn className="size-4" />
            Đăng nhập ngay
          </Link>
        </div>
      )}

      {/* Comment List */}
      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground gap-2 text-sm">
          <Loader2 className="size-4 animate-spin text-primary" />
          Đang tải bình luận...
        </div>
      ) : rootComments.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-border/70 text-muted-foreground text-sm">
          Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!
        </div>
      ) : (
        <div className="space-y-6">
          {rootComments.map((comment) => {
            const replies = repliesByParent[comment.id] || [];
            const isAuthor = comment.authorId === postAuthorId;
            const canDelete =
              currentUser &&
              (currentUser.id === comment.authorId || currentUser.role === "admin");

            return (
              <div key={comment.id} className="group/comment space-y-3">
                {/* Main Comment */}
                <div className="flex gap-3">
                  <Avatar className="size-8 ring-1 ring-border shrink-0 mt-0.5">
                    <AvatarImage src={comment.author.image ?? undefined} alt={comment.author.name} />
                    <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    {/* Author Meta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">
                          {comment.author.name}
                        </span>
                        {isAuthor && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 gap-0.5 font-normal">
                            <UserCheck className="size-2.5" />
                            Tác giả
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingId === comment.id}
                          className="opacity-0 group-hover/comment:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded hover:bg-muted"
                          title="Xoá bình luận"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>

                    {/* Actions */}
                    {currentUser && (
                      <div className="pt-1">
                        <button
                          onClick={() => {
                            if (replyingToId === comment.id) {
                              setReplyingToId(null);
                              setReplyContent("");
                            } else {
                              setReplyingToId(comment.id);
                              setReplyContent("");
                            }
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Reply className="size-3" />
                          {replyingToId === comment.id ? "Huỷ" : "Trả lời"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Reply Form */}
                {replyingToId === comment.id && currentUser && (
                  <div className="ml-11 pl-3 border-l-2 border-primary/40 space-y-2 mt-2">
                    <Textarea
                      placeholder={`Trả lời @${comment.author.name}...`}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-16 resize-y bg-card text-xs"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          setReplyingToId(null);
                          setReplyContent("");
                        }}
                      >
                        Huỷ
                      </Button>
                      <Button
                        size="xs"
                        disabled={submittingReply || !replyContent.trim()}
                        onClick={() => handleSubmitReply(comment.id)}
                        className="gap-1"
                      >
                        {submittingReply ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Send className="size-3" />
                        )}
                        Phản hồi
                      </Button>
                    </div>
                  </div>
                )}

                {/* Replies Thread */}
                {replies.length > 0 && (
                  <div className="ml-7 pl-4 border-l-2 border-border/60 space-y-3 pt-1">
                    {replies.map((reply) => {
                      const isReplyAuthor = reply.authorId === postAuthorId;
                      const canDeleteReply =
                        currentUser &&
                        (currentUser.id === reply.authorId || currentUser.role === "admin");

                      return (
                        <div key={reply.id} className="group/reply flex gap-2.5">
                          <Avatar className="size-7 ring-1 ring-border shrink-0 mt-0.5">
                            <AvatarImage src={reply.author.image ?? undefined} alt={reply.author.name} />
                            <AvatarFallback className="text-[10px]">{getInitials(reply.author.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-xs text-foreground">
                                  {reply.author.name}
                                </span>
                                {isReplyAuthor && (
                                  <Badge variant="secondary" className="text-[9px] py-0 px-1 font-normal">
                                    Tác giả
                                  </Badge>
                                )}
                                <span className="text-[11px] text-muted-foreground font-mono">
                                  {formatTimeAgo(reply.createdAt)}
                                </span>
                              </div>

                              {canDeleteReply && (
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
                                  disabled={deletingId === reply.id}
                                  className="opacity-0 group-hover/reply:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded hover:bg-muted"
                                  title="Xoá phản hồi"
                                >
                                  <Trash2 className="size-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
