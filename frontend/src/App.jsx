import axios from 'axios';
import {
  ArrowLeft,
  Building2,
  Camera,
  FolderSearch,
  ImageUp,
  Images,
  LockKeyhole,
  Search,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const text = {
  title: '\uAC74\uCD95\uBB3C\n\uADE0\uC5F4 \uC9C4\uB2E8 \uC11C\uBE44\uC2A4',
  subtitle: 'AI \uAE30\uBC18 \uC678\uAD00 \uC810\uAC80\uACFC \uBD84\uC11D \uAE30\uB85D \uAD00\uB9AC',
  login: '\uB85C\uADF8\uC778',
  logout: '\uB85C\uADF8\uC544\uC6C3',
  loginTitle: '\uAD6C\uAE00 \uB85C\uADF8\uC778',
  loginHint: '\uAD6C\uAE00 \uACC4\uC815\uC73C\uB85C \uC778\uC99D\uD558\uBA74 \uC568\uBC94\uACFC \uC5C5\uB85C\uB4DC\uC5D0 \uD3EC\uD568\uD560 \uC0AC\uC6A9\uC790 \uC815\uBCF4\uB97C \uAD6C\uBD84\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
  loginAction: '\uAD6C\uAE00\uC73C\uB85C \uB85C\uADF8\uC778',
  loginReady: '\uB85C\uADF8\uC778 \uC644\uB8CC',
  loginRequired: '\uAD6C\uAE00 \uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
  loginConfigMissing: '\uAD6C\uAE00 \uB85C\uADF8\uC778 \uC124\uC815\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
  loginFailed: '\uAD6C\uAE00 \uB85C\uADF8\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.',
  email: '\uC774\uBA54\uC77C',
  name: '\uC774\uB984',
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
  albumDetailTitle: '\uC0C1\uC138 \uC815\uBCF4',
  albumLoading: '\uC568\uBC94 \uB85C\uB529 \uC911',
  albumLoadFailed: '\uC568\uBC94 \uB85C\uB529\uc5d0 \uC2E4\ud328\ud588\uc2b5\ub2c8\ub2e4.',
  annotationCount: '\uC8FC\uC11D \uAC1C\uC218',
  aiStatus: 'AI \uC0C1\uD0DC',
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

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('ko-KR');
}

function getDefectSeverity(aiAnalysis) {
  const defectFound = aiAnalysis?.defect_found ?? aiAnalysis?.defectFound ?? false;
  return defectFound ? 'danger' : 'safe';
}

function getDefectLabel(aiAnalysis) {
  const defectFound = aiAnalysis?.defect_found ?? aiAnalysis?.defectFound ?? false;
  if (!defectFound) {
    return text.safe;
  }

  const annotations = aiAnalysis?.annotations ?? [];
  const firstAnnotation = annotations[0];
  return firstAnnotation?.class_name ?? firstAnnotation?.className ?? text.danger;
}

function normalizeAlbumRecord(record) {
  const defectFound = record.defectFound ?? record.defect_found ?? getDefectSeverity(record.aiAnalysis) === 'danger';
  const severity = defectFound ? 'danger' : 'safe';
  const severityLabel = severity === 'safe' ? text.safe : text.danger;
  const annotations = record.aiAnalysis?.annotations ?? [];
  const firstAnnotation = annotations[0];
  const defectType = record.defectType ?? getDefectLabel(record.aiAnalysis);
  const annotationCount = record.annotationCount ?? annotations.length;

  return {
    id: record.objectKey,
    objectKey: record.objectKey,
    objectUrl: record.objectUrl,
    savedAt: record.savedAt,
    originalFileName: record.originalFileName,
    fileSize: record.fileSize,
    userId: record.userId,
    aiAnalysis: record.aiAnalysis,
    severity,
    severityLabel,
    defectType,
    confidence: null,
    ratio: null,
    note: record.originalFileName,
    annotationCount,
    firstAnnotation,
  };
}

function loadStoredUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem('csas-google-user');
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

function App() {
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL ?? 'http://localhost:8080';
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
  const api = useMemo(() => axios.create({ baseURL: backendBaseUrl }), [backendBaseUrl]);
  const googleButtonRef = useRef(null);

  const [view, setView] = useState('home');
  const [authUser, setAuthUser] = useState(() => loadStoredUser());
  const [health, setHealth] = useState('checking');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadState, setUploadState] = useState('idle');
  const [analysis, setAnalysis] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [albumItems, setAlbumItems] = useState([]);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [albumLoadError, setAlbumLoadError] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [loginError, setLoginError] = useState('');
  const [pendingView, setPendingView] = useState(null);
  const loggedIn = Boolean(authUser);
  const currentUserId = authUser?.userId ?? '';

  useEffect(() => {
    api
      .get('/health')
      .then((response) => setHealth(response.data?.status ?? 'unknown'))
      .catch(() => setHealth('unavailable'));
  }, [api]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (authUser) {
      window.localStorage.setItem('csas-google-user', JSON.stringify(authUser));
    } else {
      window.localStorage.removeItem('csas-google-user');
    }

    return undefined;
  }, [authUser]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (view !== 'login' || loggedIn || !googleClientId) {
      return undefined;
    }

    let isActive = true;

    const renderGoogleButton = () => {
      if (!isActive || !window.google?.accounts?.id || !googleButtonRef.current) {
        return;
      }

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
          callback: async (response) => {
            if (!response?.credential) {
              setLoginError(text.loginRequired);
              return;
            }

            try {
              setLoginError('');
              const loginResponse = await api.post('/api/auth/google', { credential: response.credential });
              const user = loginResponse.data ?? null;
              setAuthUser(user);
              setView(pendingView ?? 'home');
              setPendingView(null);
            } catch {
              setLoginError(text.loginFailed);
            }
          },
        });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        width: 320,
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return () => {
        isActive = false;
        if (googleButtonRef.current) {
          googleButtonRef.current.innerHTML = '';
        }
      };
    }

    const timer = window.setInterval(() => {
      if (window.google?.accounts?.id) {
        window.clearInterval(timer);
        renderGoogleButton();
      }
    }, 100);

    return () => {
      isActive = false;
      window.clearInterval(timer);
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
      }
    };
  }, [api, googleClientId, loggedIn, pendingView, view]);

  useEffect(() => {
    if (view !== 'album') {
      return undefined;
    }

    let isActive = true;

    const loadAlbumItems = async () => {
      if (!currentUserId) {
        setAlbumLoadError(text.loginRequired);
        setAlbumItems([]);
        setSelectedAlbum(null);
        return;
      }

      setAlbumLoading(true);
      setAlbumLoadError('');

      try {
        const response = await api.get('/api/albums', {
          params: { userId: currentUserId, limit: 20 },
        });
        const nextItems = Array.isArray(response.data) ? response.data.map(normalizeAlbumRecord) : [];

        if (isActive) {
          setAlbumItems(nextItems);
          setSelectedAlbum(nextItems[0] ?? null);
        }
      } catch {
        if (isActive) {
          setAlbumLoadError(text.albumLoadFailed);
          setAlbumItems([]);
          setSelectedAlbum(null);
        }
      } finally {
        if (isActive) {
          setAlbumLoading(false);
        }
      }
    };

    loadAlbumItems();

    return () => {
      isActive = false;
    };
  }, [api, currentUserId, view]);

  const filteredAlbum = albumItems.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.severity === activeFilter;
    const lowerQuery = query.trim().toLowerCase();
    const matchesQuery =
      !lowerQuery ||
      [item.originalFileName, item.objectKey, item.defectType, item.severityLabel, item.userId, item.note]
        .join(' ')
        .toLowerCase()
        .includes(lowerQuery);

    return matchesFilter && matchesQuery;
  });

  const cameraAnalysis = analysis?.aiAnalysis ?? null;
  const cameraSeverity = getDefectSeverity(cameraAnalysis);
  const cameraSeverityLabel = cameraSeverity === 'safe' ? text.safe : text.danger;
  const cameraDefectType = getDefectLabel(cameraAnalysis);
  const cameraAnnotationCount = cameraAnalysis?.annotations?.length ?? 0;

  const handleSelectAlbum = async (item) => {
    setSelectedAlbum(item);

    if (!item?.objectKey) {
      return;
    }

    try {
      const response = await api.get('/api/albums/detail', {
        params: { objectKey: item.objectKey },
      });
      const detail = response.data ? normalizeAlbumRecord(response.data) : null;

      if (detail) {
        setSelectedAlbum(detail);
      }
    } catch {
      setAlbumLoadError(text.albumLoadFailed);
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    setPendingView(null);
    setAnalysis(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadState('idle');
    setErrorMessage('');
    setAlbumItems([]);
    setAlbumLoading(false);
    setAlbumLoadError('');
    setSelectedAlbum(null);
    setActiveFilter('all');
    setQuery('');
    setLoginError('');
    setView('home');
  };

  const openProtectedView = (nextView) => {
    if (!loggedIn) {
      setPendingView(nextView);
      setView('login');
      return;
    }

    setView(nextView);
  };

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
    if (!currentUserId) {
      setErrorMessage(text.loginRequired);
      return;
    }

    if (!selectedFile) {
      setErrorMessage(text.chooseImage);
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', currentUserId);
    setUploadState('uploading');
    setErrorMessage('');

    try {
    const response = await api.post('/api/images/upload', formData);
      const uploadedRecord = response.data ? normalizeAlbumRecord(response.data) : null;

      setAnalysis(uploadedRecord);
      setAlbumItems((items) => (uploadedRecord ? [uploadedRecord, ...items] : items));
      setSelectedAlbum(uploadedRecord);
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
            <button
              className="main-button"
              onClick={() => {
                if (loggedIn) {
                  handleLogout();
                  return;
                }

                setView('login');
              }}
              type="button"
            >
              <LockKeyhole size={30} />
              {loggedIn ? text.logout : text.login}
            </button>
          </section>

          <section className="quick-menu" aria-label={text.main}>
            <button onClick={() => openProtectedView('camera')} type="button">
              <span>
                <Camera size={34} />
              </span>
              {text.camera}
            </button>
            <button onClick={() => openProtectedView('album')} type="button">
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
            <p>{text.loginHint}</p>
          {!googleClientId && <p className="message error">{text.loginConfigMissing}</p>}
          {loginError && <p className="message error">{loginError}</p>}
          {loggedIn && authUser ? (
            <section className="login-card">
              <div className="login-profile">
                {authUser.picture ? <img alt={authUser.name ?? text.name} src={authUser.picture} /> : <LockKeyhole size={42} />}
                <div>
                  <strong>{authUser.name ?? text.name}</strong>
                  <p>{authUser.email ?? '-'}</p>
                  <span>{authUser.userId ?? '-'}</span>
                </div>
              </div>
              <button className="ghost-button" onClick={handleLogout} type="button">
                {text.logout}
              </button>
            </section>
          ) : (
            <div className="google-login-box">
              <div ref={googleButtonRef} />
              {!googleClientId && <p className="screen-copy">{text.loginConfigMissing}</p>}
            </div>
          )}
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
            <div className={`severity-pill ${cameraSeverity}`}>{cameraSeverityLabel ?? text.waiting}</div>
            <dl>
              <div>
                <dt>{text.defectType}</dt>
                <dd>{cameraDefectType ?? '-'}</dd>
              </div>
              <div>
                <dt>{text.annotationCount}</dt>
                <dd>{cameraAnnotationCount}</dd>
              </div>
              <div>
                <dt>{text.aiStatus}</dt>
                <dd>{cameraAnalysis?.status ?? '-'}</dd>
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

          {albumLoading && <p className="screen-copy">{text.albumLoading}</p>}
          {albumLoadError && <p className="message error">{albumLoadError}</p>}

          <div className="album-list">
            {filteredAlbum.length > 0 ? (
              filteredAlbum.map((item) => (
                <article
                  className={`album-item ${selectedAlbum?.objectKey === item.objectKey ? 'active' : ''}`}
                  key={item.objectKey}
                  onClick={() => handleSelectAlbum(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleSelectAlbum(item);
                    }
                  }}
                >
                  <div className="album-thumb">
                    {item.objectUrl ? <img alt={item.originalFileName} src={item.objectUrl} /> : <Images size={28} />}
                  </div>
                  <div>
                    <strong>{item.originalFileName}</strong>
                    <span>{item.savedAt ? new Date(item.savedAt).toLocaleString('ko-KR') : '-'}</span>
                    <p>{item.defectType}</p>
                  </div>
                  <em>{item.severityLabel}</em>
                </article>
              ))
            ) : (
              <p className="empty-state">{text.emptyAlbum}</p>
            )}
          </div>

          {selectedAlbum && (
            <section className="result-card">
              <div className={`severity-pill ${selectedAlbum.severity ?? 'idle'}`}>{selectedAlbum.severityLabel}</div>
              <h3>{text.albumDetailTitle}</h3>
              <div className="preview-frame album-preview">
                {selectedAlbum.objectUrl ? <img alt={selectedAlbum.originalFileName} src={selectedAlbum.objectUrl} /> : <span>{text.noImage}</span>}
              </div>
              <dl>
                <div>
                  <dt>{text.defectType}</dt>
                  <dd>{selectedAlbum.defectType ?? '-'}</dd>
                </div>
                <div>
                  <dt>{text.annotationCount}</dt>
                  <dd>{selectedAlbum.annotationCount ?? 0}</dd>
                </div>
                <div>
                  <dt>{text.server}</dt>
                  <dd>{selectedAlbum.userId ?? '-'}</dd>
                </div>
              </dl>
              {selectedAlbum.aiAnalysis && (
                <div className="analysis-summary">
                  <p>
                    <strong>{text.aiStatus}:</strong> {selectedAlbum.aiAnalysis.status ?? '-'}
                  </p>
                  <p>
                    <strong>Defect:</strong> {String(selectedAlbum.aiAnalysis.defect_found ?? selectedAlbum.aiAnalysis.defectFound ?? false)}
                  </p>
                  <pre>{JSON.stringify(selectedAlbum.aiAnalysis.annotations ?? [], null, 2)}</pre>
                </div>
              )}
            </section>
          )}
        </section>
      )}
    </main>
  );
}

export default App;
