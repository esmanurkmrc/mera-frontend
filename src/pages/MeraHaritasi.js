import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  MapPinned,
  Activity,
  BarChart3,
  LogOut,
  PawPrint,
  Clock,
  Map,
  Sparkles,
} from "lucide-react";
import { GiCow } from "react-icons/gi";
import "../CSS/dashboard.css";
import "../CSS/meraHaritasi.css";

function MeraHaritasi() {
  const navigate = useNavigate();
  const location = useLocation();

  const [konumlar, setKonumlar] = useState([]);
  const [status, setStatus] = useState("loading");

  const KONUM_API = "http://localhost:8080/api/konum/son";

   const menuItems = [
       { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
       { title: "Sensör Verileri", icon: Activity, path: "/sensor-verileri" },
       { title: "Canlı Kamera", icon: Camera, path: "/canli-kamera" },
       { title: "Mera Haritası", icon: MapPinned, path: "/mera-haritasi" },
       { title: "Hayvan Takibi", icon: GiCow, path: "/hayvan-takibi" },
      //  { title: "Analizler", icon: BarChart3, path: "/analizler" },
     ];

  useEffect(() => {
    veriGetir();
    const interval = setInterval(veriGetir, 2000);
    return () => clearInterval(interval);
  }, []);

  const veriGetir = async () => {
    try {
      const res = await fetch(KONUM_API);
      const data = await res.json();

      if (Array.isArray(data)) setKonumlar(data);
      else if (data) setKonumlar([data]);
      else setKonumlar([]);

      setStatus("online");
    } catch (error) {
      console.error("Mera haritası verisi alınamadı:", error);
      setKonumlar([]);
      setStatus("offline");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("kullaniciAdi");
    navigate("/login");
  };

  const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getBolgeHayvanlari = (bolge) => {
    const unique = {};

    konumlar
      .filter((item) => item.bolge === bolge)
      .forEach((item) => {
        unique[item.markerId] = item;
      });

    return Object.values(unique);
  };

  const bolgeA = getBolgeHayvanlari("Bolge A");
  const bolgeB = getBolgeHayvanlari("Bolge B");
  const bolgeC = getBolgeHayvanlari("Bolge C");

  const sonKayit = konumlar[0];

  const enYogunBolge = () => {
    const bolgeler = [
      { ad: "Bölge A", sayi: bolgeA.length },
      { ad: "Bölge B", sayi: bolgeB.length },
      { ad: "Bölge C", sayi: bolgeC.length },
    ];

    const sirali = bolgeler.sort((a, b) => b.sayi - a.sayi);
    return sirali[0].sayi > 0 ? sirali[0].ad : "Veri bekleniyor";
  };

  const toplamHayvan = bolgeA.length + bolgeB.length + bolgeC.length;

  const haritaYorumu = () => {
    if (konumlar.length === 0) {
      return "Henüz ArUco marker algılanmadı. Kamera görüntüsü bekleniyor.";
    }

    if (toplamHayvan === 0) {
      return "Bölgelerde aktif hayvan görünmüyor.";
    }

    return `${enYogunBolge()} şu anda en aktif alan görünüyor. Son kayıtlara göre hayvan dağılımı canlı olarak güncellenmektedir.`;
  };

  const ZoneBox = ({ title, letter, animals, type }) => {
    let density = "low";
    if (animals.length >= 3) density = "high";
    else if (animals.length >= 1) density = "medium";

    return (
      <div className={`map-zone ${type} ${density}`}>
        <div className="zone-top">
          <div>
            <span>{title}</span>
            <h2>{letter}</h2>
          </div>

          <strong>{animals.length} hayvan</strong>
        </div>

        <div className="animal-area">
          {animals.length === 0 ? (
            <p className="empty-zone-text">Bölgede hayvan yok</p>
          ) : (
            animals.map((animal) => (
              <div className="animal-chip" key={animal.id || animal.markerId}>
                <PawPrint size={16} />
                <div>
                  <b>{animal.hayvanAdi}</b>
                  <small>Marker #{animal.markerId}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <PawPrint size={24} />
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

      <main className="mera-page">
        <header className="mera-header">
          <div>
            <p className="page-tag">Dijital Mera Haritası</p>
            <h1>Mera Bölge Dağılımı</h1>
            <span>
              ArUco marker verilerine göre hayvanların bölgelere dağılımı canlı izlenir.
            </span>
          </div>

          <div className={`map-status ${status}`}>
            <Map size={18} />
            {status === "online" ? "Harita Canlı" : "Bağlantı Yok"}
          </div>
        </header>

        <section className="map-summary">
          <div className="map-card">
            <p>Bölge A</p>
            <h3>{bolgeA.length}</h3>
            <span>Hayvan</span>
          </div>

          <div className="map-card">
            <p>Bölge B</p>
            <h3>{bolgeB.length}</h3>
            <span>Hayvan</span>
          </div>

          <div className="map-card">
            <p>Bölge C</p>
            <h3>{bolgeC.length}</h3>
            <span>Hayvan</span>
          </div>

          <div className="map-card highlight">
            <p>Son Görülen</p>
            <h3>{sonKayit?.hayvanAdi || "-"}</h3>
            <span>{sonKayit?.bolge || "Veri bekleniyor"}</span>
          </div>
        </section>

        <section className="map-comment">
          <div className="comment-icon">
            <Sparkles size={22} />
          </div>
          <div>
            <h3>Harita Yorumu</h3>
            <p>{haritaYorumu()}</p>
          </div>
        </section>

        <section className="map-content">
          <div className="digital-map-panel">
            <div className="panel-title">
              <div>
                <h2>Canlı Bölge Haritası</h2>
                <p>Maketteki A/B/C bölgelerinin dijital karşılığı</p>
              </div>
              <span className="live-map-badge">CANLI</span>
            </div>

            <div className="digital-map">
              <ZoneBox title="Bölge A" letter="A" animals={bolgeA} type="zone-a" />
              <ZoneBox title="Bölge B" letter="B" animals={bolgeB} type="zone-b" />
              <ZoneBox title="Bölge C" letter="C" animals={bolgeC} type="zone-c" />
            </div>
          </div>

          <div className="movement-panel">
            <div className="panel-title">
              <div>
                <h2>Son 5 Hareket</h2>
                <p>ArUco algılama kayıtları</p>
              </div>
            </div>

            <div className="movement-list">
              {konumlar.length === 0 ? (
                <div className="movement-empty">Henüz kayıt yok</div>
              ) : (
                konumlar.slice(0, 5).map((item, index) => (
                  <div className="movement-item" key={item.id || index}>
                    <div className="movement-icon">
                      <PawPrint size={17} />
                    </div>

                    <div>
                      <h4>{item.hayvanAdi}</h4>
                      <p>
                        {item.bolge} • Marker #{item.markerId}
                      </p>
                    </div>

                    <span>
                      <Clock size={13} />
                      {formatTime(item.zaman)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MeraHaritasi;