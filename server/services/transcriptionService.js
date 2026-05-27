const fs = require("fs");
const Groq = require("groq-sdk");

/**
 * Initialize Groq client
 */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Retry helper with exponential backoff
 */
const retryWithBackoff = async (fn, retries = 3, delay = 1500) => {
  try {
    return await fn();
  } catch (error) {
    const status = error.status || error.response?.status;

    const isPermanentError =
      status === 400 ||
      status === 401 ||
      status === 403;

    if (retries <= 0 || isPermanentError) {
      throw error;
    }

    console.warn(
      `[Groq Service] API request failed (${status || error.message}). Retrying in ${delay}ms... (${retries} attempts left)`
    );

    await new Promise((resolve) => setTimeout(resolve, delay));

    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

/**
 * Transcribe audio using Groq Whisper
 */
const transcribeAudio = async (filePath, language = "") => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Audio file not found at path: ${filePath}`);
  }

  const apiKey = process.env.GROQ_API_KEY;

  // Mock fallback if API key missing
  if (!apiKey || apiKey.trim() === "") {
    console.warn(
      "[Groq Service] GROQ_API_KEY missing. Using simulated transcription."
    );

    return await simulateTranscription(filePath, language);
  }

  const executeApiCall = async () => {
    const transcription =
      await groq.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-large-v3",
        response_format: "verbose_json",
        language: language || undefined,
      });

    return transcription;
  };

  try {
    const response = await retryWithBackoff(
      executeApiCall,
      3,
      1500
    );

    return {
      text: response.text,
      language: response.language || language || "en",
    };
  } catch (error) {
    console.error(
      "[Groq Service] API call failed:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.error?.message ||
        "Failed to transcribe audio using Groq Whisper API"
    );
  }
};

/**
 * Mock fallback transcription
 */
const simulateTranscription = (filePath, targetLanguage) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockTranscripts = [
        "Welcome to the Speech-to-Text SaaS dashboard powered by Groq AI Whisper transcription.",
        "This is a simulated transcription generated locally without API usage.",
        "Groq Whisper integration is configured successfully in your MERN stack application.",
        "Your audio upload and transcription pipeline is working correctly.",
      ];

      const fileHash = filePath
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);

      const chosenText =
        mockTranscripts[fileHash % mockTranscripts.length];

      resolve({
        text: `[Simulated] ${chosenText}`,
        language: targetLanguage || "en",
      });
    }, 2500);
  });
};

module.exports = {
  transcribeAudio,
};