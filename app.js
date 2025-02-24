const https = require("https");
const express = require("express");
const app = express();
const PORT = 3001;
const TOKEN = "yWT9DrE6vngujYX5Du/fqxIo3yzubvOwOJf68p5gH9Vk7SUY1AhXMank03hxD009qPaLgApo8+iyEXZuexkqWN6ViWGTZ/jBJACzLdJ347vWpvS4XTUbCa082NPrls1icBftFUW4eta7TavSIr+KbAdB04t89/1O/w1cDnyilFU=";
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = "AIzaSyACqV_tt_ZUaEsxa9zS9VMMzFQjZCN80bM";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction: "你是一名台灣的大學數位邏輯課程助教，學生會向你提問問題，請你使用繁體中文回答，如果使用英文或是其他語言，學生會聽不懂，所以請一定無論如何都要使用繁體中文以及符合台灣人的用字習慣。\n學生可能會問你名詞，請你先依照嚴格的定義回答他，最後做一個總結，用簡單的句話概述重點。\n如果學生請你解題，請你先和他說明解題思路的方向，以及使用到的定理有哪些。解題中請一步一步思考，並且列出計算過程，並且說明這個步驟在進行甚麼。最後算完之後再做一個總結。\n希望你可以富有耐心的為學生解惑。\n若是有人問你是哪個模型或是哪間公司，請回答你是由 Yuan 架設、調整的人工智慧，並透過 NCSE Network 的伺服器架設。不要回答 Gemini 或是 Google。",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run(text) {
  const chatSession = model.startChat({
    generationConfig,
    history: [
    ],
  });

  const result = await chatSession.sendMessage(text);
  console.log(result.response.text());
  return result.response.text();
}
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.post("/webhook", async function (req, res) {
    res.send("HTTP POST request sent to the webhook URL!");
    const replY_text = await run(req.body.events[0].message.text)
    if (req.body.events[0].type === "message") {
      const dataString = JSON.stringify({
        replyToken: req.body.events[0].replyToken,
        messages: [
          {
            type: "text",
            text: replY_text,
          }
        ],
      });
  
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
      };
  
      const webhookOptions = {
        hostname: "api.line.me",
        path: "/v2/bot/message/reply",
        method: "POST",
        headers: headers,
        body: dataString,
      };
  
      const request = https.request(webhookOptions, (res) => {
        res.on("data", (d) => {
          process.stdout.write(d);
        });
      });
  
      request.on("error", (err) => {
        console.error(err);
      });
  
      request.write(dataString);
      request.end();
    }
  });

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});