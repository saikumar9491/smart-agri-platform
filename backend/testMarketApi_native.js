import https from 'https';

const apiKey = '14613c4e-5ab0-4705-b440-e4e49ae345de';
const url = `https://api.data.gov.in/resource/9ef273d6-b1d0-42fe-885d-82cbf424d5a3?api-key=${apiKey}&format=json&limit=10&filters[market]=Phagwara`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log("Response was not JSON:", data);
    }
    process.exit(0);
  });
}).on('error', (err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
