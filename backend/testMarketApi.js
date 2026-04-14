import axios from 'axios';

async function testApi() {
  const apiKey = '14613c4e-5ab0-4705-b440-e4e49ae345de';
  const url = `https://api.data.gov.in/resource/9ef273d6-b1d0-42fe-885d-82cbf424d5a3?api-key=${apiKey}&format=json&limit=10&filters[market]=Phagwara`;
  
  try {
    const res = await axios.get(url);
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("API Error:", err.response?.data || err.message);
  }
}

testApi();
