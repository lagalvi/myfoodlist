import { useState } from "react";
import { LOCAL_STORAGE_DATA } from "../Utils";
import "./Main.css";

import "./MainMap";
import "./MainUsers";

import { NavLink, Outlet } from "react-router-dom";

const menuName = {
  map: "마푸리 지도",
  list: "마푸리 목록",
  add: "마푸리 사용자들",
};

const Main = ({ onLogout }) => {
  const clickLogout = () => {
    alert("로그아웃 되었습니다.");
    onLogout();
  };

  const userData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DATA));
  const initSelectUser = {
    seq: userData.seq,
    id: userData.id,
    name: userData.name,
  };

  const [selectUser, setSelectUser] = useState(initSelectUser);

  return (
    <div id="main-container">
      {/* 왼쪽 메뉴 영역*/}
      <div id="left-container">
        <div>
          <div id="user-container">
            <div id="user-image" />
            <label id="user-label">{userData.name}</label>
          </div>
          <nav>
            <NavLink
              onClick={() => setSelectUser(initSelectUser)}
              to="/main"
              /** end는 로그인 시 첫번째 선택하여 활성화 */
              end
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              {menuName.map}
            </NavLink>

            <NavLink
              to="/main/list"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              {menuName.list}
            </NavLink>

            <NavLink
              to="/main/users"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              {menuName.add}
            </NavLink>
          </nav>
        </div>
        <button id="logout-button" onClick={clickLogout}>
          로그아웃
        </button>
      </div>

      {/* 오른쪽 영역 */}
      <div id="right-container">
        <Outlet context={{ selectUser, setSelectUser }} />
      </div>
    </div>
  );
};

export default Main;
export { menuName };
