# Portainer Stack 배포

이 구성은 Portainer가 `main` 브랜치를 주기적으로 확인한 뒤 변경된 소스를
받아 세 앱의 이미지를 직접 빌드하고 한 Stack으로 배포합니다. 별도 컨테이너
레지스트리, GitHub Actions, GitHub Secrets는 사용하지 않습니다.

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
6. `GitOps updates`를 활성화합니다.
7. Mechanism은 `Polling`으로 선택하고 원하는 Fetch interval을 지정합니다.
8. `Re-pull image`는 활성화하지 않아도 됩니다.
9. 필요하면 `Environment variables`에서 포트를 변경합니다.
10. `Deploy the stack`을 누릅니다. Portainer가 Dockerfile을 사용해
   `admin-web`, `civil-web`, `user-web` 이미지를 직접 빌드합니다.

사용 가능한 환경변수:

| 변수 | 기본값 | 용도 |
| --- | ---: | --- |
| `ADMIN_WEB_PORT` | `8081` | 관리자 앱 외부 포트 |
| `CIVIL_WEB_PORT` | `8082` | 민원인 앱 외부 포트 |
| `USER_WEB_PORT` | `8083` | 내부 사용자 앱 외부 포트 |
| `IMAGE_TAG` | `latest` | Portainer에서 빌드한 세 이미지의 공통 태그 |
| `VITE_API_BASE_URL` | `` | 빌드에 주입되는 API 서버 origin (변경 시 재배포 필요) |

같은 서버에서 이미 사용 중인 포트는 Portainer의 환경변수 값으로 변경해야
합니다. 서버 방화벽이나 클라우드 보안 그룹에서도 선택한 포트의 인바운드
접속을 허용해야 합니다.

## 갱신 배포

`main`에 merge되면 commit hash가 변경됩니다. 다음 Polling 주기에 Portainer가
변경을 감지하고 새 소스를 받은 뒤 Dockerfile로 세 이미지를 다시 빌드하고
Stack을 재배포합니다. 각 서비스의 `pull_policy: build`가 기존 로컬 이미지
대신 새 빌드를 사용하도록 강제하므로 `Re-pull image`는 필요하지 않습니다.

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
