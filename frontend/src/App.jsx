import axios from 'axios';
import {
  ArrowLeft,
  Building2,
  Camera,
  CheckCircle2,
  FolderSearch,
  ImageUp,
  Images,
  LockKeyhole,
  Search,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const text = {
  title: '\uAC74\uCD95\uBB3C\n\uADE0\uC5F4 \uC9C4\uB2E8 \uC11C\uBE44\uC2A4',
  subtitle: 'AI \uAE30\uBC18 \uC678\uAD00 \uC810\uAC80\uACFC \uBD84\uC11D \uAE30\uB85D \uAD00\uB9AC',
  login: '\uB85C\uADF8\uC778',
  logout: '\uB85C\uADF8\uC544\uC6C3',
  loginTitle: '\uC810\uAC80\uC790 \uB85C\uADF8\uC778',
  loginHint: '\uD504\uB860\uD2B8 \uD654\uBA74 \uD750\uB984\uC744 \uC704\uD55C \uBAA9\uC5C5 \uB85C\uADF8\uC778\uC785\uB2C8\uB2E4.',
  email: '\uC774\uBA54\uC77C',
  password: '\uBE44\uBC00\uBC88\uD638',
  camera: '\uCD2C\uC601 \uBD84\uC11D',
  album: '\uBD84\uC11D\uACB0\uACFC\uC800\uC7A5\uC18C',
  main: '\uBA54\uC778',
  cameraTitle: '\uADE0\uC5F4 \uC0AC\uC9C4 \uCD2C\uC601',
  cameraHint: '\uCE74\uBA54\uB77C\uB85C \uCD2C\uC601\uD558\uAC70\uB098 \uC774\uBBF8\uC9C0\uB97C \uC5C5\uB85C\uB4DC\uD558\uC138\uC694.',
  takePhoto: '\uCE74\uBA54\uB77C \uC5F4\uAE30',
  choosePhoto: '\uC0AC\uC9C4 \uC120\uD0DD',
  uploadAnalyze: '\uBD84\uC11D \uC2DC\uC791',
  uploading: '\uBD84\uC11D \uC694\uCCAD \uC911',
  noImage: '\uC120\uD0DD\uB41C \uC0AC\uC9C4\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
  chooseImage: '\uBA3C\uC800 \uC0AC\uC9C4\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694.',
  imageOnly: '\uC774\uBBF8\uC9C0 \uD30C\uC77C\uB9CC \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
  uploadFailed: '\uC5C5\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uBC31\uC5D4\uB4DC\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694.',
  result: '\uBD84\uC11D \uACB0\uACFC',
  waiting: '\uBD84\uC11D \uB300\uAE30',
  severity: '\uC704\uD5D8\uB3C4',
  defectType: '\uACB0\uD568 \uC720\uD615',
  confidence: '\uC2E0\uB8B0\uB3C4',
  ratio: '\uACB0\uD568 \uBA74\uC801\uBE44',
  albumTitle: '\uBD84\uC11D \uC568\uBC94',
  search: '\uAC80\uC0C9',
  searchPlaceholder: '\uC704\uCE58, \uACB0\uD568 \uC720\uD615, \uBA54\uBAA8 \uAC80\uC0C9',
  all: '\uC804\uCCB4',
  safe: '\uC591\uD638',
  watch: '\uC8FC\uC758',
  alert: '\uACBD\uACC4',
  danger: '\uC704\uD5D8',
  emptyAlbum: '\uC870\uAC74\uC5D0 \uB9DE\uB294 \uC568\uBC94\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
  server: '\uC11C\uBC84',
};

const filters = [
  { value: 'all', label: text.all },
  { value: 'safe', label: text.safe },
  { value: 'watch', label: text.watch },
  { value: 'alert', label: text.alert },
  { value: 'danger', label: text.danger },
];

const seedAlbum = [
  {
    id: 1,
    location: '\uC9C0\uD558\uC8FC\uCC28\uC7A5 B2',
    capturedAt: '2026.06.01 09:40',
    defectType: 'Crack',
    severity: 'danger',
    severityLabel: text.danger,
    confidence: 0.94,
    ratio: 0.48,
    note: '\uAE34 \uC218\uC9C1 \uADE0\uC5F4',
  },
  {
    id: 2,
    location: '\uC678\uBCBD \uB0A8\uCE21',
    capturedAt: '2026.05.30 14:12',
    defectType: 'Spalling',
    severity: 'alert',
    severityLabel: text.alert,
    confidence: 0.88,
    ratio: 0.33,
    note: '\uD45C\uBA74 \uBC15\uB9AC \uC758\uC2EC',
  },
  {
    id: 3,
    location: '\uACC4\uB2E8\uC2E4 3F',
    capturedAt: '2026.05.28 16:05',
    defectType: 'Efflorescence',
    severity: 'watch',
    severityLabel: text.watch,
    confidence: 0.81,
    ratio: 0.18,
    note: '\uBC31\uD654 \uD754\uC801',
  },
];

function App() {
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL ?? 'http://localhost:8080';
  const demoUserId = 'demo-user-001';
  const api = useMemo(() => axios.create({ baseURL: backendBaseUrl }), [backendBaseUrl]);

  const [view, setView] = useState('home');
  const [loggedIn, setLoggedIn] = useState(false);
  const [health, setHealth] = useState('checking');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadState, setUploadState] = useState('idle');
  const [analysis, setAnalysis] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [albumItems, setAlbumItems] = useState(seedAlbum);
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    api
      .get('/health')
      .then((response) => setHealth(response.data?.status ?? 'unknown'))
      .catch(() => setHealth('unavailable'));
  }, [api]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const filteredAlbum = albumItems.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.severity === activeFilter;
    const lowerQuery = query.trim().toLowerCase();
    const matchesQuery =
      !lowerQuery ||
      [item.location, item.defectType, item.severityLabel, item.note].join(' ').toLowerCase().includes(lowerQuery);

    return matchesFilter && matchesQuery;
  });

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setErrorMessage('');

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(text.imageOnly);
      return;
    }

    setSelectedFile(file);
    setAnalysis(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage(text.chooseImage);
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', demoUserId);
    setUploadState('uploading');
    setErrorMessage('');

    try {
      const response = await api.post('/api/images/upload', formData);
      const mockAnalysis = {
        defectType: 'Crack',
        severity: 'alert',
        severityLabel: text.alert,
        confidence: 0.91,
        ratio: 0.31,
        objectKey: response.data?.objectKey ?? '-',
      };

      setAnalysis(mockAnalysis);
      setAlbumItems((items) => [
        {
          id: Date.now(),
          location: '\uC0C8 \uCD2C\uC601',
          capturedAt: new Date().toLocaleString('ko-KR'),
          note: selectedFile.name,
          ...mockAnalysis,
        },
        ...items,
      ]);
      setUploadState('done');
    } catch {
      setUploadState('error');
      setErrorMessage(text.uploadFailed);
    }
  };

  const formatPercent = (value) => (typeof value === 'number' ? `${Math.round(value * 100)}%` : '-');

  return (
    <main className="phone-shell">
      {view !== 'home' && (
        <button className="back-button" onClick={() => setView('home')} type="button" aria-label={text.main}>
          <ArrowLeft size={22} />
        </button>
      )}

      {view === 'home' && (
        <section className="home-screen">
          <section className="hero-panel">
            <div className="building-visual" aria-hidden="true">
              <svg viewBox="0 0 360 210" role="img">
                <defs>
                  <linearGradient id="towerFace" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="rgba(255,255,255,0.38)" />
                    <stop offset="1" stopColor="rgba(255,255,255,0.12)" />
                  </linearGradient>
                </defs>

                <g className="ground-line">
                  <path d="M22 190H338" />
                  <path d="M68 199H292" />
                </g>

                <g className="buildings">
                  <path className="tower side" d="M34 188V76h22V54h84v134H34Z" />
                  <path className="tower main" d="M122 188V38h24V14h70v24h24v150H122Z" />
                  <path className="tower side" d="M220 188V66h22V44h84v144H220Z" />

                  <path className="roof" d="M123 39h117" />
                  <path className="roof" d="M33 78h107" />
                  <path className="roof" d="M220 68h107" />
                </g>

                <g className="windows">
                  {Array.from({ length: 4 }).map((_, row) =>
                    Array.from({ length: 3 }).map((__, col) => (
                      <rect height="12" key={`l-${row}-${col}`} rx="2" width="16" x={55 + col * 25} y={77 + row * 24} />
                    )),
                  )}
                  {Array.from({ length: 5 }).map((_, row) =>
                    Array.from({ length: 4 }).map((__, col) => (
                      <rect height="13" key={`m-${row}-${col}`} rx="2" width="17" x={145 + col * 22} y={43 + row * 24} />
                    )),
                  )}
                  {Array.from({ length: 4 }).map((_, row) =>
                    Array.from({ length: 3 }).map((__, col) => (
                      <rect height="12" key={`r-${row}-${col}`} rx="2" width="16" x={242 + col * 25} y={75 + row * 24} />
                    )),
                  )}
                </g>

                <g className="crack-lines">
                  <path d="M190 35h-9v25h-10v21h12v20h-15v31h10v18h-14v31" />
                  <path d="M177 91h-20v13h-14" />
                  <path d="M174 129h17v13h17" />
                  <path d="M207 64h-8v18h-8v24" />
                  <path d="M160 151h-14v13h-11" />
                </g>

                <g className="break-effect">
                  <rect height="9" width="9" x="155" y="75" />
                  <rect height="7" width="7" x="199" y="88" />
                  <rect height="8" width="8" x="146" y="121" />
                  <rect height="10" width="10" x="196" y="136" />
                  <rect height="7" width="7" x="169" y="157" />
                  <rect height="6" width="6" x="210" y="52" />
                  <rect height="6" width="6" x="135" y="103" />
                  <path d="M162 88h13v13h-13Z" />
                  <path d="M184 111h12v12h-12Z" />
                  <path d="M151 139h11v11h-11Z" />
                </g>

              </svg>
            </div>
            <div>
              <p>{text.subtitle}</p>
              <h1>{text.title}</h1>
            </div>
          </section>

          <section className="login-zone" aria-label={text.login}>
            <button className="main-button" onClick={() => setView('login')} type="button">
              <LockKeyhole size={30} />
              {loggedIn ? text.logout : text.login}
            </button>
          </section>

          <section className="quick-menu" aria-label={text.main}>
            <button onClick={() => setView('camera')} type="button">
              <span>
                <Camera size={34} />
              </span>
              {text.camera}
            </button>
            <button onClick={() => setView('album')} type="button">
              <span>
                <FolderSearch size={34} />
              </span>
              {text.album}
            </button>
          </section>

          <footer className="server-chip">
            <span className={health === 'UP' ? 'online' : ''} />
            {text.server}: {health}
          </footer>
        </section>
      )}

      {view === 'login' && (
        <section className="sub-screen login-screen">
          <div className="screen-title">
            <LockKeyhole size={30} />
            <div>
              <span>{text.login}</span>
              <h2>{text.loginTitle}</h2>
            </div>
          </div>
          <form
            className="login-form"
            onSubmit={(event) => {
              event.preventDefault();
              setLoggedIn(true);
              setView('home');
            }}
          >
            <p>{text.loginHint}</p>
            <input aria-label={text.email} placeholder="inspector@csas.dev" type="email" />
            <input aria-label={text.password} placeholder="password" type="password" />
            <button type="submit">
              <CheckCircle2 size={22} />
              {text.login}
            </button>
            {loggedIn && (
              <button className="ghost-button" onClick={() => setLoggedIn(false)} type="button">
                {text.logout}
              </button>
            )}
          </form>
        </section>
      )}

      {view === 'camera' && (
        <section className="sub-screen camera-screen">
          <div className="screen-title">
            <Camera size={30} />
            <div>
              <span>{text.camera}</span>
              <h2>{text.cameraTitle}</h2>
            </div>
          </div>
          <p className="screen-copy">{text.cameraHint}</p>

          <div className="preview-frame">{previewUrl ? <img alt="" src={previewUrl} /> : <span>{text.noImage}</span>}</div>

          <div className="capture-actions">
            <label>
              <input accept="image/*" capture="environment" onChange={handleFileChange} type="file" />
              <Building2 size={24} />
              {text.takePhoto}
            </label>
            <label>
              <input accept="image/*" onChange={handleFileChange} type="file" />
              <ImageUp size={24} />
              {text.choosePhoto}
            </label>
          </div>

          <button className="wide-action" disabled={uploadState === 'uploading'} onClick={handleUpload} type="button">
            {uploadState === 'uploading' ? text.uploading : text.uploadAnalyze}
          </button>
          {errorMessage && <p className="message error">{errorMessage}</p>}

          <section className="result-card">
            <div className={`severity-pill ${analysis?.severity ?? 'idle'}`}>{analysis?.severityLabel ?? text.waiting}</div>
            <dl>
              <div>
                <dt>{text.defectType}</dt>
                <dd>{analysis?.defectType ?? '-'}</dd>
              </div>
              <div>
                <dt>{text.confidence}</dt>
                <dd>{formatPercent(analysis?.confidence)}</dd>
              </div>
              <div>
                <dt>{text.ratio}</dt>
                <dd>{formatPercent(analysis?.ratio)}</dd>
              </div>
            </dl>
          </section>
        </section>
      )}

      {view === 'album' && (
        <section className="sub-screen album-screen">
          <div className="screen-title">
            <Images size={30} />
            <div>
              <span>{text.album}</span>
              <h2>{text.albumTitle}</h2>
            </div>
          </div>

          <label className="search-box">
            <Search size={20} />
            <input
              aria-label={text.search}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={text.searchPlaceholder}
              value={query}
            />
          </label>

          <div className="filter-row">
            {filters.map((filter) => (
              <button
                className={activeFilter === filter.value ? 'active' : ''}
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="album-list">
            {filteredAlbum.length > 0 ? (
              filteredAlbum.map((item) => (
                <article className="album-item" key={item.id}>
                  <div className={`album-icon ${item.severity}`}>
                    <Images size={28} />
                  </div>
                  <div>
                    <strong>{item.location}</strong>
                    <span>{item.capturedAt}</span>
                    <p>{item.note}</p>
                  </div>
                  <em>{item.severityLabel}</em>
                </article>
              ))
            ) : (
              <p className="empty-state">{text.emptyAlbum}</p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
