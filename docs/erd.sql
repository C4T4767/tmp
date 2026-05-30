CREATE TYPE user_role AS ENUM (
  'USER', -- 일반 사용자
  'ADMIN' -- 관리자
);

CREATE TYPE product_status AS ENUM (
  'PENDING', -- 상품 등록 후 분석 대기
  'ANALYZING', -- 성분 추출 및 공공데이터 비교 중
  'SAFE', -- 안전
  'CAUTION', -- 주의
  'BLOCKED', -- 국내 반입차단 의심
  'FAILED' -- 크롤링 또는 분석 실패
);

CREATE TYPE ingredient_public_source_type AS ENUM (
  'ITEM_CLASSIFICATION', -- I2710 건강기능식품 품목분류정보: 품목명, 성분명, 기능성, 일일섭취량, 섭취주의사항
  'FUNCTIONAL_APPROVAL', -- I-0040 건강기능식품 기능성 원료인정현황: 인정번호, 인정일자, 업체명, 신청원료명, 기능성, 섭취주의사항
  'INDIVIDUAL_APPROVAL', -- I-0050 건강기능식품 개별인정형 정보: 원료인정번호, 원재료명, 기능성, 일일섭취량, 섭취주의사항
  'BLOCKED_IMPORT' -- 식품의약품안전처 해외직구식품 국내 반입차단 대상 원료성분: 원료성분명, 영문명, 기타명칭, 지정/해제일자, 사유
);

CREATE TYPE purchase_confirmation_status AS ENUM (
  'PENDING', -- 판매처로 이동했지만 구매 여부를 아직 확인하지 않음
  'PURCHASED', -- 사용자가 구매했다고 확인함
  'DISMISSED', -- 사용자가 구매하지 않았다고 확인함
  'EXPIRED' -- 오래된 확인 대기 항목이라 만료 처리됨
);

CREATE TYPE product_import_input_type AS ENUM (
  'URL_PASTE', -- 앱 안에서 사용자가 상품 URL을 붙여넣음
  'APP_SHARE' -- 다른 쇼핑몰 앱/브라우저의 공유하기로 우리 앱에 URL이 전달됨
);

CREATE TYPE product_import_job_status AS ENUM (
  'PENDING', -- 분석 작업 생성 후 대기
  'RUNNING', -- 분석 진행 중
  'COMPLETED', -- 분석 완료
  'FAILED' -- 분석 실패
);

CREATE TYPE group_join_request_status AS ENUM (
  'PENDING', -- 그룹 가입 신청 대기
  'APPROVED', -- 그룹 가입 승인
  'REJECTED', -- 그룹 가입 거절
  'CANCELED' -- 사용자가 가입 신청 취소
);

CREATE TYPE review_sentiment AS ENUM (
  'POSITIVE', -- 긍정 댓글 또는 긍정 관점
  'NEGATIVE', -- 부정 댓글 또는 부정 관점
  'OTHER' -- 중립, 정보성, 분류 어려움
);

CREATE TABLE users (
  id UUID PRIMARY KEY, -- 사용자 ID
  nickname VARCHAR(50) NOT NULL, -- 사용자 닉네임
  role user_role NOT NULL DEFAULT 'USER', -- 사용자 권한
  oauth_provider VARCHAR(50), -- 로그인 제공자: kakao 등
  oauth_provider_user_id VARCHAR(255), -- 로그인 제공자 기준 사용자 ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 사용자 생성 시각
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 사용자 수정 시각
  UNIQUE (oauth_provider, oauth_provider_user_id) -- 같은 소셜 계정 중복 가입 방지
);

CREATE TABLE user_onboardings (
  id UUID PRIMARY KEY, -- 사용자 온보딩 ID
  user_id UUID NOT NULL REFERENCES users(id), -- 사용자 ID
  version INTEGER NOT NULL, -- 사용자 온보딩 버전
  is_pregnant BOOLEAN NOT NULL DEFAULT false, -- 임산부 여부
  has_hypertension BOOLEAN NOT NULL DEFAULT false, -- 고혈압 여부
  has_hyperlipidemia BOOLEAN NOT NULL DEFAULT false, -- 고지혈증 여부
  has_diabetes BOOLEAN NOT NULL DEFAULT false, -- 당뇨 여부
  is_breastfeeding BOOLEAN NOT NULL DEFAULT false, -- 수유 여부
  is_child BOOLEAN NOT NULL DEFAULT false, -- 어린이 여부
  is_elderly BOOLEAN NOT NULL DEFAULT false, -- 고령자 여부
  is_caffeine_sensitive BOOLEAN NOT NULL DEFAULT false, -- 카페인 민감 여부
  additional_notes TEXT, -- 추가 건강 정보 또는 주의 성분 메모
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 온보딩 생성 시각
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 온보딩 수정 시각
  UNIQUE (user_id, version) -- 사용자별 온보딩 버전 중복 방지
);

CREATE TABLE groups (
  id UUID PRIMARY KEY, -- 그룹 ID
  name VARCHAR(100) NOT NULL, -- 그룹명
  invite_code VARCHAR(50) NOT NULL UNIQUE, -- 그룹 초대 코드
  owner_user_id UUID NOT NULL REFERENCES users(id), -- 그룹장 사용자 ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 그룹 생성 시각
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now() -- 그룹 수정 시각
);

CREATE TABLE group_members (
  id UUID PRIMARY KEY, -- 그룹 멤버 ID
  group_id UUID NOT NULL REFERENCES groups(id), -- 그룹 ID
  user_id UUID NOT NULL REFERENCES users(id), -- 사용자 ID
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 그룹 참여 시각
  UNIQUE (group_id, user_id) -- 같은 사용자의 중복 참여 방지
);

CREATE TABLE group_join_requests (
  id UUID PRIMARY KEY, -- 그룹 가입 신청 ID
  group_id UUID NOT NULL REFERENCES groups(id), -- 가입 신청한 그룹 ID
  user_id UUID NOT NULL REFERENCES users(id), -- 가입 신청한 사용자 ID
  status group_join_request_status NOT NULL DEFAULT 'PENDING', -- 가입 신청 상태
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 가입 신청 시각
  decided_at TIMESTAMPTZ, -- 승인/거절 처리 시각
  decided_by_user_id UUID REFERENCES users(id), -- 승인/거절 처리 사용자 ID
  UNIQUE (group_id, user_id) -- 같은 그룹에 중복 신청 방지
);

CREATE TABLE products (
  id UUID PRIMARY KEY, -- 상품 ID
  name VARCHAR(255) NOT NULL, -- 상품명
  brand VARCHAR(100), -- 정규화된 브랜드명
  product_line VARCHAR(255), -- 정규화된 제품 라인명
  form VARCHAR(100), -- 정규화된 제형
  package_quantity_value NUMERIC, -- 포장 수량 숫자
  package_quantity_unit VARCHAR(50), -- 포장 수량 단위
  canonical_key VARCHAR(500), -- 동일 상품 후보 매칭용 정규화 키
  image_url TEXT, -- 대표 이미지 URL
  status product_status NOT NULL DEFAULT 'PENDING', -- 상품 자체 분석 상태
  UNIQUE (canonical_key) -- 정규화 키 중복 방지
);

CREATE TABLE product_offers (
  id UUID PRIMARY KEY, -- 판매처 가격 ID
  product_id UUID NOT NULL REFERENCES products(id), -- 상품 ID
  store_name VARCHAR(100) NOT NULL, -- 판매처명
  price INTEGER NOT NULL, -- 상품 가격
  shipping_fee INTEGER NOT NULL DEFAULT 0, -- 배송비
  source_product_name VARCHAR(255), -- 판매처 원문 상품명
  product_url TEXT, -- 판매처 상품 URL
  crawled_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 가격 조회 시각
  UNIQUE (product_id, store_name) -- 상품별 판매처는 하나의 현재가만 유지
);

CREATE TABLE product_offer_reviews (
  id UUID PRIMARY KEY, -- 판매처 댓글 ID
  product_offer_id UUID NOT NULL REFERENCES product_offers(id), -- 댓글이 달린 판매처 상품 ID
  external_review_id VARCHAR(255), -- 쇼핑몰 원본 댓글 ID
  rating NUMERIC(2, 1), -- 쇼핑몰 원본 평점
  content TEXT NOT NULL, -- 댓글 원문
  sentiment review_sentiment, -- 댓글 단위 AI 감성 분류 결과
  written_at TIMESTAMPTZ, -- 쇼핑몰 원본 댓글 작성 시각
  crawled_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 댓글 수집 시각
  UNIQUE (product_offer_id, external_review_id) -- 같은 판매처 댓글 중복 수집 방지
);

CREATE TABLE product_offer_review_summaries (
  id UUID PRIMARY KEY, -- 판매처 댓글 요약 ID
  product_offer_id UUID NOT NULL REFERENCES product_offers(id), -- 요약 대상 판매처 상품 ID
  total_review_count INTEGER NOT NULL DEFAULT 0, -- 요약에 사용한 전체 댓글 수
  positive_count INTEGER NOT NULL DEFAULT 0, -- 긍정 댓글 수
  negative_count INTEGER NOT NULL DEFAULT 0, -- 부정 댓글 수
  other_count INTEGER NOT NULL DEFAULT 0, -- 기타 댓글 수
  positive_ratio NUMERIC(5, 2) NOT NULL DEFAULT 0, -- 긍정 비율
  negative_ratio NUMERIC(5, 2) NOT NULL DEFAULT 0, -- 부정 비율
  other_ratio NUMERIC(5, 2) NOT NULL DEFAULT 0, -- 기타 비율
  summary TEXT NOT NULL, -- 판매처별 댓글 종합 요약
  ai_model VARCHAR(100), -- 요약에 사용한 AI 모델명
  summarized_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 요약 생성 시각
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 요약 수정 시각
  UNIQUE (product_offer_id) -- 판매처 상품당 최신 댓글 요약은 하나만 유지
);

CREATE TABLE product_offer_review_topics (
  id UUID PRIMARY KEY, -- 판매처 댓글 관점 요약 ID
  review_summary_id UUID NOT NULL REFERENCES product_offer_review_summaries(id), -- 댓글 요약 ID
  topic_name VARCHAR(100) NOT NULL, -- 관점명: 배송, 가격, 품질, 포장, 효과 등
  sentiment review_sentiment NOT NULL, -- 관점별 감성
  review_count INTEGER NOT NULL DEFAULT 0, -- 해당 관점에 포함된 댓글 수
  summary TEXT NOT NULL, -- 관점별 요약 문구
  example_reviews JSONB, -- 대표 댓글 예시 목록
  sort_order INTEGER NOT NULL DEFAULT 0 -- 화면 표시 순서
);

CREATE TABLE product_import_jobs (
  id UUID PRIMARY KEY, -- 상품 링크 분석 작업 ID
  user_id UUID NOT NULL REFERENCES users(id), -- 분석을 요청한 사용자 ID
  input_type product_import_input_type NOT NULL, -- URL 입력 방식
  source_url TEXT NOT NULL, -- 분석할 원본 상품 URL
  detected_store_name VARCHAR(100), -- URL로 판별한 쇼핑몰명
  status product_import_job_status NOT NULL DEFAULT 'PENDING', -- 분석 작업 상태
  product_id UUID REFERENCES products(id), -- 분석 완료 후 연결된 상품 ID
  error_message TEXT, -- 분석 실패 사유
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 작업 생성 시각
  started_at TIMESTAMPTZ, -- 분석 시작 시각
  completed_at TIMESTAMPTZ -- 분석 완료 또는 실패 시각
);

CREATE TABLE user_favorite_offers (
  id UUID PRIMARY KEY, -- 사용자 관심 판매처 ID
  user_id UUID NOT NULL REFERENCES users(id), -- 사용자 ID
  product_offer_id UUID NOT NULL REFERENCES product_offers(id), -- 관심 등록한 판매처 가격 ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 관심 등록 시각
  UNIQUE (user_id, product_offer_id) -- 같은 판매처 중복 등록 방지
);

CREATE TABLE group_favorite_products (
  id UUID PRIMARY KEY, -- 그룹 관심 상품 ID
  group_id UUID NOT NULL REFERENCES groups(id), -- 그룹 ID
  product_id UUID NOT NULL REFERENCES products(id), -- 상품 ID
  created_by_user_id UUID NOT NULL REFERENCES users(id), -- 그룹 관심 상품을 추가한 사용자 ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 그룹 관심 상품 등록 시각
  UNIQUE (group_id, product_id) -- 같은 그룹의 같은 상품 중복 등록 방지
);

CREATE TABLE purchase_confirmation_checks (
  id UUID PRIMARY KEY, -- 구매 여부 확인 ID
  user_id UUID NOT NULL REFERENCES users(id), -- 판매처 바로가기를 누른 사용자 ID
  product_id UUID NOT NULL REFERENCES products(id), -- 확인 대상 상품 ID
  product_offer_id UUID NOT NULL REFERENCES product_offers(id), -- 이동한 판매처 가격 ID
  group_id UUID REFERENCES groups(id), -- 그룹 관심품목에서 이동한 경우의 그룹 ID
  status purchase_confirmation_status NOT NULL DEFAULT 'PENDING', -- 구매 여부 확인 상태
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 판매처 바로가기를 누른 시각
  checked_at TIMESTAMPTZ, -- 사용자가 구매 여부를 답한 시각
  expires_at TIMESTAMPTZ, -- 구매 여부 확인을 더 이상 묻지 않을 만료 시각
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 확인 항목 생성 시각
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now() -- 확인 항목 수정 시각
);

CREATE TABLE purchase_records (
  id UUID PRIMARY KEY, -- 구매 기록 ID
  user_id UUID NOT NULL REFERENCES users(id), -- 구매한 사용자 ID
  product_id UUID NOT NULL REFERENCES products(id), -- 구매한 상품 ID
  product_offer_id UUID NOT NULL REFERENCES product_offers(id), -- 구매하러 이동한 판매처 가격 ID
  purchase_confirmation_check_id UUID REFERENCES purchase_confirmation_checks(id), -- 구매 확인 대기 항목을 통해 확정된 경우의 확인 ID
  group_id UUID REFERENCES groups(id), -- 그룹 관심품목에서 구매한 경우의 그룹 ID
  purchased_price INTEGER NOT NULL, -- 구매 기록 당시 상품 가격
  shipping_fee INTEGER NOT NULL DEFAULT 0, -- 구매 기록 당시 배송비
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 사용자가 구매했다고 기록한 시각
  created_at TIMESTAMPTZ NOT NULL DEFAULT now() -- 구매 기록 생성 시각
);

CREATE TABLE ingredients (
  id UUID PRIMARY KEY, -- 성분 ID
  name_ko VARCHAR(255) NOT NULL, -- 표준 성분 한글명
  name_en VARCHAR(255), -- 성분 영문명
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 성분 생성 시각
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now() -- 성분 수정 시각
);

CREATE TABLE ingredient_aliases (
  id UUID PRIMARY KEY, -- 성분 별칭 ID
  ingredient_id UUID NOT NULL REFERENCES ingredients(id), -- 표준 성분 ID
  normalized_alias VARCHAR(255) NOT NULL, -- 검색 및 매칭용 정규화 성분명 또는 별칭
  UNIQUE (normalized_alias) -- 같은 검색어가 여러 성분에 매칭되는 것 방지
);

CREATE TABLE ingredient_public_sources (
  id UUID PRIMARY KEY, -- 공공데이터 성분 근거 ID
  ingredient_id UUID NOT NULL REFERENCES ingredients(id), -- 성분 ID
  source_type ingredient_public_source_type NOT NULL, -- 사용한 공공 API 유형
  name VARCHAR(255) NOT NULL, -- API 기준 이름: I2710 PRDCT_NM, I-0040 APLC_RAWMTRL_NM, I-0050 RAWMTRL_NM, 반입차단 원료성분명
  functionality TEXT, -- I2710 PRIMARY_FNCLTY, I-0040 FNCLTY_CN, I-0050 PRIMARY_FNCLTY: 기능성 내용
  daily_intake_min_text VARCHAR(100), -- I2710 DAY_INTK_LOWLIMIT, I-0050 DAY_INTK_LOWLIMIT: 일일 섭취량 하한 원문
  daily_intake_max_text VARCHAR(100), -- I2710 DAY_INTK_HIGHLIMIT, I-0050 DAY_INTK_HIGHLIMIT: 일일 섭취량 상한 원문
  daily_intake_unit VARCHAR(50), -- I2710 INTK_UNIT, I-0050 WT_UNIT: 일일 섭취량 단위
  intake_note TEXT, -- I2710 INTK_MEMO 또는 I-0040 DAY_INTK_CN: 섭취량 비고/문장형 섭취량
  warning TEXT, -- I2710/I-0040/I-0050 IFTKN_ATNT_MATR_CN 또는 반입차단 지정 사유: 주의사항/차단 근거
  source_created_date DATE, -- I2710 CRET_DTM: 원천 데이터 최초 등록일
  source_updated_date DATE, -- I2710 LAST_UPDT_DTM: 원천 데이터 최종 수정일
  raw_payload JSONB NOT NULL, -- 원천 API 응답 row 전체
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 공공데이터 동기화 시각
  UNIQUE (ingredient_id, source_type) -- 성분당 공공 API별 근거는 하나만 유지
);

CREATE TABLE product_ingredients (
  id UUID PRIMARY KEY, -- 상품 성분 ID
  product_id UUID NOT NULL REFERENCES products(id), -- 상품 ID
  ingredient_id UUID NOT NULL REFERENCES ingredients(id), -- 성분 ID
  display_name VARCHAR(255) NOT NULL, -- 상품 페이지에 표시된 성분명
  amount_value NUMERIC, -- 숫자로 파싱한 성분 함량
  amount_text VARCHAR(100), -- 성분 함량 원문
  unit VARCHAR(30), -- 성분 함량 단위
  source_text TEXT -- 성분 추출 근거 원문
);

CREATE TABLE product_ingredient_analyses (
  id UUID PRIMARY KEY, -- 성분 분석 ID
  product_id UUID NOT NULL REFERENCES products(id), -- 상품 ID
  product_ingredient_id UUID NOT NULL REFERENCES product_ingredients(id), -- 상품 성분 ID
  status product_status NOT NULL, -- 성분 안전 분석 상태
  reason TEXT, -- 분석 사유 또는 근거 설명
  source VARCHAR(100), -- 분석 근거 출처
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now() -- 분석 시각
);

CREATE TABLE user_ingredient_cautions (
  id UUID PRIMARY KEY, -- 사용자별 성분 주의 캐시 ID
  user_id UUID NOT NULL REFERENCES users(id), -- 사용자 ID
  ingredient_id UUID NOT NULL REFERENCES ingredients(id), -- 성분 ID
  onboarding_version INTEGER NOT NULL, -- 분석에 사용한 사용자 온보딩 버전
  status product_status NOT NULL, -- 사용자 기준 성분 상태
  caution_text TEXT, -- 사용자 건강정보 기준 주의 문구
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 캐시 생성 시각
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 캐시 수정 시각
  UNIQUE (user_id, ingredient_id, onboarding_version) -- 같은 온보딩 버전에서는 성분별 주의 분석을 한 번만 유지
);
