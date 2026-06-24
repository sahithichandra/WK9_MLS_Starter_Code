import axiosInstance from '../api/axiosInstance';
import { THREAD_API } from '../config/apiConfig.js';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchRecentThreads = async () => {
  const res = await axiosInstance.get(THREAD_API.GET_ALL, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

export const fetchThreadById = async (threadId) => {
  const res = await axiosInstance.get(THREAD_API.GET_BY_ID(threadId), {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

export const createThread = async (data) => {
  const res = await axiosInstance.post(THREAD_API.CREATE, data, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

export const upvoteThread = async (threadId) => {
  const res = await axiosInstance.post(THREAD_API.UPVOTE(threadId), null, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

export const downvoteThread = async (threadId) => {
  const res = await axiosInstance.post(THREAD_API.DOWNVOTE(threadId), null, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

export const improveQuestion = async (title, description, tags) => {
  const res = await axiosInstance.post(THREAD_API.IMPROVE_QUESTION, { title, description, tags }, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

export const rephraseText = async (text) => {
  const res = await axiosInstance.post(THREAD_API.REPHRASE, { text }, {
    headers: getAuthHeaders(),
  });
  return res.data.data.rephrased;
};

export const summarizeAnswers = async (threadId) => {
  const res = await axiosInstance.post(THREAD_API.SUMMARIZE_ANSWERS(threadId), null, {
    headers: getAuthHeaders(),
  });
  return res.data.data.summary;
};
