import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [mesaj, setMesaj] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/users/giris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          sifre: sifre,
        }),
      });

      // Backend'den gelen cevabı metin olarak alıyoruz (JSON hatasını önler)
      const resText = await response.text();

      if (response.ok) {
        // Giriş başarılı (Status 200)
        // Backend metin döndürdüğü için data.ad gibi objelere erişemeyiz.
        // Şimdilik giriş yapan emaili kaydediyoruz:
        localStorage.setItem("kullaniciEmail", email);

        setMesaj("Giriş başarılı!");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        // Giriş başarısız (Status 401, 404 vb.)
        setMesaj(resText || "Email veya şifre hatalı!");
      }
    } catch (error) {
      console.error("Giriş hatası:", error);
      setMesaj("Sunucuya bağlanılamadı!");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Giriş Yap</h1>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Email gir"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Şifre</label>
            <input
              type="password"
              placeholder="Şifre gir"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Giriş Yap
          </button>
        </form>

        {mesaj && <p className="mesaj">{mesaj}</p>}

        <div className="kayit-link">
          Hesabın yok mu?
          <span 
            onClick={() => navigate("/kayit")} 
            style={{ cursor: "pointer", color: "blue", fontWeight: "bold" }}
          > 
            Kayıt Ol
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;