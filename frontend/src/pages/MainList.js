import { useEffect, useRef, useState } from "react";
import { menuName } from "./Main";
import "./MainList.css";
import {
  LOCAL_STORAGE_DATA,
  selectMFL,
  selectMFLImages,
  SERVER_URL,
} from "../Utils";

/**
 * 마푸리 목록을 보여주는 컴포넌트
 * @returns
 */
const MainList = () => {
  const user = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DATA));

  //추가 dialog 관련
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [foodList, setFoodList] = useState([]);

  //마푸리에 올릴 사진
  const [imgFiles, setImgFiles] = useState([]);

  //올린 사진 미리보기
  const [imgPreviews, setImgPreviews] = useState([]);
  const [imgIndex, setImgIndex] = useState(0);

  const [isMFLImageDialog, setIsMFLImageDialog] = useState(false);

  const [mflImgLinks, setMflImgLinks] = useState([]);
  const [mflImgIndex, setMflImgIndex] = useState(0);

  const closeMFLImageDialog = () => setIsMFLImageDialog(false);

  const openAddDialog = () => {
    setAddForm(initAddForm);
    setIsAddDialogOpen(true);
    setImgFiles([]);
    setImgPreviews([]);
    setImgIndex(0);
  };
  const closeAddDialog = () => setIsAddDialogOpen(false);

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

  const getMFL = async () => {
    const data = await selectMFL(user.seq);
    if (data !== null) {
      setFoodList(data.result);
    }
  };

  //마푸리 목록 획득
  //개발 모드에서 두번 호출 되는 부분 방지
  const isRendering = useRef(false);

  useEffect(() => {
    //한번만 호출되게
    if (isRendering.current) return;
    isRendering.current = true;

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

        //서버에 저장
        const formData = new FormData();

        formData.append("user_seq", user.seq);
        formData.append("name", addForm.foodName);
        formData.append("address", data.roadAddress);
        formData.append("comment", addForm.foodComment);
        formData.append("lat", data.lat);
        formData.append("lon", data.lon);

        for (let i = 0; i < imgFiles.length; i++) {
          formData.append("images", imgFiles[i]);
        }

        const insertUrl = `${SERVER_URL}/insertmfl`;
        fetch(insertUrl, {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.code === 200) {
              alert("마푸리 추가 성공");
              closeAddDialog();
              //정보를 다시 획득한다.
              getMFL();
            } else {
              alert(`${data.code}\n${data.message}`);
              return;
            }
          })
          .catch((err) => {
            alert(`에러\n${err}`);
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

  const handleImgFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    setImgFiles(selectedFiles);

    const imgUrls = selectedFiles.map((file) => URL.createObjectURL(file));

    setImgPreviews(imgUrls);
    setImgIndex(0);
  };

  const goImgPrev = () => {
    setImgIndex((prev) => (prev === 0 ? imgPreviews.length - 1 : prev - 1));
  };

  const goImgNext = () => {
    setImgIndex((prev) => (prev === imgPreviews.length - 1 ? 0 : prev + 1));
  };

  const clickMyFood = async (food) => {
    const data = await selectMFLImages(user.seq, food.seq);

    if (data.code === 200) {
      if (data.result.length > 0) {
        showMFLImages(data.result, food.name);
      } else {
        alert("해당 음식점의 사진이 없습니다.");
      }
    }
  };

  const showMFLImages = (images, foodName) => {
    console.log(images, foodName);
    setIsMFLImageDialog(true);
    setMflImgIndex(0);

    const mflImages = [];
    images.map((image, index) => {
      mflImages.push({
        src: `${SERVER_URL}/${image.image_path}`,
        alt: `${foodName}${image.seq}`,
      });
    });
    setMflImgLinks(mflImages);
  };

  const goMFLPrev = () => {
    setMflImgIndex((prev) => (prev === 0 ? mflImgLinks.length - 1 : prev - 1));
  };
  const goMFLNext = () => {
    setMflImgIndex((prev) => (prev === mflImgLinks.length - 1 ? 0 : prev + 1));
  };

  return (
    <div id="list-container">
      <div id="list-header">
        <div className="right-title">{menuName.list}</div>
        <button id="add-button" onClick={openAddDialog}>
          마푸리 추가
        </button>
      </div>
      <div className="food-table-header-wrapper">
        <table border={1} className="food-table">
          <thead>
            <tr>
              <th>음식점 이름</th>
              <th>주소</th>
              <th>의견</th>
            </tr>
          </thead>
        </table>
      </div>
      <div className="food-table-body-wrapper">
        <table className="food-table">
          <tbody>
            {foodList.length > 0 ? (
              foodList.map((food, index) => (
                <tr key={index} onClick={() => clickMyFood(food)}>
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
      </div>

      {/** 사진 보여주는 다이얼로그 모달리스 형식*/}
      {isMFLImageDialog && (
        <div className="dialog-backdrop" onClick={closeMFLImageDialog}>
          <div
            className="dialog-box img-dialog"
            onClick={(e) => e.stopPropagation()} // 안에서 클릭해도 다이얼로그 닫히지 않게
          >
            <button type="button" onClick={goMFLPrev}>
              ←
            </button>
            <div className="img-dialog-img-wrap">
              <img
                src={mflImgLinks[mflImgIndex].src}
                alt={`${mflImgLinks[mflImgIndex].alt}`}
              />
            </div>
            <button type="button" onClick={goMFLNext}>
              →
            </button>
          </div>
        </div>
      )}

      {/**모달형식으로 마푸리 추가 다이얼로그를 띄운다. */}
      {isAddDialogOpen && (
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
                <label className="add-label">사진</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImgFileChange}
                />
              </div>
              {imgPreviews.length > 0 ? (
                <div className="add-row add-img-row">
                  <button type="button" onClick={goImgPrev}>
                    ←
                  </button>
                  <div id="add-img-wrap">
                    <img
                      id="add-preview-img"
                      src={imgPreviews[imgIndex]}
                      alt={`preview-${imgIndex}`}
                    />
                  </div>
                  <button type="button" onClick={goImgNext}>
                    →
                  </button>
                </div>
              ) : (
                <div></div>
              )}

              <div className="add-row">
                <button onClick={closeAddDialog}>닫기</button>
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
