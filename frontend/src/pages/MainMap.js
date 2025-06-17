/**
 * 마푸리 지도를 보여주는 컴포넌트
 * Main으로 동작한다.
 * @returns
 */

import { useEffect, useState } from "react";
import { menuName } from "./Main";
import "./MainMap.css";
import { useOutletContext } from "react-router-dom";
import { selectMFL, selectMFLImages, SERVER_URL } from "../Utils";

const MainMap = () => {
  const { selectUser } = useOutletContext();

  const [selectedMFL, setSelectedMFL] = useState({});
  const [isMFLDialog, setIsMFLDialog] = useState(false);

  const [imgIndex, setImgIndex] = useState(0);

  //팝업을 띄운다.
  const showSelectMFL = async (item) => {
    setImgIndex(0);

    const images = await selectMFLImages(selectUser.seq, item.seq);

    setSelectedMFL({
      ...item,
      imageList: images.result,
    });

    setIsMFLDialog(true);
  };

  //네이버 맵 초기화 함수
  const initNaverMap = async (mfl) => {
    const mapOptions = {
      center: new window.naver.maps.LatLng(37.5665, 126.978),
      zoom: 13,
    };
    const map = new window.naver.maps.Map("naverMap", mapOptions);

    if (mfl.length === 0) return;

    mfl.forEach((item) => {
      //마커 생성
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(item.lat, item.lon),
        map: map,
        id: item.seq,
        icon: {
          url: "marker.png",
          size: new window.naver.maps.Size(30, 40.8),
          scaledSize: new window.naver.maps.Size(30, 40.8),
          origin: new window.naver.maps.Point(0, 0),
          anchor: new window.naver.maps.Point(15, 40.8),
        },
      });

      //마커 클릭 이벤트 등록
      window.naver.maps.Event.addListener(marker, "click", () => {
        const item = mfl.find((object) => object.seq === marker.id);
        showSelectMFL(item);
      });
    });

    //마커들이 다 보이도록 fitBounds 설정
    const bounds = new window.naver.maps.LatLngBounds();
    mfl.forEach((item) => {
      const coord = new window.naver.maps.LatLng(item.lat, item.lon);
      bounds.extend(coord);
    });
    map.fitBounds(bounds);
  };

  //초기화
  useEffect(() => {
    selectMFL(selectUser.seq).then((data) => {
      initNaverMap(data.result);
    });
  });

  const goMFLPrev = () => {
    setImgIndex((prev) =>
      prev === 0 ? selectedMFL.imageList.length - 1 : prev - 1
    );
  };

  const goMFLNext = () => {
    setImgIndex((prev) =>
      prev === selectedMFL.imageList.length - 1 ? 0 : prev + 1
    );
  };
  return (
    <div id="map-container">
      <div className="right-title">
        {menuName.map} - {selectUser.name}
      </div>

      {/** 지도 */}
      <div id="naverMap" />

      {/**마푸리 클릭 다이얼로그 */}
      {isMFLDialog && (
        <div
          className="map-mfl-dialog-backdrop"
          onClick={() => setIsMFLDialog(false)}
        >
          <div className="map-mfl-dialog" onClick={(e) => e.stopPropagation()}>
            <h1>{selectedMFL.name}</h1>
            <div className="map-mfl-dialog-row">
              <label className="map-mfl-dialog-label">주소</label>
              <div className="map-mfl-dialog-value">{selectedMFL.address}</div>
            </div>
            <div className="map-mfl-dialog-row">
              <label className="map-mfl-dialog-label">의견</label>
              <div className="map-mfl-dialog-value">{selectedMFL.comment}</div>
            </div>
            <div className="map-mfl-dialog-row map-mfl-dialog-img-row-wrap">
              <button type="button" onClick={goMFLPrev}>
                ←
              </button>
              <div className="map-mfl-dialog-img-wrap">
                {selectedMFL.imageList.length > 0 ? (
                  <img
                    src={`${SERVER_URL}/${selectedMFL.imageList[imgIndex].image_path}`}
                    alt={`${selectedMFL.name}${imgIndex}`}
                  />
                ) : (
                  <div>이미지가 없습니다.</div>
                )}
              </div>
              <button type="button" onClick={goMFLNext}>
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMap;
