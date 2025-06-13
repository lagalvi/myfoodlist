import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";

import "./Auth.css";
import "./Login.css";
import { SERVER_URL } from "../Utils";

/**
 *
 * @param {*} param0
 * @returns
 */
const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const initForm = {
    id: "",
    pw: "",
  };

  const refs = {
    id: useRef(),
    pw: useRef(),
  };

  const [form, setForm] = useState(initForm);

  const clickLogin = (e) => {
    e.preventDefault(); // 새로 고침 방지

    const emptyKey = Object.keys(form).find((key) => form[key].trim() === "");
    if (emptyKey) {
      alert("아이디와 비밀번호를 입력하세요.");
      refs[emptyKey].current.focus();
      return;
    }
    const user = {
      user_id: form.id,
      password: form.pw,
    };

    const url = `${SERVER_URL}/login`;
    console.log(url);
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          //로그인 성공
          console.log(data);
          onLogin(data);
        } else {
          //아이디 없거나 비밀번호 일치하지 않을 때
          alert(`${data.code}\n${data.message}`);
        }
      })
      .catch((error) => {
        //그밖에 에러
        console.log(error);
        alert(error);
      });
  };

  const clickJogin = () => {
    navigate("/join");
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="auth-page">
      <div className="auth-title">MY FOOD LIST</div>

      <form
        id="login-container"
        className="auth-container"
        onSubmit={clickLogin}
      >
        <div className="auth-row">
          <label className="auth-label login-label">아이디</label>
          <input
            type="text"
            className="auth-input"
            id="login-id"
            name="id"
            onChange={onChange}
            ref={refs.id}
          />
        </div>

        <div className="auth-row">
          <label className="auth-label login-label">비밀번호</label>
          <input
            type="password"
            className="auth-input"
            id="login-pw"
            name="pw"
            onChange={onChange}
            ref={refs.pw}
          />
        </div>

        <button type="submit" className="login-button" id="login-button">
          로그인
        </button>
        <button
          type="button"
          className="login-button"
          onClick={clickJogin}
          id="join-button"
        >
          회원가입
        </button>
      </form>
    </div>
  );
};

export default Login;
