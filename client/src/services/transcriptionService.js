import apiClient from "./api";

/**
 * Upload an audio file and initiate speech-to-text transcription
 * @param {FormData} formData - Multipart data containing 'audio' file and optional 'title'/'language'
 * @param {Function} onUploadProgress - Callback with signature (percent)
 * @returns {Promise<object>} response data containing transcription object
 */
export const uploadAudio = async (formData, onUploadProgress) => {
  const response = await apiClient.post("/transcriptions/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percentCompleted);
      }
    },
  });
  return response.data;
};

/**
 * Fetch all transcription entries from database
 * @returns {Promise<object>} list of transcriptions
 */
export const getTranscriptions = async () => {
  const response = await apiClient.get("/transcriptions");
  return response.data;
};

/**
 * Fetch a single transcription entry by ID
 * @param {string} id - Database ObjectId of transcript
 * @returns {Promise<object>} transcript details
 */
export const getTranscriptionDetails = async (id) => {
  const response = await apiClient.get(`/transcriptions/${id}`);
  return response.data;
};

/**
 * Delete a transcription entry by ID (deletes database record & disk file)
 * @param {string} id - Database ObjectId of transcript
 * @returns {Promise<object>} status confirmation
 */
export const deleteTranscription = async (id) => {
  const response = await apiClient.delete(`/transcriptions/${id}`);
  return response.data;
};

/**
 * Fetch all community spaces
 * @returns {Promise<object>} list of communities
 */
export const getCommunities = async () => {
  const response = await apiClient.get("/communities");
  return response.data;
};

/**
 * Create a new community space
 * @param {object} communityData - { name, description, category }
 * @returns {Promise<object>} created community entry
 */
export const createCommunity = async (communityData) => {
  const response = await apiClient.post("/communities", communityData);
  return response.data;
};
