//grid ids
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const coordDisplay = document.getElementById('hover-coordinates');
let botposition;
const botImage = new Image();
botImage.src = './assets/icons/bot.png'; // Path to the robot image

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

//buffer canvas for drawing to avoid flickering
let bufferCanvas = document.createElement('canvas');
let bufferCtx = bufferCanvas.getContext('2d');

bufferCanvas.width = canvas.width;
bufferCanvas.height = canvas.height;

// Farm-robot coordinate system
const coordWidth = 395;
const coordHeight = 650;

//coordinate system
const majorTickX = 50;
const majorTickY = 100;

let plants = [];

const plantImages = {
    lettuce: new Image(),
    radish: new Image(),
    tomato: new Image()
};

plantImages.lettuce.src = './assets/icons/lettuce.png';
plantImages.radish.src = './assets/icons/radish.png';
plantImages.tomato.src = './assets/icons/tomato.png';
const size = 50; // Size of the plant image

//draw plants
function drawPlant(ctx, plant) {
    const coord = coordToPixel(plant.xcoordinate, plant.ycoordinate);
    switch (plant.planttype) {
        case "lettuce":
            ctx.drawImage(plantImages.lettuce, coord.x - size / 2, coord.y - size / 2, size, size);
            drawRadius(ctx, coord, 15);
            break;
        case "radish":
            ctx.drawImage(plantImages.radish, coord.x - size / 2, coord.y - size / 2, size, size);
            drawRadius(ctx, coord, 2);
            break;
        case "tomato":
            ctx.drawImage(plantImages.tomato, coord.x - size / 2, coord.y - size / 2, size, size);
            drawRadius(ctx, coord, 30);
            break;
    }
}
// Draws the radius
function drawRadius(ctx, coord, radius) {
    ctx.beginPath();
    ctx.arc(coord.x, coord.y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgb(10, 120, 210)'//'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke()
}


function drawRobot() {
    const pos = coordToPixel(botposition.x, botposition.y);
    ctx.drawImage(botImage, pos.x - size / 2, pos.y - size / 2, size, size);
}

// Draw grid lines for visual reference
export function drawGrid() {
    plants = window.plants;
    ctx.strokeStyle = 'rgb(102, 68, 40)'//'#ddd';
    ctx.linewidth = 1;

    for (let x = 0; x <= coordWidth; x += majorTickX) {
        ctx.beginPath();
        ctx.moveTo(coordToPixel(x, 0).x, 0);
        ctx.lineTo(coordToPixel(x, 0).x, canvasHeight);
        ctx.stroke();
    }

    for (let y = 0; y <= coordHeight; y += majorTickY) {
        ctx.beginPath();
        ctx.moveTo(0, coordToPixel(0, y).y);
        ctx.lineTo(canvasWidth, coordToPixel(0, y).y);
        ctx.stroke();
    }

    drawAxesAndLabels(ctx);

    for (const plant in plants) {
        drawPlant(ctx, plants[plant]);
    }
}

function drawAxesAndLabels(ctx) {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // Draw X-axis
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight);
    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.stroke();

    // Draw Y-axis
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvasHeight);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // X-axis labels
    for (let x = 0; x <= coordWidth; x += majorTickX) {
        const px = (x / coordWidth) * canvasWidth;
        ctx.beginPath();
        ctx.moveTo(px, canvasHeight - 5);
        ctx.lineTo(px, canvasHeight);
        ctx.stroke();
        ctx.fillText(x.toString(), px, canvasHeight + 2);
    }

    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let y = 0; y <= coordHeight; y += majorTickY) {
        const py = (y / coordHeight) * canvasHeight;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(5, py);
        ctx.stroke();
        ctx.fillText((coordHeight - y).toString(), -5, py);
    }

    // Axis titles
    ctx.textAlign = 'right';
    ctx.fillText("Y", 15, 10);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText("X", canvasWidth - 10, canvasHeight - 5);
}


export function clearCanvas() {
    plants = [];
    canvas.width = canvas.width;
    canvas.height = canvas.height;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

export function updateGrid() {
    plants = window.plants;

    // Clear the buffer
    bufferCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    bufferCtx.strokeStyle = 'rgb(102, 68, 40)';
    bufferCtx.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x <= coordWidth; x += majorTickX) {
        bufferCtx.beginPath();
        bufferCtx.moveTo(coordToPixel(x, 0).x, 0);
        bufferCtx.lineTo(coordToPixel(x, 0).x, canvasHeight);
        bufferCtx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= coordHeight; y += majorTickY) {
        bufferCtx.beginPath();
        bufferCtx.moveTo(0, coordToPixel(0, y).y);
        bufferCtx.lineTo(canvasWidth, coordToPixel(0, y).y);
        bufferCtx.stroke();
    }

    // Draw labels and axes
    drawAxesAndLabels(bufferCtx);

    // Draw plants
    for (const plant in plants) {
        drawPlant(bufferCtx, plants[plant]);
    }

    // Copy buffer to main canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(bufferCanvas, 0, 0);
    drawRobot();
}

// Map pixel to real-world coordinate
export function pixelToCoord(x, y) {
    const coordX = Math.round((x / canvasWidth) * coordWidth);
    const coordY = Math.round((y / canvasHeight) * coordHeight);
    return { x: coordX, y: coordY };
}


// Map real-world coordinate to pixel
export function coordToPixel(x, y) {
    const px = (x / coordWidth) * canvasWidth;
    const py = (y / coordHeight) * canvasHeight;
    return { x: px, y: py };
}

// Handle hover
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const hoverY = e.clientY - rect.top;

    //position of the display box for the coordinates
    const coords = pixelToCoord(hoverX, hoverY);
    coordDisplay.style.left = `${e.clientX - 300}px`;
    coordDisplay.style.top = `${e.clientY + 15}px`;
    coordDisplay.textContent = `(${coords.x}, ${coords.y})`;
    coordDisplay.style.display = 'block';
});

//box disappears when mouse leaves the canvas
canvas.addEventListener('mouseleave', () => {
    coordDisplay.style.display = 'none';
});

export function setbotposition(position) {
    botposition = position;
}