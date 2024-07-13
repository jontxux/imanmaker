const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageLoader = document.getElementById('imageLoader');
const circle59Checkbox = document.getElementById('circle59');
const circle68Checkbox = document.getElementById('circle68');
const saveImageButton = document.getElementById('saveImage');

let img = new Image();
let imgScale = 1;
let imgX = 0;
let imgY = 0;
let isDragging = false;
let dragStartX, dragStartY;

const DPI = 300;
const circle59mmRadius = (59 / 25.4) * DPI / 2;
const circle68mmRadius = (68 / 25.4) * DPI / 2;

imageLoader.addEventListener('change', handleImage, false);
canvas.addEventListener('mousedown', startDragging, false);
canvas.addEventListener('mousemove', dragImage, false);
canvas.addEventListener('mouseup', stopDragging, false);
canvas.addEventListener('wheel', zoomImage, false);
circle59Checkbox.addEventListener('change', drawCanvas);
circle68Checkbox.addEventListener('change', drawCanvas);
saveImageButton.addEventListener('click', saveCanvasAsImage);

function handleImage(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        img.onload = function() {
            // Mantener la imagen en su resolución original
            imgScale = 1;
            imgX = (canvas.width - img.width) / 2;
            imgY = (canvas.height - img.height) / 2;
            drawCanvas();
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

function startDragging(e) {
    isDragging = true;
    dragStartX = e.clientX - imgX;
    dragStartY = e.clientY - imgY;
    canvas.style.cursor = 'grabbing';
}

function dragImage(e) {
    if (isDragging) {
        imgX = e.clientX - dragStartX;
        imgY = e.clientY - dragStartY;
        drawCanvas();
    }
}

function stopDragging() {
    isDragging = false;
    canvas.style.cursor = 'grab';
}

function zoomImage(e) {
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
        imgScale *= zoomFactor;
    } else {
        imgScale /= zoomFactor;
    }
    imgScale = Math.max(imgScale, 0.1);
    drawCanvas();
}

function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, imgX, imgY, img.width * imgScale, img.height * imgScale);
    if (circle59Checkbox.checked) {
        drawCircle(canvas.width / 2, canvas.height / 2, circle59mmRadius, 'red');
    }
    if (circle68Checkbox.checked) {
        drawCircle(canvas.width / 2, canvas.height / 2, circle68mmRadius, 'black');
    }
}

function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function saveCanvasAsImage() {
    const filename = prompt('Ingrese el nombre del archivo:', 'canvas_image');
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
