const urlParams = new URLSearchParams(window.location.search);
let myIdx = "732ace73-38e6-4a20-bd81-0953bcd61a81";
let youIdx = "68e1a597-648c-4f5e-9cf7-5c14b2fccd72";
let username = urlParams.get('userIdx') === myIdx ? "박지성" : "손흥민";

let roomNum = urlParams.get('roomNumber'); // roomNumber 값 가져오기
let serviceId = "artmining";
let image1 = "https://artmining-storage-dev.s3.ap-northeast-2.amazonaws.com/art-mining/AME9050000/240905152813-100.jpg#800#1069";
let image2 = "https://artmining-storage-dev.s3.ap-northeast-2.amazonaws.com/art-mining/AME9040002/240904164732-100.jpg#1200#628";

const eventSource = new EventSource(`http://10.10.20.53:8080/chat/roomNum/${roomNum}`);

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    let type = data.message.sender === username ? 'message sent' : 'message received';
    initMessage(data, type);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#sendButton').addEventListener('click', () => {
        addMessage();
    });

    document.querySelector('#messageInput').addEventListener('keydown', (e) => {
        if (e.keyCode === 13) {
            addMessage();
        }
    });
});

function getSendMsgBox(data, time) {
    return `
        <div class="message sent">
            <div class="bubble">
                ${data.message.msg}
            </div>
            <div class="time">${time}</div>
        </div>`;
}

function getReceivedMsgBox(data, time) {
    return `
        <div class="message received">
            <div class="profile-img">
                <img src="${data.message.regImages}" alt="Profile">
            </div>
            <div class="bubble-container">
                <div class="sender-name">${data.message.sender}</div>
                <div class="bubble">
                    ${data.message.msg}
                </div>
                <div class="time">${time}</div>
            </div>
        </div>`;
}

function initMessage(data, type) {
    let chatBox = document.querySelector('#messages');
    let chatMessageBox = document.createElement('div');
    const currentTime = formatTimeWithAmPm(data.createdAt);

    if (type === 'message sent') {
        chatMessageBox.innerHTML = getSendMsgBox(data, currentTime);
    } else {
        chatMessageBox.innerHTML = getReceivedMsgBox(data, currentTime);
    }

    chatBox.append(chatMessageBox);
    scrollToBottom();

    if (type === 'message received') {
        markAsRead(data.roomNumber, myIdx, data.idx);
    }
}

function formatTimeWithAmPm(isoString) {
    const date = new Date(isoString);
    const formattedTime = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    return formattedTime;
}

function scrollToBottom() {
    const chatBox = document.querySelector('#messages');
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function addMessage() {
    let msgInput = document.querySelector('#messageInput');
    let transactionStatus = "TRADE_REQUESTED"; // Example transaction status
    let chat = {
        serviceId: serviceId,
        roomNumber: roomNum,
        participates: {
            seller: myIdx,
            buyer: youIdx
        },
        status: transactionStatus,
        message: {
            type: "normal",
            sender: username,
            userIdx: username === "손흥민" ? myIdx : youIdx,
            msg: msgInput.value,
            regImages: username === "손흥민" ? image1 : image2
        },
        readBy: [myIdx]
    };

    fetch("http://10.10.20.53:8080/chat", {
        method: "post",
        body: JSON.stringify(chat),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    });

    msgInput.value = ''; // Clear input field
}

function markAsRead(roomNumber, userIdx, messageIdx) {
    fetch(`http://10.10.20.53:8080/chat/roomNum/markAsRead/${roomNumber}/${userIdx}/${messageIdx}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    })
    .then(response => console.log(response))
    .catch(error => console.error('Error marking as read:', error));
}
