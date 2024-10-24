//let myIdx = "68e1a597-648c-4f5e-9cf7-5c14b2fccd72"; // 로그인한 유저의 ID
let myIdx = "732ace73-38e6-4a20-bd81-0953bcd61a81";

// 서버로부터 실시간 채팅방 리스트 업데이트 받기
const eventSource = new EventSource(`http://10.10.20.53:8080/chat/rooms/${myIdx}`);

eventSource.onmessage = (event) => {
    const roomData = JSON.parse(event.data);
    console.log(roomData);
    
    // 새로운 방 데이터를 받아서 렌더링
    renderRoomList(roomData);
};

// 채팅방 리스트를 렌더링하는 함수
function renderRoomList(room) {
    const roomListContainer = document.querySelector('#roomList');
    let existingRoomElement = document.querySelector(`.room[data-room-number="${room.roomNumber}"]`);

    // 각 방의 읽지 않은 메시지 수 계산
    let roomUnreadCount = calculateUnreadCount(room.readBy);

    if (existingRoomElement) {
        // 기존 방이 있으면 삭제
        roomListContainer.removeChild(existingRoomElement);
    }

    // 새로운 방 엘리먼트 생성
    const roomElement = document.createElement('div');
    roomElement.className = 'room';
    roomElement.setAttribute('data-room-number', room.roomNumber);
	console.log(roomUnreadCount);
    const unreadCountHtml = roomUnreadCount ? `<span class="unread-count"></span>` : '';

    roomElement.innerHTML = `
        <div class="room-info">
            <div class="room-number">Room ${room.roomNumber} ${unreadCountHtml}</div>
            <div class="last-message-time">${formatTimeWithAmPm(room.createdAt)}</div>
        </div>
        <div class="last-message">${room.message != null ? room.message.msg : "-"}</div>
    `;

    // 채팅방 클릭 시 해당 방으로 입장하는 로직
    roomElement.addEventListener('click', () => enterRoom(room.roomNumber));

    // 방을 맨 위에 추가
    roomListContainer.prepend(roomElement);
}



// 메시지와 읽은 사용자 데이터를 기반으로 읽지 않은 메시지 수 계산
function calculateUnreadCount(readBy) {
    let unreadCount = false;
	console.log(!readBy.includes(myIdx));
    // 현재 유저가 읽은 유저 목록에 포함되지 않은 경우에 true
    if (!readBy.includes(myIdx)) {
        unreadCount = true;
    }

    return unreadCount;
}

// 시간 포맷을 12시간제로 변환
function formatTimeWithAmPm(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// 채팅방 입장 함수
function enterRoom(roomNumber) {	
	window.location.href = `./chat.html?roomNumber=${roomNumber}&userIdx=${myIdx}`;
}
