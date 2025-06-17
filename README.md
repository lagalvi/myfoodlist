# myfoodlist

My Food List Application

## DB

PostgreSQL 17.4 on x86_64-windows, compiled by msvc-19.42.34436, 64-bit

## TABLE

1.  mfl_users

```sql
    CREATE TABLE mfl_users (
    seq SERIAL PRIMARY KEY, -- 자동 증가하는 고유 번호
    user_id VARCHAR(50) NOT NULL UNIQUE, -- 아이디 (중복 불가)
    password VARCHAR(100) NOT NULL, -- 비밀번호
    name VARCHAR(50) NOT NULL, -- 이름
    phone VARCHAR(20), -- 전화번호
    email VARCHAR(100) -- 이메일
    );
```

2.  mfl_food

```sql
    CREATE TABLE mfl_food (
    seq SERIAL PRIMARY KEY, -- 고유 번호 (자동 증가)
    user_seq INTEGER NOT NULL, -- 음식점 등록한 사용자 번호
    name VARCHAR(100) NOT NULL, -- 음식점 상호명
    address VARCHAR(255) NOT NULL, -- 음식점 주소
    lat DECIMAL(9,6) NOT NULL, -- 위도 (소수점 6자리까지)
    lon DECIMAL(9,6) NOT NULL, -- 경도 (소수점 6자리까지)
    -- 사용자 테이블과 외래 키 연결
    CONSTRAINT fk_food_user
        FOREIGN KEY (user_seq)
        REFERENCES mfl_users(seq)
        ON DELETE CASCADE    -- 사용자 삭제 시 해당 음식점도 삭제

    );
```

3.  mfl_food_img

```sql
    CREATE TABLE mfl_food_image (
    seq SERIAL PRIMARY KEY, -- 고유 번호 (자동 증가)
    food_seq INTEGER NOT NULL, -- 이미지가 속한 음식점 번호
    user_seq INTEGER NOT NULL, -- 이미지를 등록한 사용자 번호
    image_path TEXT NOT NULL, -- 이미지 경로 (예: /img/food/abc.png)

    -- 음식점 테이블 외래 키 연결
    CONSTRAINT fk_image_food
        FOREIGN KEY (food_seq)
        REFERENCES mfl_food(seq)
        ON DELETE CASCADE, -- 음식점 삭제 시 해당 이미지도 삭제

    -- 사용자 테이블 외래 키 연결
    CONSTRAINT fk_image_user
        FOREIGN KEY (user_seq)
        REFERENCES mfl_users(seq)
        ON DELETE CASCADE  -- 사용자 삭제 시 해당 이미지도 삭제

    );
```
