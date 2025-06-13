import express from "express";
import cors from "cors";
import { Pool } from "pg";
import multer from "multer";
import { fileURLToPath } from "url";
import path, { extname } from "path";
import fs from "fs/promises";

import {
  FRONT_END_URL,
  Response,
  comparePassword,
  converHashPassword,
  generateToken,
  verifyToken,
} from "./Utils.js";
import cookieParser from "cookie-parser";

//.env 환경변수 사용하기
//import dotenv from "dotenv";
//dotenv.config();

const PORT = process.env.PORT;

const app = express();

//Json 데이터 파싱
app.use(express.json());

//서버 접속 허용
app.use(
  cors({
    origin: FRONT_END_URL,
    credentials: true,
  })
);

app.use(cookieParser());

//postgre 설정
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "oaie",
  password: "7410",
  port: 5432,
});

app.get("/", async (req, res) => {
  res.send("서버 실행 완료");
});

//회원가입
app.post("/joinUser", async (req, res) => {
  //사용자 정보 획득
  const { user_id, password, name, phone, email } = req.body;

  const hashedPassword = await converHashPassword(password);

  //쿼리
  const query = `INSERT INTO mfl_users (user_id, password, name, phone, email) 
                values ($1, $2, $3, $4, $5)`;
  const values = [user_id, hashedPassword, name, phone, email];
  console.log(hashedPassword);
  pool
    .query(query, values)
    .then((result) => {
      //회원가입 성공
      res.send(Response.SUCCESS);
    })
    .catch((error) => {
      console.log(error);
      if (error.code === "23505") {
        //아이디 중복
        res.send(Response.DUPLICATION_NAME);
      } else {
        //기타 오류
        res.send(Response.FAIL);
      }
    });
});

//로그인
app.post("/login", async (req, res) => {
  const { user_id, password } = req.body;

  const query = `SELECT seq, password, user_id, name, phone, email
                 FROM mfl_users 
                 WHERE user_id=$1`;

  pool
    .query(query, [user_id])
    .then(async (data) => {
      if (data.rowCount === 0) {
        //아이디 해당 아이디 없음
        res.send(Response.NOT_MATCH_ID);
        return;
      }
      const user = data.rows[0];

      //입력된 비밀번호와 암호화된 비밀번호(DB)와 비교
      const isMatch = await comparePassword(password, user.password);

      if (!isMatch) {
        //비밀번호 불일치
        res.send(Response.NOT_MATCH_PASSWORD);
        return;
      }

      //로그인 성공
      //JWT 발급
      const token = generateToken({ user_id: user.user_id, seq: user.seq });

      //httpOnly 쿠키로 토큰 발급
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, //http 환경이면 true
        maxAge: 1000 * 60 * 60, // 한시간
        sameSite: "lax",
      });

      const response = {
        ...Response.SUCCESS,
        seq: user.seq,
        id: user.user_id,
        name: user.name,
        phone: user.phone,
        email: user.email,
      };
      res.send(response);
      return;
    })
    .catch((error) => {
      console.log(error);
      res.send(Response.FAIL);
    });
});

//로그인 상태 확인
app.get("/me", async (req, res) => {
  const token = req.cookies.token;

  //유효하지 않은 토큰 사용자자
  if (!token) {
    res.send(Response.NOT_VERIFY_TOKEN);
    return;
  }

  const decoded = verifyToken(token);

  //DB에서 사용자 정보 재 조회
  const query = `SELECT seq, user_id, name, phone, email FROM mfl_users
                   WHERE user_id=$1
                   AND seq=$2`;
  pool
    .query(query, [token.user_id, token.seq])
    .then(async (data) => {
      if (data.rowCount === 0) {
        res.send(Response.NOT_VERIFY_TOKEN);
        return;
      }
      const user = data.rows[0];
      const response = {
        ...Response.SUCCESS,
        seq: user.seq,
        id: user.user_id,
        name: user.name,
        phone: user.phone,
        email: user.email,
      };
      res.send(response);
    })
    .catch((error) => {
      console.log(error);
      res.send(Response.FAIL);
    });
});

//로그아웃
app.post("/logout", async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.send(Response.SUCCESS);
});

//지오 코딩
app.post("/geocoding", async (req, res) => {
  //주소 획득
  const { address } = req.body;

  const apiUrl = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${address}`;

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  fetch(apiUrl, {
    method: "GET",
    headers: {
      "x-ncp-apigw-api-key-id": clientId,
      "x-ncp-apigw-api-key": clientSecret,
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "OK") {
        console.log(data);

        if (data.meta.totalCount === 0) {
          res.send(Response.EMPTY_NAVER_GEOCODING);
          return;
        }

        const addressInfo = data.addresses[0];
        const result = {
          ...Response.SUCCESS,
          lat: addressInfo.y,
          lon: addressInfo.x,
          roadAddress: addressInfo.roadAddress,
        };

        res.send(result);
        return;
      }
    })
    .catch((err) => {
      console.log(err);
      res.send(Response.ERROR_NAVER_API);
      return;
    });
});

//multer : 메모리에 저장(나중에 직접 파일 저장)
const storage = multer.memoryStorage();
const upload = multer({ storage });

//마푸리 추가
app.post("/insertmfl", upload.array("images"), async (req, res) => {
  const { user_seq, name, address, comment, lat, lon } = req.body;
  const files = req.files;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    //1. mfl_food에 insert food seq를 반환
    const foodResult = await client.query(
      `INSERT INTO mfl_food 
                (user_seq, name, address, lat, lon, comment)
                values 
                ($1, $2, $3, $4, $5, $6)
                RETURNING seq`,
      [user_seq, name, address, lat, lon, comment]
    );

    const foodSeq = foodResult.rows[0].seq;

    //업로드 경로 설정
    const uploadDir = path.join(
      "uploads",
      "imgs",
      String(user_seq),
      String(foodSeq)
    );
    await fs.mkdir(uploadDir, {
      recursive: true, //디렉토리가 없으면 한번에 생성해주는 옵션
    });

    //mfl_food_img에 저장
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extName = path.extname(file.originalname); // 확장자 추출
      const fileName = `${i + 1}${extName}`; // ex) 0.png

      const foodPath = path.join(uploadDir, fileName);

      //db에 저장
      await client.query(
        `INSERT INTO mfl_food_image(food_seq, user_seq, image_path)
                    values
                    ($1, $2, $3)`,
        [foodSeq, user_seq, foodPath]
      );

      //이미지 파일 저장
      await fs.writeFile(foodPath, file.buffer);
    }

    await client.query("COMMIT");
    res.send(Response.SUCCESS);
  } catch (err) {
    //실패하면 복구
    console.log(err);
    await client.query("ROLLBACK");
    res.send(Response.ERROR_INSERT_MFL);
  } finally {
    client.release();
  }
});

//마푸리 가져오기
app.post("/selectmfl", async (req, res) => {
  const { user_seq } = req.body;
  const query = `SELECT seq, name, address, comment, lat, lon
                FROM mfl_food
                WHERE user_seq=$1`;
  pool
    .query(query, [user_seq])
    .then((data) => {
      const result = {
        ...Response.SUCCESS,
        result: data.rows,
      };
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
      res.send(Response.ERROR_SELECT_MFL);
    });
});

app.post("/selectuserlist", async (req, res) => {
  const { user_seq } = req.body;

  const query = `SELECT 
                  mu.seq, 
                  mu.user_id, 
                  mu.name, 
                  COUNT(mf.user_seq) AS food_count
                FROM 
                  mfl_users mu
                LEFT JOIN 
                  mfl_food mf 
                ON 
                  mu.seq = mf.user_seq
                GROUP BY 
                  mu.seq, mu.user_id, mu.name
                ORDER BY 
                  case when mu.seq=$1 then 0 else 1 end,
                  mu.seq ASC`;

  pool
    .query(query, [user_seq])
    .then((data) => {
      const result = {
        ...Response.SUCCESS,
        result: data.rows,
      };
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
      res.send(Response.ERROR_SELECT_USER_LIST);
    });
});

app.listen(PORT, () => {
  console.log(`${PORT}에서 서버 실행 중..`);
});
