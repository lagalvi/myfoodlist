import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//.env 환경변수 사용하기
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.SECRET_TOKEN;

export const generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

export const FRONT_END_URL = "http://localhost:3690";

export const Response = {
  SUCCESS: {
    code: 200,
    message: "성공",
  },
  FAIL: {
    code: 400,
    message: "서버 에러입니다.",
  },
  DUPLICATION_NAME: {
    code: 401,
    message: "아이디가 중복되었습니다.",
  },
  NOT_MATCH_ID: {
    code: 402,
    message: "해당 아이디가 없습니다.",
  },
  NOT_MATCH_PASSWORD: {
    code: 403,
    message: "비밀번호가 일치하지 않습니다.",
  },
  NOT_VERIFY_TOKEN: {
    code: 404,
    message: "유효하지 않은 사용자 입니다.",
  },

  ERROR_NAVER_API: {
    code: 405,
    message: "네이버 API 에러입니다.",
  },
  EMPTY_NAVER_GEOCODING: {
    code: 406,
    message: "입력한 주소의 정보가 없습니다.",
  },
  ERROR_INSERT_MFL: {
    code: 407,
    message: "마푸리 추가 실패했습니다.",
  },
  ERROR_SELECT_MFL: {
    code: 408,
    message: "마푸리 가져오기 실패했습니다",
  },
  ERROR_SELECT_USER_LIST: {
    code: 409,
    message: "사용자 가져오기 실패했습니다",
  },
};

//비밀번호 해싱
export const converHashPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

// 비밀번호 비교
export const comparePassword = async (password, hashedPassword) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};
