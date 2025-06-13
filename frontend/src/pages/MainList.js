import { useEffect, useRef, useState } from "react";
import { menuName } from "./Main";
import "./MainList.css";
import { LOCAL_STORAGE_DATA, selectMFL, SERVER_URL } from "../Utils";

/**
 * 마푸리 목록을 보여주는 컴포넌트
 * @returns
 */
const MainList = () => {
  const user = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DATA));

  //추가 dialog 관련
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const openDialog = () => {
    setAddForm(initAddForm);
    setIsDialogOpen(true);
  };
  const closeDialog = () => setIsDialogOpen(false);

  const initAddForm = {
    foodName: "",
    foodAddress: "",
    foodComment: "",
  };
  const refs = {
    foodName: useRef(),
    foodAddress: useRef(),
    foodComment: useRef(),
  };

  const [foodList, setFoodList] = useState([]);

  //마푸리 목록 획득
  //개발 모드에서 두번 호출 되는 부분 방지
  const isRendering = useRef(false);

  useEffect(() => {
    //한번만 호출되게
    if (isRendering.current) return;
    isRendering.current = true;

    const getMFL = async () => {
      const data = await selectMFL(user.seq);
      if (data !== null) {
        setFoodList(data.result);
      }
    };
    getMFL();
  });

  //마푸리추가 form관련
  const [addForm, setAddForm] = useState(initAddForm);

  const clickAddFood = async (e) => {
    e.preventDefault(); // 기본 제출 막기

    //빈값 확인
    const emptyKey = Object.keys(addForm).find(
      (key) => addForm[key].trim() === ""
    );
    if (emptyKey) {
      alert("모든 항목을 입력해주세요.");
      refs[emptyKey].current.focus();
      return;
    }

    //지오코딩 api 백엔드로 보내야한다.
    addressToGeocoding();
  };

  const addressToGeocoding = () => {
    //위도 경도를 획득한다.
    const url = `${SERVER_URL}/geocoding`;
    const param = {
      address: addForm.foodAddress,
    };
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(param),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code !== 200) {
          alert(`${data.code}\n${data.message}`);
          return;
        }

        const dbData = {
          user_seq: user.seq,
          name: addForm.foodName,
          address: data.roadAddress,
          comment: addForm.foodComment,
          lat: data.lat,
          lon: data.lon,
        };

        const insertUrl = `${SERVER_URL}/insertmfl`;
        fetch(insertUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dbData),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.code === 200) {
              alert("추가 완료");
              closeDialog();
              return;
            } else {
              alert(`${data.code}\n${data.message}`);
              return;
            }
          })
          .catch((err) => {
            alert(err);
          });
      })
      .catch((err) => {
        alert(err);
      });
  };

  const onAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm({
      ...addForm,
      [name]: value,
    });
  };

  return (
    <div id="list-container">
      <div id="list-header">
        <div className="right-title">{menuName.list}</div>
        <button id="add-button" onClick={openDialog}>
          마푸리 추가
        </button>
      </div>
      <table border={1} className="food-table">
        <thead>
          <tr>
            <th>음식점 이름</th>
            <th>주소</th>
            <th>의견</th>
          </tr>
        </thead>
        <tbody>
          {foodList.length > 0 ? (
            foodList.map((food, index) => (
              <tr key={index}>
                <td>{food.name}</td>
                <td>{food.address}</td>
                <td>{food.comment}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ textAlign: "center" }}>
                등록된 음식점이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/**모달형식으로 마푸리 추가 다이얼로그를 띄운다. */}
      {isDialogOpen && (
        <div className="dialog-backdrop">
          <div className="dialog-box">
            <h3>마푸리 추가</h3>
            <form onSubmit={clickAddFood}>
              <div className="add-row">
                <label className="add-label">이름</label>
                <input
                  placeholder="식당 이름을 입력하세요"
                  ref={refs.foodName}
                  className="add-input"
                  name="foodName"
                  value={addForm.foodName}
                  onChange={onAddChange}
                  type="text"
                />
              </div>
              <div className="add-row">
                <label className="add-label">주소</label>
                <input
                  placeholder="주소 전체를 입력하세요"
                  ref={refs.foodAddress}
                  className="add-input"
                  name="foodAddress"
                  value={addForm.foodAddress}
                  onChange={onAddChange}
                  type="text"
                />
              </div>
              <div className="add-row">
                <label className="add-label">의견</label>
                <input
                  placeholder="음식점에 대한 설명을 입력하세요"
                  ref={refs.foodComment}
                  className="add-input"
                  name="foodComment"
                  value={addForm.foodComment}
                  onChange={onAddChange}
                  type="text"
                />
              </div>
              <div className="add-row">
                <button onClick={closeDialog}>닫기</button>
                <button type="submit">추가</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainList;
