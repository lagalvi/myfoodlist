export const SERVER_URL = "http://localhost:8888";

export const LOCAL_STORAGE_DATA = "userData";

const select = async (url, param) => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(param),
    });

    const data = res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

//마푸리 획득
export const selectMFL = async (seq) => {
  const url = `${SERVER_URL}/selectmfl`;
  const param = {
    user_seq: seq,
  };

  return select(url, param);
};

//사용자 목록
export const selectUserList = async (seq) => {
  const url = `${SERVER_URL}/selectuserlist`;
  const param = {
    user_seq: seq,
  };
  return select(url, param);
};

//선택된 마푸리 이미지 획득
export const selectMFLImages = async (userSeq, foodSeq) => {
  const url = `${SERVER_URL}/selectmflimages`;

  const param = {
    userSeq: userSeq,
    foodSeq: foodSeq,
  };
  return select(url, param);
};
