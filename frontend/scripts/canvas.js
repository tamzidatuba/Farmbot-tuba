//grid ids
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const coordDisplay = document.getElementById('hover-coordinates');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;


// Farm-robot coordinate system
const coordWidth = 395;
const coordHeight = 650;

//coordinate system
const majorTickX = 50;
const majorTickY = 100;

let plants = [];


//draw plants
function drawPlant(plant) {
    //ctx.save();
    const img = new Image();
    const coord = coordToPixel(plant.x, plant.y);
    switch (plant.type) {
        case "lettuce":
            img.src = '../icons/lettuce.png';
            drawRadius(coord, 15);
            break;
        case "radish":
            img.src = '../icons/radish.png';
            drawRadius(coord, 2);
            break;
        case "tomato":
            img.src = '../icons/tomato.png';
            drawRadius(coord, 30);
            break;
    }
    img.onload = () => {
        const size = 50;
        ctx.drawImage(img, coord.x - size / 2, coord.y - size / 2, size, size);
    }

}
// Draws the radius
function drawRadius(coord, radius) {
    ctx.beginPath();
    ctx.arc(coord.x, coord.y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgb(10, 120, 210)'//'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke()
}

// Draw robot
let robot = { x: 0, y: 0 };

function drawRobot() {
    const pos = coordToPixel(robot.x, robot.y);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#4caf50';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.stroke();
}



// Draw grid lines for visual reference
export function drawGrid(recievedPlants) {
    plants = recievedPlants;
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

    drawAxesAndLabels();

    for (const plant in plants) {
        drawPlant(plants[plant]);
    }
}

function drawAxesAndLabels() {
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


function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

// Map pixel to real-world coordinate
function pixelToCoord(x, y) {
    const coordX = Math.round((x / canvasWidth) * coordWidth);
    const coordY = Math.round((y / canvasHeight) * coordHeight);
    return { x: coordX, y: coordY };
}

// Map real-world coordinate to pixel
function coordToPixel(x, y) {
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
    coordDisplay.style.left = `${e.clientX - 200}px`;
    coordDisplay.style.top = `${e.clientY + 15}px`;
    coordDisplay.textContent = `(${coords.x}, ${coords.y})`;
    coordDisplay.style.display = 'block';
});

//box disappears when mouse leaves the canvas
canvas.addEventListener('mouseleave', () => {
    coordDisplay.style.display = 'none';
});