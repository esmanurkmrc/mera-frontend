import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  MapPinned,
  BarChart3,
  LogOut,
  Wifi,
  Video,
  AlertTriangle,
  Activity,
  Bell,
  Radio,
  ShieldCheck,
  Cpu,
  Lightbulb,
} from "lucide-react";
import { GiCow } from "react-icons/gi";
import "../CSS/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [konumlar, setKonumlar] = useState([]);
  const [sensorData, setSensorData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("loading");

  const KONUM_API = "http://localhost:8080/api/konum";
  const SENSOR_API = "http://localhost:8080/api/sensor/latest";

  const hayvanlar = [
    { markerId: 1, hayvanAdi: "İnek 101" },
    { markerId: 2, hayvanAdi: "İnek 102" },
    { markerId: 3, hayvanAdi: "İnek 103" },
    { markerId: 4, hayvanAdi: "İnek 104" },
    { markerId: 5, hayvanAdi: "İnek 105" },
    { markerId: 6, hayvanAdi: "İnek 106" },
  ];

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { title: "Sensör Verileri", icon: Activity, path: "/sensor-verileri" },
    { title: "Canlı Kamera", icon: Camera, path: "/canli-kamera" },
    { title: "Mera Haritası", icon: MapPinned, path: "/mera-haritasi" },
    { title: "Hayvan Takibi", icon: GiCow, path: "/hayvan-takibi" },
    // { title: "Analizler", icon: BarChart3, path: "/analizler" },
  ];

  useEffect(() => {
    veriGetir();
    const interval = setInterval(veriGetir, 2500);
    return () => clearInterval(interval);
  }, []);

  const veriGetir = async () => {
    try {
      const [konumRes, sensorRes] = await Promise.all([
        fetch(KONUM_API),
        fetch(SENSOR_API).catch(() => null),
      ]);

      const konumData = await konumRes.json();
      const liste = Array.isArray(konumData) ? konumData : konumData ? [konumData] : [];

      const sirali = liste.sort(
        (a, b) => new Date(b.zaman) - new Date(a.zaman)
      );

      setKonumlar(sirali);

      if (sensorRes && sensorRes.ok) {
        const sensorJson = await sensorRes.json();
        setSensorData(sensorJson);
      }

      setConnectionStatus("online");
    } catch (error) {
      console.error("Veri alınamadı:", error);
      setConnectionStatus("offline");
    }
  };

  const son5Kayit = konumlar.slice(0, 5);
  const son10Kayit = konumlar.slice(0, 10).reverse();
  const sonKayit = konumlar[0];

  const sonKonumMap = useMemo(() => {
    const map = {};
    konumlar.forEach((item) => {
      if (!map[item.markerId]) {
        map[item.markerId] = item;
      }
    });
    return map;
  }, [konumlar]);

  const aktifHayvanSayisi = Object.keys(sonKonumMap).length;

  const bolgeSay = (bolge) => {
    return son5Kayit.filter((item) => item.bolge === bolge).length;
  };

  const kameraBolgeA = bolgeSay("Bolge A");
  const kameraBolgeB = bolgeSay("Bolge B");
  const kameraBolgeC = bolgeSay("Bolge C");

  const espBolgeA = sensorData?.bolgeA || false;
  const espBolgeB = sensorData?.bolgeB || false;
  const espBolgeC = sensorData?.bolgeC || false;
  const espHareket = sensorData?.hareket || false;

  const hayvanVar = espBolgeA || espBolgeB || espBolgeC;
  const kameraHayvanVar = aktifHayvanSayisi > 0;
  const sistemUyumu = kameraHayvanVar === hayvanVar;

  const kirmiziLedAktif = !hayvanVar;
  const yesilLedAktif = hayvanVar;
  const buzzerAktif = !hayvanVar;

  const kayipHayvanlar = hayvanlar.filter((hayvan) => {
    const son = sonKonumMap[hayvan.markerId];
    if (!son?.zaman) return true;

    const farkSaniye = (new Date() - new Date(son.zaman)) / 1000;
    return farkSaniye > 10;
  });

  const formatDate = (date) => {
    if (!date) return "Veri bekleniyor";
    return new Date(date).toLocaleString("tr-TR");
  };

  const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const enYogunBolge = () => {
    const bolgeler = [
      { ad: "Bölge A", sayi: kameraBolgeA },
      { ad: "Bölge B", sayi: kameraBolgeB },
      { ad: "Bölge C", sayi: kameraBolgeC },
    ];

    const sirali = bolgeler.sort((a, b) => b.sayi - a.sayi);
    return sirali[0].sayi > 0 ? sirali[0].ad : "Veri yok";
  };

  const getZoneStatus = (count) => {
    if (count >= 3) return "YOĞUN";
    if (count >= 1) return "DOLU";
    return "BOŞ";
  };

  const handleLogout = () => {
    localStorage.removeItem("kullaniciAdi");
    navigate("/login");
  };

  const ZoneCard = ({ title, count }) => {
    let density = "empty-zone";
    if (count >= 3) density = "danger-zone";
    else if (count >= 1) density = "active-zone";

    return (
      <div className={`zone-card ${density}`}>
        <div className="zone-top">
          <span>{title}</span>
          <GiCow size={25} />
        </div>
        <h3>{getZoneStatus(count)}</h3>
        <p>{count} algılama / son 5 kamera kaydı</p>
      </div>
    );
  };

  const EspCard = ({ title, active }) => (
    <div className={`esp-card ${active ? "active" : ""}`}>
      <span>{title}</span>
      <strong>{active ? "DOLU" : "BOŞ"}</strong>
    </div>
  );

  const MovementChart = () => {
    if (son10Kayit.length === 0) {
      return (
        <div className="empty-chart">
          <Activity size={34} />
          <p>Canlı grafik için veri bekleniyor.</p>
        </div>
      );
    }

    return (
      <div className="live-chart">
        {son10Kayit.map((item, index) => (
          <div className="chart-column" key={item.id || index}>
            <div className="chart-bar-wrapper">
              <div
                className="chart-bar"
                style={{ height: `${(index + 1) * 10}%` }}
              ></div>
            </div>
            <span>{formatTime(item.zaman)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <GiCow size={25} />
          </div>
          <div>
            <h2>Mera Takip</h2>
            <span>IoT Hayvan İzleme</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`sidebar-item ${isActive ? "active" : ""}`}
              >
                <Icon size={20} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Çıkış Yap</span>
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="page-label">Canlı Kontrol Paneli</p>
            <h1>Akıllı Mera Takip Sistemi</h1>
            <span>
              ArUco kamera takibi ve ESP32 sensör verileri birlikte izlenir.
            </span>
          </div>

          <div className="header-status">
            <div className={`status-pill ${connectionStatus === "online" ? "online" : "offline"}`}>
              <Wifi size={17} />
              {connectionStatus === "online" ? "Backend Bağlı" : "Bağlantı Yok"}
            </div>

            <div className="status-pill camera">
              <Video size={17} />
              Sistem Canlı
            </div>
          </div>
        </header>

        <section className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon green">
              <GiCow size={24} />
            </div>
            <p>Aktif Hayvan</p>
            <h3>{aktifHayvanSayisi}</h3>
            <span>Kamera ile algılanan hayvan</span>
          </div>

          <div className="summary-card">
            <div className="summary-icon blue">
              <Activity size={24} />
            </div>
            <p>PIR Hareket</p>
            <h3>{espHareket ? "Hareket Var" : "Hareket Yok"}</h3>
            <span>ESP32 hareket sensörü</span>
          </div>

          <div className="summary-card">
            <div className="summary-icon orange">
              <Radio size={24} />
            </div>
            <p>En Yoğun Bölge</p>
            <h3>{enYogunBolge()}</h3>
            <span>Son kamera kayıtlarına göre</span>
          </div>

          <div className="summary-card">
            <div className="summary-icon red">
              <AlertTriangle size={24} />
            </div>
            <p>Uyarı</p>
            <h3>{kayipHayvanlar.length}</h3>
            <span>Takip dışı kalan hayvan</span>
          </div>
        </section>

        <section className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon green">
              <Lightbulb size={24} />
            </div>
            <p>Yeşil LED</p>
            <h3>{yesilLedAktif ? "Aktif" : "Pasif"}</h3>
            <span>Hayvan algılandığında yanar</span>
          </div>

          <div className="summary-card">
            <div className="summary-icon red">
              <Lightbulb size={24} />
            </div>
            <p>Kırmızı LED</p>
            <h3>{kirmiziLedAktif ? "Aktif" : "Pasif"}</h3>
            <span>Hayvan algılanmadığında yanar</span>
          </div>

          <div className="summary-card">
            <div className="summary-icon red">
              <Bell size={24} />
            </div>
            <p>Buzzer</p>
            <h3>{buzzerAktif ? "Aktif" : "Pasif"}</h3>
            <span>Hayvan algılanmadığında çalışır</span>
          </div>

          <div className="summary-card">
            <div className={`summary-icon ${sistemUyumu ? "green" : "red"}`}>
              {sistemUyumu ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
            </div>
            <p>Sistem Uyumu</p>
            <h3>{sistemUyumu ? "Uyumlu" : "Kontrol Et"}</h3>
            <span>Kamera ve ESP32 karşılaştırması</span>
          </div>
        </section>

        <section className="alert-grid">
          <div className={`mini-alert ${hayvanVar ? "danger" : "safe"}`}>
            <div className="mini-alert-icon">
              {hayvanVar ? <Bell size={23} /> : <ShieldCheck size={23} />}
            </div>
            <div>
              <h3>{hayvanVar ? "Fiziksel Varlık Algılandı" : "Mera Alanı Sakin"}</h3>
              <p>
                {hayvanVar
                  ? "ESP32 mesafe sensörleri bölgede hayvan/cisim algıladı."
                  : "Mesafe sensörlerine göre aktif doluluk bulunmuyor."}
              </p>
            </div>
          </div>

          <div className={`mini-alert ${espHareket ? "motion" : "neutral"}`}>
            <div className="mini-alert-icon">
              <Activity size={23} />
            </div>
            <div>
              <h3>{espHareket ? "Hareket Algılandı" : "Hareket Yok"}</h3>
              <p>PIR sensöründen gelen son hareket durumu.</p>
            </div>
          </div>

          <div className={`mini-alert ${sistemUyumu ? "safe" : "warning"}`}>
            <div className="mini-alert-icon">
              {sistemUyumu ? <ShieldCheck size={23} /> : <AlertTriangle size={23} />}
            </div>
            <div>
              <h3>{sistemUyumu ? "Kamera ve ESP32 Uyumlu" : "Veri Uyumsuzluğu"}</h3>
              <p>
                {sistemUyumu
                  ? "Kamera takibi ve ESP32 sensör verileri birbiriyle uyumlu görünüyor."
                  : "Kamera ve ESP32 sensör verileri farklı sonuç veriyor. Marker görünürlüğü veya sensör açısı kontrol edilebilir."}
              </p>
            </div>
          </div>

          {kayipHayvanlar.length > 0 && (
            <div className="mini-alert warning">
              <div className="mini-alert-icon">
                <AlertTriangle size={23} />
              </div>
              <div>
                <h3>Takip Uyarısı</h3>
                <p>
                  {kayipHayvanlar.length} hayvan son 10 saniyedir kamera sisteminde görünmüyor.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="content-grid">
          <div className="panel large-panel">
            <div className="panel-header">
              <div>
                <h2>Kamera Bölge Analizi</h2>
                <p>ArUco marker ile son kamera kayıtlarına göre bölge yoğunluğu</p>
              </div>
              <span className="live-badge">ArUco</span>
            </div>

            <div className="pasture-map">
              <ZoneCard title="Bölge A" count={kameraBolgeA} />
              <ZoneCard title="Bölge B" count={kameraBolgeB} />
              <ZoneCard title="Bölge C" count={kameraBolgeC} />
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Canlı Hareket Grafiği</h2>
                <p>Son 10 kamera kaydına göre hareket akışı</p>
              </div>
            </div>

            <MovementChart />
          </div>

          <div className="panel large-panel esp-panel">
            <div className="panel-header">
              <div>
                <h2>ESP32 Sensör Doğrulaması</h2>
                <p>Mesafe ve PIR sensörlerinden gelen canlı bilgiler</p>
              </div>

              <div className="code-badge">
                <Cpu size={16} />
                ESP32
              </div>
            </div>

            <div className="esp-grid">
              <EspCard title="Bölge A" active={espBolgeA} />
              <EspCard title="Bölge B" active={espBolgeB} />
              <EspCard title="Bölge C" active={espBolgeC} />

              <div className={`esp-card ${espHareket ? "motion" : ""}`}>
                <span>PIR Hareket</span>
                <strong>{espHareket ? "VAR" : "YOK"}</strong>
              </div>
            </div>

            <div className="esp-footer">
              <span>Son sensör verisi:</span>
              <strong>{formatDate(sensorData?.zaman)}</strong>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Son Görülen Hayvan</h2>
                <p>En güncel kamera kaydı</p>
              </div>
            </div>

            <div className="live-data-box">
              <div>
                <span>Hayvan</span>
                <strong>{sonKayit?.hayvanAdi || "-"}</strong>
              </div>
              <div>
                <span>Marker ID</span>
                <strong>#{sonKayit?.markerId || "-"}</strong>
              </div>
              <div>
                <span>Bölge</span>
                <strong>{sonKayit?.bolge || "-"}</strong>
              </div>
              <div>
                <span>Zaman</span>
                <strong>{formatTime(sonKayit?.zaman)}</strong>
              </div>
            </div>
          </div>

          <div className="panel large-panel smart-comment-panel">
            <div className="panel-header">
              <div>
                <h2>Akıllı Sistem Yorumu</h2>
                <p>Kamera ve sensör verilerine göre otomatik yorum</p>
              </div>
            </div>

            <div className="activity-list">
              <div>
                <span>Kamera Yorumu</span>
                <p>
                  Son kamera verilerine göre en yoğun alan <b>{enYogunBolge()}</b>.
                </p>
              </div>

              <div>
                <span>Sensör Yorumu</span>
                <p>
                  {hayvanVar
                    ? "ESP32 sensörleri bölgede fiziksel varlık olduğunu doğruluyor."
                    : "ESP32 sensörleri şu an bölgelerde doluluk algılamıyor."}
                </p>
              </div>

              <div>
                <span>LED ve Buzzer Durumu</span>
                <p>
                  {buzzerAktif
                    ? "Hayvan algılanmadığı için kırmızı LED ve buzzer aktif durumdadır."
                    : "Hayvan algılandığı için yeşil LED aktif, kırmızı LED ve buzzer kapalıdır."}
                </p>
              </div>

              <div>
                <span>Kamera - ESP32 Uyumu</span>
                <p>
                  {sistemUyumu
                    ? "Kamera ve ESP32 sensör verileri birbiriyle uyumlu görünüyor."
                    : "Kamera ve ESP32 sensör verileri arasında farklılık var. Marker görünürlüğü veya sensör açısı kontrol edilmelidir."}
                </p>
              </div>

              <div>
                <span>Hareket Durumu</span>
                <p>
                  {espHareket
                    ? "PIR sensörü hareket algıladı. Alan aktif durumda."
                    : "PIR sensörüne göre anlık hareket bulunmuyor."}
                </p>
              </div>

              <div>
                <span>Son Güncelleme</span>
                <p>{formatDate(sonKayit?.zaman)}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;