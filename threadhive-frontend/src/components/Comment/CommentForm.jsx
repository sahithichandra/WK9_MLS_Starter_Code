import { useState } from "react";
import { Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import { rephraseText } from "../../services/threadService.js";
import './CommentForm.css';

export default function CommentForm({ commentText, onCommentChange, onPostComment, disabled }) {
  const [rephrasing, setRephrasing] = useState(false);
  const [rephrasedText, setRephrasedText] = useState(null);
  const [rephraseError, setRephraseError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onPostComment) {
      onPostComment();
    }
  };

  const handleRephrase = async () => {
    setRephrasing(true);
    setRephraseError(null);
    setRephrasedText(null);
    try {
      const result = await rephraseText(commentText);
      setRephrasedText(result);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setRephraseError(
        msg?.includes("quota") || msg?.includes("RESOURCE_EXHAUSTED")
          ? "AI quota exceeded. Please try again later."
          : "Failed to rephrase. Your original text has been preserved."
      );
    } finally {
      setRephrasing(false);
    }
  };

  const handleAcceptRephrase = () => {
    onCommentChange({ target: { value: rephrasedText } });
    setRephrasedText(null);
  };

  const handleRejectRephrase = () => {
    setRephrasedText(null);
  };

  return (
    <Card className="add-comment-section mb-4 border-0">
      <Card.Body>
        <h5 className="add-comment-title">Add a Comment</h5>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="commentTextarea" className="mb-2">
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Write a comment..."
              value={commentText}
              onChange={onCommentChange}
              required
              className="comment-textarea"
            />
          </Form.Group>

          <div className="mb-3">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleRephrase}
              disabled={!commentText?.trim() || rephrasing}
              className="rephrase-btn"
            >
              {rephrasing ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  Rephrasing...
                </>
              ) : (
                '✨ Rephrase with AI'
              )}
            </Button>

            {rephraseError && (
              <Alert variant="danger" className="mt-2 mb-0 py-2 rephrase-alert">
                {rephraseError}
              </Alert>
            )}

            {rephrasedText && (
              <div className="rephrase-preview-card mt-2">
                <p className="rephrase-preview-label">Rephrased version:</p>
                <p className="rephrase-preview-text">{rephrasedText}</p>
                <div className="d-flex gap-2">
                  <Button variant="primary" size="sm" onClick={handleAcceptRephrase}>
                    Accept
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={handleRejectRephrase}>
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={disabled || !commentText?.trim()}
            className="post-comment-btn"
          >
            📝 Post Comment
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
