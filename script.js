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
let isDragging = false;

// 扇形绘制函数
function drawSector(centerX, centerY, radius, startAngle, endAngle, color) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

// 绘制所有扇形
function drawAllSectors() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // 清除画布
    sectors.forEach(sector => {
        drawSector(sector.centerX, sector.centerY, sector.radius, sector.startAngle, sector.endAngle, sector.color);
    });
}

// 鼠标按下事件
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // 检查鼠标是否点击在某个扇形内
    sectors.forEach((sector) => {
        if (isInsideSector(mouseX, mouseY, sector)) {
            selectedSector = sector;
            isDragging = true;

            // 计算初始的鼠标角度和扇形的角度
            initialMouseAngle = Math.atan2(mouseY - sector.centerY, mouseX - sector.centerX);
            initialStartAngle = sector.startAngle;
            initialEndAngle = sector.endAngle;
        }
    });
});

// 将角度规范化到 0 到 2π 之间
function normalizeAngle(angle) {
    // 将角度转为正数
    while (angle < 0) {
        angle += 2 * Math.PI;
    }

    // 如果角度大于 2π，则取模
    return angle % (2 * Math.PI);
}

// 鼠标移动事件
canvas.addEventListener('mousemove', (event) => {
    if (isDragging && selectedSector) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // 计算当前鼠标相对扇形中心的角度
        const currentMouseAngle = Math.atan2(mouseY - selectedSector.centerY, mouseX - selectedSector.centerX);

        // 计算角度的变化
        const angleDifference = currentMouseAngle - initialMouseAngle;

        // 更新扇形的起始角度和结束角度，并确保角度在 0 到 2π 之间
        selectedSector.startAngle = normalizeAngle(initialStartAngle + angleDifference);
        selectedSector.endAngle = normalizeAngle(initialEndAngle + angleDifference);
        // 打印扇形的起始角度和结束角度
        console.log(`startAngle: ${selectedSector.startAngle}, endAngle: ${selectedSector.endAngle}`);
        // 重新绘制所有扇形
        drawAllSectors();
    }
});


// 鼠标松开事件
canvas.addEventListener('mouseup', () => {
    if (isDragging) {
        // 停止拖动并保持最终旋转位置
        isDragging = false;
        selectedSector = null;  // 重置选中扇形
    }
});

// 判断点击位置是否在某个扇形内
function isInsideSector(mouseX, mouseY, sector) {
    const { centerX, centerY, radius, startAngle, endAngle } = sector;
  
    // 计算鼠标点击点相对于扇形中心的极坐标
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);  // 计算与扇形中心的距离
    const angle = Math.atan2(dy, dx);  // 计算点击点的角度
  
    // 将负角度转换为正角度
    const normalizedMouseAngle = normalizeAngle(angle);
  
    // 判断鼠标是否在扇形的半径范围内
    if (distance > radius) {
      return false;
    }
  
    // 判断鼠标角度是否在扇形的起始角度和结束角度之间
    if (startAngle <= endAngle) {
      // 正常顺序
      return normalizedMouseAngle >= startAngle && normalizedMouseAngle <= endAngle;
    } else {
      // 跨越0度情况
      return normalizedMouseAngle >= startAngle || normalizedMouseAngle <= endAngle;
    }
  }

// 初始绘制
drawAllSectors();
