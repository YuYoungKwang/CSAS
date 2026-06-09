import axios from 'axios';
import {
  ArrowLeft,
  Building2,
  Camera,
  ChevronLeft,
  ChevronRight,
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
  loginTitle: 'Google \uB85C\uADF8\uC778',
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
  defectType: '\uADE0\uC5F4 \uC885\uB958',
  defectTypes: '\uADE0\uC5F4 \uC885\uB958',
  analyzedAt: '\uBD84\uC11D \uC2DC\uAC04',
  coordinates: '\uC704\uCE58 \uC88C\uD45C',
  locationUnavailable: '\uC704\uCE58 \uC815\uBCF4 \uC5C6\uC74C',
  confidence: '\uC2E0\uB8B0\uB3C4',
  ratio: '\uACB0\uD568 \uBA74\uC801\uBE44',
  albumTitle: '\uBD84\uC11D \uC568\uBC94',
  albumDetailTitle: '\uC0C1\uC138 \uC815\uBCF4',
  albumLoading: '\uC568\uBC94 \uB85C\uB529 \uC911',
  albumLoadFailed: '\uC568\uBC94 \uB85C\uB529\uc5d0 \uC2E4\ud328\ud588\uc2b5\ub2c8\ub2e4.',
  search: '\uAC80\uC0C9',
  searchPlaceholder: '\uC704\uCE58, \uACB0\uD568 \uC720\uD615, \uBA54\uBAA8 \uAC80\uC0C9',
  all: '\uC804\uCCB4',
  recent: '\uCD5C\uADFC',
  sortName: '\uC774\uB984',
  sortDefectType: '\uADE0\uC5F4\uC885\uB958',
  safe: '\uC815\uC0C1',
  danger: '\uC704\uD5D8',
  emptyAlbum: '\uC870\uAC74\uC5D0 \uB9DE\uB294 \uC568\uBC94\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
  server: '\uC11C\uBC84',
};

const filters = [
  { value: 'all', label: text.all },
  { value: 'recent', label: text.recent },
  { value: 'name', label: text.sortName },
  { value: 'defectType', label: text.sortDefectType },
];

const defectTypeOptions = [
  { value: 'normal', label: '\uC815\uC0C1', aliases: ['\uC815\uC0C1', '\uC591\uD638', 'safe', 'normal'] },
  { value: 'crack', label: '\uADE0\uC5F4', aliases: ['\uADE0\uC5F4', 'crack', 'damage'] },
  { value: 'leakage', label: '\uB204\uC218', aliases: ['\uB204\uC218', 'leak', 'leakage'] },
  { value: 'efflorescence', label: '\uBC31\uD0DC', aliases: ['\uBC31\uD0DC', 'efflorescence'] },
  { value: 'peeling', label: '\uBC15\uB9AC', aliases: ['\uBC15\uB9AC', 'peeling'] },
  { value: 'spalling', label: '\uBC15\uB77D', aliases: ['\uBC15\uB77D', 'spalling'] },
  { value: 'rebar', label: '\uCCA0\uADFC\uB178\uCD9C', aliases: ['\uCCA0\uADFC\uB178\uCD9C', 'rebar', 'rebar exposure'] },
  { value: 'contamination', label: '\uC624\uC5FC', aliases: ['\uC624\uC5FC', 'contamination', 'stain'] },
  { value: 'breakage', label: '\uD30C\uC190', aliases: ['\uD30C\uC190', 'breakage', 'broken'] },
  { value: 'delamination', label: '\uB4E4\uB728\uC784', aliases: ['\uB4E4\uB728\uC784', 'delamination'] },
  { value: 'other', label: '\uAE30\uD0C0', aliases: ['\uAE30\uD0C0', 'other'] },
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
  return firstAnnotation?.class_name ?? firstAnnotation?.className ?? text.safe;
}

function getRecordDefectLabels(record) {
  const labels = [
    record.defectType,
    ...(record.aiAnalysis?.annotations ?? []).map((annotation) => annotation?.class_name ?? annotation?.className),
  ]
    .filter(Boolean)
    .map((label) => String(label).trim().toLowerCase());

  if (labels.length === 0 && record.severity === 'safe') {
    return ['normal', 'safe', '\uC815\uC0C1', '\uC591\uD638'];
  }

  return labels;
}

function getAnnotationClassName(annotation) {
  return annotation?.class_name ?? annotation?.className ?? text.safe;
}

function getAnnotationPoints(annotation) {
  return Array.isArray(annotation?.points) ? annotation.points : [];
}

function getUniqueAnnotationTypes(annotations = []) {
  const names = annotations.map(getAnnotationClassName).filter(Boolean);
  return [...new Set(names)];
}

function getAnnotationColor(index) {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
  return colors[index % colors.length];
}

function getAnnotationCenter(points, width, height) {
  if (!points.length) {
    return { x: 50, y: 50 };
  }

  const normalizedPoints = points.map((point) => normalizePoint(point, width, height));
  const sum = normalizedPoints.reduce(
    (total, point) => ({
      x: total.x + point.x,
      y: total.y + point.y,
    }),
    { x: 0, y: 0 }
  );

  return {
    x: (sum.x / normalizedPoints.length / width) * 100,
    y: (sum.y / normalizedPoints.length / height) * 100,
  };
}

function getRecordLocation(record) {
  const latitude = record?.latitude ?? record?.lat ?? record?.location?.latitude ?? record?.gps?.latitude;
  const longitude = record?.longitude ?? record?.lng ?? record?.location?.longitude ?? record?.gps?.longitude;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }

  return { latitude, longitude };
}

function formatLocation(location) {
  if (!location) {
    return text.locationUnavailable;
  }

  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
}

function normalizePoint(point, width, height) {
  const [rawX = 0, rawY = 0] = point ?? [];
  const x = Number(rawX);
  const y = Number(rawY);

  return {
    x: x <= 1 ? x * width : x,
    y: y <= 1 ? y * height : y,
  };
}

function AnalysisImageViewer({ src, annotations = [], alt = '' }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [hoveredAnnotation, setHoveredAnnotation] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const hasAnnotations = annotations.length > 0;
  const isAnalysisSlide = hasAnnotations && activeSlide === 1;

  const toggleSlide = () => {
    setActiveSlide((currentSlide) => (currentSlide === 0 ? 1 : 0));
    setHoveredAnnotation(null);
  };

  return (
    <div className="analysis-viewer">
      <img
        alt={alt}
        className="analysis-image"
        onLoad={(event) => {
          setImageSize({
            width: event.currentTarget.naturalWidth || 1,
            height: event.currentTarget.naturalHeight || 1,
          });
        }}
        src={src}
      />
      {isAnalysisSlide && (
        <div className="analysis-overlay">
          <svg aria-hidden="true" preserveAspectRatio="xMidYMid meet" viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}>
            {annotations.map((annotation, index) => {
              const points = (annotation.points ?? []).map((point) => normalizePoint(point, imageSize.width, imageSize.height));
              if (points.length === 0) {
                return null;
              }

              const color = getAnnotationColor(index);
              const pointString = points.map((point) => `${point.x},${point.y}`).join(' ');

              return (
                <g key={`${getAnnotationClassName(annotation)}-${index}`}>
                  {points.length >= 3 && (
                    <polygon
                      fill={color}
                      onMouseEnter={() => setHoveredAnnotation({ annotation, index })}
                      onMouseLeave={() => setHoveredAnnotation(null)}
                      opacity="0.2"
                      points={pointString}
                    />
                  )}
                  <polyline
                    onMouseEnter={() => setHoveredAnnotation({ annotation, index })}
                    onMouseLeave={() => setHoveredAnnotation(null)}
                    points={pointString}
                    stroke={color}
                  />
                  {points.map((point, pointIndex) => (
                    <circle cx={point.x} cy={point.y} fill={color} key={pointIndex} r="4" />
                  ))}
                </g>
              );
            })}
          </svg>
          {hoveredAnnotation && (
            <span
              className="annotation-tooltip"
              style={{
                '--tooltip-x': `${getAnnotationCenter(
                  getAnnotationPoints(hoveredAnnotation.annotation),
                  imageSize.width,
                  imageSize.height
                ).x}%`,
                '--tooltip-y': `${getAnnotationCenter(
                  getAnnotationPoints(hoveredAnnotation.annotation),
                  imageSize.width,
                  imageSize.height
                ).y}%`,
                '--tooltip-color': getAnnotationColor(hoveredAnnotation.index),
              }}
            >
              {getAnnotationClassName(hoveredAnnotation.annotation)}
            </span>
          )}
        </div>
      )}
      {hasAnnotations && (
        <>
          <button aria-label="원본 사진 보기" className="slide-arrow left" onClick={toggleSlide} type="button">
            <ChevronLeft size={22} />
          </button>
          <button aria-label="분석 완료 사진 보기" className="slide-arrow right" onClick={toggleSlide} type="button">
            <ChevronRight size={22} />
          </button>
          <div className="slide-status">
            <span className={activeSlide === 0 ? 'active' : ''}>원본</span>
            <span className={activeSlide === 1 ? 'active' : ''}>분석</span>
          </div>
        </>
      )}
    </div>
  );
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
    latitude: record.latitude,
    longitude: record.longitude,
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

function GoogleGIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.61Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.19l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.94v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.41 5.41 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.82.94 4.03l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.43 1.35l2.58-2.58A8.65 8.65 0 0 0 9 0 9 9 0 0 0 .94 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

function App() {
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL ?? 'http://localhost:8080';
  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '122091663263-0eda9eg9mi2jc0vd1dr65smmpk4h4jbr.apps.googleusercontent.com';
  const api = useMemo(() => axios.create({ baseURL: backendBaseUrl }), [backendBaseUrl]);
  const googleButtonRef = useRef(null);

  const [view, setView] = useState('home');
  const [authUser, setAuthUser] = useState(() => loadStoredUser());
  const [health, setHealth] = useState('checking');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [cameraLocation, setCameraLocation] = useState(null);
  const [uploadState, setUploadState] = useState('idle');
  const [analysis, setAnalysis] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [albumItems, setAlbumItems] = useState([]);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [albumLoadError, setAlbumLoadError] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedDefectTypes, setSelectedDefectTypes] = useState([]);
  const [query, setQuery] = useState('');
  const [loginError, setLoginError] = useState('');
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
    if (view !== 'home' || loggedIn || !googleClientId) {
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
              setView('home');
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
  }, [api, googleClientId, loggedIn, view]);

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
    const lowerQuery = query.trim().toLowerCase();
    const matchesQuery =
      !lowerQuery ||
      [item.originalFileName, item.objectKey, item.defectType, item.severityLabel, item.userId, item.note]
        .join(' ')
        .toLowerCase()
        .includes(lowerQuery);

    if (!matchesQuery) {
      return false;
    }

    if (activeFilter !== 'defectType' || selectedDefectTypes.length === 0) {
      return true;
    }

    const itemDefectLabels = getRecordDefectLabels(item);
    return selectedDefectTypes.every((selectedValue) => {
      const option = defectTypeOptions.find((defectType) => defectType.value === selectedValue);
      return option?.aliases.some((alias) => itemDefectLabels.includes(alias.toLowerCase())) ?? false;
    });
  }).sort((first, second) => {
    if (activeFilter === 'recent') {
      return new Date(second.savedAt ?? 0).getTime() - new Date(first.savedAt ?? 0).getTime();
    }

    if (activeFilter === 'name') {
      return (first.originalFileName ?? '').localeCompare(second.originalFileName ?? '', 'ko-KR', {
        numeric: true,
        sensitivity: 'base',
      });
    }

    if (activeFilter === 'defectType') {
      return (first.defectType ?? '').localeCompare(second.defectType ?? '', 'ko-KR', {
        numeric: true,
        sensitivity: 'base',
      });
    }

    return 0;
  });

  const cameraAnalysis = analysis?.aiAnalysis ?? null;
  const cameraAnnotations = cameraAnalysis?.annotations ?? [];
  const cameraDefectTypes = getUniqueAnnotationTypes(cameraAnnotations);
  const selectedAlbumAnnotations = selectedAlbum?.aiAnalysis?.annotations ?? [];
  const selectedAlbumDefectTypes = getUniqueAnnotationTypes(selectedAlbumAnnotations);
  const cameraDisplayLocation = getRecordLocation(analysis) ?? cameraLocation;
  const selectedAlbumLocation = getRecordLocation(selectedAlbum);

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
    setAnalysis(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setCameraLocation(null);
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

  const handleToggleDefectType = (value) => {
    setSelectedDefectTypes((currentValues) =>
      currentValues.includes(value)
        ? currentValues.filter((currentValue) => currentValue !== value)
        : [...currentValues, value]
    );
  };

  const openProtectedView = (nextView) => {
    setView(nextView);
  };

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setCameraLocation(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCameraLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => setCameraLocation(null),
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 5000 }
    );
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
    setCameraLocation(null);
    requestCurrentLocation();
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
    if (cameraLocation) {
      formData.append('latitude', String(cameraLocation.latitude));
      formData.append('longitude', String(cameraLocation.longitude));
    }
    setUploadState('uploading');
    setErrorMessage('');

    try {
    const response = await api.post('/api/images/upload', formData);
      const uploadedRecord = response.data
        ? {
            ...normalizeAlbumRecord(response.data),
            latitude: response.data.latitude ?? cameraLocation?.latitude,
            longitude: response.data.longitude ?? cameraLocation?.longitude,
          }
        : null;

      setAnalysis(uploadedRecord);
      setAlbumItems((items) => (uploadedRecord ? [uploadedRecord, ...items] : items));
      setSelectedAlbum(uploadedRecord);
      setUploadState('done');
    } catch {
      setUploadState('error');
      setErrorMessage(text.uploadFailed);
    }
  };

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
            {loggedIn ? (
              <button className="main-button" onClick={handleLogout} type="button">
                <LockKeyhole size={30} />
                {text.logout}
              </button>
            ) : (
              <div className="home-google-login">
                <div ref={googleButtonRef} />
                {!googleClientId && (
                  <button className="google-fallback-button" disabled type="button">
                    <GoogleGIcon />
                    {'\uAD6C\uAE00\uB85C \uACC4\uC18D\uD558\uAE30'}
                  </button>
                )}
              </div>
            )}
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

      {false && view === 'login' && (
        <section className="sub-screen login-screen">
          <div className="screen-title">
            <LockKeyhole size={30} />
            <div>
              <h2>{text.loginTitle}</h2>
            </div>
          </div>
            <p>{text.loginHint}</p>
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
              {!googleClientId && (
                <>
                  <button className="google-fallback-button" disabled type="button">
                    <svg aria-hidden="true" viewBox="0 0 18 18">
                      <path
                        fill="#4285F4"
                        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.61Z"
                      />
                      <path
                        fill="#34A853"
                        d="M9 18c2.43 0 4.47-.8 5.96-2.19l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.94v2.33A9 9 0 0 0 9 18Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M3.95 10.7A5.41 5.41 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.82.94 4.03l3.01-2.33Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M9 3.58c1.32 0 2.5.45 3.43 1.35l2.58-2.58A8.65 8.65 0 0 0 9 0 9 9 0 0 0 .94 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58Z"
                      />
                    </svg>
                    구글로 계속하기
                  </button>
                </>
              )}
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

          <div className="preview-frame">
            {previewUrl ? (
              <AnalysisImageViewer alt={selectedFile?.name ?? ''} annotations={cameraAnalysis?.annotations ?? []} src={previewUrl} />
            ) : (
              <span>{text.noImage}</span>
            )}
          </div>

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
            <h3>{text.result}</h3>
            <dl>
              <div>
                <dt>{text.defectTypes}</dt>
                <dd>{cameraDefectTypes.length > 0 ? cameraDefectTypes.join(', ') : '-'}</dd>
              </div>
              <div>
                <dt>{text.coordinates}</dt>
                <dd>{formatLocation(cameraDisplayLocation)}</dd>
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

          {activeFilter === 'defectType' && (
            <div className="defect-type-row" aria-label={text.sortDefectType}>
              {defectTypeOptions.map((option) => (
                <button
                  className={selectedDefectTypes.includes(option.value) ? 'selected' : ''}
                  key={option.value}
                  onClick={() => handleToggleDefectType(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

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
                </article>
              ))
            ) : (
              <p className="empty-state">{text.emptyAlbum}</p>
            )}
          </div>

          {selectedAlbum && (
            <section className="result-card">
              <h3>{text.albumDetailTitle}</h3>
              <div className="preview-frame album-preview">
                {selectedAlbum.objectUrl ? (
                  <AnalysisImageViewer
                    alt={selectedAlbum.originalFileName}
                    annotations={selectedAlbum.aiAnalysis?.annotations ?? []}
                    src={selectedAlbum.objectUrl}
                  />
                ) : (
                  <span>{text.noImage}</span>
                )}
              </div>
              <dl>
                <div>
                  <dt>{text.defectTypes}</dt>
                  <dd>{selectedAlbumDefectTypes.length > 0 ? selectedAlbumDefectTypes.join(', ') : selectedAlbum.defectType ?? '-'}</dd>
                </div>
                <div>
                  <dt>{text.analyzedAt}</dt>
                  <dd>{formatDate(selectedAlbum.savedAt)}</dd>
                </div>
                <div>
                  <dt>{text.coordinates}</dt>
                  <dd>{formatLocation(selectedAlbumLocation)}</dd>
                </div>
              </dl>
            </section>
          )}
        </section>
      )}
    </main>
  );
}

export default App;
