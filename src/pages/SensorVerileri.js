import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  MapPinned,
  BarChart3,
  LogOut,
  Wifi,
  Activity,
  Database,
  Clock,
  Radio,
  Move,
  AlertTriangle,
  Lightbulb,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import { GiCow } from "react-icons/gi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import "../CSS/sensorVerileri.css";
import "../CSS/dashboard.css";

function SensorVerileri() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sensorData, setSensorData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [history, setHistory] = useState([]);
  const [loglar, setLoglar] = useState([]);
  const [sonSenkron, setSonSenkron] = useState("-");

  const SENSOR_API = "http://localhost:8080/api/sensor/latest";

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
      const response = await fetch(SENSOR_API);
      const data = await response.json();

      setSensorData(data);
      setStatus("online");

      const simdi = new Date().toLocaleTimeString("tr-TR");
      setSonSenkron(simdi);

      const graphPoint = {
        time: new Date().toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        A: data.mesafeA ?? (data.bolgeA ? 6 : 18),
        B: data.mesafeB ?? (data.bolgeB ? 6 : 18),
        C: data.mesafeC ?? (data.bolgeC ? 6 : 18),
      };

      setHistory((prev) => [...prev.slice(-14), graphPoint]);

      const yeniLog = {
        zaman: simdi,
        mesaj: `A:${data.bolgeA ? "DOLU" : "BOŞ"} | B:${
          data.bolgeB ? "DOLU" : "BOŞ"
        } | C:${data.bolgeC ? "DOLU" : "BOŞ"} | Hareket:${
          data.hareket ? "VAR" : "YOK"
        }`,
      };

      setLoglar((prev) => [yeniLog, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error("Sensör hatası:", error);
      setStatus("offline");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("kullaniciAdi");
    navigate("/login");
  };

  const hayvanVar =
    sensorData?.bolgeA || sensorData?.bolgeB || sensorData?.bolgeC;

  const kirmiziLedAktif = !hayvanVar;
  const yesilLedAktif = hayvanVar;
  const buzzerAktif = !hayvanVar;

  const aktifBolgeSayisi = useMemo(() => {
    let sayac = 0;
    if (sensorData?.bolgeA) sayac++;
    if (sensorData?.bolgeB) sayac++;
    if (sensorData?.bolgeC) sayac++;
    return sayac;
  }, [sensorData]);

  const genelDurum = () => {
    if (status === "offline") return "Bağlantı yok";
    if (!hayvanVar) return "Hayvan algılanmadı";
    if (sensorData?.hareket && hayvanVar) return "Hareketli doluluk";
    if (hayvanVar) return "Bölgede hayvan var";
    return "Alan sakin";
  };

  const SensorCard = ({ title, active, distance, colorClass }) => (
    <div className={`sensor-zone-card ${active ? "active" : ""} ${colorClass}`}>
      <div className="zone-card-top">
        <div className="zone-icon">
          <Radio size={23} />
        </div>
        <span className={`live-dot ${active ? "on" : ""}`}></span>
      </div>

      <p>{title}</p>
      <h3>{active ? "DOLU" : "BOŞ"}</h3>

      <div className="sensor-detail">
        <span>Mesafe</span>
        <strong>{distance ?? "-"} cm</strong>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <GiCow size={30} className="logo-pulse" />
          <div>
            <h2>Mera Takip</h2>
            <span>SENSÖR PANELİ</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`sidebar-item ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <Icon size={20} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Çıkış</span>
        </button>
      </aside>

      <main className="dashboard-main sensor-page">
        <header className="sensor-header">
          <div>
            <h1>Canlı Sensör Paneli</h1>
            <span>
              Mesafe sensörleri, PIR hareket durumu ve LED uyarısı anlık olarak
              izlenir.
            </span>
          </div>

          <div className={`sensor-status ${status}`}>
            <Wifi size={18} />
            {status === "online" ? "ESP32 Bağlı" : "Bağlantı Yok"}
          </div>
        </header>

        <section className="iot-overview-grid">
          <div className="iot-card">
            <div className="iot-icon green">
              <Cpu size={22} />
            </div>
            <p>Genel Durum</p>
            <h3>{genelDurum()}</h3>
            <span>Sensörlerden gelen son bilgi</span>
          </div>

          <div className="iot-card">
            <div className="iot-icon blue">
              <Clock size={22} />
            </div>
            <p>Son Veri</p>
            <h3>{sonSenkron}</h3>
            <span>Son senkronizasyon zamanı</span>
          </div>

          <div className="iot-card">
            <div className="iot-icon orange">
              <Move size={22} />
            </div>
            <p>PIR Hareket</p>
            <h3>{sensorData?.hareket ? "VAR" : "YOK"}</h3>
            <span>Hareket sensörü bilgisi</span>
          </div>

          <div className="iot-card">
            <div className="iot-icon red">
              <Lightbulb size={22} />
            </div>
            <p>Kırmızı LED</p>
            <h3>{kirmiziLedAktif ? "AKTİF" : "PASİF"}</h3>
            <span>Hayvan algılanmadığında yanar</span>
          </div>
        </section>

        <section className="iot-overview-grid">
          <div className="iot-card">
            <div className="iot-icon green">
              <Lightbulb size={22} />
            </div>
            <p>Yeşil LED</p>
            <h3>{yesilLedAktif ? "AKTİF" : "PASİF"}</h3>
            <span>Hayvan algılandığında yanar</span>
          </div>

          <div className="iot-card">
            <div className="iot-icon red">
              <AlertTriangle size={22} />
            </div>
            <p>Buzzer</p>
            <h3>{buzzerAktif ? "AKTİF" : "PASİF"}</h3>
            <span>Hayvan algılanmadığında çalışır</span>
          </div>

          <div className="iot-card">
            <div className="iot-icon blue">
              <Radio size={22} />
            </div>
            <p>Aktif Bölge</p>
            <h3>{aktifBolgeSayisi}</h3>
            <span>Dolu algılanan bölge sayısı</span>
          </div>

          <div className="iot-card">
            <div className="iot-icon orange">
              <Activity size={22} />
            </div>
            <p>Algılama Durumu</p>
            <h3>{hayvanVar ? "VAR" : "YOK"}</h3>
            <span>Ultrasonik sensör genel sonucu</span>
          </div>
        </section>

        <section className="sensor-zone-grid">
          <SensorCard
            title="Bölge A"
            active={sensorData?.bolgeA}
            distance={sensorData?.mesafeA}
            colorClass="blue"
          />

          <SensorCard
            title="Bölge B"
            active={sensorData?.bolgeB}
            distance={sensorData?.mesafeB}
            colorClass="purple"
          />

          <SensorCard
            title="Bölge C"
            active={sensorData?.bolgeC}
            distance={sensorData?.mesafeC}
            colorClass="indigo"
          />

          <div className={`motion-card ${sensorData?.hareket ? "active" : ""}`}>
            <div className="zone-card-top">
              <div className="zone-icon">
                <Activity size={23} />
              </div>
              <span className={`live-dot ${sensorData?.hareket ? "on" : ""}`}></span>
            </div>

            <p>Hareket Analizi</p>
            <h3>{sensorData?.hareket ? "HAREKET VAR" : "DİNGİN"}</h3>

            <div className="sensor-detail">
              <span>Algılama</span>
              <strong>{sensorData?.hareket ? "Aktif" : "Pasif"}</strong>
            </div>
          </div>
        </section>

        <section className="sensor-main-grid">
          <div className="sensor-panel chart-panel">
            <div className="sensor-panel-header">
              <div>
                <h2>
                  <Activity size={20} />
                  Canlı Mesafe Grafiği
                </h2>
                <p>A, B ve C bölgelerinin anlık mesafe değişimi</p>
              </div>

              <div className="chart-legend">
                <span className="legend-item a">Bölge A</span>
                <span className="legend-item b">Bölge B</span>
                <span className="legend-item c">Bölge C</span>
              </div>
            </div>

            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={310}>
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="#dbe3ec"
                    vertical={false}
                  />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" domain={[0, 20]} />
                  <Tooltip
                    contentStyle={{
                      border: "none",
                      borderRadius: "14px",
                      boxShadow: "0 12px 35px rgba(15,23,42,0.18)",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="A"
                    stroke="#2563eb"
                    fill="url(#colorA)"
                    strokeWidth={3}
                  />

                  <Area
                    type="monotone"
                    dataKey="B"
                    stroke="#7c3aed"
                    fill="url(#colorB)"
                    strokeWidth={3}
                  />

                  <Area
                    type="monotone"
                    dataKey="C"
                    stroke="#4f46e5"
                    fillOpacity={0}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="sensor-panel smart-panel">
            <div className="sensor-panel-header">
              <div>
                <h2>
                  <CheckCircle2 size={20} />
                  Akıllı Sistem Yorumu
                </h2>
                <p>Anlık sensör durumuna göre otomatik değerlendirme</p>
              </div>
            </div>

            <div className="comment-list">
              <div>
                <span>Bölge Kullanımı</span>
                <p>
                  {aktifBolgeSayisi > 0
                    ? `${aktifBolgeSayisi} bölgede hayvan algılandı.`
                    : "Mesafe sensörlerine göre bölgelerde hayvan algılanmadı."}
                </p>
              </div>

              <div>
                <span>Hareket Durumu</span>
                <p>
                  {sensorData?.hareket
                    ? "PIR sensörü hareket algıladı. Alan aktif durumda."
                    : "PIR sensörüne göre anlık hareket bulunmuyor."}
                </p>
              </div>

              <div>
                <span>LED ve Buzzer Uyarısı</span>
                <p>
                  {buzzerAktif
                    ? "Kırmızı LED ve buzzer aktif. Sistem bölgelerde hayvan algılamadı."
                    : "Yeşil LED aktif. Hayvan algılandığı için buzzer kapalı."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="sensor-panel log-panel">
          <div className="sensor-panel-header">
            <div>
              <h2>
                <Database size={20} />
                Son Sensör Kayıtları
              </h2>
              <p>ESP32’den gelen son canlı veri akışı</p>
            </div>

            <span className="mini-live">
              <Radio size={15} />
              CANLI
            </span>
          </div>

          <div className="log-list">
            {loglar.length === 0 ? (
              <div className="empty-log">
                <AlertTriangle size={24} />
                Veri bekleniyor.
              </div>
            ) : (
              loglar.map((log, i) => (
                <div key={i} className="log-row">
                  <span>{log.zaman}</span>
                  <p>{log.mesaj}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default SensorVerileri;