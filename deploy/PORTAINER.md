# Portainer Stack 배포

이 구성은 Portainer가 Git 저장소를 받은 뒤 세 앱의 이미지를 직접 빌드하고
한 Stack으로 배포합니다. 별도 컨테이너 레지스트리나 Business Edition 전용
GitOps 기능은 사용하지 않습니다.

## 기본 접속 주소

서버 주소가 `192.0.2.10`이라면 기본 접속 주소는 다음과 같습니다.

- 관리자용: `http://192.0.2.10:8081`
- 민원인용: `http://192.0.2.10:8082`
- 내부 사용자용: `http://192.0.2.10:8083`

## 배포 절차

1. 변경 사항을 GitHub의 `develop` 브랜치에 push합니다.
2. `develop`에서 `main`으로 Pull Request를 만들고 merge합니다.
3. Portainer에서 `Stacks` → `Add stack`을 선택합니다.
4. `Git repository` 방식을 선택하고 Repository reference를 `main`으로
   지정합니다.
5. `Compose path`에 `compose.portainer.yml`을 입력합니다.
6. 필요하면 `Environment variables`에서 포트를 변경합니다.
7. `Deploy the stack`을 누릅니다. Portainer가 Dockerfile을 사용해
   `admin-web`, `civil-web`, `user-web` 이미지를 직접 빌드합니다.
8. Portainer 우측 상단 사용자 메뉴 → `My account` → `Access tokens`에서
    GitHub Actions용 Access Token을 생성합니다.
9. GitHub 저장소의 `Settings` → `Secrets and variables` → `Actions`에
    아래 Repository secrets를 등록합니다.

| Secret | 값 |
| --- | --- |
| `PORTAINER_URL` | 외부에서 접근 가능한 Portainer 주소. 예: `https://portainer.example.com` |
| `PORTAINER_ACCESS_TOKEN` | 8번에서 만든 Access Token |
| `PORTAINER_STACK_ID` | 배포한 Commonly Stack의 숫자 ID |

Stack ID는 Access Token을 사용해 `GET /api/stacks`를 호출하면 응답의
`Id`에서 확인할 수 있습니다.

```sh
curl -H "X-API-Key: <ACCESS_TOKEN>" https://portainer.example.com/api/stacks
```

사용 가능한 환경변수:

| 변수 | 기본값 | 용도 |
| --- | ---: | --- |
| `ADMIN_WEB_PORT` | `8081` | 관리자 앱 외부 포트 |
| `CIVIL_WEB_PORT` | `8082` | 민원인 앱 외부 포트 |
| `USER_WEB_PORT` | `8083` | 내부 사용자 앱 외부 포트 |
| `IMAGE_TAG` | `latest` | Portainer에서 빌드한 세 이미지의 공통 태그 |

같은 서버에서 이미 사용 중인 포트는 Portainer의 환경변수 값으로 변경해야
합니다. 서버 방화벽이나 클라우드 보안 그룹에서도 선택한 포트의 인바운드
접속을 허용해야 합니다.

## 갱신 배포

`main`에 merge되면 GitHub Actions가 Portainer CE의
`PUT /api/stacks/{id}/git/redeploy` API를 호출합니다. Portainer가 `main`의
새 소스를 받고 Dockerfile로 세 이미지를 다시 빌드한 뒤 Stack을 재배포합니다.
각 서비스의 `pull_policy: build`가 기존 로컬 이미지 대신 새 빌드를
사용하도록 강제합니다.

Portainer가 사설망 안에만 있어 GitHub-hosted runner에서 API 주소에 접근할
수 없다면 자동 호출은 실패합니다. 이 경우 네트워크에 접근 가능한
self-hosted runner를 사용하거나 Stack 화면에서 수동으로 재배포해야 합니다.

Portainer가 원격 Agent나 별도 원격 Docker 환경을 관리하는 구성에서는
Compose의 `build`가 지원되지 않을 수 있습니다. 이 방식은 Portainer가
Docker 엔진에 직접 연결된 환경을 기준으로 합니다.

## 도메인과 HTTPS

현재 Compose 파일은 별도 리버스 프록시 없이 포트를 직접 노출합니다.
도메인과 HTTPS를 사용하려면 Portainer 서버의 Nginx Proxy Manager, Traefik,
Caddy 같은 기존 리버스 프록시에서 각 앱의 컨테이너 또는 위 포트로
연결합니다. 프록시 종류와 도메인이 정해지면 해당 프록시에 맞는 labels 또는
설정 파일을 추가할 수 있습니다.

## 로컬에서 이미지까지 확인하기

Docker가 실행 중인 개발 PC에서는 아래 구성으로 세 이미지를 직접 빌드하고
기동할 수 있습니다.

```sh
docker compose -f compose.build.yml up -d --build
```

로컬 확인에는 `compose.build.yml`, 운영 Portainer에는
`compose.portainer.yml`을 사용합니다. 두 파일 모두 동일한 Dockerfile로
세 앱을 빌드합니다.
