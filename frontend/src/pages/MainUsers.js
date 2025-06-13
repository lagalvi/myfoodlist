/**
 * 마푸리 사용자들 목록을 보여주는 컴포넌트
 * @returns
 */

import { useEffect, useRef, useState } from "react";
import { LOCAL_STORAGE_DATA, selectUserList } from "../Utils";
import { menuName } from "./Main";
import "./MainUsers.css";
import { useNavigate, useOutletContext } from "react-router-dom";
const MainUsers = () => {
  const userData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DATA));

  const [userList, setUserList] = useState([]);

  //마푸리 목록 획득
  //개발 모드에서 두번 호출 되는 부분 방지
  const isRendering = useRef(false);

  useEffect(() => {
    if (isRendering.current) return;
    isRendering.current = true;

    const getUserList = async (seq) => {
      const data = await selectUserList(seq);
      if (data !== null) {
        console.log(data);
        setUserList(data.result);
      }
    };

    getUserList(userData.seq);
  }, [userData.seq]);

  const { setSelectUser } = useOutletContext();
  const navigate = useNavigate();
  //마푸리 보기 누르면 해당 사용자의 마푸리 목록의 지도가 나와야한다.
  const clickUserMFL = (user) => {
    console.log(user);
    const selectedUser = {
      seq: user.seq,
      id: user.user_id,
      name: user.name,
    };

    setSelectUser(selectedUser);
    navigate("/main");
  };

  return (
    <div>
      <div className="right-title">{menuName.add}</div>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>이름</th>
            <th>마푸리 개수</th>
            <th>마푸리 보기</th>
          </tr>
        </thead>
        <tbody>
          {userList.length > 0 ? (
            userList.map((user, index) => (
              <tr key={index}>
                <td>{user.user_id}</td>
                <td>{user.name}</td>
                <td>{user.food_count}</td>
                <td>
                  <button onClick={() => clickUserMFL(user)}>
                    마푸리 보기
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>사용자들이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MainUsers;
