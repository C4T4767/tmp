# Redis 키 목록

## search:rank:realtime

- Type: Sorted Set
- Member: product_id
- Score: 검색 점수
- TTL: 없음
- Write: 사용자가 검색 결과에서 상품 상세 페이지로 진입할 때 점수 증가
- Read: 홈 실시간 검색 TOP 10 조회

### 명령어

```redis
ZINCRBY search:rank:realtime 1 {product_id}
ZREVRANGE search:rank:realtime 0 9 WITHSCORES
```

### 참고

- Redis에는 product_id만 저장한다.
- TOP 10 product_id를 읽은 뒤 상품명과 이미지 URL은 PostgreSQL products 테이블에서 조회한다.
- 일간 또는 시간대별 랭킹이 필요해지면 스케줄러로 초기화하거나 시간 단위 키를 추가한다.

## auth:refresh:{user_id}:{token_id}

- Type: String
- Value: refresh token 식별값 또는 해시값
- TTL: refresh token 만료 시간과 동일
- Write: 로그인 또는 토큰 재발급 시 저장
- Read: access token 재발급 요청 시 refresh token이 화이트리스트에 있는지 확인
- Delete: 로그아웃 또는 refresh token 회전 시 삭제

### 명령어

```redis
SET auth:refresh:{user_id}:{token_id} {refresh_token_hash} EX {ttl_seconds}
GET auth:refresh:{user_id}:{token_id}
DEL auth:refresh:{user_id}:{token_id}
```

### 참고

- refresh token은 Redis 화이트리스트에 존재할 때만 유효하다.
- refresh token 원문을 그대로 저장하지 않고 해시값을 저장한다.
- token_id는 JWT의 `jti` 값을 사용한다.
- 토큰 재발급 시 기존 refresh token 키는 삭제하고 새 refresh token 키를 저장한다.

## auth:user-sessions:{user_id}

- Type: Set
- Member: refresh token의 token_id
- TTL: 없음
- Write: 로그인 또는 토큰 재발급 시 token_id 추가
- Read: 사용자 전체 로그아웃 또는 세션 관리 시 조회
- Delete: 로그아웃 시 해당 token_id 제거

### 명령어

```redis
SADD auth:user-sessions:{user_id} {token_id}
SMEMBERS auth:user-sessions:{user_id}
SREM auth:user-sessions:{user_id} {token_id}
```

### 참고

- 일반 로그아웃은 현재 refresh token의 token_id만 제거한다.
- 전체 로그아웃이 필요하면 Set의 모든 token_id를 조회해 `auth:refresh:{user_id}:{token_id}`를 삭제한다.

## auth:access:blocklist:{token_id}

- Type: String
- Value: revoked
- TTL: access token 남은 만료 시간
- Write: 로그아웃 시 아직 만료되지 않은 access token을 즉시 무효화해야 할 때 저장
- Read: 인증 미들웨어에서 access token의 `jti`가 차단되었는지 확인

### 명령어

```redis
SET auth:access:blocklist:{token_id} revoked EX {remaining_ttl_seconds}
GET auth:access:blocklist:{token_id}
```

### 참고

- access token은 짧게 만료시키는 것을 기본으로 한다.
- 즉시 로그아웃 반영이 필요하면 access token blocklist를 사용한다.
- refresh token은 화이트리스트 방식, access token은 필요 시 blocklist 방식으로 관리한다.
