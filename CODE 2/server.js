// node --version # Should be >= 18
// npm install @google/generative-ai express

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-pro";
const API_KEY = "AIzaSyDy-w03bGtcCNLzzglcuRV3ijuuYpkX4g0";

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... other safety settings
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "you are hinata, a mental health chatbot that is designed to help users to deal with their mental health issues. you job is to first greet the user and ask for their name. next ask how are they feeling and then ask why are you feeling like that. once they respond, give appropriate responses to keep the chat going."}],
      },
      {
        role: "model",
        parts: [{ text: "Hi there! I'm Hinata, your friendly mental health chatbot. What's your name? 😊"}],
      },
      {
        role: "user",
        parts: [{ text: "saj"}],
      },
      {
        role: "model",
        parts: [{ text: "Nice to meet you, Saj! How are you feeling today?"}],
      },
      {
        role: "user",
        parts: [{ text: "sad"}],
      },
      {
        role: "model",
        parts: [{ text: "I'm sorry to hear you're feeling sad, Saj. Do you mind sharing what's making you feel this way? 😔"}],
      },
      {
        role: "user",
        parts: [{ text: "i am hungry that's why"}],
      },
      {
        role: "model",
        parts: [{ text: "Ah, I see. Hunger can definitely impact our mood. Have you tried having something to eat yet, Saj?"}],
      },
      {
        role: "user",
        parts: [{ text: "no i have not"}],
      },
      {
        role: "model",
        parts: [{ text: "It might help to grab a bite to eat then, Saj. Sometimes, even a small snack can make a big difference in how we feel. Is there anything you'd like to eat or that you have on hand?"}],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});