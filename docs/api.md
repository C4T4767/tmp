# API 문서

## 홈

### GET /api/products/top-searches

홈 화면의 실시간 검색 TOP 10 상품 목록을 조회한다.

#### Response

```json
{
  "items": [
    {
      "rank": 1,
      "id": "product-id",
      "name": "나우푸드 멜라토닌 3mg",
      "imageUrl": "https://example.com/product.jpg",
      "status": "SAFE",
      "score": 128
    }
  ]
}
```

#### Rules

- Redis `search:rank:realtime` Sorted Set에서 TOP 10 product_id를 조회한다.
- Redis에는 product_id만 저장한다.
- 상품명, 이미지 URL, 상품 상태는 PostgreSQL `products` 테이블에서 조회한다.
- 응답 순서는 Redis score 내림차순을 따른다.
- 상품 클릭 시 `/product/{id}` 상세 화면으로 이동한다.

#### Related Storage

- PostgreSQL: `products`
- Redis: `search:rank:realtime`

### GET /api/purchase-confirmation-checks/pending

홈 진입 시 아직 답하지 않은 구매 여부 확인 항목을 조회한다.

#### Response

```json
{
  "items": [
    {
      "checkId": "purchase-confirmation-check-id",
      "product": {
        "id": "product-id",
        "name": "Nature Made 멀티비타민",
        "imageUrl": null
      },
      "offer": {
        "id": "offer-id",
        "storeName": "iHerb",
        "price": 25900,
        "shippingFee": 4500,
        "totalPrice": 30400,
        "productUrl": "https://example.com/source-product"
      },
      "group": {
        "id": "group-id",
        "name": "우리 가족"
      },
      "openedAt": "2026-05-30T00:00:00+09:00"
    }
  ]
}
```

#### Rules

- 앱을 껐다 켜거나 홈 화면에 진입할 때 호출한다.
- 로그인 사용자의 `purchase_confirmation_checks.status = PENDING` 항목만 조회한다.
- 만료 시간이 지난 항목은 `EXPIRED`로 바꾼 뒤 응답에서 제외한다.
- 가장 최근에 판매처로 이동한 항목부터 보여준다.
- 응답이 있으면 홈에서 “구매하셨나요?” 확인 UI를 표시한다.
- 자동 모달 표시 여부는 클라이언트 쿠키로 제어한다.
- 쿠키가 꺼져 있어도 API는 pending 항목을 그대로 내려준다.

#### Related Tables

- `purchase_confirmation_checks`
- `products`
- `product_offers`
- `groups`

## 인증과 내 정보

### POST /api/auth/kakao

카카오 로그인 결과로 받은 인증 정보를 사용해 로그인 또는 회원가입을 처리한다.

#### Request

```json
{
  "authorizationCode": "kakao-authorization-code"
}
```

#### Response

```json
{
  "accessToken": "service-access-token",
  "refreshToken": "service-refresh-token",
  "kakaoProfile": {
    "nickname": "카카오사용자"
  },
  "user": {
    "id": "user-id",
    "nickname": "카카오사용자",
    "role": "USER",
    "isOnboarded": false
  }
}
```

#### Rules

- 카카오 사용자 ID를 `users.oauth_provider = kakao`, `users.oauth_provider_user_id`로 저장한다.
- 카카오 프로필 닉네임을 회원가입 화면 닉네임 input의 기본값으로 사용한다.
- 처음 로그인한 사용자는 `users`에 생성한다.
- 이미 가입된 사용자는 기존 사용자를 반환한다.
- 온보딩 최신 버전이 있으면 `isOnboarded = true`로 응답한다.
- 사용자가 회원가입 화면에서 닉네임을 수정하면 수정한 값을 `users.nickname`으로 저장한다.
- access token과 refresh token을 JWT로 발급한다.
- access token은 짧은 만료 시간을 가진다.
- refresh token은 JWT `jti`를 `token_id`로 사용하고 Redis 화이트리스트에 저장한다.
- Redis 화이트리스트에 저장된 refresh token만 재발급에 사용할 수 있다.

#### Related Tables

- `users`
- `user_onboardings`

#### Related Redis Keys

- `auth:refresh:{user_id}:{token_id}`
- `auth:user-sessions:{user_id}`

### POST /api/auth/refresh

refresh token으로 새 access token과 refresh token을 발급한다.

#### Request

```json
{
  "refreshToken": "service-refresh-token"
}
```

#### Response

```json
{
  "accessToken": "new-service-access-token",
  "refreshToken": "new-service-refresh-token"
}
```

#### Rules

- refresh token JWT 서명과 만료 시간을 검증한다.
- refresh token의 `sub`는 사용자 ID, `jti`는 token_id로 사용한다.
- Redis `auth:refresh:{user_id}:{token_id}`에 해당 token_id가 없으면 재발급을 거부한다.
- 재발급 성공 시 기존 refresh token 키를 삭제한다.
- 새 refresh token을 발급하고 새 `auth:refresh:{user_id}:{new_token_id}`를 저장한다.
- `auth:user-sessions:{user_id}`에서도 기존 token_id를 제거하고 새 token_id를 추가한다.
- access token도 새로 발급한다.

#### Related Tables

- `users`

#### Related Redis Keys

- `auth:refresh:{user_id}:{token_id}`
- `auth:user-sessions:{user_id}`

### POST /api/auth/logout

현재 로그인 세션을 로그아웃한다.

#### Request

```json
{
  "refreshToken": "service-refresh-token"
}
```

#### Response

```json
{
  "loggedOut": true
}
```

#### Rules

- refresh token의 `sub`, `jti`를 읽는다.
- Redis `auth:refresh:{user_id}:{token_id}`를 삭제한다.
- Redis `auth:user-sessions:{user_id}`에서 token_id를 제거한다.
- access token을 즉시 무효화해야 하면 access token의 남은 만료 시간만큼 `auth:access:blocklist:{access_token_jti}`를 저장한다.
- 로그아웃 후 같은 refresh token으로는 재발급할 수 없다.

#### Related Redis Keys

- `auth:refresh:{user_id}:{token_id}`
- `auth:user-sessions:{user_id}`
- `auth:access:blocklist:{token_id}`

### 인증 미들웨어

로그인이 필요한 API 요청의 access token을 검증한다.

#### Rules

- `Authorization: Bearer {accessToken}` 헤더를 사용한다.
- access token JWT 서명과 만료 시간을 검증한다.
- access token의 `sub`를 로그인 사용자 ID로 사용한다.
- access token의 `jti`가 Redis `auth:access:blocklist:{token_id}`에 있으면 거부한다.
- access token이 만료되면 클라이언트는 `POST /api/auth/refresh`로 재발급한다.

#### Related Redis Keys

- `auth:access:blocklist:{token_id}`

### GET /api/me

로그인 사용자의 기본 정보를 조회한다.

#### Response

```json
{
  "id": "user-id",
  "nickname": "홍길동",
  "role": "USER",
  "isOnboarded": true
}
```

#### Related Tables

- `users`
- `user_onboardings`

### PATCH /api/me/nickname

마이페이지에서 닉네임을 변경한다.

#### Request

```json
{
  "nickname": "새닉네임"
}
```

#### Response

```json
{
  "id": "user-id",
  "nickname": "새닉네임"
}
```

#### Related Tables

- `users`

## 온보딩

### POST /api/onboardings

회원가입 또는 온보딩 수정 화면에서 건강 정보를 저장한다.

#### Request

```json
{
  "isPregnant": false,
  "hasHypertension": true,
  "hasHyperlipidemia": false,
  "hasDiabetes": false,
  "isBreastfeeding": false,
  "isChild": false,
  "isElderly": false,
  "isCaffeineSensitive": true,
  "additionalNotes": "복용 중인 약 있음"
}
```

#### Response

```json
{
  "onboardingId": "onboarding-id",
  "version": 3
}
```

#### Rules

- 기존 온보딩 row를 수정하지 않고 새 `version`으로 저장한다.
- 사용자별 다음 버전 번호를 계산해 `user_onboardings`에 insert한다.
- 새 버전 저장 후 기존 `user_ingredient_cautions` 캐시는 삭제하지 않는다.
- 이후 상품 상세 분석에서는 최신 온보딩 버전 기준 캐시를 새로 조회하거나 생성한다.

#### Related Tables

- `user_onboardings`
- `user_ingredient_cautions`

### GET /api/onboardings/me/latest

로그인 사용자의 최신 온보딩 정보를 조회한다.

#### Response

```json
{
  "version": 3,
  "isPregnant": false,
  "hasHypertension": true,
  "hasHyperlipidemia": false,
  "hasDiabetes": false,
  "isBreastfeeding": false,
  "isChild": false,
  "isElderly": false,
  "isCaffeineSensitive": true,
  "additionalNotes": "복용 중인 약 있음"
}
```

#### Related Tables

- `user_onboardings`

## 그룹

### GET /api/groups

내가 참여 중인 그룹 목록을 조회한다.

#### Response

```json
{
  "items": [
    {
      "id": "group-id",
      "name": "우리 가족",
      "memberCount": 4,
      "onboardedCount": 3,
      "inviteCode": "FAM2024",
      "ownerUserId": "user-id"
    }
  ]
}
```

#### Related Tables

- `groups`
- `group_members`
- `user_onboardings`

### POST /api/groups

새 그룹을 생성한다.

#### Request

```json
{
  "name": "우리 가족"
}
```

#### Response

```json
{
  "id": "group-id",
  "name": "우리 가족",
  "inviteCode": "FAM2024"
}
```

#### Rules

- 생성 사용자를 `groups.owner_user_id`로 저장한다.
- 생성 사용자를 즉시 `group_members`에 추가한다.
- `inviteCode`는 중복되지 않게 생성한다.

#### Related Tables

- `groups`
- `group_members`

### GET /api/groups/search

그룹명 또는 초대코드로 참가 가능한 그룹을 검색한다.

#### Query Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| keyword | string | true | 그룹명 또는 초대코드 |

#### Response

```json
{
  "items": [
    {
      "id": "group-id",
      "name": "건강 관리 모임",
      "leaderName": "이영희",
      "memberCount": 12
    }
  ]
}
```

#### Related Tables

- `groups`
- `users`
- `group_members`

### POST /api/groups/{groupId}/join-requests

선택한 그룹에 가입 신청을 보낸다.

#### Response

```json
{
  "joinRequestId": "join-request-id",
  "status": "PENDING"
}
```

#### Rules

- 이미 그룹 멤버이면 새 신청을 만들지 않는다.
- 같은 그룹에 대기 중인 신청이 있으면 기존 신청을 반환한다.
- 승인 전까지는 `group_members`에 추가하지 않는다.

#### Related Tables

- `group_join_requests`
- `group_members`

### GET /api/groups/{groupId}

그룹 상세와 그룹원 목록을 조회한다.

#### Response

```json
{
  "id": "group-id",
  "name": "우리 가족",
  "inviteCode": "FAM2024",
  "memberCount": 4,
  "members": [
    {
      "id": "user-id",
      "nickname": "홍길동",
      "isOnboarded": true
    }
  ]
}
```

#### Related Tables

- `groups`
- `group_members`
- `users`
- `user_onboardings`

### DELETE /api/groups/{groupId}

그룹을 삭제한다.

#### Response

```json
{
  "deleted": true
}
```

#### Rules

- 그룹장만 삭제할 수 있다.
- 그룹 삭제 시 그룹 관심상품, 구매내역의 `group_id` 처리 정책을 함께 정해야 한다.

#### Related Tables

- `groups`
- `group_members`
- `group_favorite_products`
- `purchase_records`

## 상품 링크 분석

### POST /api/product-imports

사용자가 붙여넣거나 다른 앱에서 공유한 상품 URL 분석 작업을 생성한다.

#### Request

```json
{
  "url": "https://kr.iherb.com/pr/california-gold-nutrition-gold-c-vitamin-c-1000-mg-60-veggie-capsules/61864",
  "inputType": "URL_PASTE"
}
```

#### Response

```json
{
  "jobId": "import-job-id"
}
```

#### Rules

- 요청 URL의 쇼핑몰을 판별한다.
- `product_import_jobs`에 분석 작업을 생성한 뒤 즉시 `jobId`를 반환한다.
- `inputType`은 `URL_PASTE` 또는 `APP_SHARE`이다.
- 실제 분석 진행 상태는 SSE API로 전달한다.
- 원본 URL의 판매처 가격은 같은 상품 검증 없이 확정 판매처로 저장할 수 있다.
- 다른 쇼핑몰은 URL이 있으면 직접 수집하고, URL이 없으면 검색 결과 상위 10개를 후보로 수집한다.
- 검색 후보는 LLM으로 같은 상품 여부를 검증한 뒤 통과한 것만 `product_offers`에 upsert한다.
- 판매처별 댓글 수집이 가능하면 `product_offer_reviews`에 저장하고 AI 요약 결과를 판매처별로 저장한다.
- 분석 완료 시 `product_import_jobs.product_id`에 상품 ID를 저장한다.
- 앱 공유하기로 들어온 URL도 같은 API를 사용한다.

#### Related Tables

- `product_import_jobs`
- `products`
- `product_offers`
- `product_offer_reviews`
- `product_offer_review_summaries`
- `product_offer_review_topics`

### GET /api/product-imports/{jobId}/events

상품 링크 분석 작업의 진행 상태를 SSE로 구독한다.

#### Event Stream

```text
event: STORE_DETECTED
data: {"message":"쇼핑몰을 확인했습니다.","storeName":"iHerb"}

event: SOURCE_CRAWLED
data: {"message":"원본 상품 정보를 수집했습니다."}

event: INGREDIENTS_EXTRACTED
data: {"message":"성분 정보를 추출했습니다.","ingredientCount":4}

event: SAFETY_ANALYZED
data: {"message":"공공데이터 기준 안전 분석을 완료했습니다."}

event: PRICE_CANDIDATES_SEARCHED
data: {"message":"다른 쇼핑몰 가격 후보를 검색했습니다.","candidateCount":10}

event: OFFERS_MATCHED
data: {"message":"같은 상품으로 확인된 판매처를 저장했습니다.","matchedStoreCount":2}

event: REVIEWS_SUMMARIZED
data: {"message":"판매처별 댓글 요약을 만들었습니다.","summarizedStoreCount":2}

event: COMPLETED
data: {"productId":"product-id","lowestTotalPrice":23000,"matchedStores":["iHerb","Coupang"],"unmatchedStores":["Amazon","11번가"]}
```

#### Error Event

```text
event: FAILED
data: {"message":"상품 정보를 분석하지 못했습니다."}
```

#### Service Flow

- `STORE_DETECTED`: URL 기반 쇼핑몰을 판별한다.
- `SOURCE_CRAWLED`: 원본 상품명, 이미지, 가격, 배송비, 옵션 정보를 수집한다.
- `INGREDIENTS_EXTRACTED`: 원본 상품 정보에서 성분명과 함량을 추출한다.
- `SAFETY_ANALYZED`: 성분 별칭 매칭, 공공데이터 근거 조회, 성분별 최종 분석 결과 저장을 수행한다.
- `PRICE_CANDIDATES_SEARCHED`: 다른 쇼핑몰에서 검색 결과 상위 10개를 후보로 수집한다.
- `OFFERS_MATCHED`: 기준 상품과 후보를 LLM으로 비교하고 같은 상품만 `product_offers`에 upsert한다.
- `REVIEWS_SUMMARIZED`: 판매처별 댓글을 수집할 수 있으면 긍정, 부정, 기타와 관점별 요약을 저장한다.
- `COMPLETED`: 상품 상세로 이동할 수 있는 `productId`와 검증된 판매처 요약을 반환한다.
- `FAILED`: 분석 실패 사유를 반환한다.

#### Related Tables

- `product_import_jobs`
- `products`
- `product_offers`
- `product_offer_reviews`
- `product_offer_review_summaries`
- `product_offer_review_topics`
- `ingredients`
- `ingredient_aliases`
- `ingredient_public_sources`
- `product_ingredients`
- `product_ingredient_analyses`

### POST /api/app-shares/product-url

다른 쇼핑몰 앱이나 브라우저의 공유하기로 전달된 상품 URL을 분석 작업으로 등록한다.

#### Request

```json
{
  "sharedUrl": "https://kr.iherb.com/pr/example-product/12345"
}
```

#### Response

```json
{
  "jobId": "import-job-id",
  "eventsUrl": "/api/product-imports/import-job-id/events"
}
```

#### Rules

- 모바일 앱의 공유 확장 또는 딥링크 진입부에서 호출한다.
- 내부적으로 `POST /api/product-imports`와 같은 분석 파이프라인을 사용한다.
- `product_import_jobs.input_type`은 `APP_SHARE`로 저장한다.
- 클라이언트는 `eventsUrl`로 진행 상태를 구독한다.
- 분석이 완료되면 SSE `COMPLETED` 이벤트의 `productId`를 사용해 상품 상세 화면으로 이동한다.
- 이미 같은 URL로 완료된 상품이 있으면 새 분석 대신 기존 상품 상세로 이동할 수 있다.

#### Related Tables

- `product_import_jobs`
- `products`
- `product_offers`

## 상품 검색

### GET /api/products/search

검색어에 맞는 상품 목록과 상품별 판매처 가격을 조회한다.

#### Query Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| keyword | string | true | 상품명 또는 성분명 검색어 |

#### Response

```json
{
  "items": [
    {
      "id": "product-id",
      "name": "Nature Made 멀티비타민",
      "imageUrl": null,
      "status": "SAFE",
      "matchedIngredientName": "비타민 C",
      "offers": [
        {
          "id": "offer-id",
          "storeName": "iHerb",
          "price": 25900,
          "shippingFee": 4500,
          "totalPrice": 30400,
          "crawledAt": "2026-05-30T00:00:00+09:00"
        }
      ]
    },
    {
      "id": "product-id",
      "name": "Swanson 프로바이오틱스",
      "imageUrl": null,
      "status": "BLOCKED",
      "matchedIngredientName": null,
      "offers": []
    }
  ]
}
```

#### Rules

- 상품명 기준 검색 결과와 성분명 기준 검색 결과를 함께 조회한다.
- 성분명 검색은 `ingredient_aliases.normalized_alias` 기준으로 표준 성분을 찾고, `product_ingredients`에서 해당 성분이 들어간 상품을 찾는다.
- 상품명 검색 결과와 성분명 검색 결과가 같은 상품을 포함하면 `product_id` 기준으로 중복 제거한다.
- 상품명과 성분명이 모두 매칭된 상품은 한 번만 응답한다.
- `status`가 `BLOCKED`인 상품은 판매처 가격 대신 금지품목 경고를 표시한다.
- `status`가 `BLOCKED`가 아닌 상품은 `offers`를 `totalPrice` 오름차순으로 표시한다.
- `totalPrice`는 `price + shippingFee` 값이다.
- 검색 목록에서는 상품 행 클릭 시 `/product/{id}` 상세 화면으로 이동한다.
- 검색 목록에서는 판매처 가격을 버튼이나 링크처럼 표현하지 않는다.

#### Related Tables

- `products`
- `product_offers`
- `ingredients`
- `ingredient_aliases`
- `product_ingredients`

## 관심품목

### GET /api/favorites

내 관심 판매처 목록을 조회한다.

#### Query Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| keyword | string | false | 관심품목 내 상품명 검색어 |
| sort | string | false | `name` 또는 `price` |

#### Response

```json
{
  "items": [
    {
      "favoriteId": "favorite-id",
      "product": {
        "id": "product-id",
        "name": "Nature Made 멀티비타민",
        "imageUrl": null,
        "status": "SAFE"
      },
      "offer": {
        "id": "offer-id",
        "storeName": "iHerb",
        "price": 25900,
        "shippingFee": 4500,
        "totalPrice": 30400,
        "productUrl": "https://example.com/source-product"
      },
      "createdAt": "2026-05-30T00:00:00+09:00"
    }
  ]
}
```

#### Rules

- 로그인 사용자의 `user_favorite_offers`를 조회한다.
- `product_offers`, `products`를 조인해서 상품과 판매처 가격을 함께 내려준다.
- 전체 관심품목에서는 사용자/그룹 기준 주의 상태를 계산하지 않는다.
- `BLOCKED` 상품만 반입차단 의심으로 표시하고, 그 외 상품은 안전으로 표시한다.
- 가격 정렬은 `totalPrice = price + shippingFee` 기준으로 한다.

#### Related Tables

- `user_favorite_offers`
- `product_offers`
- `products`

### POST /api/favorites

상품 상세에서 선택한 판매처를 내 관심품목에 추가한다.

#### Request

```json
{
  "productOfferId": "offer-id"
}
```

#### Response

```json
{
  "favoriteId": "favorite-id"
}
```

#### Rules

- 같은 사용자가 같은 `productOfferId`를 중복 등록하면 기존 값을 유지한다.
- 저장 기준은 상품이 아니라 판매처 가격이다.

#### Related Tables

- `user_favorite_offers`

### DELETE /api/favorites/{favoriteId}

내 관심품목에서 판매처 항목을 삭제한다.

#### Response

```json
{
  "deleted": true
}
```

#### Rules

- 로그인 사용자의 관심 항목만 삭제할 수 있다.

#### Related Tables

- `user_favorite_offers`

### GET /api/groups/{groupId}/favorites

선택한 그룹의 관심 상품 목록을 조회한다.

#### Query Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| keyword | string | false | 그룹 관심품목 내 상품명 검색어 |
| sort | string | false | `name` 또는 `price` |

#### Response

```json
{
  "groupId": "group-id",
  "items": [
    {
      "favoriteId": "group-favorite-id",
      "product": {
        "id": "product-id",
        "name": "Garden of Life 프로틴",
        "imageUrl": null,
        "status": "GROUP_CAUTION"
      },
      "bestOffer": {
        "id": "offer-id",
        "storeName": "iHerb",
        "price": 45000,
        "shippingFee": 5000,
        "totalPrice": 50000,
        "productUrl": "https://example.com/source-product"
      },
      "createdByUserId": "user-id",
      "createdAt": "2026-05-30T00:00:00+09:00"
    }
  ]
}
```

#### Rules

- `group_favorite_products` 기준으로 그룹 관심 상품을 조회한다.
- 판매처는 검증 완료된 `product_offers` 중 `totalPrice`가 가장 낮은 항목을 `bestOffer`로 내려준다.
- 그룹원 기준 위험이 있으면 `GROUP_CAUTION`으로 표시한다.
- 그룹원 기준 위험 계산은 상품 상세의 group-risk 흐름과 같은 `user_ingredient_cautions` 캐시를 사용한다.

#### Related Tables

- `group_favorite_products`
- `products`
- `product_offers`
- `group_members`
- `user_onboardings`
- `user_ingredient_cautions`

### POST /api/groups/{groupId}/favorites

상품을 그룹 관심품목에 추가한다.

#### Request

```json
{
  "productId": "product-id"
}
```

#### Response

```json
{
  "favoriteId": "group-favorite-id"
}
```

#### Rules

- 같은 그룹에 같은 `productId`를 중복 등록하면 기존 값을 유지한다.
- 그룹 멤버만 추가할 수 있다.

#### Related Tables

- `group_favorite_products`
- `group_members`

### DELETE /api/groups/{groupId}/favorites/{favoriteId}

그룹 관심품목에서 상품을 삭제한다.

#### Response

```json
{
  "deleted": true
}
```

#### Rules

- 그룹 멤버만 삭제할 수 있다.
- 삭제 대상은 판매처가 아니라 그룹 관심 상품이다.

#### Related Tables

- `group_favorite_products`
- `group_members`

### POST /api/purchase-records

사용자가 구매했다고 확인한 내역을 기록한다.

#### Request

```json
{
  "purchaseConfirmationCheckId": "purchase-confirmation-check-id",
  "productId": "product-id",
  "productOfferId": "offer-id",
  "groupId": "group-id"
}
```

#### Response

```json
{
  "purchaseRecordId": "purchase-record-id"
}
```

#### Rules

- 사용자가 판매처 바로가기 후 구매했다고 확인했을 때 호출한다.
- `purchaseConfirmationCheckId`가 있으면 해당 확인 항목을 `PURCHASED`로 변경한다.
- `groupId`는 그룹 관심품목 화면에서 구매한 경우에만 전달한다.
- 구매 기록에는 구매 당시의 `price`, `shippingFee`를 스냅샷으로 저장한다.
- 저장된 가격은 이후 판매처 가격이 갱신되어도 구매내역 표시 기준으로 유지한다.
- 실제 결제 검증이 아니라 사용자가 직접 남기는 구매 기록이다.
- 같은 `purchaseConfirmationCheckId`로 구매 기록이 이미 있으면 기존 구매 기록을 반환한다.

#### Related Tables

- `purchase_records`
- `purchase_confirmation_checks`
- `product_offers`
- `products`
- `groups`

### POST /api/purchase-confirmation-checks

판매처 바로가기를 누른 사실을 구매 여부 확인 대기 항목으로 저장한다.

#### Request

```json
{
  "productId": "product-id",
  "productOfferId": "offer-id",
  "groupId": "group-id"
}
```

#### Response

```json
{
  "checkId": "purchase-confirmation-check-id",
  "productUrl": "https://example.com/source-product"
}
```

#### Rules

- 외부 쇼핑몰로 이동하기 직전에 호출한다.
- `status = PENDING`으로 `purchase_confirmation_checks`에 저장한다.
- `expiresAt`은 정책에 따라 지정한다. 예시는 7일 뒤이다.
- 응답의 `productUrl`로 클라이언트가 외부 쇼핑몰을 연다.
- 앱으로 바로 돌아오지 않아도 홈 진입 시 pending 조회 API로 다시 확인할 수 있다.

#### Related Tables

- `purchase_confirmation_checks`
- `product_offers`
- `products`
- `groups`

### PATCH /api/purchase-confirmation-checks/{checkId}

구매 여부 확인 항목을 구매하지 않음 또는 만료 등으로 변경한다.

#### Request

```json
{
  "status": "DISMISSED"
}
```

#### Response

```json
{
  "updated": true
}
```

#### Rules

- 사용자가 “아니요”를 누르면 `DISMISSED`로 변경한다.
- 서버 만료 처리나 배치 작업에서 `EXPIRED`로 변경할 수 있다.
- `PURCHASED` 처리는 구매 기록 생성을 동반해야 하므로 `POST /api/purchase-records`를 사용한다.

#### Related Tables

- `purchase_confirmation_checks`

### GET /api/groups/{groupId}/purchase-records

선택한 그룹의 구매내역을 조회한다.

#### Query Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| sort | string | false | `name` 또는 `price` |

#### Response

```json
{
  "groupId": "group-id",
  "items": [
    {
      "purchaseRecordId": "purchase-record-id",
      "buyer": {
        "id": "user-id",
        "nickname": "김영희"
      },
      "product": {
        "id": "product-id",
        "name": "Nature Made 멀티비타민",
        "imageUrl": null
      },
      "offer": {
        "id": "offer-id",
        "storeName": "iHerb",
        "purchasedPrice": 25900,
        "shippingFee": 4500,
        "totalPrice": 30400,
        "productUrl": "https://example.com/source-product"
      },
      "purchasedAt": "2026-05-30T00:00:00+09:00"
    }
  ]
}
```

#### Rules

- 그룹 멤버만 조회할 수 있다.
- 누가 어떤 상품을 어느 판매처에서 구매했는지 보여준다.
- 가격 정렬은 `totalPrice = purchasedPrice + shippingFee` 기준으로 한다.
- 이름 정렬은 상품명 기준으로 한다.
- 구매내역은 `purchase_records`에 저장된 가격 스냅샷을 사용한다.

#### Related Tables

- `purchase_records`
- `users`
- `products`
- `product_offers`
- `group_members`

## 상품 상세

### GET /api/products/{productId}

상품 상세 화면에 필요한 기본 데이터를 조회한다.

#### Response

```json
{
  "product": {
    "id": "product-id",
    "name": "California Gold 비타민 C",
    "imageUrl": "https://example.com/product.jpg",
    "status": "CAUTION",
    "canPurchase": true,
    "purchaseBlockedReason": null
  },
  "offers": [
    {
      "id": "offer-id",
      "storeName": "iHerb",
      "price": 20000,
      "shippingFee": 3000,
      "totalPrice": 23000,
      "productUrl": "https://example.com/source-product",
      "crawledAt": "2026-05-30T00:00:00+09:00",
      "isFavorite": true,
      "reviewSummary": {
        "positive": 76,
        "negative": 14,
        "other": 10,
        "summary": "제품 효과와 가격 만족도가 높고, 배송은 대체로 안정적이라는 의견이 많습니다.",
        "topics": [
          {
            "name": "배송",
            "sentiment": "POSITIVE",
            "summary": "예상보다 빨리 받았다는 의견이 많습니다."
          },
          {
            "name": "포장",
            "sentiment": "OTHER",
            "summary": "포장 상태는 무난하다는 반응입니다."
          }
        ]
      }
    }
  ],
  "favoriteOfferIds": ["offer-id"],
  "ingredients": [
    {
      "id": "product-ingredient-id",
      "ingredientId": "ingredient-id",
      "name": "카페인",
      "displayName": "Caffeine",
      "amountValue": 80,
      "amountText": "80mg",
      "unit": "mg",
      "analysis": {
        "status": "CAUTION",
        "reason": "카페인은 심박 증가, 불면, 혈압 상승 가능성이 있어 고혈압 또는 심혈관 질환자는 주의가 필요합니다.",
        "source": "I2710, I-0050",
        "analyzedAt": "2026-05-30T00:00:00+09:00"
      }
    }
  ],
  "userRisk": {
    "status": "CAUTION",
    "risks": [
      {
        "productIngredientId": "product-ingredient-id",
        "ingredientId": "ingredient-id",
        "ingredientName": "카페인",
        "onboardingVersion": 2,
        "reason": "카페인 민감 정보가 있어 카페인 성분에 주의가 필요합니다.",
        "fromCache": true
      }
    ]
  },
  "groups": [
    {
      "id": "group-id",
      "name": "우리 가족"
    }
  ],
  "defaultGroupId": "group-id",
  "groupRisk": {
    "groupId": "group-id",
    "status": "GROUP_CAUTION",
    "risks": [
      {
        "memberId": "member-id",
        "memberName": "김영희",
        "productIngredientId": "product-ingredient-id",
        "ingredientId": "ingredient-id",
        "ingredientName": "비타민 A",
        "onboardingVersion": 3,
        "reason": "임신 정보가 있어 비타민 A 성분에 주의가 필요합니다.",
        "fromCache": true
      }
    ]
  }
}
```

#### Service Flow

- `products`에서 상품 기본 정보를 조회한다.
- `product_offers`에서 판매처 가격을 조회하고 `totalPrice = price + shippingFee`를 계산한다.
- `product_offer_review_summaries`와 `product_offer_review_topics`를 조회해 판매처별 댓글 요약을 `offers[].reviewSummary`에 포함한다.
- 로그인 사용자의 `user_favorite_offers`를 조회해서 판매처별 `isFavorite`과 `favoriteOfferIds`를 만든다.
- `product_ingredients`와 `ingredients`를 조인해서 상품 성분 목록을 조회한다.
- `product_ingredient_analyses`에서 성분별 최종 분석 결과를 조회한다.
- 로그인 사용자의 최신 온보딩 버전을 조회한다.
- 현재 사용자와 성분 조합마다 `user_id + ingredient_id + onboarding_version` 기준으로 `user_ingredient_cautions`를 조회한다.
- 캐시가 없으면 성분별 최종 분석 결과와 사용자 온보딩 정보를 온보딩 조건 매칭 규칙으로 비교한다.
- 온보딩 조건 매칭 규칙은 임신, 수유, 어린이, 고령자, 고혈압, 고지혈증, 당뇨, 카페인 민감, 추가 정보를 기준으로 한다.
- 매칭되는 주의 조건이 있으면 `CAUTION`과 `caution_text`를 `user_ingredient_cautions`에 upsert한다.
- 매칭되는 주의 조건이 없으면 `SAFE` 결과를 `user_ingredient_cautions`에 upsert한다.
- 현재 사용자 기준 위험 결과를 `userRisk`로 만든다.
- 로그인 사용자의 그룹 목록을 조회한다.
- 첫 번째 그룹을 `defaultGroupId`로 정한다.
- `defaultGroupId`에 속한 그룹원별 최신 온보딩 버전을 조회한다.
- 그룹원별 `user_id + ingredient_id + onboarding_version` 조합으로 `user_ingredient_cautions`를 먼저 조회한다.
- 캐시가 있으면 `caution_text`를 사용한다.
- 캐시가 없으면 성분별 최종 분석 결과와 각 그룹원의 온보딩 정보를 온보딩 조건 매칭 규칙으로 비교한 뒤 `user_ingredient_cautions`에 upsert한다.
- `defaultGroupId` 기준의 그룹 위험 결과를 함께 응답한다.
- 상세 조회 시 공공 API 원천 데이터를 다시 대조하지 않고, 저장된 `product_ingredient_analyses`를 사용한다.
- `BLOCKED` 성분만 구매를 차단하고, 사용자/그룹 기준 주의는 구매 가능 상태로 응답한다.
- 댓글 요약은 상품 전체가 아니라 판매처별로 내려준다.
- 리뷰 수집/요약 데이터가 없는 판매처는 `offers[].reviewSummary = null`로 내려준다.
- 최상위 `reviewSummary`는 사용하지 않는다.

#### Related Tables

- `products`
- `product_offers`
- `product_offer_review_summaries`
- `product_offer_review_topics`
- `ingredients`
- `product_ingredients`
- `product_ingredient_analyses`
- `user_favorite_offers`
- `groups`
- `group_members`
- `user_onboardings`
- `user_ingredient_cautions`

### GET /api/products/{productId}/group-risk

상품 상세에서 그룹 선택을 변경했을 때, 선택한 그룹 기준 위험 결과만 조회한다.

#### Query Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| groupId | UUID | true | 위험 여부를 확인할 그룹 ID |

#### Response

```json
{
  "groupId": "group-id",
  "status": "GROUP_CAUTION",
  "risks": [
    {
      "memberId": "member-id",
      "memberName": "김철수",
      "productIngredientId": "product-ingredient-id",
      "ingredientId": "ingredient-id",
      "ingredientName": "카페인",
      "onboardingVersion": 2,
      "reason": "고지혈증 정보가 있어 카페인 성분에 주의가 필요합니다.",
      "fromCache": false
    }
  ]
}
```

#### Service Flow

- `groupId`에 속한 그룹원 온보딩 정보를 조회한다.
- `product_ingredients`에서 상품 성분 목록을 조회한다.
- `product_ingredient_analyses`에서 성분별 최종 분석 결과를 조회한다.
- 각 그룹원과 성분 조합마다 `user_id + ingredient_id + onboarding_version` 기준으로 `user_ingredient_cautions`를 조회한다.
- 캐시가 있으면 저장된 `status`, `caution_text`를 사용한다.
- 캐시가 없으면 그룹원 온보딩 정보와 성분 분석 결과를 온보딩 조건 매칭 규칙으로 비교해서 주의 여부를 계산한다.
- 온보딩 조건 매칭 규칙은 임신, 수유, 어린이, 고령자, 고혈압, 고지혈증, 당뇨, 카페인 민감, 추가 정보를 기준으로 한다.
- 새로 계산한 결과는 `user_ingredient_cautions`에 upsert한다.
- 위험 그룹원이 있으면 `GROUP_CAUTION`, 없으면 `SAFE`로 응답한다.
- `fromCache`는 해당 위험 문구가 캐시에서 온 값인지 표시한다.
- 상품 정보, 판매처 가격, 성분 목록 전체는 다시 응답하지 않는다.

#### Related Tables

- `groups`
- `group_members`
- `user_onboardings`
- `product_ingredients`
- `product_ingredient_analyses`
- `user_ingredient_cautions`
