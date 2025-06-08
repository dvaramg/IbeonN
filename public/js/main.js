// 로그인 상태 확인
document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  const userWelcome = document.getElementById("userWelcome");
  const loginLink = document.getElementById("loginLink");

  // 로그인 링크가 있는 경우
  if (username) {
    loginLink.style.display = "none";
    userWelcome.style.display = "inline-block";
    userWelcome.textContent = `${username}님 환영합니다!`;
  
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("username");
        alert("로그아웃 되었습니다.");
        window.location.href = "home.html";
      });
    }
  }
  
  // 로그인 링크가 없는 경우
  if (window.location.pathname.includes("event.html") && !username) {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
  }
  // 마이페이지에서 참여 기록 불러오기
  if (window.location.pathname.includes("mypage.html") && username) {
    fetch(`/mypage/${username}`)
      .then(res => res.json())
      .then(data => {
        const list = document.getElementById("recordsList");
        if (list) {
          list.innerHTML = ""; // 기존 내용 초기화
          data.forEach(r => {
            const li = document.createElement("li");
            const utcTime = new Date(r.timestamp);
            const localTime = utcTime.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
            li.textContent = `${r.eventName || r.event || '이벤트'} 참여 - ${localTime}`;
            list.appendChild(li);
          });
        }
      });
  }
  // 로그인 폼 제출 처리
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      // 로그인 성공 시
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("username", data.username);
        window.location.href = "home.html";
      } else {
        alert("로그인 실패");
      }
    });
  }
});

// 로그아웃
function logout() {
  localStorage.removeItem("username");
  window.location.href = "login.html";
}

// 이벤트 참여
function participateInEvent(eventData) {
  const username = localStorage.getItem("username");
  if (!username) {
    alert("로그인이 필요합니다.");
    return;
  }
  // 이벤트 데이터가 없으면 경고
  fetch("/participate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      ...eventData
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(`${eventData.eventName} 참여 완료!`);
      }
    });
}


// 대시보드에서 버튼으로 이벤트 참여 (개별 카드형 이벤트 참여 버튼용)
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".participateBtn");

  if (buttons.length > 0) {
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        const username = localStorage.getItem("username");
        if (!username) {
          alert("로그인이 필요합니다.");
          window.location.href = "login.html";
          return;
        }

        const eventId = button.dataset.id;
        const eventName = button.dataset.name;
        const location = button.dataset.location;

        fetch("/participate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username,
            eventId,
            eventName,
            location
          })
        })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            alert(`${eventName} 참가 완료!`);
          } else {
            alert(result.message || '참여 실패');
          }
        })
        .catch(error => {
          console.error("참여 오류:", error);
          alert("서버 오류 발생");
        });
      });
    });
  }
});

  // 추천 이벤트 자동 스크롤
  const carousel = document.getElementById("carousel");
  if (carousel) {
    let scrollAmount = 0;
    const cardWidth = 270; // 카드 너비 + 간격

    setInterval(() => {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (scrollAmount < maxScroll) {
        scrollAmount += cardWidth;
      } else {
        scrollAmount = 0;
      }
      carousel.scrollTo({
        left: scrollAmount,
        behavior: "smooth"
      });
    }, 3000);
  }


// 이벤트 참여 기록 저장 (마이페이지용)
function goToDashboardIfLoggedIn() {
  const username = localStorage.getItem("username");
  if (!username) {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
    return;
  }
  window.location.href = "dashboard.html";
}

// IPFS 업로드 (추후 구현용)
function uploadToIPFS() {
  alert("IPFS 업로드 기능은 추후 지원될 예정입니다.");
}