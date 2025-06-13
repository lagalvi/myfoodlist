/**
 * 마푸리 지도를 보여주는 컴포넌트
 * Main으로 동작한다.
 * @returns
 */

import { useEffect } from "react";
import { menuName } from "./Main";
import "./MainMap.css";
import { useOutletContext } from "react-router-dom";
import { selectMFL } from "../Utils";
//import { useOutletContext } from "react-router-dom";

const MainMap = () => {
  //팝업을 띄운다.
  const showSelectMFL = async (item) => {
    console.log(item);
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

  const { selectUser } = useOutletContext();

  useEffect(() => {
    selectMFL(selectUser.seq).then((data) => {
      initNaverMap(data.result);
    });
  });

  return (
    <div id="map-container">
      <div className="right-title">
        {menuName.map} - {selectUser.name}
      </div>

      {/** 지도 */}
      <div id="naverMap" />
    </div>
  );
};

export default MainMap;
