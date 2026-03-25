const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

// Teacher joins the class room
const classCode = "RJIMUQ";
socket.emit("joinClassRoom", classCode);

socket.on("connect", () => {
  console.log("Connected to server with socket id:", socket.id);
});

socket.on("studentJoined", (student) => {
  console.log("Student joined event received:", student);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
