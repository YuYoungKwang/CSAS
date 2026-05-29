import { useEffect, useState } from 'react';

function App() {
  const [health, setHealth] = useState('checking');
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL ?? 'http://localhost:8080';

  useEffect(() => {
    fetch(`${backendBaseUrl}/health`)
      .then((response) => response.json())
      .then((data) => setHealth(data.status ?? 'unknown'))
      .catch(() => setHealth('unavailable'));
  }, [backendBaseUrl]);

  return (
    <main>
      <h1>crackSensingAiService</h1>
      <p>AI 기반 시설물 균열 감지 서비스 프론트엔드입니다.</p>
      <p>Backend health: {health}</p>
    </main>
  );
}

export default App;
