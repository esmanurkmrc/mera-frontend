import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  MapPinned,
  Activity,
  BarChart3,
  LogOut,
  Clock,
  Search,
  Navigation,
  ShieldCheck,
  Radio,
  AlertTriangle,
  Map,
  Route,
  Sparkles,
  Eye,
} from "lucide-react";
import { GiCow } from "react-icons/gi";
import "../CSS/dashboard.css";
import "../CSS/hayvanTakibi.css";

function HayvanTakibi() {
  const navigate = useNavigate();
  const location = useLocation();

  const [konumlar, setKonumlar] = useState([]);
  const [seciliMarker, setSeciliMarker] = useState(null);
  const [status, setStatus] = useState("loading");

  const KONUM_API = "http://localhost:8080/api/konum";

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

      const liste = Array.isArray(data) ? data : data ? [data] : [];
      const sirali = liste.sort((a, b) => new Date(b.zaman) - new Date(a.zaman));

      setKonumlar(sirali);
      setStatus("online");

      if (!seciliMarker && sirali.length > 0) {
        setSeciliMarker(sirali[0].markerId);
      }
    } catch (error) {
      console.error("Hayvan takip verisi alınamadı:", error);
      setStatus("offline");
      setKonumlar([]);
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

  const formatDate = (date) => {
    if (!date) return "Veri bekleniyor";
    return new Date(date).toLocaleString("tr-TR");
  };

  const hayvanlar = useMemo(() => {
    const map = {};

    konumlar.forEach((item) => {
      if (!map[item.markerId]) {
        map[item.markerId] = {
          markerId: item.markerId,
          hayvanAdi: item.hayvanAdi,
          sonBolge: item.bolge,
          sonZaman: item.zaman,
          kayitSayisi: 1,
        };
      } else {
        map[item.markerId].kayitSayisi += 1;
      }
    });

    return Object.values(map);
  }, [konumlar]);

  const seciliHayvan = hayvanlar.find((item) => item.markerId === seciliMarker);
  const seciliHayvanGecmisi = konumlar.filter(
    (item) => item.markerId === seciliMarker
  );

  const bolgeSayisi = (bolge) =>
    seciliHayvanGecmisi.filter((item) => item.bolge === bolge).length;

  const enCokKullanilanBolge = () => {
    const bolgeler = [
      { ad: "Bölge A", key: "Bolge A", sayi: bolgeSayisi("Bolge A") },
      { ad: "Bölge B", key: "Bolge B", sayi: bolgeSayisi("Bolge B") },
      { ad: "Bölge C", key: "Bolge C", sayi: bolgeSayisi("Bolge C") },
    ];

    const sirali = bolgeler.sort((a, b) => b.sayi - a.sayi);
    return sirali[0].sayi > 0 ? sirali[0].ad : "Veri yok";
  };

  const aktiviteDurumu = () => {
    const sayi = seciliHayvanGecmisi.length;

    if (sayi >= 8) return { text: "Çok Aktif", className: "high" };
    if (sayi >= 4) return { text: "Normal", className: "normal" };
    if (sayi >= 1) return { text: "Düşük Aktivite", className: "low" };

    return { text: "Veri Yok", className: "empty" };
  };

  const sonGorulmeDurumu = () => {
    if (!seciliHayvan?.sonZaman) return { text: "Veri Yok", className: "empty" };

    const farkSaniye = (new Date() - new Date(seciliHayvan.sonZaman)) / 1000;

    if (farkSaniye <= 10) return { text: "Güncel", className: "normal" };
    if (farkSaniye <= 30) return { text: "Gecikmeli", className: "low" };

    return { text: "Kayıp Riskli", className: "high" };
  };

  const activity = aktiviteDurumu();
  const gorulmeDurumu = sonGorulmeDurumu();

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <GiCow size={25} />
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

      <main className="tracking-page">
        <header className="tracking-header">
          <div>
            <p className="page-tag">Hayvan Bazlı İzleme</p>
            <h1>Hayvan Takibi</h1>
            <span>
              ArUco marker verilerine göre hayvanların son konumu, hareket
              geçmişi ve aktivite durumu izlenir.
            </span>
          </div>

          <div className={`tracking-status ${status}`}>
            <ShieldCheck size={18} />
            {status === "online" ? "Takip Aktif" : "Bağlantı Yok"}
          </div>
        </header>

        <section className="tracking-summary">
          <div className="tracking-stat-card">
            <GiCow size={28} />
            <div>
              <p>Algılanan Hayvan</p>
              <h3>{hayvanlar.length}</h3>
            </div>
          </div>

          <div className="tracking-stat-card">
            <Radio size={26} />
            <div>
              <p>Toplam Kayıt</p>
              <h3>{konumlar.length}</h3>
            </div>
          </div>

          <div className="tracking-stat-card">
            <Map size={26} />
            <div>
              <p>Favori Bölge</p>
              <h3>{enCokKullanilanBolge()}</h3>
            </div>
          </div>

          <div className="tracking-stat-card warning">
            <AlertTriangle size={26} />
            <div>
              <p>Son Görülme</p>
              <h3>{gorulmeDurumu.text}</h3>
            </div>
          </div>
        </section>

        <section className="tracking-layout">
          <div className="animal-list-panel">
            <div className="panel-title">
              <div>
                <h2>Hayvan Listesi</h2>
                <p>Algılanan marker kayıtları</p>
              </div>
              <Search size={20} />
            </div>

            <div className="animal-list">
              {hayvanlar.length === 0 ? (
                <div className="empty-animal">Henüz hayvan algılanmadı.</div>
              ) : (
                hayvanlar.map((animal) => (
                  <button
                    key={animal.markerId}
                    onClick={() => setSeciliMarker(animal.markerId)}
                    className={`animal-list-item ${
                      seciliMarker === animal.markerId ? "selected" : ""
                    }`}
                  >
                    <div className="animal-avatar">
                      <GiCow size={23} />
                    </div>

                    <div>
                      <h3>{animal.hayvanAdi}</h3>
                      <p>Marker #{animal.markerId}</p>
                    </div>

                    <span>{animal.sonBolge}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="animal-detail-panel">
            <div className="detail-hero">
              <div>
                <p>Seçili Hayvan</p>
                <h2>{seciliHayvan?.hayvanAdi || "Hayvan seçilmedi"}</h2>
                <span>Marker #{seciliHayvan?.markerId || "-"}</span>
              </div>

              <div className={`activity-badge ${activity.className}`}>
                {activity.text}
              </div>
            </div>

            <div className="detail-cards">
              <div className="detail-card">
                <Navigation size={22} />
                <p>Anlık Konum</p>
                <h3>{seciliHayvan?.sonBolge || "-"}</h3>
              </div>

              <div className="detail-card">
                <Clock size={22} />
                <p>Son Görülme</p>
                <h3>{formatTime(seciliHayvan?.sonZaman)}</h3>
              </div>

              <div className="detail-card">
                <Route size={22} />
                <p>Hareket Kaydı</p>
                <h3>{seciliHayvanGecmisi.length}</h3>
              </div>
            </div>

            <div className="mini-map">
              {["Bolge A", "Bolge B", "Bolge C"].map((bolge) => (
                <div
                  key={bolge}
                  className={`mini-zone ${
                    seciliHayvan?.sonBolge === bolge ? "active" : ""
                  }`}
                >
                  <span>{bolge.split(" ")[1]}</span>

                  {seciliHayvan?.sonBolge === bolge && (
                    <GiCow className="mini-cow" size={28} />
                  )}
                </div>
              ))}
            </div>

            <div className="zone-counts">
              {["Bolge A", "Bolge B", "Bolge C"].map((bolge) => (
                <div key={bolge}>
                  <span>{bolge.replace("Bolge", "Bölge")}</span>
                  <strong>{bolgeSayisi(bolge)}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="smart-tracking-panel">
          <div className="panel-title">
            <div>
              <h2>
                <Sparkles size={20} />
                Akıllı Takip Yorumu
              </h2>
              <p>Seçili hayvanın hareket geçmişine göre otomatik değerlendirme</p>
            </div>
          </div>

          <div className="smart-comment-grid">
            <div>
              <span>Alan Tercihi</span>
              <p>
                {seciliHayvan
                  ? `${seciliHayvan.hayvanAdi} en çok ${enCokKullanilanBolge()} bölgesinde görülmüş.`
                  : "Henüz seçili hayvan yok."}
              </p>
            </div>

            <div>
              <span>Aktivite Yorumu</span>
              <p>
                {activity.text === "Çok Aktif"
                  ? "Hayvan sık bölge değiştirmiş, hareketlilik yüksek görünüyor."
                  : activity.text === "Normal"
                  ? "Hayvanın hareket seviyesi normal aralıkta görünüyor."
                  : activity.text === "Düşük Aktivite"
                  ? "Hareket sayısı düşük, takip edilmesi önerilir."
                  : "Analiz için yeterli kayıt bulunmuyor."}
              </p>
            </div>

            <div>
              <span>Son Durum</span>
              <p>
                {seciliHayvan
                  ? `Son olarak ${seciliHayvan.sonBolge} bölgesinde ${formatDate(
                      seciliHayvan.sonZaman
                    )} tarihinde algılandı.`
                  : "Sistem canlı veri bekliyor."}
              </p>
            </div>
          </div>
        </section>

        <section className="history-panel">
          <div className="panel-title">
            <div>
              <h2>
                <Eye size={20} />
                Hareket Geçmişi
              </h2>
              <p>Seçili hayvanın son 10 konum kaydı</p>
            </div>
          </div>

          <div className="history-list">
            {seciliHayvanGecmisi.length === 0 ? (
              <div className="empty-animal">Kayıt bulunamadı.</div>
            ) : (
              seciliHayvanGecmisi.slice(0, 10).map((item, index) => (
                <div className="history-item" key={item.id || index}>
                  <div className="history-dot"></div>

                  <div>
                    <h4>{item.bolge}</h4>
                    <p>
                      {item.hayvanAdi} • Marker #{item.markerId}
                    </p>
                  </div>

                  <span>{formatTime(item.zaman)}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HayvanTakibi;