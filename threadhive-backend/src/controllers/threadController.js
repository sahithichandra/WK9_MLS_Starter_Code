import {
  fetchAllThreads,
  fetchThreadById,
  createNewThread,
  updateThreadById,
  deleteThreadById,
} from "../services/threadService.js";
import { getCommentsByThread } from "../services/commentService.js";
import { summarizeThreadWithGemini, rephraseText as rephraseWithGemini, improveQuestion, summarizeAnswers } from "../services/geminiService.js";
import { createAppError } from "../utils/createAppError.js";

// GET /api/threads
export const getAllThreads = async (req, res) => {
  const threads = await fetchAllThreads();
  res.status(200).json({
    success: true,
    message: "Threads fetched successfully",
    data: threads,
  });
};

// GET /api/threads/:id
export const getThreadByID = async (req, res) => {
  const thread = await fetchThreadById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Thread fetched successfully",
    data: thread,
  });
};

// POST /api/threads
export const createThread = async (req, res) => {
  const { title, content, subreddit } = req.body;
  const author = req.user.userId;

  if(!title || !content || !subreddit) {
    throw createAppError("Title, content, and subreddit are required.", 400);
  }

  const populatedThread = await createNewThread(
    title,
    content,
    author,
    subreddit,
  );
  res.status(201).json({
    success: true,
    message: "Thread created successfully",
    data: populatedThread,
  });
};

// PUT /api/threads/:id

export const updateThread = async (req, res) => {
  const updatedThread = await updateThreadById(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Thread updated successfully",
    data: updatedThread,
  });
};

// DELETE /api/threads/:id
export const deleteThread = async (req, res) => {
  const deletedThread = await deleteThreadById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Thread deleted successfully",
    data: deletedThread,
  });
};

// POST /api/threads/rephrase
export const rephraseText = async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) {
    throw createAppError("Text is required for rephrasing.", 400);
  }
  const rephrased = await rephraseWithGemini(text);
  res.status(200).json({
    success: true,
    message: "Text rephrased successfully",
    data: { rephrased },
  });
};

// POST /api/threads/:id/summarize
export const summarizeThread = async (req, res) => {
  const thread = await fetchThreadById(req.params.id);
  const comments = await getCommentsByThread(req.params.id);
  const summary = await summarizeThreadWithGemini(thread, comments);
  res.status(200).json({
    success: true,
    message: "Thread summarized successfully",
    data: { summary },
  });
};

// POST /api/threads/improve-question
export const improveQuestionController = async (req, res) => {
  const { title, description, tags } = req.body;
  
  if (!title?.trim() || !description?.trim()) {
    throw createAppError("Title and description are required for improvement.", 400);
  }

  const improvements = await improveQuestion(title, description, tags || "");
  res.status(200).json({
    success: true,
    message: "Question improvements generated successfully",
    data: improvements,
  });
};

// POST /api/threads/:id/summarize-answers
export const summarizeAnswersController = async (req, res) => {
  const thread = await fetchThreadById(req.params.id);
  const comments = await getCommentsByThread(req.params.id);

  if (comments.length < 3) {
    throw createAppError("At least 3 answers are required for summarization.", 400);
  }

  const summary = await summarizeAnswers(thread.title, comments);
  res.status(200).json({
    success: true,
    message: "Answers summarized successfully",
    data: { summary },
  });
};
