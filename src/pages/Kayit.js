import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/kayit.css";

function Kayit() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    email: "",
    sifre: "",
  });

  const [mesaj, setMesaj] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/users/kayit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMesaj("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setMesaj("Kayıt sırasında bir hata oluştu.");
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
      setMesaj("Backend bağlantı hatası!");
    }
  };

  return (
    <div className="kayit-page">
      <div className="kayit-card">
        <h1>Kayıt Ol</h1>
        <p>Kamera destekli akıllı mera takip sistemine hoş geldiniz.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Ad</label>
            <input
              type="text"
              name="ad"
              value={formData.ad}
              onChange={handleChange}
              placeholder="Adınızı giriniz"
              required
            />
          </div>

          <div className="input-group">
            <label>Soyad</label>
            <input
              type="text"
              name="soyad"
              value={formData.soyad}
              onChange={handleChange}
              placeholder="Soyadınızı giriniz"
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email adresinizi giriniz"
              required
            />
          </div>

          <div className="input-group">
            <label>Şifre</label>
            <input
              type="password"
              name="sifre"
              value={formData.sifre}
              onChange={handleChange}
              placeholder="Şifrenizi giriniz"
              required
            />
          </div>

          <button type="submit" className="kayit-btn">
            Kayıt Ol
          </button>
        </form>

        {mesaj && <div className="mesaj">{mesaj}</div>}

        <div className="login-link">
          Zaten hesabınız var mı?
          <span onClick={() => navigate("/login")}> Giriş Yap</span>
        </div>
      </div>
    </div>
  );
}

export default Kayit;