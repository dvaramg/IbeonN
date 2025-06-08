require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

async function uploadJSONToPinataV3() {
  const url = "https://uploads.pinata.cloud/v3/files"; // V3 파일 업로드용

  const filePath = path.join(__dirname, "participation.json");

  //  FormData 구성
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("name", "participation.json");
  form.append("network", "public");

  let cid;

  try {
    const res = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(), // 자동으로 multipart 헤더 구성
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    });

  cid = res.data.data.cid;
  console.log("🌐 JSON:", `https://gateway.pinata.cloud/ipfs/${cid}`);
  }
  catch (err) {
    console.error("❌ Upload failed:", err.response?.status, err.response?.data || err.message);
  }

  const metadata = 
    {
      "name": "IbeonN Participation Badge",
      "description": "Participation Badge issued by IbeonN",
      "image": "https://i.ibb.co/WNrPw2Fm/ibeonn-badge.png", //이미지 URL
      "external_url": `https://gateway.pinata.cloud/ipfs/${cid}`,  // 실제 ZKP+publicSignals가 담긴 JSON 주소
      "attributes": [
        { "trait_type": "Level", "value": "Advanced" },
        { "trait_type": "IbeonN", "value": "Participation Badge" }
      ]
    };

  const filePath2 = path.join(__dirname, "metadata.json");
  fs.writeFileSync(filePath2, JSON.stringify(metadata, null, 2));

  const form2 = new FormData();
  form2.append("file", fs.createReadStream(filePath2));
  form2.append("name", "metadata.json");
  form2.append("network", "public");

  try {
    const res2 = await axios.post(url, form2, {
      headers: {
        ...form2.getHeaders(), // 자동으로 multipart 헤더 구성
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    });
    const cid2 = res2.data.data.cid;

    console.log("✅ Uploaded JSON to IPFS (V3)");
    console.log("📦 Full response:", res2.data);
    
    return `ipfs://${cid2}`;

  } catch (err) {
    console.error("❌ Upload failed:", err.response?.status, err.response?.data || err.message);
  }
  
}
module.exports = { uploadJSONToPinataV3 };