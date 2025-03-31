// 日期转时间戳工具
export function initTimestampConverter() {
    const currentDatetime = document.getElementById('current-datetime');
    const currentTimestamp = document.getElementById('current-timestamp');
    const dateInput = document.getElementById('date-input');
    const convertToTimestampButton = document.getElementById('convert-to-timestamp');
    const secondsTimestamp = document.getElementById('seconds-timestamp');
    const millisecondsTimestamp = document.getElementById('milliseconds-timestamp');
    const timestampInput = document.getElementById('timestamp-input');
    const timestampUnit = document.getElementById('timestamp-unit');
    const convertToDateButton = document.getElementById('convert-to-date');
    const localDate = document.getElementById('local-date');
    const utcDate = document.getElementById('utc-date');
    const isoDate = document.getElementById('iso-date');
    const copyButtons = document.querySelectorAll('.copy-button');
    
    // 更新当前时间
    function updateCurrentTime() {
        const now = new Date();
        currentDatetime.textContent = now.toLocaleString();
        currentTimestamp.textContent = `${Math.floor(now.getTime() / 1000)}秒 / ${now.getTime()}毫秒`;
    }
    
    // 初始化时间输入框为当前时间
    function initDateInput() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }
    
    // 初始化
    updateCurrentTime();
    initDateInput();
    setInterval(updateCurrentTime, 1000);
    
    // 日期转时间戳
    convertToTimestampButton.addEventListener('click', () => {
        const dateValue = dateInput.value;
        if (!dateValue) {
            showTimestampMessage('请选择日期和时间', 'error');
            return;
        }
        
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
            showTimestampMessage('无效的日期格式', 'error');
            return;
        }
        
        const timestampInSeconds = Math.floor(date.getTime() / 1000);
        const timestampInMilliseconds = date.getTime();
        
        secondsTimestamp.value = timestampInSeconds;
        millisecondsTimestamp.value = timestampInMilliseconds;
        
        showTimestampMessage('转换成功', 'success');
    });
    
    // 时间戳转日期
    convertToDateButton.addEventListener('click', () => {
        const timestampValue = timestampInput.value.trim();
        if (!timestampValue) {
            showTimestampMessage('请输入时间戳', 'error');
            return;
        }
        
        let timestamp = parseInt(timestampValue);
        if (isNaN(timestamp)) {
            showTimestampMessage('无效的时间戳', 'error');
            return;
        }
        
        // 根据单位调整时间戳
        if (timestampUnit.value === 'seconds' && timestamp > 1000000000000) {
            showTimestampMessage('秒级时间戳似乎太大了，请检查单位', 'warning');
        } else if (timestampUnit.value === 'milliseconds' && timestamp < 1000000000000) {
            showTimestampMessage('毫秒级时间戳似乎太小了，请检查单位', 'warning');
        }
        
        if (timestampUnit.value === 'seconds') {
            timestamp *= 1000;
        }
        
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            showTimestampMessage('无法转换为有效日期', 'error');
            return;
        }
        
        localDate.value = date.toLocaleString();
        utcDate.value = date.toUTCString();
        isoDate.value = date.toISOString();
        
        showTimestampMessage('转换成功', 'success');
    });
    
    // 复制按钮功能
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            
            if (!targetElement || !targetElement.value) {
                showTimestampMessage('没有可复制的内容', 'error');
                return;
            }
            
            navigator.clipboard.writeText(targetElement.value)
                .then(() => {
                    showTimestampMessage('已复制到剪贴板', 'success');
                })
                .catch(() => {
                    showTimestampMessage('复制失败', 'error');
                });
        });
    });
    
    // 显示消息
    function showTimestampMessage(text, type) {
        // 移除现有消息
        const existingMessage = document.querySelector('#timestamp-converter .message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 创建新消息
        const message = document.createElement('div');
        message.className = `message ${type}-message`;
        message.textContent = text;
        
        // 插入到转换器容器中
        const converterContainer = document.querySelector('.converter-container');
        converterContainer.insertBefore(message, converterContainer.firstChild);
        
        // 3秒后自动移除
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}
