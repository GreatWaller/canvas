// 获取画布及其上下文
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// 定义扇形的属性
const sectors = [
    { centerX: 100, centerY: 100, radius: 80, startAngle: 0, endAngle: Math.PI / 2, color: 'lightblue' },
    { centerX: 300, centerY: 100, radius: 60, startAngle: Math.PI / 4, endAngle: Math.PI, color: 'lightgreen' },
    { centerX: 100, centerY: 300, radius: 100, startAngle: Math.PI / 2, endAngle: Math.PI, color: 'lightcoral' },
    { centerX: 300, centerY: 300, radius: 50, startAngle: 0, endAngle: 2 * Math.PI / 3, color: 'lightgoldenrodyellow' },
    { centerX: 500, centerY: 500, radius: 70, startAngle: Math.PI / 3, endAngle: Math.PI, color: 'lightpink' }
];

// 保存当前选中的扇形和初始角度
let selectedSector = null;
let initialMouseAngle = 0;
let initialStartAngle = 0;
let initialEndAngle = 0;
let initialRadius = 0;
let isDragging = false;
let isResizing = false;
// 定义红点的半径变量
let hintDotRadius = 7; // 这里可以随时调整红点的半径大小

// 鼠标按下事件
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    sectors.forEach((sector) => {
        if (isInsideSector(mouseX, mouseY, sector)) {
            selectedSector = sector;
            const middleAngle = (sector.startAngle + sector.endAngle) / 2;

            // 计算鼠标到中线的距离
            const middleX = sector.centerX + Math.cos(middleAngle) * sector.radius;
            const middleY = sector.centerY + Math.sin(middleAngle) * sector.radius;
            const dx = mouseX - middleX;
            const dy = mouseY - middleY;
            const distanceToMiddleLine = Math.sqrt(dx * dx + dy * dy);

            if (distanceToMiddleLine < 2* hintDotRadius) {  // 如果距离小于一定值（10像素以内），启用半径调整
                isResizing = true;
                initialRadius = sector.radius;
            } else {
                isDragging = true;
                initialMouseAngle = Math.atan2(mouseY - sector.centerY, mouseX - sector.centerX);
                initialStartAngle = sector.startAngle;
                initialEndAngle = sector.endAngle;
            }
        }
    });
});

// 鼠标移动事件
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // 如果正在拖拽
    if (isDragging && selectedSector) {
        const currentMouseAngle = Math.atan2(mouseY - selectedSector.centerY, mouseX - selectedSector.centerX);
        const angleDifference = currentMouseAngle - initialMouseAngle;

        selectedSector.startAngle = normalizeAngle(initialStartAngle + angleDifference);
        selectedSector.endAngle = normalizeAngle(initialEndAngle + angleDifference);

        drawAllSectors();
    }

    // 如果正在调整半径
    if (isResizing && selectedSector) {
        const dx = mouseX - selectedSector.centerX;
        const dy = mouseY - selectedSector.centerY;
        const newRadius = Math.sqrt(dx * dx + dy * dy);

        selectedSector.radius = newRadius;
        drawAllSectors();
    }
});

// 鼠标松开事件
canvas.addEventListener('mouseup', () => {
    if (isDragging || isResizing) {
        isDragging = false;
        isResizing = false;
        selectedSector = null;
        drawAllSectors();  // 重绘所有扇形
    }
});

// 判断点击位置是否在某个扇形内
function isInsideSector(mouseX, mouseY, sector) {
    const { centerX, centerY, radius, startAngle, endAngle } = sector;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const normalizedMouseAngle = normalizeAngle(angle);

    if (distance > radius) return false;

    if (startAngle <= endAngle) {
        return normalizedMouseAngle >= startAngle && normalizedMouseAngle <= endAngle;
    } else {
        return normalizedMouseAngle >= startAngle || normalizedMouseAngle <= endAngle;
    }
}

// 将角度规范化到 0 到 2π 之间
function normalizeAngle(angle) {
    while (angle < 0) {
        angle += 2 * Math.PI;
    }
    return angle % (2 * Math.PI);
}

// 绘制所有扇形
function drawAllSectors() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sectors.forEach(sector => {
        drawSector(sector.centerX, sector.centerY, sector.radius, sector.startAngle, sector.endAngle, sector.color);

        // 绘制中线提示圆点
        drawResizeHint(sector);
    });
}

// 绘制单个扇形
function drawSector(centerX, centerY, radius, startAngle, endAngle, color) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

// 绘制调整半径提示圆点
function drawResizeHint(sector) {
    let startAngle = sector.startAngle;
    let endAngle = sector.endAngle;

    // 如果endAngle小于startAngle，说明角度跨越了2π，进行规范化处理
    if (endAngle < startAngle) {
        endAngle += 2 * Math.PI;
    }

    // 计算扇形中线的角度
    const middleAngle = (startAngle + endAngle) / 2;

    // 根据中线角度计算提示圆点的位置
    const hintX = sector.centerX + Math.cos(middleAngle) * sector.radius;
    const hintY = sector.centerY + Math.sin(middleAngle) * sector.radius;

    // 绘制提示圆点
    ctx.beginPath();
    ctx.arc(hintX, hintY, hintDotRadius, 0, 2 * Math.PI);  // 半径为5的红色圆点
    ctx.fillStyle = 'red';
    ctx.fill();
}


// 初始绘制
drawAllSectors();
