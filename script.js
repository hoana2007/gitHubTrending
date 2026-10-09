/* =========================================================
   GITHUB TRENDS DASHBOARD
   - Three.js 3D bubble chart
   - D3 donut + line chart
   - i18n (EN/VN)
   - localStorage cache (TTL 15 phút)
   - CSV export
   ========================================================= */

const API = "https://api.github.com/search/repositories";
const CACHE_PREFIX = "ght_cache_";
const CACHE_TTL = 15 * 60 * 1000; // 15 phút
const PERIODS = [7, 30, 90];
const PERIOD_COLORS = { 7: "#6366f1", 30: "#06b6d4", 90: "#f59e0b" };

/* ---------- Bảng màu ngôn ngữ ---------- */
const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", "C++": "#f34b7d",
  PHP: "#4F5D95", Ruby: "#701516", HTML: "#e34c26", CSS: "#563d7c",
  default: "#8b949e",
};

/* ---------- Topic keywords ---------- */
const TOPIC_KEYWORDS = {
  ai: ["ai", "machine-learning", "deep-learning", "ml", "neural", "llm", "gpt"],
  web: ["web", "react", "vue", "angular", "nextjs", "frontend", "backend"],
  mobile: ["mobile", "android", "ios", "flutter", "react-native", "swift"],
  devops: ["devops", "kubernetes", "docker", "ci", "cd", "terraform"],
  database: ["database", "sql", "nosql", "mongodb", "postgres", "redis"],
  game: ["game", "unity", "godot", "unreal", "game-engine"],
  cli: ["cli", "terminal", "command-line", "shell", "tui"],
  framework: ["framework", "library", "toolkit", "sdk"],
};

/* ================= I18N ================= */
const I18N = {
  vi: {
    logo: 'GitHub<span class="logo-accent">Trends</span>',
    search: 'Tìm repo...',
    filter_language: 'Ngôn ngữ',
    filter_period: 'Khoảng thời gian',
    filter_topic: 'Topic',
    filter_sort: 'Sắp xếp',
    all: 'Tất cả',
    '7days': '7 ngày',
    '30days': '30 ngày',
    '3months': '3 tháng',
    '1year': '1 năm',
    ai_ml: 'AI / ML',
    web: 'Web',
    mobile: 'Mobile',
    devops: 'DevOps',
    database: 'Database',
    game: 'Game',
    cli: 'CLI',
    framework: 'Framework',
    stars: '⭐ Stars',
    forks: '🍴 Forks',
    newest: '🕐 Mới nhất',
    compare: '📈 Compare',
    csv: '⬇ CSV',
    refresh: '🔄 Làm mới',
    total_stars: 'Tổng Stars',
    total_forks: 'Tổng Forks',
    repo_count: 'Số Repo',
    current_filter: 'Kết quả lọc hiện tại',
    top_lang: 'Ngôn ngữ top',
    most_common: 'Chiếm nhiều nhất',
    trending_repos: 'Xu hướng Repo',
    bubble_hint: 'Kích thước = Stars • Màu = Ngôn ngữ • Kéo để xoay',
    repo_list: 'Danh sách Repo',
    compare_title: 'So sánh khoảng thời gian',
    compare_sub: 'Stars theo ngày cho 7d / 30d / 90d',
    close: '✕ Đóng',
    lang_distribution: 'Phân bố ngôn ngữ',
    loading: 'Đang tải dữ liệu…',
    footer: '© 2026 GitHub Trends Dashboard - hoana2007',
    footer_tech: 'Powered by Three.js & D3.js & GitHub API',
    results: 'kết quả',
    no_repos: 'Không có repo nào.',
    no_data: 'Không có dữ liệu để so sánh',
    repos: 'repos',
    rate_limit: 'Vượt giới hạn API (10 req/phút). Đang dùng cache nếu có.',
    api_error: 'Lỗi API',
    rate_limit_days: 'Rate limit cho',
    export_empty: 'Không có dữ liệu để xuất.',
    theme_toggle: 'Đổi chế độ sáng/tối',
    lang_toggle: 'Switch language',
  },
  en: {
    logo: 'GitHub<span class="logo-accent">Trends</span>',
    search: 'Search repos...',
    filter_language: 'Language',
    filter_period: 'Period',
    filter_topic: 'Topic',
    filter_sort: 'Sort by',
    all: 'All',
    '7days': '7 days',
    '30days': '30 days',
    '3months': '3 months',
    '1year': '1 year',
    ai_ml: 'AI / ML',
    web: 'Web',
    mobile: 'Mobile',
    devops: 'DevOps',
    database: 'Database',
    game: 'Game',
    cli: 'CLI',
    framework: 'Framework',
    stars: '⭐ Stars',
    forks: '🍴 Forks',
    newest: '🕐 Newest',
    compare: '📈 Compare',
    csv: '⬇ CSV',
    refresh: '🔄 Refresh',
    total_stars: 'Total Stars',
    total_forks: 'Total Forks',
    repo_count: 'Repo Count',
    current_filter: 'Current filtered results',
    top_lang: 'Top Language',
    most_common: 'Most common',
    trending_repos: 'Trending Repos',
    bubble_hint: 'Size = Stars • Color = Language • Drag to rotate',
    repo_list: 'Repo List',
    compare_title: 'Compare Periods',
    compare_sub: 'Daily stars for 7d / 30d / 90d',
    close: '✕ Close',
    lang_distribution: 'Language Distribution',
    loading: 'Loading data...',
    footer: '© 2026 GitHub Trends Dashboard - hoana2007',
    footer_tech: 'Powered by Three.js & D3.js & GitHub API',
    results: 'results',
    no_repos: 'No repositories found.',
    no_data: 'No data to compare',
    repos: 'repos',
    rate_limit: 'API rate limit exceeded (10 req/min). Using cache if available.',
    api_error: 'API Error',
    rate_limit_days: 'Rate limit for',
    export_empty: 'No data to export.',
    theme_toggle: 'Toggle light/dark mode',
    lang_toggle: 'Chuyển ngôn ngữ',
  },
};

let currentLang = localStorage.getItem("ght_lang") || "vi";

function t(key) {
  return I18N[currentLang][key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.innerHTML = t(key);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    const key = el.getAttribute("data-i18n-ph");
    el.placeholder = t(key);
  });
  document.documentElement.lang = currentLang;
}

function toggleLanguage() {
  currentLang = currentLang === "vi" ? "en" : "vi";
  localStorage.setItem("ght_lang", currentLang);
  applyTranslations();
  document.getElementById("btn-lang").textContent = currentLang === "vi" ? "VN" : "EN";
  if (state.repos.length) {
    renderAll();
  }
}

/* ================= STATE ================= */
const state = {
  repos: [],
  loading: false,
  searchTerm: "",
  compareVisible: false,
  compareData: {},
  compareHidden: new Set(),
};

/* ================= DOM ================= */
const $ = (id) => document.getElementById(id);
const els = {
  language: $("filter-language"),
  period: $("filter-period"),
  topic: $("filter-topic"),
  sort: $("filter-sort"),
  search: $("search-input"),
  refresh: $("btn-refresh"),
  exportBtn: $("btn-export"),
  compareBtn: $("btn-compare"),
  compareCard: $("compare-card"),
  closeCompare: $("btn-close-compare"),
  canvas: $("bubble-canvas"),
  list: $("repo-items"),
  count: $("repo-count"),
  loading: $("loading"),
  error: $("error"),
  legend: $("legend"),
  themeBtn: $("btn-theme"),
  themeIcon: $("theme-icon"),
  langBtn: $("btn-lang"),
  statStars: $("stat-stars"),
  statForks: $("stat-forks"),
  statCount: $("stat-count"),
  statLang: $("stat-lang"),
  sparkStars: $("spark-stars"),
  sparkForks: $("spark-forks"),
  sparkCount: $("spark-count"),
  sparkLang: $("spark-lang"),
  donut: $("donut-chart"),
  line: $("line-chart"),
  lineLegend: $("line-legend"),
};

/* =========================================================
   THEME
   ========================================================= */
function initTheme() {
  const saved = localStorage.getItem("ght_theme") || "light";
  setTheme(saved);
  els.themeBtn.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(cur === "dark" ? "light" : "dark");
  });
}

function setTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode);
  els.themeIcon.textContent = mode === "dark" ? "☀️" : "🌙";
  localStorage.setItem("ght_theme", mode);
  if (state.repos.length) {
    renderBubbles();
    renderDonut();
    if (state.compareVisible) renderLineChart();
  }
}

/* =========================================================
   CACHE
   ========================================================= */
function getCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { t, data } = JSON.parse(raw);
    if (Date.now() - t > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), data }));
  } catch (e) {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  }
}

/* =========================================================
   FETCH
   ========================================================= */
async function fetchTrends(force = false) {
  setLoading(true);
  clearError();

  const lang = els.language.value;
  const days = parseInt(els.period.value);
  const sort = els.sort.value;

  const cacheKey = `trend_${lang}_${days}_${sort}`;
  if (!force) {
    const cached = getCache(cacheKey);
    if (cached) {
      state.repos = cached;
      renderAll();
      setLoading(false);
      return;
    }
  }

  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  let q = `created:>${since}`;
  if (lang) q += ` language:${lang}`;

  const sortParam = sort === "forks" ? "forks" : sort === "updated" ? "updated" : "stars";
  const url = `${API}?q=${encodeURIComponent(q)}&sort=${sortParam}&order=desc&per_page=60`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) {
      if (res.status === 403 || res.status === 429)
        throw new Error(t("rate_limit"));
      throw new Error(`${t("api_error")}: ${res.status}`);
    }
    const data = await res.json();
    state.repos = data.items || [];
    setCache(cacheKey, state.repos);
    renderAll();
  } catch (err) {
    const stale = localStorage.getItem(CACHE_PREFIX + cacheKey);
    if (stale) {
      state.repos = JSON.parse(stale).data;
      renderAll();
    }
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

/* =========================================================
   RENDER ALL
   ========================================================= */
function renderAll() {
  const filtered = applyLocalFilters(state.repos);
  renderStats(filtered);
  renderBubbles(filtered);
  renderList(filtered);
  renderDonut(filtered);
  els.count.textContent = `${filtered.length} ${t("results")}`;
}

function applyLocalFilters(repos) {
  let out = repos;
  const topic = els.topic.value;
  const term = state.searchTerm.trim().toLowerCase();

  if (topic) {
    const kws = TOPIC_KEYWORDS[topic] || [];
    out = out.filter((r) => {
      const hay = (
        (r.name || "") + " " + (r.description || "") + " " +
        (r.topics || []).join(" ")
      ).toLowerCase();
      return kws.some((k) => hay.includes(k));
    });
  }

  if (term) {
    out = out.filter((r) =>
      ((r.full_name || "") + " " + (r.description || "")).toLowerCase().includes(term)
    );
  }

  return out;
}

/* =========================================================
   STATS + SPARKLINES
   ========================================================= */
function renderStats(repos) {
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);

  const langCount = {};
  repos.forEach((r) => {
    const l = r.language || "Other";
    langCount[l] = (langCount[l] || 0) + 1;
  });
  const topLang = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0] || ["—"];

  els.statStars.textContent = formatNumber(totalStars);
  els.statForks.textContent = formatNumber(totalForks);
  els.statCount.textContent = repos.length;
  els.statLang.textContent = topLang[0];

  const top = repos.slice(0, 10).map((r) => r.stargazers_count);
  drawSparkline(els.sparkStars, top, "#6366f1");
  drawSparkline(els.sparkForks, repos.slice(0, 10).map((r) => r.forks_count), "#06b6d4");
  drawSparkline(els.sparkCount, repos.slice(0, 10).map((_, i) => i + 1), "#f59e0b");
  drawSparkline(els.sparkLang, [topLang[1], 10, 20, 15, 25, 30, 28], "#10b981");
}

function drawSparkline(svgEl, values, color) {
  const svg = d3.select(svgEl);
  svg.selectAll("*").remove();
  if (!values.length) return;

  const w = 90, h = 36;
  svg.attr("viewBox", `0 0 ${w} ${h}`);

  const x = d3.scaleLinear().domain([0, values.length - 1]).range([2, w - 2]);
  const y = d3.scaleLinear().domain([0, d3.max(values) || 1]).range([h - 3, 3]);

  const line = d3.line()
    .x((_, i) => x(i))
    .y((d) => y(d))
    .curve(d3.curveMonotoneX);

  const path = svg.append("path")
    .datum(values)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 2)
    .attr("stroke-linecap", "round")
    .attr("d", line);

  const len = path.node().getTotalLength();
  path
    .attr("stroke-dasharray", `${len} ${len}`)
    .attr("stroke-dashoffset", len)
    .transition().duration(900).ease(d3.easeCubicOut)
    .attr("stroke-dashoffset", 0);
}

/* =========================================================
   THREE.JS 3D BUBBLE CHART
   ========================================================= */
let scene, camera, renderer, raycaster;
let bubbleGroup;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let autoRotate = true;

function initThreeJS() {
  const container = els.canvas.parentElement;
  const width = container.clientWidth;
  const height = container.clientHeight;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(0, 0, 50);

  renderer = new THREE.WebGLRenderer({
    canvas: els.canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xffffff, 0.5);
  pointLight.position.set(-10, -10, 10);
  scene.add(pointLight);

  bubbleGroup = new THREE.Group();
  scene.add(bubbleGroup);

  raycaster = new THREE.Raycaster();

  els.canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    autoRotate = false;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  els.canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      bubbleGroup.rotation.y += deltaX * 0.005;
      bubbleGroup.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    const rect = els.canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(bubbleGroup.children);

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (obj.userData && obj.userData.repoData) {
        const d = obj.userData.repoData;
        showTooltip(e, {
          fullName: d.fullName,
          desc: d.description || "",
          stars: d.stars,
          forks: d.forks,
          lang: d.language,
        });
      }
    } else {
      hideTooltip();
    }
  });

  els.canvas.addEventListener('mouseup', () => {
    isDragging = false;
    setTimeout(() => { autoRotate = true; }, 3000);
  });

  els.canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    hideTooltip();
  });

  els.canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z += e.deltaY * 0.05;
    camera.position.z = Math.max(20, Math.min(100, camera.position.z));
  }, { passive: false });

  els.canvas.addEventListener('click', (e) => {
    const rect = els.canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(bubbleGroup.children);

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (obj.userData && obj.userData.repoData) {
        window.open(obj.userData.repoData.url, "_blank");
      }
    }
  });

  function animate() {
    requestAnimationFrame(animate);

    if (autoRotate && !isDragging) {
      bubbleGroup.rotation.y += 0.002;
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
}

function renderBubbles(repos = state.repos) {
  if (!scene) return;

  while (bubbleGroup.children.length > 0) {
    const child = bubbleGroup.children[0];
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (child.material.map) child.material.map.dispose();
      child.material.dispose();
    }
    bubbleGroup.remove(child);
  }

  if (!repos.length) return;

  const data = repos.slice(0, 30).map((r) => ({
    name: r.name,
    fullName: r.full_name,
    stars: r.stargazers_count,
    forks: r.forks_count,
    lang: r.language || "Other",
    url: r.html_url,
    description: r.description || "",
  }));

  data.forEach((d, i) => {
    const color = LANG_COLORS[d.lang] || LANG_COLORS.default;
    const size = Math.max(1.5, Math.min(6, Math.sqrt(d.stars) / 500));

    const geometry = new THREE.SphereGeometry(size, 32, 32);

    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.85,
      shininess: 100,
    });

    const sphere = new THREE.Mesh(geometry, material);

    const phi = Math.acos(-1 + (2 * i) / data.length);
    const theta = Math.sqrt(data.length * Math.PI) * phi;
    const radius = 15 + Math.random() * 5;

    sphere.position.x = radius * Math.cos(theta) * Math.sin(phi);
    sphere.position.y = radius * Math.sin(theta) * Math.sin(phi);
    sphere.position.z = radius * Math.cos(phi);

    sphere.userData = { repoData: d, originalScale: 1 };

    bubbleGroup.add(sphere);

    if (size > 3) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;

      context.fillStyle = document.documentElement.getAttribute("data-theme") === "dark"
        ? "rgba(30, 41, 59, 0.9)"
        : "rgba(255, 255, 255, 0.9)";
      context.beginPath();
      context.roundRect(0, 0, 256, 64, 12);
      context.fill();

      context.fillStyle = document.documentElement.getAttribute("data-theme") === "dark"
        ? "#f1f5f9"
        : "#1e293b";
      context.font = 'bold 24px Inter, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      const label = d.name.length > 15 ? d.name.slice(0, 12) + "..." : d.name;
      context.fillText(label, 128, 32);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(8, 2, 1);
      sprite.position.copy(sphere.position);
      sprite.position.y += size + 1.5;
      bubbleGroup.add(sprite);
    }
  });

  bubbleGroup.position.set(0, 0, 0);

  const langs = [...new Set(data.map((d) => d.lang))].slice(0, 8);
  els.legend.innerHTML = langs.map((l) => `
    <span class="legend-item">
      <span class="legend-dot" style="background:${LANG_COLORS[l] || LANG_COLORS.default}"></span>
      ${l}
    </span>`).join("");
}

/* =========================================================
   DONUT CHART (D3)
   ========================================================= */
function renderDonut(repos = state.repos) {
  const svg = d3.select("#donut-chart");
  svg.selectAll("*").remove();
  const box = els.donut.parentElement;
  const size = Math.min(box.clientWidth, 240);
  if (!size || !repos.length) return;

  svg.attr("viewBox", `0 0 ${size} ${size}`).attr("preserveAspectRatio", "xMidYMid meet");

  const langCount = {};
  repos.forEach((r) => {
    const l = r.language || "Other";
    langCount[l] = (langCount[l] || 0) + 1;
  });
  const data = Object.entries(langCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const g = svg.append("g").attr("transform", `translate(${size / 2},${size / 2})`);
  const radius = size / 2 - 8;
  const innerR = radius * 0.62;

  const color = d3.scaleOrdinal()
    .domain(data.map((d) => d.name))
    .range(data.map((d) => LANG_COLORS[d.name] || LANG_COLORS.default));

  const pie = d3.pie().value((d) => d.value).sort(null);
  const arc = d3.arc().innerRadius(innerR).outerRadius(radius);
  const arcHover = d3.arc().innerRadius(innerR).outerRadius(radius + 5);

  const total = d3.sum(data, (d) => d.value);
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

  g.selectAll("path")
    .data(pie(data))
    .join("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.name))
    .attr("stroke", isDark ? "#1e293b" : "#fff")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .on("mouseenter", function (e, d) {
      d3.select(this).transition().duration(150).attr("d", arcHover);
      showTooltip(e, { fullName: d.data.name, desc: `${d.data.value} ${t("repos")} • ${((d.data.value / total) * 100).toFixed(1)}%`, stars: 0, forks: 0, lang: d.data.name });
    })
    .on("mousemove", moveTooltip)
    .on("mouseleave", function () {
      d3.select(this).transition().duration(150).attr("d", arc);
      hideTooltip();
    })
    .transition().duration(700)
    .attrTween("d", function (d) {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return (t) => arc(i(t));
    });

  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "-0.1em")
    .style("font-family", "Poppins, sans-serif")
    .style("font-size", size * 0.14 + "px")
    .style("font-weight", 800)
    .style("fill", "var(--text)")
    .text(repos.length);

  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "1.2em")
    .style("font-family", "Inter, sans-serif")
    .style("font-size", size * 0.055 + "px")
    .style("fill", "var(--text-muted)")
    .text(t("repos"));
}

/* =========================================================
   REPO LIST
   ========================================================= */
function renderList(repos = state.repos) {
  if (!repos.length) {
    els.list.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;padding:20px;text-align:center">${t("no_repos")}</p>`;
    return;
  }

  els.list.innerHTML = repos.map((r) => {
    const color = LANG_COLORS[r.language] || LANG_COLORS.default;
    return `
      <div class="repo-card" style="--accent:${color}" data-url="${r.html_url}">
        <div class="name">${escapeHtml(r.full_name)}</div>
        <div class="desc">${escapeHtml(r.description || "Không có mô tả")}</div>
        <div class="meta">
          <span><span class="lang-dot"></span>${r.language || "N/A"}</span>
          <span>⭐ ${formatNumber(r.stargazers_count)}</span>
          <span>🍴 ${formatNumber(r.forks_count)}</span>
        </div>
      </div>`;
  }).join("");

  els.list.querySelectorAll(".repo-card").forEach((el) => {
    el.addEventListener("click", () => window.open(el.dataset.url, "_blank"));
  });
}

/* =========================================================
   LINE CHART — Compare periods (D3)
   ========================================================= */
async function toggleCompare() {
  state.compareVisible = !state.compareVisible;
  els.compareCard.hidden = !state.compareVisible;

  if (state.compareVisible) {
    await loadCompareData();
    renderLineChart();
  }
}

async function loadCompareData() {
  const lang = els.language.value;
  for (const days of PERIODS) {
    if (state.compareData[days]) continue;

    const cacheKey = `compare_${lang}_${days}`;
    const cached = getCache(cacheKey);
    if (cached) {
      state.compareData[days] = cached;
      continue;
    }

    const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    let q = `created:>${since}`;
    if (lang) q += ` language:${lang}`;
    const url = `${API}?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=100`;

    try {
      const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
      if (!res.ok) throw new Error(`${t("rate_limit_days")} ${days} ${t("days")}`);
      const data = await res.json();

      const byDate = {};
      (data.items || []).forEach((r) => {
        const d = r.created_at.slice(0, 10);
        byDate[d] = (byDate[d] || 0) + r.stargazers_count;
      });
      const arr = Object.entries(byDate)
        .map(([date, stars]) => ({ date, stars }))
        .sort((a, b) => a.date.localeCompare(b.date));

      state.compareData[days] = arr;
      setCache(cacheKey, arr);
    } catch (e) {
      console.warn("Compare fetch failed:", e);
      state.compareData[days] = [];
    }
  }
}

function renderLineChart() {
  const svg = d3.select("#line-chart");
  svg.selectAll("*").remove();

  const wrap = els.line.parentElement;
  const width = wrap.clientWidth - 24;
  const height = wrap.clientHeight - 20;
  if (!width || !height) return;

  svg.attr("viewBox", `0 0 ${width} ${height}`);

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const axisColor = isDark ? "#475569" : "#e2e8f0";
  const textColor = isDark ? "#cbd5e1" : "#64748b";

  const margin = { top: 16, right: 20, bottom: 30, left: 50 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const allDates = new Set();
  PERIODS.forEach((p) => (state.compareData[p] || []).forEach((d) => allDates.add(d.date)));
  const sortedDates = [...allDates].sort();

  if (!sortedDates.length) {
    g.append("text")
      .attr("x", innerW / 2).attr("y", innerH / 2)
      .attr("text-anchor", "middle")
      .style("fill", textColor).style("font-size", "13px")
      .text(t("no_data"));
    return;
  }

  const x = d3.scalePoint()
    .domain(sortedDates)
    .range([0, innerW])
    .padding(0.5);

  const allStars = PERIODS.flatMap((p) => (state.compareData[p] || []).map((d) => d.stars));
  const y = d3.scaleLinear()
    .domain([0, d3.max(allStars) || 10])
    .nice()
    .range([innerH, 0]);

  g.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat(""))
    .selectAll("line")
    .attr("stroke", axisColor)
    .attr("stroke-dasharray", "3 3");

  g.selectAll(".grid .domain").remove();

  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickValues(sortedDates.filter((_, i) => i % Math.ceil(sortedDates.length / 8) === 0)))
    .selectAll("text")
    .style("fill", textColor)
    .style("font-size", "10px")
    .attr("transform", "rotate(-30)")
    .attr("text-anchor", "end");

  g.append("g")
    .call(d3.axisLeft(y).ticks(5).tickFormat((d) => formatNumber(d)))
    .selectAll("text")
    .style("fill", textColor)
    .style("font-size", "10px");

  g.selectAll(".domain").attr("stroke", axisColor);
  g.selectAll(".tick line").attr("stroke", axisColor);

  const line = d3.line()
    .x((d) => x(d.date))
    .y((d) => y(d.stars))
    .curve(d3.curveMonotoneX);

  const area = d3.area()
    .x((d) => x(d.date))
    .y0(innerH)
    .y1((d) => y(d.stars))
    .curve(d3.curveMonotoneX);

  PERIODS.forEach((p) => {
    const data = state.compareData[p] || [];
    if (!data.length) return;
    if (state.compareHidden.has(p)) return;

    const color = PERIOD_COLORS[p];

    g.append("path")
      .datum(data)
      .attr("fill", color)
      .attr("opacity", 0.08)
      .attr("d", area);

    const path = g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2.5)
      .attr("stroke-linecap", "round")
      .attr("d", line);

    const len = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", `${len} ${len}`)
      .attr("stroke-dashoffset", len)
      .transition().duration(900).ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);

    g.selectAll(`.dot-${p}`)
      .data(data)
      .join("circle")
      .attr("class", `dot-${p}`)
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.stars))
      .attr("r", 3)
      .attr("fill", color)
      .attr("opacity", 0)
      .on("mouseenter", function (e, d) {
        d3.select(this).attr("r", 5);
        showTooltip(e, { fullName: `${days_label(p)} — ${d.date}`, desc: `${formatNumber(d.stars)} ${t("stars")}`, stars: d.stars, forks: 0, lang: "" });
      })
      .on("mousemove", moveTooltip)
      .on("mouseleave", function () {
        d3.select(this).attr("r", 3);
        hideTooltip();
      })
      .transition().delay(700).duration(300)
      .attr("opacity", 1);
  });

  els.lineLegend.innerHTML = PERIODS.map((p) => `
    <span class="line-legend-item ${state.compareHidden.has(p) ? "off" : ""}" data-period="${p}">
      <span class="legend-dot" style="background:${PERIOD_COLORS[p]}"></span>
      ${days_label(p)}
    </span>
  `).join("");

  els.lineLegend.querySelectorAll(".line-legend-item").forEach((el) => {
    el.addEventListener("click", () => {
      const p = parseInt(el.dataset.period);
      if (state.compareHidden.has(p)) state.compareHidden.delete(p);
      else state.compareHidden.add(p);
      renderLineChart();
    });
  });
}

function days_label(d) {
  if (currentLang === "vi") {
    return d === 7 ? "7 ngày" : d === 30 ? "30 ngày" : d === 90 ? "90 ngày" : d + " ngày";
  }
  return d === 7 ? "7 days" : d === 30 ? "30 days" : d === 90 ? "90 days" : d + " days";
}

/* =========================================================
   CSV EXPORT
   ========================================================= */
function exportCSV() {
  const repos = applyLocalFilters(state.repos);
  if (!repos.length) {
    alert(t("export_empty"));
    return;
  }

  const headers = ["full_name", "language", "stars", "forks", "watchers", "issues", "created_at", "updated_at", "topics", "url", "description"];
  const rows = repos.map((r) => [
    r.full_name,
    r.language || "",
    r.stargazers_count,
    r.forks_count,
    r.watchers_count,
    r.open_issues_count,
    r.created_at,
    r.updated_at,
    (r.topics || []).join("|"),
    r.html_url,
    (r.description || "").replace(/"/g, '""'),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const ts = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `github-trends_${ts}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* =========================================================
   TOOLTIP
   ========================================================= */
let tooltipEl = null;
function ensureTooltip() {
  if (!tooltipEl) tooltipEl = document.getElementById("tooltip");
  return tooltipEl;
}
function showTooltip(e, d) {
  const t = ensureTooltip();
  const stars = d.stars ? `⭐ ${formatNumber(d.stars)} • ` : "";
  const forks = d.forks ? `🍴 ${formatNumber(d.forks)} • ` : "";
  t.innerHTML = `
    <b>${escapeHtml(d.fullName || "")}</b><br/>
    ${d.desc ? escapeHtml(d.desc.slice(0, 120)) + "<br/>" : ""}
    ${stars}${forks}${d.lang || ""}
  `;
  t.classList.add("show");
  moveTooltip(e);
}
function moveTooltip(e) {
  const t = ensureTooltip();
  const pad = 14;
  let x = e.clientX + pad;
  let y = e.clientY + pad;
  const rect = t.getBoundingClientRect();
  if (x + rect.width > window.innerWidth) x = e.clientX - rect.width - pad;
  if (y + rect.height > window.innerHeight) y = e.clientY - rect.height - pad;
  t.style.left = x + "px";
  t.style.top = y + "px";
}
function hideTooltip() {
  const t = ensureTooltip();
  t.classList.remove("show");
}

/* =========================================================
   HELPERS
   ========================================================= */
function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );
}
function setLoading(v) {
  state.loading = v;
  els.loading.classList.toggle("show", v);
}
function showError(msg) {
  els.error.textContent = "⚠️ " + msg;
  els.error.classList.add("show");
  setTimeout(clearError, 4000);
}
function clearError() {
  els.error.classList.remove("show");
}

/* =========================================================
   EVENTS
   ========================================================= */
els.language.addEventListener("change", () => {
  state.compareData = {};
  fetchTrends();
});
els.period.addEventListener("change", () => fetchTrends());
els.sort.addEventListener("change", () => fetchTrends());
els.topic.addEventListener("change", renderAll);
els.search.addEventListener("input", (e) => {
  state.searchTerm = e.target.value;
  renderAll();
});
els.refresh.addEventListener("click", () => fetchTrends(true));
els.exportBtn.addEventListener("click", exportCSV);
els.compareBtn.addEventListener("click", toggleCompare);
els.closeCompare.addEventListener("click", toggleCompare);
els.langBtn.addEventListener("click", toggleLanguage);

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    renderBubbles();
    renderDonut();
    if (state.compareVisible) renderLineChart();
  }, 200);
});

/* =========================================================
   INIT
   ========================================================= */
initTheme();
applyTranslations();
els.langBtn.textContent = currentLang === "vi" ? "🇻🇳" : "EN";
initThreeJS();
fetchTrends();
