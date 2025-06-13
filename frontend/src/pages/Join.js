import "./Auth.css";
import "./Join.css";

import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { SERVER_URL } from "../Utils";

const Join = () => {
  const navigate = useNavigate();

  const initForm = {
    id: "",
    password: "",
    passwordCheck: "",
    name: "",
    phone1: "",
    phone2: "",
    phone3: "",
    email: "",
  };

  const refs = {
    id: useRef(),
    password: useRef(),
    passwordCheck: useRef(),
    name: useRef(),
    phone1: useRef(),
    phone2: useRef(),
    phone3: useRef(),
    email: useRef(),
  };

  const [form, setForm] = useState(initForm);

  //input의 상태값이 변할 때
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      // prev는 무조건 이전 값
      ...prev, // 이전 상태를 그대로 유지,  이전 상태의 모든 키와 값을 새 객체에 복사
      [name]: value, // 수정된 값만 저장
    }));
  };

  //취소 버튼 클릭릭
  const onCancel = () => {
    if (window.confirm("가입을 취소하겠습니까?")) {
      setForm(initForm);
      navigate("/");
    }
  };

  //가입 버튼 클릭
  const onSubmit = async (e) => {
    e.preventDefault(); // 새로 고침 방지

    //빈 항목을 찾는다.
    const emptyKey = Object.keys(form).find((key) => form[key].trim() === "");

    if (emptyKey) {
      alert("모든 항목을 입력해주세요.");
      //첫번 째 빈 항목으로 커서를 이동
      refs[emptyKey].current.focus();
      return;
    }

    if (form.id.length < 4) {
      alert("아이디는 4자 이상이어야 합니다.");
      return;
    }

    if (form.password !== form.passwordCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      refs.passwordCheck.current.focus();
      return;
    }

    //서버로 회원 정보 전송
    insertJoinUser(form);
  };

  /**
   * 회원가입 서버로 전송송
   * @param {*} form
   */
  const insertJoinUser = async (form) => {
    const user = {
      user_id: form.id,
      password: form.password,
      name: form.name,
      phone: form.phone1 + form.phone2 + form.phone3,
      email: form.email,
    };

    const url = `${SERVER_URL}/joinUser`;
    console.log(url);
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((res) => res.json()) //응답 본문을 json으로 파싱
      .then((data) => {
        // data는 위에서 파싱된 json
        if (data.code === 200) {
          alert("회원가입이 완료되었습니다.");
          //로그인화면으로 이동
          navigate("/");
        } else {
          alert(`${data.code}\n${data.message}`);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="auth-page">
      <div className="auth-title">회원 가입</div>

      <form className="auth-container" onSubmit={onSubmit}>
        <div className="auth-row">
          <label className="auth-label">아이디</label>
          <input
            ref={refs.id}
            type="text"
            className="auth-input"
            name="id"
            value={form.id}
            onChange={onChange}
          />
        </div>

        <div className="auth-row">
          <label className="auth-label">비밀번호</label>
          <input
            ref={refs.password}
            type="password"
            className="auth-input"
            name="password"
            value={form.password}
            onChange={onChange}
          />
        </div>

        <div className="auth-row">
          <label className="auth-label">비밀번호 확인</label>
          <input
            ref={refs.passwordCheck}
            type="password"
            className="auth-input"
            name="passwordCheck"
            value={form.passwordCheck}
            onChange={onChange}
          />
        </div>

        <div className="auth-row">
          <label className="auth-label">이름</label>
          <input
            ref={refs.name}
            type="text"
            className="auth-input"
            name="name"
            value={form.name}
            onChange={onChange}
          />
        </div>

        <div className="auth-row">
          <label className="auth-label">전화번호</label>
          <input
            ref={refs.phone1}
            type="tel"
            className="auth-input auth-input-tel"
            name="phone1"
            maxLength={3}
            value={form.phone1}
            onChange={onChange}
          />
          <span className="tel-dash">-</span>
          <input
            ref={refs.phone2}
            type="tel"
            className="auth-input auth-input-tel"
            name="phone2"
            maxLength={4}
            value={form.phone2}
            onChange={onChange}
          />
          <span className="tel-dash">-</span>
          <input
            ref={refs.phone3}
            type="tel"
            className="auth-input auth-input-tel"
            name="phone3"
            maxLength={4}
            value={form.phone3}
            onChange={onChange}
          />
        </div>

        <div className="auth-row">
          <label className="auth-label">이메일</label>
          <input
            ref={refs.email}
            type="email"
            className="auth-input"
            name="email"
            value={form.email}
            onChange={onChange}
          />
        </div>

        <div className="button-row">
          <button
            type="button"
            className="join-button"
            id="cancel-button"
            onClick={onCancel}
          >
            취소
          </button>
          <button type="submit" className="join-button" id="submit-button">
            가입
          </button>
        </div>
      </form>
    </div>
  );
};

export default Join;
