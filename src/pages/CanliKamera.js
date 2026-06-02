import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  Radio,
  MapPinned,
  Clock,
  Wifi,
  AlertCircle,
  Activity,
  BarChart3,
  LogOut,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import { GiCow } from "react-icons/gi";
import "../CSS/dashboard.css";
import "../CSS/canliKamera.css";

function CanliKamera() {
  const navigate = useNavigate();
  const location = useLocation();

  const [konumlar, setKonumlar] = useState([]);
  const [sensorData, setSensorData] = useState(null);
  const [status, setStatus] = useState("loading");

  const KONUM_API = "http://localhost:8080/api/konum/son";
  const SENSOR_API = "http://localhost:8080/api/sensor/latest";
  const STREAM_URL = "http://127.0.0.1:5000/video";

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { title: "Sensör Verileri", icon: Activity, path: "/sensor-verileri" },
    { title: "Canlı Kamera", icon: Camera, path: "/canli-kamera" },
    { title: "Mera Haritası", icon: MapPinned, path: "/mera-haritasi" },
    { title: "Hayvan Takibi", icon: GiCow, path: "/hayvan-takibi" },
  ];

  useEffect(() => {
    veriGetir();
    const interval = setInterval(veriGetir, 2000);
    return () => clearInterval(interval);
  }, []);

  const veriGetir = async () => {
    try {
      const [konumRes, sensorRes] = await Promise.all([
        fetch(KONUM_API),
        fetch(SENSOR_API).catch(() => null),
      ]);

      const konumData = await konumRes.json();

      if (Array.isArray(konumData)) {
        setKonumlar(konumData);
      } else if (konumData) {
        setKonumlar([konumData]);
      } else {
        setKonumlar([]);
      }

      if (sensorRes && sensorRes.ok) {
        const sensorJson = await sensorRes.json();
        setSensorData(sensorJson);
      }

      setStatus("online");
    } catch (error) {
      console.error("Veri alınamadı:", error);
      setKonumlar([]);
      setStatus("offline");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("kullaniciAdi");
    navigate("/login");
  };

  const bolgeSay = (bolge) => {
    return konumlar.filter((item) => item.bolge === bolge).length;
  };

  const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const sonKayit = konumlar[0];
  const kameraBolgesi = sonKayit?.bolge || "-";

  const sensorBolgeDoluMu = () => {
    if (!sensorData || kameraBolgesi === "-") return false;

    if (kameraBolgesi === "Bolge A") return sensorData.bolgeA;
    if (kameraBolgesi === "Bolge B") return sensorData.bolgeB;
    if (kameraBolgesi === "Bolge C") return sensorData.bolgeC;

    return false;
  };

  const dogrulamaDurumu = sensorBolgeDoluMu();

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <GiCow size={24} />
          </div>
          <div>
            <h2>MeraTakip</h2>
            <span>IoT & Görüntü İşleme</span>
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

      <main className="camera-page">
        <header className="camera-header">
          <div>
            <p className="page-tag">Canlı Görüntü İşleme</p>
            <h1>Canlı Kamera / ArUco Takibi</h1>
            <span>
              Kamera görüntüsü üzerinden marker algılama ve bölge takibi yapılır.
            </span>
          </div>

          <div className={`camera-status ${status}`}>
            <Wifi size={18} />
            {status === "online" ? "Bağlantı Aktif" : "Bağlantı Yok"}
          </div>
        </header>

        <section className="camera-stats">
          <div className="stat-card">
            <div className="stat-icon green">
              <Camera size={24} />
            </div>
            <p>Kamera</p>
            <h3>Aktif</h3>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <GiCow size={24} />
            </div>
            <p>Son 5 Kayıt</p>
            <h3>{konumlar.length}</h3>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <MapPinned size={24} />
            </div>
            <p>Son Bölge</p>
            <h3>{sonKayit?.bolge || "-"}</h3>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <Clock size={24} />
            </div>
            <p>Son Algılama</p>
            <h3>{formatTime(sonKayit?.zaman)}</h3>
          </div>
        </section>

        <section className="camera-content">
          <div className="stream-panel">
            <div className="panel-title">
              <div>
                <h2>Canlı Kamera Görüntüsü</h2>
                <p>Python Flask stream üzerinden canlı aktarım</p>
              </div>
              <span className="live-dot">
                <Radio size={15} />
                LIVE
              </span>
            </div>

            <div className="stream-box">
              <img
                src={STREAM_URL}
                alt="Canlı ArUco Kamera"
                className="camera-stream"
              />
            </div>
          </div>

          <div className="side-panel">
            <div className="panel-title">
              <div>
                <h2>Son 5 ArUco Kaydı</h2>
                <p>Backend’den gelen canlı konumlar</p>
              </div>
            </div>

            <div className="marker-feed">
              {konumlar.length === 0 ? (
                <div className="empty-feed">
                  <AlertCircle size={30} />
                  <p>Henüz marker algılanmadı.</p>
                </div>
              ) : (
                konumlar.map((item, index) => (
                  <div className="marker-card" key={item.id || index}>
                    <div className="marker-left">
                      <div className="marker-id">#{item.markerId}</div>
                      <div>
                        <h3>{item.hayvanAdi}</h3>
                        <span>{formatTime(item.zaman)}</span>
                      </div>
                    </div>

                    <div
                      className={`zone-badge ${
                        item.bolge ? item.bolge.replace(" ", "") : ""
                      }`}
                    >
                      {item.bolge || "Bilinmiyor"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="sensor-verify-panel">
          <div className="verify-header">
            <div>
              <h2>ESP32 Sensör Doğrulaması</h2>
              <p>Kamera tespiti ile mesafe/hareket sensörü verileri karşılaştırılır.</p>
            </div>

            <div className={`verify-badge ${dogrulamaDurumu ? "success" : "warning"}`}>
              {dogrulamaDurumu ? <ShieldCheck size={18} /> : <Cpu size={18} />}
              {dogrulamaDurumu ? "Doğrulandı" : "Sensör Kontrolü"}
            </div>
          </div>

          <div className="verify-grid">
            <div className="verify-card">
              <span>Kamera Tespiti</span>
              <strong>{sonKayit?.hayvanAdi || "-"}</strong>
              <p>{sonKayit?.bolge || "Kamera verisi bekleniyor"}</p>
            </div>

            <div className={`verify-card ${sensorData?.bolgeA ? "active" : ""}`}>
              <span>Bölge A</span>
              <strong>{sensorData?.bolgeA ? "DOLU" : "BOŞ"}</strong>
              <p>Mesafe sensörü</p>
            </div>

            <div className={`verify-card ${sensorData?.bolgeB ? "active" : ""}`}>
              <span>Bölge B</span>
              <strong>{sensorData?.bolgeB ? "DOLU" : "BOŞ"}</strong>
              <p>Mesafe sensörü</p>
            </div>

            <div className={`verify-card ${sensorData?.bolgeC ? "active" : ""}`}>
              <span>Bölge C</span>
              <strong>{sensorData?.bolgeC ? "DOLU" : "BOŞ"}</strong>
              <p>Mesafe sensörü</p>
            </div>

            <div className={`verify-card ${sensorData?.hareket ? "motion" : ""}`}>
              <span>PIR Hareket</span>
              <strong>{sensorData?.hareket ? "VAR" : "YOK"}</strong>
              <p>Hareket sensörü</p>
            </div>
          </div>

          <div className="verify-comment">
            {dogrulamaDurumu
              ? "Kamera ve ESP32 sensör verileri aynı bölgeyi doğruluyor."
              : "Kamera verisi ile sensör doğrulaması henüz eşleşmedi veya sensör verisi bekleniyor."}
          </div>
        </section>

        <section className="zone-summary">
          <div className="zone-box bolge-a">
            <span>Bölge A</span>
            <h3>{bolgeSay("Bolge A")}</h3>
            <p>Son 5 kayıt içindeki görülme sayısı</p>
          </div>

          <div className="zone-box bolge-b">
            <span>Bölge B</span>
            <h3>{bolgeSay("Bolge B")}</h3>
            <p>Son 5 kayıt içindeki görülme sayısı</p>
          </div>

          <div className="zone-box bolge-c">
            <span>Bölge C</span>
            <h3>{bolgeSay("Bolge C")}</h3>
            <p>Son 5 kayıt içindeki görülme sayısı</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CanliKamera;