# 다이어트 앱 체크

여성 직장인을 위한 다이어트 기록 웹앱 (베타). 빌드 없이 정적 파일만으로 동작해요.

## 배포 (GitHub Pages)
1. 이 폴더 전체를 GitHub 저장소(`minyeahp_diet_app`)에 올려요.
2. 저장소 **Settings → Pages → Build and deployment**에서 *Deploy from a branch*, 브랜치 `main` / 폴더 `/ (root)` 선택 후 Save.
3. 1~2분 뒤 `https://kimsh1364-commits.github.io/minyeahp_diet_app/` 에서 열려요. (로그인 없이 누구나 접속)

## 아이폰에서 앱처럼 쓰기
- 사파리로 주소를 열고 **공유 → 홈 화면에 추가**.
- 물 마시기 단축어: 단축어 앱 → *URL 열기* → `https://kimsh1364-commits.github.io/minyeahp_diet_app/#water` (누를 때마다 1잔 기록)

## 개발
```bash
python3 -m http.server 8000   # http://localhost:8000
```
배포할 때마다 `sw.js`의 `VERSION` 숫자를 올리면 사용자 캐시가 갱신돼요.

자세한 기획 원칙은 `CLAUDE.md`를 참고하세요.
