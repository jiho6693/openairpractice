# Open Air Practice — GitHub Pages용 정적 사이트

Next.js나 npm 설치가 필요하지 않습니다. HTML/CSS/JavaScript로 만든 화면을 GitHub Pages에 올립니다.
GitHub Actions가 Google Drive 공개 폴더를 읽고 JSON 사진 목록을 만든 뒤 다시 배포합니다.
Cargo 참고 디자인, 영문 소개, 날짜별 사진 줄, 인덱스, 전체 사진 보기와 확대 보기를 포함합니다.

## 1. VS Code에서 수정

ZIP을 풀고 `open-air-practice` 폴더를 엽니다.

| 파일 | 수정 내용 |
|---|---|
| site/index.html | 페이지 구조, 제목, 메뉴 |
| site/style.css | 색상, 글꼴, 사진 배치, 모바일 스타일 |
| site/app.js | 소개 글, 날짜 표기, 화면 동작 |
| config.json | 드라이브 폴더 ID |
| scripts/sync_drive.py | 드라이브 목록을 정적 JSON으로 만드는 코드 |
| .github/workflows/pages.yml | 자동 갱신과 배포 |

VS Code의 Live Server 확장을 설치하고 `site/index.html`을 우클릭 → Open with Live Server로 엽니다.
또는 Python이 설치되어 있다면 터미널에서 다음을 실행합니다.

```bash
python3 -m http.server 8000 --directory site
```

Windows에서는 python3 대신 python을 사용할 수 있습니다.
브라우저: http://localhost:8000
파일을 저장하고 화면을 새로고침합니다. HTML을 더블클릭해서 file://로 열면 JSON을 읽지 못합니다.
ZIP에는 현재 드라이브에서 읽은 사진 목록이 들어 있어 로컬에서 바로 확인할 수 있습니다.
사진은 Google의 미리보기 주소에서 불러오므로 인터넷 연결은 필요합니다.

## 2. GitHub Pages 배포

1. GitHub에 새 저장소를 만듭니다. 공개 저장소로 시작하면 간단합니다.
2. 이 폴더의 내용을 저장소 최상위에 올립니다. `.github/workflows/pages.yml`도 반드시 포함합니다.
   저장소 바로 아래에 `site`, `scripts`, `.github`, `config.json`, `README.md`가 있어야 합니다.
   `open-air-practice`라는 바깥 폴더 전체를 다시 한 단계 안에 넣지 않습니다.
3. 저장소 Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 선택합니다.
4. Actions 탭에서 **Sync Drive and deploy Pages** → **Run workflow**를 실행합니다.
5. 배포 작업이 성공하면 Settings → Pages 또는 작업 결과에 사이트 주소가 표시됩니다.

VS Code에서 Git을 사용하는 경우, 새 저장소가 비어 있을 때:

```bash
git init
git add .
git commit -m "Add Open Air Practice archive"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

YOUR_USERNAME과 YOUR_REPOSITORY를 실제 값으로 바꾸세요.
이미 Git 저장소인 경우 init/remote 추가를 반복하지 않고 기존 저장소에 커밋·푸시합니다.
GitHub Desktop에서 Add existing repository로 폴더를 추가해도 됩니다.
기존 저장소에 적용할 때는 기존 파일과 workflow 이름 충돌을 확인한 뒤 병합하세요.

## 3. 업데이트 방식

- 코드 수정: 커밋·푸시하면 기본 브랜치에서 다시 배포합니다.
- 드라이브 사진 변경: GitHub Actions가 **매시간 17분(UTC)** 실행되어 목록을 다시 만들고 배포합니다.
  한국 시간도 매시간 17분입니다. 배포가 끝난 뒤 새 기록이 보입니다.
- 즉시 갱신하려면 Actions → Run workflow를 실행합니다.
- 웹사이트의 Refresh는 **마지막으로 배포된 JSON**을 다시 읽습니다. 드라이브 동기화를 시작하지 않습니다.
- 화면을 열어둔 동안에는 5분마다 배포된 JSON을 다시 읽습니다.

GitHub 예약 작업은 지연되거나 건너뛰어질 수 있고 공개 저장소가 장기간 비활성 상태면 중지될 수 있습니다.
정확한 시각을 보장하는 실시간 동기화가 아닙니다. 필요하면 Actions에서 직접 실행하세요.
사진 목록은 배포 산출물에만 갱신되며, 저장소의 site/data/archive.json을 자동 커밋하지 않습니다.
동기화 실패 시 workflow가 중단되어 마지막 정상 배포를 덮어쓰지 않습니다.

로컬 사진 목록도 갱신하려면:

```bash
python3 scripts/sync_drive.py
```

Python 기본 라이브러리만 사용하므로 pip 설치가 필요하지 않습니다.

## 4. 드라이브 설정

현재 연결: https://drive.google.com/drive/folders/1fnVSg7cGxNcMCg7QBNmqi6_INKqqBDav

루트 아래 날짜별 폴더를 읽습니다. 날짜별 폴더 안의 이미지가 표시됩니다.
추가 중첩 폴더는 재귀적으로 읽지 않습니다.
로그인 없이 열리는 폴더·이미지여야 합니다. 비공개 폴더는 지원하지 않습니다.
다른 루트 폴더로 바꾸려면 config.json의 driveFolderId를 바꾸고 동기화하세요.
`site/app.js`의 Info 화면에 있는 비상 원본 링크도 함께 수정하세요.

이 버전은 Google Drive의 공개 HTML 페이지를 읽으며 공식 Drive API를 사용하지 않습니다.
Google 페이지 구조, 공유 권한 또는 미리보기 주소가 바뀌면 연결 수정이 필요할 수 있습니다.
사진 원본은 ZIP에 복사하지 않았습니다. 사진 미리보기는 Google에서 직접 제공됩니다.

## 5. 글과 디자인 수정

소개: site/app.js에서 `Open Air Practice is a group` 검색.
작가 영문 이름은 임시 음역이므로 실제 사용하는 표기로 수정해 주세요.
색상: site/style.css의 :root에 있는 --black, --blue, --yellow, --orange, --green.
데스크톱 한 줄 사진 수: style.css의 repeat(5,minmax(0,1fr))와 app.js의 slice(0,5)를 함께 수정.
모바일: style.css의 @media(max-width:700px).
폴더명 영어 표기: app.js의 name 함수. 실제 드라이브 이름은 바꾸지 않습니다.

## 참고

이 ZIP은 기존 ChatGPT Sites 주소와 별개로 GitHub Pages에서 배포할 수 있는 사본입니다.
기존 주소에 GitHub 커밋이 자동으로 반영되지는 않습니다.
GitHub 계정 연결, 저장소 생성, 실제 GitHub 배포는 이 파일 제공에 포함되지 않습니다.

공식 문서:
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#schedule
