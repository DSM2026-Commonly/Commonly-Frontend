# Portainer Stack 배포

이 구성은 GitHub Actions가 세 앱의 이미지를 GHCR에 올리고, Portainer가 해당
이미지를 받아 한 Stack으로 배포합니다. Portainer 안에서 직접 이미지를
빌드하지 않으므로 Docker Standalone과 Docker Swarm 양쪽에서 사용할 수
있습니다.

## 기본 접속 주소

서버 주소가 `192.0.2.10`이라면 기본 접속 주소는 다음과 같습니다.

- 관리자용: `http://192.0.2.10:8081`
- 민원인용: `http://192.0.2.10:8082`
- 내부 사용자용: `http://192.0.2.10:8083`

## 배포 절차

1. 변경 사항을 GitHub의 `develop` 브랜치에 push합니다.
2. `develop`에서 `main`으로 Pull Request를 만들고 merge합니다.
3. `develop` push에서는 세 이미지가 빌드되는지만 검증하고 GHCR에는
   push하지 않습니다.
4. `main` merge 후 GitHub 저장소의 `Actions`에서 `Build container images`
   작업이 세 운영 이미지를 GHCR에 push합니다.
5. 처음 생성된 GHCR 패키지가 private이면 Portainer에 `ghcr.io` registry를
   추가하고 GitHub 사용자명과 `read:packages` 권한을 가진 Personal Access
   Token (classic)을 입력합니다. 공개 이미지로 운영할 경우 각 패키지의
   visibility를 public으로 바꿀 수도 있습니다.
6. Portainer에서 `Stacks` → `Add stack`을 선택합니다.
7. `Git repository` 방식을 선택하고 Repository reference를 `main`으로
   지정합니다.
8. `Compose path`에 `compose.portainer.yml`을 입력합니다.
9. GitOps updates를 활성화하고 Mechanism은 `Webhook`으로 선택합니다.
10. `Re-pull image`를 활성화한 뒤 생성된 webhook URL을 복사합니다.
11. private 이미지라면 앞에서 등록한 GHCR registry를 선택합니다.
12. 필요하면 `Environment variables`에서 포트 또는 이미지 태그를 변경합니다.
13. `Deploy the stack`을 누릅니다.
14. GitHub 저장소의 `Settings` → `Secrets and variables` → `Actions`에
    `PORTAINER_WEBHOOK_URL`이라는 Repository secret을 만들고 10번에서 복사한
    URL을 입력합니다.

사용 가능한 환경변수:

| 변수 | 기본값 | 용도 |
| --- | ---: | --- |
| `ADMIN_WEB_PORT` | `8081` | 관리자 앱 외부 포트 |
| `CIVIL_WEB_PORT` | `8082` | 민원인 앱 외부 포트 |
| `USER_WEB_PORT` | `8083` | 내부 사용자 앱 외부 포트 |
| `IMAGE_REGISTRY` | `ghcr.io` | 컨테이너 레지스트리 주소 |
| `IMAGE_NAMESPACE` | `dsm2026-commonly` | 이미지 namespace |
| `IMAGE_TAG` | `main` | 세 이미지의 공통 태그 |

같은 서버에서 이미 사용 중인 포트는 Portainer의 환경변수 값으로 변경해야
합니다. 서버 방화벽이나 클라우드 보안 그룹에서도 선택한 포트의 인바운드
접속을 허용해야 합니다.

## 갱신 배포

`main`에 merge되면 GitHub Actions가 세 이미지 push를 모두 성공시킨 뒤
`PORTAINER_WEBHOOK_URL`에 POST 요청을 보냅니다. Portainer는 `main`의 새
구성과 같은 `main` 태그의 새 이미지를 다시 받아 Stack을 배포합니다.

Portainer가 사설망 안에만 있어 GitHub-hosted runner에서 webhook URL에
접근할 수 없다면 자동 호출은 실패합니다. 이 경우 Portainer GitOps의
Polling을 사용하거나 네트워크에 접근 가능한 self-hosted runner를 사용해야
합니다.

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

운영 Portainer에는 `compose.build.yml`이 아니라 `compose.portainer.yml`을
사용합니다.
