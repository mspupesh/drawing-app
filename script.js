const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const tool = document.getElementById('tool');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
let isDrawing = false;
let startX = 0, startY = 0;
let history = [];
let redoStack = [];

function setCanvasSize() {
  const width = 900;
  const height = 600;
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  redraw();
}
window.addEventListener('resize', setCanvasSize);
setCanvasSize();

canvas.addEventListener('mousedown', e => {
  isDrawing = true;
  [startX, startY] = [e.offsetX, e.offsetY];
  if (['pencil', 'brush', 'eraser'].includes(tool.value)) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  }
});

canvas.addEventListener('mousemove', e => {
  if (!isDrawing) return;
  const x = e.offsetX;
  const y = e.offsetY;
  ctx.lineWidth = brushSize.value;
  ctx.lineCap = 'round';
  ctx.strokeStyle = tool.value === 'eraser' ? '#ffffff' : colorPicker.value;

  if (['pencil', 'brush', 'eraser'].includes(tool.value)) {
    ctx.lineTo(x, y);
    ctx.stroke();
  } else {
    redraw();
    drawShape(startX, startY, x, y);
  }
});

canvas.addEventListener('mouseup', e => {
  if (!isDrawing) return;
  isDrawing = false;
  const x = e.offsetX;
  const y = e.offsetY;
  if (!['pencil', 'brush', 'eraser'].includes(tool.value)) {
    drawShape(startX, startY, x, y);
  }
  saveState();
});

function drawShape(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = brushSize.value;
  if (tool.value === 'line') {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  } else if (tool.value === 'rectangle') {
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
  } else if (tool.value === 'circle') {
    const radius = Math.hypot(x2 - x1, y2 - y1);
    ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
  }
  ctx.stroke();
}

function saveState() {
  history.push(canvas.toDataURL());
  redoStack = [];
}

function redraw() {
  if (history.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  const img = new Image();
  img.src = history[history.length - 1];
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
}

function undo() {
  if (history.length > 0) {
    redoStack.push(history.pop());
    redraw();
  }
}

function redo() {
  if (redoStack.length > 0) {
    history.push(redoStack.pop());
    redraw();
  }
}

function save() {
  localStorage.setItem("savedDrawing", canvas.toDataURL());
  alert("Drawing saved!");
}

function load() {
  const data = localStorage.getItem("savedDrawing");
  if (!data) {
    alert("No saved drawing found!");
    return;
  }
  const img = new Image();
  img.src = data;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    saveState();
  };
}
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  saveState();
}

window.undo = undo;
window.redo = redo;
window.save = save;
window.load = load;
window.clearCanvas = clearCanvas;
