const express = require('express');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
const app = express();
const port = 3000;

require("dotenv").config();

app.use(express.static(path.join(__dirname, 'public')));
// Papago API 요청 함수
async function translateText(text, source, target) {
    const clientId = process.env["PAPAGO_clientId "]; // 여기에 발급받은 클라이언트 ID 입력
    const clientSecret = process.env["PAPAGO_clientSecret "]; // 여기에 발급받은 클라이언트 Secret 입력
    const apiUrl = `https://openapi.naver.com/v1/papago/n2mt`;

    try {
        const response = await axios.post(
            apiUrl,
            {
                source: 'auto', // 입력된 언어 자동 감지
                target: target,
                text: text,
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Naver-Client-Id': clientId,
                    'X-Naver-Client-Secret': clientSecret,
                },
            }
        );
        return response.data.message.result.translatedText;
    } catch (error) {
        console.error('Error translating text:', error);
        return 'Translation error';
    }
}


// 언어 감지 요청 함수
async function detectLanguage(text) {
    const clientId = process.env["PAPAGO_clientId "]; // 여기에 발급받은 클라이언트 ID 입력
    const clientSecret = process.env["PAPAGO_clientSecret "]; // 여기에 발급받은 클라이언트 Secret 입력
    const apiUrl = `https://openapi.naver.com/v1/papago/n2mt`;

    try {
        const response = await axios.post(
            apiUrl,
            { query: text },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Naver-Client-Id': clientId,
                    'X-Naver-Client-Secret': clientSecret,
                },
            }
        );
        return response.data.langCode;
    } catch (error) {
        console.error('Error detecting language:', error);
        return 'Language detection error';
    }
}

// 번역 요청 처리
app.get('/translate', async (req, res) => {
    const text = req.query.text;
    const targetLang = req.query.target;

    if (!text) {
        return res.status(400).send('Please provide text to translate');
    }

    try {
        const sourceLang = await detectLanguage(text); // 입력된 언어 자동 감지
        const translatedText = await translateText(text, sourceLang, targetLang);
        res.send(translatedText);
    } catch (err) {
        res.status(500).send('Translation failed');
    }
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});