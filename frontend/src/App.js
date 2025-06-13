import "./App.css";
import Login from "./pages/Login";
import Main from "./pages/Main";
import Join from "./pages/Join";
import MainMap from "./pages/MainMap";

import { useEffect, useState } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainList from "./pages/MainList";
import MainUsers from "./pages/MainUsers";
import { LOCAL_STORAGE_DATA, SERVER_URL } from "./Utils";

const App = () => {
  const [isLogin, setIsLogin] = useState(false);

  //로그인 한 사용자 id

  const handleLogin = (loginData) => {
    setIsLogin(true);
    localStorage.setItem(LOCAL_STORAGE_DATA, JSON.stringify(loginData));
  };

  const handleLogout = () => {
    fetch(`${SERVER_URL}/logout`, {
      method: "POST",
      credentials: "include",
    }).then(() => {
      setIsLogin(false);

      localStorage.removeItem(LOCAL_STORAGE_DATA);
    });
  };

  //새로 고침 시 로그인 유지 시도
  useEffect(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_DATA);

    if (savedUser) {
      setIsLogin(true);
    } else {
      fetch(`${SERVER_URL}/me`, {
        method: "GET",
        credentials: "include", // 쿠키 포함 요청
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === 200) {
            handleLogin(data);
          }
        })
        .catch((error) => {
          setIsLogin(false);
          localStorage.removeItem(LOCAL_STORAGE_DATA);
        });
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLogin ? <Navigate to="/main" /> : <Login onLogin={handleLogin} />
          }
        />
        <Route path="/join" element={<Join />} />

        {/** 메인 페이지 라우팅 */}
        {isLogin && (
          <Route path="main" element={<Main onLogout={handleLogout} />}>
            <Route index element={<MainMap />} />
            <Route path="list" element={<MainList />} />
            <Route path="users" element={<MainUsers />} />
          </Route>
        )}

        {/**로그인페이지 라우팅 */}
        {!isLogin && <Route path="/main/*" element={<Navigate to="/" />} />}
      </Routes>
    </Router>
  );
};

export default App;
