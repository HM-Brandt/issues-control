import { useEffect } from "react";
import Layout from "./components/Layout";
import { useAuthStore } from "./stores/authStore";

function App() {
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const refreshToken = params.get("refreshToken") || "";

    if (token) {
      // 1. Guardar en Zustand y localStorage mediante login()
      login(token, refreshToken);

      // 2. Limpiar los parámetros de la URL para no exponer los tokens en la barra del navegador
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [login]);
  
  return (
    <>
      <Layout />
    </>
  );
}

export default App;
