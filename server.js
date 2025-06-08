// 서버 실행 및 라우팅 설정
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');
const Participation = require('./models/Participation');
const { fstat } = require('fs');
const { uploadJSONToPinataV3 } = require('./uploadjson.js');

const PORT = 3008;
const fs = require('fs');

// MongoDB 연결
mongoose.connect('mongodb://localhost:27017/proofvault', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB 연결 성공");
}).catch(err => {
  console.error("❌ MongoDB 연결 실패:", err);
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 로그인 처리 API - 존재하지 않으면 생성
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  let user = await User.findOne({ username });
  if (!user) {
    user = new User({ username, password });
    await user.save();
    console.log(`🆕 새 사용자 생성됨: ${username}`);
  }
  if (user.password === password) {
    res.json({ success: true, username: user.username });
  } else {
    res.status(401).json({ success: false, message: "비밀번호가 잘못되었습니다." });
  }
});

// 이벤트 참여 기록 API
app.post('/participate', async (req, res) => {
  const { username, eventId, eventName, location} = req.body;

  if (!username || !eventId || !eventName || !location) {
    return res.status(400).json({ success: false, message: '필수 항목 누락' });
  }

  const participation = new Participation({ 
    username, 
    eventId,
    eventName,
    location,
    timestamp: new Date() 
  });

  const filepath = path.join(__dirname, "participation.json");


  try {
    await participation.save();
    console.log("✅ 참여 기록 저장됨:", participation);
    // participation.json 파일 샐성
    fs.writeFileSync(filepath,JSON.stringify(participation,null,2));
    res.json({ success: true });

  } catch (error) {
    console.error("❌ DB 저장 오류:", error);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 마이페이지 데이터 제공 APIf
app.get('/mypage/:username', async (req, res) => {
  const records = await Participation.find({ username: req.params.username }).sort({ timestamp: -1 });
  res.json(records);
});

// 정적 파일 제공
app.get("/",(req,res)=> {
  res.redirect("/home.html");
});

app.get("/api/token-uri", async (req, res) => {
  try {
    const uri = await uploadJSONToPinataV3();
    res.json({ tokenURI: uri });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// 404 처리
app.listen(PORT, () => {
  console.log(`✅ 서버 실행중: http://localhost:${PORT}`);
});