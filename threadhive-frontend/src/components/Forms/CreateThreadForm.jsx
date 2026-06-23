import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createThreadThunk } from "../../reducers/threadListSlice";
import {
  fetchSubreddits as fetchSubredditsThunk,
  createSubreddit as createSubredditThunk,
} from "../../reducers/subredditSlice";
import { rephraseText } from "../../services/threadService.js";
import { Form } from "react-bootstrap";
import "./CreateThreadForm.css";

export default function CreateThreadForm({ onClose }) {
  const dispatch = useDispatch();
  const { subreddits } = useSelector((state) => state.subreddits);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subredditId, setSubredditId] = useState("");
  const [newSubredditName, setNewSubredditName] = useState("");
  const [newSubredditDescription, setNewSubredditDescription] = useState("");

  const [rephrasedTitle, setRephrasedTitle] = useState(null);
  const [rephrasedContent, setRephrasedContent] = useState(null);
  const [rephraseLoadingTitle, setRephraseLoadingTitle] = useState(false);
  const [rephraseLoadingContent, setRephraseLoadingContent] = useState(false);
  const [rephraseErrorTitle, setRephraseErrorTitle] = useState(null);
  const [rephraseErrorContent, setRephraseErrorContent] = useState(null);

  useEffect(() => {
    dispatch(fetchSubredditsThunk());
  }, [dispatch]);

  const handleRephrase = async (field) => {
    const text = field === 'title' ? title : content;
    const setLoading = field === 'title' ? setRephraseLoadingTitle : setRephraseLoadingContent;
    const setRephrased = field === 'title' ? setRephrasedTitle : setRephrasedContent;
    const setError = field === 'title' ? setRephraseErrorTitle : setRephraseErrorContent;

    setLoading(true);
    setError(null);
    setRephrased(null);
    try {
      const result = await rephraseText(text);
      setRephrased(result);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "";
      const normalized = msg.toLowerCase();

      if (normalized.includes("quota") || normalized.includes("resource_exhausted")) {
        setError("AI quota exceeded. Please try again later.");
      } else if (normalized.includes("api key") || normalized.includes("gemini_api_key")) {
        setError("AI is not configured on the server. Ask the admin to set GEMINI_API_KEY.");
      } else if (normalized.includes("model") || normalized.includes("unavailable")) {
        setError("AI model is currently unavailable. Please try again in a moment.");
      } else {
        setError("Failed to rephrase. Your original text has been preserved.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewSubredditChange = (value) => {
    setNewSubredditName(value);
    if (value.trim()) {
      setSubredditId("");
    }
  };

  const handleSubredditSelect = (value) => {
    setSubredditId(value);
    if (value) {
      setNewSubredditName("");
      setNewSubredditDescription("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let subredditToUse = subredditId;

    // Create new subreddit first if needed
    if (newSubredditName.trim()) {
      if (!newSubredditDescription.trim()) {
        alert("Please provide a description for the new subreddit.");
        return;
      }

      const resultAction = await dispatch(
        createSubredditThunk({
          name: newSubredditName,
          description: newSubredditDescription,
        }),
      );

      if (createSubredditThunk.fulfilled.match(resultAction)) {
        subredditToUse = resultAction.payload._id;
        setSubredditId(resultAction.payload._id);
      } else {
        alert("Failed to create community. Please try again.");
        return;
      }
    }

    if (!subredditToUse) {
      alert("Please select or create a subreddit before posting.");
      return;
    }

    // Use Redux to create thread
    const resultAction = await dispatch(
      createThreadThunk({
        title,
        content,
        subreddit: subredditToUse,
      }),
    );

    if (createThreadThunk.fulfilled.match(resultAction)) {
      onClose();
    } else {
      alert("Failed to create thread. Please try again.");
    }
  };

  return (
    <div className="create-thread-form px-0">
      <h3 className="form-title">✏️ Create New Thread</h3>
      <Form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group-custom">
          <label className="form-label-custom">Thread Title</label>
          <input
            type="text"
            className="form-control-custom"
            placeholder="What's on your mind?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div className="rephrase-section">
            <button
              type="button"
              className="form-btn form-btn-secondary form-btn-sm"
              onClick={() => handleRephrase('title')}
              disabled={!title.trim() || rephraseLoadingTitle}
            >
              {rephraseLoadingTitle ? '⏳ Rephrasing...' : '✨ Rephrase with AI'}
            </button>
            {rephraseErrorTitle && (
              <p className="rephrase-error">{rephraseErrorTitle}</p>
            )}
            {rephrasedTitle && (
              <div className="rephrase-preview-card">
                <p className="rephrase-preview-label">Rephrased version:</p>
                <p className="rephrase-preview-text">{rephrasedTitle}</p>
                <div className="rephrase-preview-actions">
                  <button
                    type="button"
                    className="form-btn form-btn-primary form-btn-sm"
                    onClick={() => { setTitle(rephrasedTitle); setRephrasedTitle(null); }}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="form-btn form-btn-secondary form-btn-sm"
                    onClick={() => setRephrasedTitle(null)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="form-group-custom">
          <label className="form-label-custom">Content</label>
          <textarea
            className="form-control-custom form-textarea-custom"
            rows={4}
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <div className="rephrase-section">
            <button
              type="button"
              className="form-btn form-btn-secondary form-btn-sm"
              onClick={() => handleRephrase('content')}
              disabled={!content.trim() || rephraseLoadingContent}
            >
              {rephraseLoadingContent ? '⏳ Rephrasing...' : '✨ Rephrase with AI'}
            </button>
            {rephraseErrorContent && (
              <p className="rephrase-error">{rephraseErrorContent}</p>
            )}
            {rephrasedContent && (
              <div className="rephrase-preview-card">
                <p className="rephrase-preview-label">Rephrased version:</p>
                <p className="rephrase-preview-text">{rephrasedContent}</p>
                <div className="rephrase-preview-actions">
                  <button
                    type="button"
                    className="form-btn form-btn-primary form-btn-sm"
                    onClick={() => { setContent(rephrasedContent); setRephrasedContent(null); }}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="form-btn form-btn-secondary form-btn-sm"
                    onClick={() => setRephrasedContent(null)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subreddit Selection */}
        <div className="form-group-custom">
          <label className="form-label-custom">Community</label>
          {subreddits.length > 0 ? (
            <select
              className="form-control-custom"
              value={subredditId}
              onChange={(e) => handleSubredditSelect(e.target.value)}
              disabled={!!newSubredditName.trim()}
            >
              <option value="">Select a community</option>
              {subreddits.map((sr) => (
                <option key={sr._id} value={sr._id}>
                  r/{sr.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="form-hint">No communities found.</p>
          )}

          <div className="new-subreddit-section">
            <label className="form-label-custom mb-2">
              Or Create New Community
            </label>
            <input
              type="text"
              className="form-control-custom mb-2"
              placeholder={
                subredditId
                  ? "Deselect above to create new"
                  : "Enter community name"
              }
              value={newSubredditName}
              onChange={(e) => handleNewSubredditChange(e.target.value)}
              disabled={!!subredditId}
            />
            {newSubredditName && !subredditId && (
              <textarea
                className="form-control-custom"
                rows={2}
                placeholder="Describe your community"
                value={newSubredditDescription}
                onChange={(e) => setNewSubredditDescription(e.target.value)}
                required
              />
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="form-btn form-btn-primary">
            📝 Post Thread
          </button>
          <button
            type="button"
            className="form-btn form-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </Form>
    </div>
  );
}
