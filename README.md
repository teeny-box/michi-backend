# Michi : 관심사를 공유하는 랜덤 채팅 서비스

<img src="assets/logo_ver2.png" width=300 alt="미치 로고"/>

웹소켓을 기반으로 하는 서비스를 만들고자 시작하게 되었습니다.

1차적으로 기획한 기능들을 구현 완료한 상태입니다.

<br/>

**[ 페르소나 ]**

<img src="assets/persona.png" width=150 alt="학생 이미지"/>

이름 : 김소나
<br/>
직업 : 대학생
<br/>
특이사항 : 선택을 어려워 함, 새로운 사람과 대화하는 걸 좋아함
<br/>
<br/>
"상대를 내가 고르지 않고 랜덤으로 채팅할 수 없을까?"
<br/>
"이야기 주제를 올리고 관심있는 사람들과 채팅할 수는 없을까?"


<br/>

## 🖌️ 문서

- [Figma](https://www.figma.com/design/Kz6OGEQCU2uAqwalhDTchB/Michi?node-id=1-2&t=AAHJT05fsFGXniWP-1) : 와이어 프레임 및 GUI
- [Notion](https://michi1.notion.site/api-8573b3043402460da6e8b245e2f78cc1?pvs=4) : API 명세서

<br/>

## 📄 스토리보드

![미치 스토리보드](https://github.com/teeny-box/michi-backend/assets/122986061/5c79a753-4e15-42de-8208-291b31237881)

## 📄 ERD

![Michi](https://github.com/teeny-box/michi-frontend/assets/56782035/97b6f1a9-91a6-44a9-9f44-52f940c26b0d)

## 🛠 기술 스택

### Front-end

<img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=white"> <img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"> <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black"> <img src="https://img.shields.io/badge/recoil-3578E5?style=for-the-badge&logo=recoil&logoColor=white"> <img src="https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white"> <img src="https://img.shields.io/badge/FCM-DD2C00?style=for-the-badge&logo=firebase&logoColor=white"> <img src="https://img.shields.io/badge/MSW-FF6A33?style=for-the-badge&logo=mockserviceworker&logoColor=white"> 
<br/>
<img src="https://img.shields.io/badge/Android Studio-3DDC84?style=for-the-badge&logo=Android Studio&logoColor=white"/> <img src="https://img.shields.io/badge/xcode-147EFB?style=for-the-badge&logo=xcode&logoColor=white"> <img src="https://img.shields.io/badge/github actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white"> <img src="https://img.shields.io/badge/eslint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white"> <img src="https://img.shields.io/badge/prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=white">

### Back-end

<img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white"> <img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"> <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white"> <img src="https://img.shields.io/badge/mongodb-47A248?style=for-the-badge&logo=mongodb&logoColor=white"> <img src="https://img.shields.io/badge/mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white"> 
<br/> 
<img src="https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white"> <img src="https://img.shields.io/badge/jwt-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"> <img src="https://img.shields.io/badge/FCM-DD2C00?style=for-the-badge&logo=firebase&logoColor=white"> <img src="https://img.shields.io/badge/amazon s3-232F3E?style=for-the-badge&logo=amazonwebservices&logoColor=white"> <img src="https://img.shields.io/badge/eslint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white"> 
<img src="https://img.shields.io/badge/prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=white"> <img src="https://img.shields.io/badge/docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"> <img src="https://img.shields.io/badge/github actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white"> <img src="https://img.shields.io/badge/jest-C21325?style=for-the-badge&logo=jest&logoColor=white"> <img src="https://img.shields.io/badge/redis-FF4438?style=for-the-badge&logo=redis&logoColor=white"> <img src="https://img.shields.io/badge/terraform-844FBA?style=for-the-badge&logo=terraform&logoColor=white">

<br/>

## ⚙ 아키텍쳐

![미치 아키텍처](https://github.com/teeny-box/michi-backend/assets/122986061/cbe6d5cb-68ce-4f16-874f-ae331f5b264d)


## ✔️ 주요 기능

- 랜덤채팅
  - 랜덤 채팅 버튼을 누르면 온라인 상태인 유저들을 상대로 랜덤채팅 가능
- 게시글
  - 자신의 관심사를 게시글로 올리면 관심있는 유저가 채팅 신청 가능
- 채팅
  - 1:1 채팅방에서 원활한 채팅 가능
- 알림
  - 메시지, 공지사항이 오면 유저 디바이스로 알림 도착 (FCM 사용)
- 유저
  - 간단한 핸드폰 인증으로 회원가입
  - 여러 개의 기기에서 접속
  - 온라인 상태인 유저 목록 조회

<br/>

## 🚀 트러블 슈팅

<br/>

## 💻 팀원 소개

<table>
    <tr align="center">
        <td><B>Leader / Backend<B></td>
        <td><B>Backend<B></td>
        <td><B>Frontend<B></td>
        <td><B>Frontend<B></td>
        <td><B>Frontend<B></td>
        <td><B>Design<B></td>
    </tr>
    <tr align="center">
        <td><B>김동현<B></td>
        <td><B>허은리<B></td>
        <td><B>이진이<B></td>
        <td><B>김성재<B></td>
        <td><B>김태욱<B></td>
        <td><B>안지현<B></td>
    </tr>
    <tr align="center">
        <td>
            <a href="https://github.com/dongjangoon"><I>dongjangoon</I></a>
        </td>
        <td>
            <img src="https://github.com/teeny-box/michi-backend/assets/122986061/8f44da9d-df24-47d5-bf8f-d6dbfac02c30" width=100>
            <br>
            <a href="https://github.com/eunli"><I>eunli</I></a>
        </td>
        <td>
            <img src="https://avatars.githubusercontent.com/u/92137309?size=100">
            <br>
            <a href="https://github.com/jin-dooly"><I>jin-dooly</I></a>
        </td>
        <td>
            <img src="https://avatars.githubusercontent.com/u/141702982?size=100">
            <br>
            <a href="https://github.com/JMTcord"><I>JMTcord</I></a>
        </td>
        <td>
            <img src="https://avatars.githubusercontent.com/u/104901712?size=100">
            <br>
            <a href="https://github.com/Woo7i"><I>Woo7i</I></a>
        </td>
        <td>
            <a href="https://github.com/ingyoya"><I>ingyoya</I></a>
        </td>
    </tr>
</table>
