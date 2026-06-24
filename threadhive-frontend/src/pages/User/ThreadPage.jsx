import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchThreadById,
  clearThread,
} from "../../reducers/currentThreadSlice.js";
import {
  fetchComments,
  addComment,
  clearComments,
} from "../../reducers/commentSlice.js";

import ThreadCard from "../../components/ThreadList/ThreadCard";
import CommentForm from "../../components/Comment/CommentForm";
import CommentList from "../../components/Comment/CommentList";
import { Container, Card, Button, Spinner, Alert } from "react-bootstrap";
import { summarizeAnswers } from "../../services/threadService.js";
import "./ThreadPage.css";

export default function Thread() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [commentText, setCommentText] = useState("");

  const [answerSummary, setAnswerSummary] = useState(null);
  const [answerSummarizing, setAnswerSummarizing] = useState(false);
  const [answerSummaryError, setAnswerSummaryError] = useState(null);

  const {
    thread,
    loading: threadLoading,
    error: threadError,
  } = useSelector((state) => state.currentThread);

  const {
    comments: threadComments,
    loading: commentsLoading,
    error: commentsError,
  } = useSelector((state) => state.comments);

  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (threadId) {
      dispatch(fetchThreadById(threadId));
      dispatch(fetchComments(threadId));
    }

    return () => {
      dispatch(clearThread());
      dispatch(clearComments());
    };
  }, [dispatch, threadId]);

  const handleSummarizeAnswers = async () => {
    setAnswerSummarizing(true);
    setAnswerSummaryError(null);
    try {
      const text = await summarizeAnswers(threadId);
      setAnswerSummary(text);
    } catch (err) {
      if (err?.response?.status === 401) {
        setAnswerSummaryError(
          "Session expired or invalid. Please log in again.",
        );
        return;
      }
      const msg = err?.response?.data?.message || err?.message || "";
      const normalized = msg.toLowerCase();

      if (normalized.includes("at least 3")) {
        setAnswerSummaryError(
          "At least 3 answers are required for summarization.",
        );
      } else if (
        normalized.includes("quota") ||
        normalized.includes("resource_exhausted")
      ) {
        setAnswerSummaryError("AI quota exceeded. Please try again later.");
      } else if (
        normalized.includes("api key") ||
        normalized.includes("gemini_api_key")
      ) {
        setAnswerSummaryError("AI is not configured on the server.");
      } else {
        setAnswerSummaryError(
          "Failed to generate answer summary. Please try again.",
        );
      }
    } finally {
      setAnswerSummarizing(false);
    }
  };

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    dispatch(addComment({ threadId, content: commentText }));
    setCommentText("");
  };

  if (threadError) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{threadError}</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (threadLoading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading thread...</span>
        </Spinner>
        <p className="text-muted mt-3">Loading thread...</p>
      </Container>
    );
  }

  if (!thread) {
    return (
      <Container className="my-5">
        <Alert variant="warning">Thread not found</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container className="thread-container">
      {/* Thread Card */}
      <div className="mb-4">
        <ThreadCard thread={thread} goBack={() => navigate(-1)} />
      </div>

      {/* Post Comment Input */}
      <CommentForm
        commentText={commentText}
        onCommentChange={(e) => setCommentText(e.target.value)}
        onPostComment={handlePostComment}
        disabled={!commentText.trim()}
      />

      {/* Answer Summary Section */}
      {currentUser && threadComments.length >= 3 && !answerSummary && (
        <div className="mb-4">
          <Button
            variant="outline-info"
            onClick={handleSummarizeAnswers}
            disabled={answerSummarizing}
          >
            {answerSummarizing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Summarizing Answers...
              </>
            ) : (
              "📋 Summarize Answers (TL;DR)"
            )}
          </Button>

          {answerSummaryError && (
            <Alert variant="danger" className="mt-3 mb-0">
              {answerSummaryError}
            </Alert>
          )}
        </div>
      )}

      {answerSummary && (
        <Alert
          variant="info"
          className="mb-4"
          dismissible
          onClose={() => setAnswerSummary(null)}
        >
          <Alert.Heading className="mb-2">
            📋 Answer Summary (TL;DR)
          </Alert.Heading>
          <p className="mb-0">{answerSummary}</p>
        </Alert>
      )}

      {/* Comments Section */}
      <section className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4 px-2">
          <h4 className="comments-header-title">💬 Comments</h4>
          <span className="comments-count">{threadComments.length} total</span>
        </div>

        {commentsError && (
          <Alert variant="danger" className="mb-3">
            Error loading comments: {commentsError}
          </Alert>
        )}

        {commentsLoading ? (
          <Card className="text-center py-4">
            <Card.Body>
              <Spinner animation="border" role="status" size="sm" />
              <p className="text-muted mt-2 mb-0">Loading comments...</p>
            </Card.Body>
          </Card>
        ) : threadComments.length > 0 ? (
          <CommentList />
        ) : (
          <Card className="no-comments-card">
            <Card.Body>
              <p className="no-comments-text">No comments yet. Be the first!</p>
            </Card.Body>
          </Card>
        )}
      </section>
    </Container>
  );
}
