// 等待 DOM 完全加载
document.addEventListener('DOMContentLoaded', () => {
    // 初始化导航菜单
    initNavigation();
    
    // 初始化各个工具
    initImageCompressor();
    initImageResizer();
    initJsonFormatter();
    initTimestampConverter();
});

// 导航菜单功能
function initNavigation() {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    const toolLinks = document.querySelectorAll('[data-tool]');
    const footerLinks = document.querySelectorAll('.footer-links a');
    
    // 汉堡菜单点击事件
    burger.addEventListener('click', () => {
        // 切换导航菜单
        nav.classList.toggle('nav-active');
        
        // 导航链接动画
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
        
        // 汉堡菜单变成关闭按钮
        burger.classList.toggle('toggle');
        
        // 切换body滚动
        document.body.style.overflow = nav.classList.contains('nav-active') ? 'hidden' : '';
    });
    
    // 工具切换功能
    [...toolLinks, ...footerLinks].forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const toolId = link.getAttribute('data-tool');
            if (!toolId) return;
            
            // 切换活动工具
            switchTool(toolId);
            
            // 如果导航菜单是打开的，关闭它
            if (nav.classList.contains('nav-active')) {
                nav.classList.remove('nav-active');
                burger.classList.remove('toggle');
                navLinks.forEach(link => {
                    link.style.animation = '';
                });
                document.body.style.overflow = '';
            }
        });
    });
    
    // 默认显示第一个工具
    const defaultTool = document.querySelector('[data-tool]').getAttribute('data-tool');
    switchTool(defaultTool);
}

// 切换工具
function switchTool(toolId) {
    // 更新导航链接状态
    document.querySelectorAll('[data-tool]').forEach(link => {
        if (link.getAttribute('data-tool') === toolId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // 更新工具显示状态
    document.querySelectorAll('.tool-section').forEach(section => {
        if (section.id === toolId) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
    
    // 滚动到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 图片压缩工具
function initImageCompressor() {
    const uploadArea = document.getElementById('upload-area');
    const imageUpload = document.getElementById('image-upload');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const outputFormat = document.getElementById('output-format');
    const compressButton = document.getElementById('compress-button');
    const resultsArea = document.getElementById('results-area');
    const resultsGrid = document.getElementById('results-grid');
    const downloadAllButton = document.getElementById('download-all');
    
    let uploadedImages = [];
    
    // 更新质量值显示
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
    });
    
    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => {
        imageUpload.click();
    });
    
    // 文件拖放功能
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.backgroundColor = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.backgroundColor = '';
        
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    });
    
    // 文件选择处理
    imageUpload.addEventListener('change', () => {
        if (imageUpload.files.length > 0) {
            handleFiles(imageUpload.files);
        }
    });
    
    // 处理上传的文件
    function handleFiles(files) {
        uploadedImages = [];
        resultsGrid.innerHTML = '';
        resultsArea.style.display = 'none';
        
        const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (validFiles.length === 0) {
            showMessage('请选择有效的图片文件', 'error');
            return;
        }
        
        validFiles.forEach(file => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    uploadedImages.push({
                        name: file.name,
                        originalSize: file.size,
                        width: img.width,
                        height: img.height,
                        src: img.src,
                        type: file.type
                    });
                    
                    if (uploadedImages.length === validFiles.length) {
                        compressButton.disabled = false;
                        showMessage(`已上传 ${uploadedImages.length} 张图片，点击"压缩图片"按钮开始压缩`, 'success');
                    }
                };
                img.src = e.target.result;
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // 压缩图片
    compressButton.addEventListener('click', () => {
        if (uploadedImages.length === 0) return;
        
        const quality = parseInt(qualitySlider.value) / 100;
        const format = outputFormat.value;
        
        resultsGrid.innerHTML = '';
        resultsArea.style.display = 'block';
        
        const compressedImages = [];
        
        uploadedImages.forEach((image, index) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 使用原始尺寸，不调整图片大小
            let newWidth = image.width;
            let newHeight = image.height;
            
            // 设置画布尺寸为原始尺寸
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            // 创建临时图像
            const tempImg = new Image();
            tempImg.onload = () => {
                // 绘制图像到画布
                ctx.drawImage(tempImg, 0, 0, newWidth, newHeight);
                
                // 转换为所需格式
                let mimeType;
                switch (format) {
                    case 'jpeg':
                        mimeType = 'image/jpeg';
                        break;
                    case 'png':
                        mimeType = 'image/png';
                        break;
                    case 'webp':
                        mimeType = 'image/webp';
                        break;
                    default:
                        mimeType = 'image/jpeg';
                }
                
                // 获取压缩后的图像数据 - 这里是关键，使用quality参数来控制质量
                const compressedDataUrl = canvas.toDataURL(mimeType, quality);
                
                // 计算压缩后的大小
                const base64Data = compressedDataUrl.split(',')[1];
                const compressedSize = Math.round((base64Data.length * 3) / 4);
                
                // 创建结果项
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                
                // 创建图像预览
                const imgPreview = document.createElement('img');
                imgPreview.src = compressedDataUrl;
                resultItem.appendChild(imgPreview);
                
                // 创建信息区域
                const infoDiv = document.createElement('div');
                infoDiv.className = 'result-info';
                
                const originalSizeKB = Math.round(image.originalSize / 1024);
                const compressedSizeKB = Math.round(compressedSize / 1024);
                const savingsPercent = Math.round((1 - (compressedSize / image.originalSize)) * 100);
                
                infoDiv.innerHTML = `
                    <p><strong>文件名:</strong> ${image.name}</p>
                    <p><strong>尺寸:</strong> ${Math.round(newWidth)} x ${Math.round(newHeight)} px</p>
                    <p><strong>原始大小:</strong> ${originalSizeKB} KB</p>
                    <p><strong>压缩后大小:</strong> ${compressedSizeKB} KB</p>
                    <p><strong>节省:</strong> ${savingsPercent}%</p>
                `;
                resultItem.appendChild(infoDiv);
                
                // 创建操作区域
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'result-actions';
                
                const downloadButton = document.createElement('button');
                downloadButton.className = 'secondary-button';
                downloadButton.innerHTML = '<i class="fas fa-download"></i> 下载';
                downloadButton.addEventListener('click', () => {
                    // 创建下载链接
                    const link = document.createElement('a');
                    link.href = compressedDataUrl;
                    
                    // 设置文件名
                    const fileName = image.name.split('.');
                    fileName.pop();
                    link.download = `${fileName.join('.')}_compressed.${format}`;
                    
                    // 触发下载
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
                
                actionsDiv.appendChild(downloadButton);
                resultItem.appendChild(actionsDiv);
                
                // 添加到结果网格
                resultsGrid.appendChild(resultItem);
                
                // 保存压缩后的图像数据
                compressedImages.push({
                    dataUrl: compressedDataUrl,
                    name: image.name,
                    format: format
                });
                
                // 如果所有图像都已处理完毕
                if (compressedImages.length === uploadedImages.length) {
                    // 启用"下载全部"按钮
                    downloadAllButton.disabled = false;
                }
            };
            
            tempImg.src = image.src;
        });
    });
    
    // 下载所有压缩后的图像
    downloadAllButton.addEventListener('click', () => {
        // 创建一个ZIP文件
        if (typeof JSZip === 'undefined') {
            // 如果JSZip库未加载，使用单独下载
            const delay = 500; // 延迟时间，单位毫秒
            
            document.querySelectorAll('.result-item .result-actions button').forEach((button, index) => {
                setTimeout(() => {
                    button.click();
                }, index * delay);
            });
        } else {
            // 使用JSZip创建压缩包
            const zip = new JSZip();
            
            // 添加所有图像到ZIP
            uploadedImages.forEach((image, index) => {
                const base64Data = image.src.split(',')[1];
                zip.file(`image_${index + 1}.${outputFormat.value}`, base64Data, { base64: true });
            });
            
            // 生成ZIP文件并下载
            zip.generateAsync({ type: 'blob' }).then((content) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = 'compressed_images.zip';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }
    });
    
    // 显示消息
    function showMessage(text, type) {
        // 移除现有消息
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 创建新消息
        const message = document.createElement('div');
        message.className = `message ${type}-message`;
        message.textContent = text;
        
        // 插入到上传区域后面
        uploadArea.parentNode.insertBefore(message, uploadArea.nextSibling);
        
        // 5秒后自动移除
        setTimeout(() => {
            message.remove();
        }, 5000);
    }
}

// JSON格式化工具
function initJsonFormatter() {
    const jsonInput = document.getElementById('json-input');
    const jsonOutput = document.getElementById('json-output').querySelector('code');
    const formatButton = document.getElementById('format-json');
    const minifyButton = document.getElementById('minify-json');
    const indentSize = document.getElementById('indent-size');
    const clearButton = document.getElementById('clear-json');
    const loadSampleButton = document.getElementById('load-sample-json');
    const pasteButton = document.getElementById('paste-json');
    const copyButton = document.getElementById('copy-json');
    const downloadButton = document.getElementById('download-json');
    
    // 添加行号功能
    function addLineNumbers(codeElement) {
        // 获取代码内容
        const content = codeElement.textContent;
        
        // 分割成行
        const lines = content.split('\n');
        
        // 清空当前内容
        codeElement.innerHTML = '';
        
        // 为每一行添加span元素
        lines.forEach((line) => {
            const span = document.createElement('span');
            span.textContent = line;
            codeElement.appendChild(span);
            
            // 添加换行符，除了最后一行
            if (line !== lines[lines.length - 1]) {
                codeElement.appendChild(document.createTextNode('\n'));
            }
        });
    }
    
    // 格式化JSON
    formatButton.addEventListener('click', () => {
        const json = jsonInput.value.trim();
        if (!json) {
            showJsonMessage('请输入JSON数据', 'error');
            return;
        }
        
        try {
            const parsed = JSON.parse(json);
            const indent = indentSize.value === 'tab' ? '\t' : ' '.repeat(parseInt(indentSize.value));
            const formatted = JSON.stringify(parsed, null, indent);
            
            // 将格式化后的JSON设置到输出区域
            jsonOutput.textContent = formatted;
            
            // 应用语法高亮
            hljs.highlightElement(jsonOutput);
            
            // 添加行号
            addLineNumbers(jsonOutput);
            
            showJsonMessage('JSON格式化成功', 'success');
        } catch (error) {
            showJsonMessage(`JSON解析错误: ${error.message}`, 'error');
        }
    });
    
    // 压缩JSON
    minifyButton.addEventListener('click', () => {
        const json = jsonInput.value.trim();
        if (!json) {
            showJsonMessage('请输入JSON数据', 'error');
            return;
        }
        
        try {
            const parsed = JSON.parse(json);
            const minified = JSON.stringify(parsed);
            
            jsonOutput.textContent = minified;
            hljs.highlightElement(jsonOutput);
            
            showJsonMessage('JSON压缩成功', 'success');
        } catch (error) {
            showJsonMessage(`JSON解析错误: ${error.message}`, 'error');
        }
    });
    
    // 清空输入
    clearButton.addEventListener('click', () => {
        jsonInput.value = '';
        jsonOutput.textContent = '';
        showJsonMessage('输入已清空', 'success');
    });
    
    // 加载示例JSON
    loadSampleButton.addEventListener('click', () => {
        const sampleJson = {
            "name": "JSON示例",
            "type": "对象",
            "isArray": false,
            "properties": {
                "string": "这是一个字符串",
                "number": 42,
                "boolean": true,
                "null": null,
                "object": {
                    "nested": "嵌套对象"
                },
                "array": [1, 2, 3, 4, 5]
            },
            "created_at": "2023-01-01T00:00:00Z"
        };
        
        jsonInput.value = JSON.stringify(sampleJson, null, 2);
        showJsonMessage('示例JSON已加载', 'success');
    });
    
    // 粘贴JSON
    pasteButton.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            jsonInput.value = text;
            showJsonMessage('已从剪贴板粘贴', 'success');
        } catch (error) {
            showJsonMessage('无法访问剪贴板', 'error');
        }
    });
    
    // 复制JSON
    copyButton.addEventListener('click', () => {
        const text = jsonOutput.textContent;
        if (!text) {
            showJsonMessage('没有可复制的内容', 'error');
            return;
        }
        
        navigator.clipboard.writeText(text)
            .then(() => {
                showJsonMessage('已复制到剪贴板', 'success');
            })
            .catch(() => {
                showJsonMessage('复制失败', 'error');
            });
    });
    
    // 下载JSON
    downloadButton.addEventListener('click', () => {
        const text = jsonOutput.textContent;
        if (!text) {
            showJsonMessage('没有可下载的内容', 'error');
            return;
        }
        
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'formatted.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showJsonMessage('JSON文件已下载', 'success');
    });
    
    // 显示消息
    function showJsonMessage(text, type) {
        // 移除现有消息
        const existingMessage = document.querySelector('#json-formatter .message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 创建新消息
        const message = document.createElement('div');
        message.className = `message ${type}-message`;
        message.textContent = text;
        
        // 插入到控制区域后面
        const editorControls = document.querySelector('.editor-controls');
        editorControls.parentNode.insertBefore(message, editorControls.nextSibling);
        
        // 3秒后自动移除
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}

// 日期转时间戳工具
function initTimestampConverter() {
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

// 图片尺寸调整工具
function initImageResizer() {
    const uploadArea = document.getElementById('resize-upload-area');
    const imageUpload = document.getElementById('resize-image-upload');
    const percentageSlider = document.getElementById('percentage-slider');
    const percentageValue = document.getElementById('percentage-value');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const maintainAspectRatio = document.getElementById('maintain-aspect-ratio');
    const outputFormat = document.getElementById('resize-output-format');
    const resizeButton = document.getElementById('resize-button');
    const resultsArea = document.getElementById('resize-results-area');
    const resultsGrid = document.getElementById('resize-results-grid');
    const downloadAllButton = document.getElementById('resize-download-all');
    const percentageOptions = document.getElementById('percentage-options');
    const dimensionsOptions = document.getElementById('dimensions-options');
    const resizeMethodRadios = document.querySelectorAll('input[name="resize-method"]');
    
    let uploadedImages = [];
    let originalDimensions = {};
    
    // 更新百分比值显示
    percentageSlider.addEventListener('input', () => {
        percentageValue.textContent = `${percentageSlider.value}%`;
        
        // 如果已经上传了图片，实时更新宽高输入框的值
        if (Object.keys(originalDimensions).length > 0) {
            const percentage = parseInt(percentageSlider.value) / 100;
            
            // 更新所有图片的宽高输入框
            const firstImage = uploadedImages[0];
            if (firstImage) {
                const originalWidth = originalDimensions[firstImage.name].width;
                const originalHeight = originalDimensions[firstImage.name].height;
                
                widthInput.value = Math.round(originalWidth * percentage);
                heightInput.value = Math.round(originalHeight * percentage);
            }
        }
    });
    
    // 宽度输入框变化时，如果保持宽高比，自动调整高度
    widthInput.addEventListener('input', () => {
        if (maintainAspectRatio.checked && Object.keys(originalDimensions).length > 0) {
            const firstImage = uploadedImages[0];
            if (firstImage) {
                const originalWidth = originalDimensions[firstImage.name].width;
                const originalHeight = originalDimensions[firstImage.name].height;
                const aspectRatio = originalHeight / originalWidth;
                
                const newWidth = parseInt(widthInput.value) || 0;
                heightInput.value = Math.round(newWidth * aspectRatio);
            }
        }
    });
    
    // 高度输入框变化时，如果保持宽高比，自动调整宽度
    heightInput.addEventListener('input', () => {
        if (maintainAspectRatio.checked && Object.keys(originalDimensions).length > 0) {
            const firstImage = uploadedImages[0];
            if (firstImage) {
                const originalWidth = originalDimensions[firstImage.name].width;
                const originalHeight = originalDimensions[firstImage.name].height;
                const aspectRatio = originalWidth / originalHeight;
                
                const newHeight = parseInt(heightInput.value) || 0;
                widthInput.value = Math.round(newHeight * aspectRatio);
            }
        }
    });
    
    // 切换调整方式
    resizeMethodRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'percentage') {
                percentageOptions.style.display = 'block';
                dimensionsOptions.style.display = 'none';
            } else {
                percentageOptions.style.display = 'none';
                dimensionsOptions.style.display = 'block';
                
                // 如果已经上传了图片，初始化宽高输入框的值
                if (uploadedImages.length > 0) {
                    const firstImage = uploadedImages[0];
                    widthInput.value = firstImage.width;
                    heightInput.value = firstImage.height;
                }
            }
        });
    });
    
    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => {
        imageUpload.click();
    });
    
    // 文件拖放功能
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.backgroundColor = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.backgroundColor = '';
        
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    });
    
    // 文件选择处理
    imageUpload.addEventListener('change', () => {
        if (imageUpload.files.length > 0) {
            handleFiles(imageUpload.files);
        }
    });
    
    // 处理上传的文件
    function handleFiles(files) {
        uploadedImages = [];
        originalDimensions = {};
        resultsGrid.innerHTML = '';
        resultsArea.style.display = 'none';
        
        const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (validFiles.length === 0) {
            showMessage('请选择有效的图片文件', 'error');
            return;
        }
        
        validFiles.forEach(file => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    uploadedImages.push({
                        name: file.name,
                        originalSize: file.size,
                        width: img.width,
                        height: img.height,
                        src: img.src,
                        type: file.type
                    });
                    
                    // 保存原始尺寸
                    originalDimensions[file.name] = {
                        width: img.width,
                        height: img.height
                    };
                    
                    if (uploadedImages.length === validFiles.length) {
                        resizeButton.disabled = false;
                        showMessage(`已上传 ${uploadedImages.length} 张图片，点击"调整尺寸"按钮开始处理`, 'success');
                        
                        // 初始化宽高输入框
                        const firstImage = uploadedImages[0];
                        if (document.querySelector('input[name="resize-method"]:checked').value === 'dimensions') {
                            widthInput.value = firstImage.width;
                            heightInput.value = firstImage.height;
                        } else {
                            // 根据百分比更新宽高
                            const percentage = parseInt(percentageSlider.value) / 100;
                            widthInput.value = Math.round(firstImage.width * percentage);
                            heightInput.value = Math.round(firstImage.height * percentage);
                        }
                    }
                };
                img.src = e.target.result;
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // 调整图片尺寸
    resizeButton.addEventListener('click', () => {
        if (uploadedImages.length === 0) return;
        
        const resizeMethod = document.querySelector('input[name="resize-method"]:checked').value;
        const format = outputFormat.value;
        
        resultsGrid.innerHTML = '';
        resultsArea.style.display = 'block';
        
        const resizedImages = [];
        
        uploadedImages.forEach((image, index) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 计算新的尺寸
            let newWidth, newHeight;
            
            if (resizeMethod === 'percentage') {
                const percentage = parseInt(percentageSlider.value) / 100;
                newWidth = Math.round(image.width * percentage);
                newHeight = Math.round(image.height * percentage);
            } else {
                // 按具体尺寸调整
                if (maintainAspectRatio.checked) {
                    // 如果保持宽高比，使用输入的宽度和计算的高度
                    const aspectRatio = image.height / image.width;
                    newWidth = parseInt(widthInput.value) || image.width;
                    newHeight = Math.round(newWidth * aspectRatio);
                } else {
                    // 否则使用输入的宽度和高度
                    newWidth = parseInt(widthInput.value) || image.width;
                    newHeight = parseInt(heightInput.value) || image.height;
                }
            }
            
            // 设置画布尺寸
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            // 创建临时图像
            const tempImg = new Image();
            tempImg.onload = () => {
                // 绘制图像到画布
                ctx.drawImage(tempImg, 0, 0, newWidth, newHeight);
                
                // 转换为所需格式
                let mimeType;
                switch (format) {
                    case 'jpeg':
                        mimeType = 'image/jpeg';
                        break;
                    case 'png':
                        mimeType = 'image/png';
                        break;
                    case 'webp':
                        mimeType = 'image/webp';
                        break;
                    default:
                        mimeType = 'image/jpeg';
                }
                
                // 获取调整后的图像数据
                const resizedDataUrl = canvas.toDataURL(mimeType, 1.0); // 使用最高质量
                
                // 计算调整后的大小
                const base64Data = resizedDataUrl.split(',')[1];
                const resizedSize = Math.round((base64Data.length * 3) / 4);
                
                // 创建结果项
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                
                // 创建图像预览
                const imgPreview = document.createElement('img');
                imgPreview.src = resizedDataUrl;
                resultItem.appendChild(imgPreview);
                
                // 创建信息区域
                const infoDiv = document.createElement('div');
                infoDiv.className = 'result-info';
                
                const originalSizeKB = Math.round(image.originalSize / 1024);
                const resizedSizeKB = Math.round(resizedSize / 1024);
                const sizeChangePercent = Math.round((resizedSize / image.originalSize) * 100);
                
                infoDiv.innerHTML = `
                    <p><strong>文件名:</strong> ${image.name}</p>
                    <p><strong>原始尺寸:</strong> ${image.width} x ${image.height} px</p>
                    <p><strong>调整后尺寸:</strong> ${newWidth} x ${newHeight} px</p>
                    <p><strong>原始大小:</strong> ${originalSizeKB} KB</p>
                    <p><strong>调整后大小:</strong> ${resizedSizeKB} KB (${sizeChangePercent}%)</p>
                `;
                resultItem.appendChild(infoDiv);
                
                // 创建操作区域
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'result-actions';
                
                const downloadButton = document.createElement('button');
                downloadButton.className = 'secondary-button';
                downloadButton.innerHTML = '<i class="fas fa-download"></i> 下载';
                downloadButton.addEventListener('click', () => {
                    // 创建下载链接
                    const link = document.createElement('a');
                    link.href = resizedDataUrl;
                    
                    // 设置文件名
                    const fileName = image.name.split('.');
                    fileName.pop();
                    link.download = `${fileName.join('.')}_resized.${format}`;
                    
                    // 触发下载
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
                
                actionsDiv.appendChild(downloadButton);
                resultItem.appendChild(actionsDiv);
                
                // 添加到结果网格
                resultsGrid.appendChild(resultItem);
                
                // 保存调整后的图像数据
                resizedImages.push({
                    dataUrl: resizedDataUrl,
                    name: image.name,
                    format: format
                });
                
                // 如果所有图像都已处理完毕
                if (resizedImages.length === uploadedImages.length) {
                    // 启用"下载全部"按钮
                    downloadAllButton.disabled = false;
                }
            };
            
            tempImg.src = image.src;
        });
    });
    
    // 下载所有调整后的图像
    downloadAllButton.addEventListener('click', () => {
        // 创建一个ZIP文件
        if (typeof JSZip === 'undefined') {
            // 如果JSZip库未加载，使用单独下载
            const delay = 500; // 延迟时间，单位毫秒
            
            document.querySelectorAll('#resize-results-grid .result-item .result-actions button').forEach((button, index) => {
                setTimeout(() => {
                    button.click();
                }, index * delay);
            });
        } else {
            // 使用JSZip创建压缩包
            const zip = new JSZip();
            
            // 添加所有图像到ZIP
            uploadedImages.forEach((image, index) => {
                const base64Data = image.src.split(',')[1];
                zip.file(`image_${index + 1}_resized.${outputFormat.value}`, base64Data, { base64: true });
            });
            
            // 生成ZIP文件并下载
            zip.generateAsync({ type: 'blob' }).then((content) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = 'resized_images.zip';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }
    });
    
    // 显示消息
    function showMessage(text, type) {
        // 移除现有消息
        const existingMessage = document.querySelector('#image-resizer .message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 创建新消息
        const message = document.createElement('div');
        message.className = `message ${type}-message`;
        message.textContent = text;
        
        // 插入到上传区域后面
        uploadArea.parentNode.insertBefore(message, uploadArea.nextSibling);
        
        // 5秒后自动移除
        setTimeout(() => {
            message.remove();
        }, 5000);
    }
}

// Spine预览工具
function initSpineViewer() {
    const uploadArea = document.getElementById('spine-upload-area');
    const fileUpload = document.getElementById('spine-file-upload');
    const folderUpload = document.getElementById('spine-folder-upload');
    const canvasContainer = document.getElementById('spine-canvas-container');
    const canvas = document.getElementById('spine-canvas');
    const controls = document.getElementById('spine-controls');
    const animationSelect = document.getElementById('animation-select');
    const skinSelect = document.getElementById('skin-select');
    const playButton = document.getElementById('play-animation');
    const pauseButton = document.getElementById('pause-animation');
    const loopButton = document.getElementById('loop-animation');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    const scaleSlider = document.getElementById('scale-slider');
    const scaleValue = document.getElementById('scale-value');
    const resetViewButton = document.getElementById('reset-view');
    const formatSelect = document.getElementById('spine-format');
    const spineInfo = document.getElementById('spine-info');
    const spineInfoContent = document.getElementById('spine-info-content');
    const spineFileList = document.getElementById('spine-file-list');
    const debugCheckbox = document.getElementById('spine-debug');
    const bgColorPicker = document.getElementById('spine-bg-color');
    const exportButton = document.getElementById('export-spine');
    
    // 状态变量
    let spineApp = null;
    let skeleton = null;
    let animationState = null;
    let currentObjectUrls = []; // 用于跟踪创建的对象URL
    let debugRenderer = null;
    let fileGroups = {}; // 用于存储按名称分组的文件
    let currentFileGroup = null; // 当前选择的文件组
    
    // 检查Spine库是否可用
    const isSpineAvailable = typeof spine !== 'undefined';
    
    if (!isSpineAvailable) {
        showSpineMessage('Spine库未加载，请检查网络连接', 'error');
        loadSpineLibrary(); // 尝试动态加载Spine库
    }
    
    // 动态加载Spine库
    function loadSpineLibrary() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@esotericsoftware/spine-webgl@4.1.23/dist/iife/spine-webgl.min.js';
        script.onload = () => {
            showSpineMessage('Spine库加载成功', 'success');
        };
        script.onerror = () => {
            showSpineMessage('无法加载Spine库，请检查网络连接', 'error');
        };
        document.head.appendChild(script);
        
        // Spine WebGL 不需要额外的CSS
    }
    
    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => {
        fileUpload.click();
    });
    
    // 文件上传按钮点击事件
    const fileUploadBtn = document.getElementById('spine-file-upload-btn');
    if (fileUploadBtn) {
        fileUploadBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡到uploadArea
            fileUpload.click();
        });
    }
    
    // 文件夹上传按钮事件
    if (folderUpload) {
        folderUpload.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.webkitdirectory = true;
            input.multiple = true;
            
            input.onchange = (e) => {
                if (e.target.files.length > 0) {
                    handleFolderSelection(e.target.files);
                }
            };
            
            input.click();
        });
    }
    
    // 加载示例按钮事件
    const loadExampleButton = document.getElementById('load-example-spine');
    if (loadExampleButton) {
        loadExampleButton.addEventListener('click', () => {
            loadExampleSpine();
        });
    }
    
    // 加载示例Spine动画
    function loadExampleSpine() {
        showSpineMessage('正在加载示例Spine动画...', 'info');
        
        // 创建一个文件组对象
        const fileGroup = {
            baseName: 'alien-pro',
            json: null,
            skel: null,
            atlas: null,
            textures: []
        };
        
        // 使用fetch API加载示例文件
        Promise.all([
            fetch('/spine/alien-pro.json').then(response => response.blob()),
            fetch('/spine/alien-pro.atlas').then(response => response.text()),
            fetch('/spine/alien-pro.png').then(response => response.blob())
        ]).then(([jsonBlob, atlasText, pngBlob]) => {
            // 创建文件对象
            const jsonFile = new File([jsonBlob], 'alien-pro.json', { type: 'application/json' });
            const atlasFile = new File([new Blob([atlasText])], 'alien-pro.atlas', { type: 'text/plain' });
            const pngFile = new File([pngBlob], 'alien-pro.png', { type: 'image/png' });
            
            // 设置文件组
            fileGroup.json = jsonFile;
            fileGroup.atlas = atlasFile;
            fileGroup.textures = [pngFile];
            
            // 清理之前的资源
            cleanupResources();
            
            // 加载Spine动画
            loadJsonSkeleton(fileGroup);
            
        }).catch(error => {
            showSpineMessage(`加载示例失败: ${error.message}`, 'error');
            console.error('加载示例失败:', error);
        });
    }
    
    // 文件拖放功能
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.backgroundColor = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.backgroundColor = '';
        
        if (e.dataTransfer.files.length > 0) {
            // 检查是否是文件夹拖放
            if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
                const items = e.dataTransfer.items;
                // 检查是否有目录
                let hasDirectory = false;
                for (let i = 0; i < items.length; i++) {
                    const item = items[i].webkitGetAsEntry();
                    if (item && item.isDirectory) {
                        hasDirectory = true;
                        break;
                    }
                }
                
                if (hasDirectory) {
                    handleFolderSelection(e.dataTransfer.files);
                    return;
                }
            }
            
            handleFiles(e.dataTransfer.files);
        }
    });
    
    // 文件选择处理
    fileUpload.addEventListener('change', () => {
        if (fileUpload.files.length > 0) {
            handleFiles(fileUpload.files);
        }
    });
    
    // 处理文件夹选择
    function handleFolderSelection(files) {
        // 重置文件组
        fileGroups = {};
        
        // 分类文件
        Array.from(files).forEach(file => {
            // 提取基础文件名（不含扩展名）
            const filePath = file.webkitRelativePath || file.name;
            const fileName = filePath.split('/').pop();
            const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
            const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
            
            // 初始化分组
            if (!fileGroups[baseName]) {
                fileGroups[baseName] = {
                    baseName: baseName,
                    json: null,
                    skel: null,
                    atlas: null,
                    textures: []
                };
            }
            
            // 根据扩展名归类
            if (extension === '.json') {
                fileGroups[baseName].json = file;
            } else if (extension === '.skel') {
                fileGroups[baseName].skel = file;
            } else if (extension === '.atlas') {
                fileGroups[baseName].atlas = file;
            } else if (['.png', '.jpg', '.jpeg', '.webp'].includes(extension)) {
                fileGroups[baseName].textures.push(file);
            }
        });
        
        // 验证每组文件是否构成完整Spine资源
        const validGroups = Object.values(fileGroups).filter(group => {
            const hasSkeletonFile = group.json || group.skel;
            return hasSkeletonFile && group.atlas && group.textures.length > 0;
        });
        
        if (validGroups.length === 0) {
            showSpineMessage('未找到有效的Spine资源组', 'error');
            return;
        }
        
        // 渲染文件列表
        renderFileList(validGroups);
    }
    
    // 渲染文件列表
    function renderFileList(groups) {
        // 清空文件列表
        spineFileList.innerHTML = '';
        
        // 创建列表标题
        const listTitle = document.createElement('h3');
        listTitle.textContent = '可用Spine模型';
        spineFileList.appendChild(listTitle);
        
        // 创建列表
        const list = document.createElement('ul');
        list.className = 'spine-file-list';
        
        groups.forEach(group => {
            const item = document.createElement('li');
            
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = group.baseName;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 高亮选中项
                document.querySelectorAll('.spine-file-list li').forEach(li => {
                    li.classList.remove('active');
                });
                item.classList.add('active');
                
                // 加载选中的Spine模型
                loadSelectedSpineModel(group);
            });
            
            // 添加文件格式标签
            const formatBadge = document.createElement('span');
            formatBadge.className = 'format-badge';
            formatBadge.textContent = group.skel ? 'SKEL' : 'JSON';
            link.appendChild(formatBadge);
            
            item.appendChild(link);
            list.appendChild(item);
        });
        
        spineFileList.appendChild(list);
        spineFileList.style.display = 'block';
        
        // 自动选择第一个模型
        if (groups.length > 0) {
            loadSelectedSpineModel(groups[0]);
            list.querySelector('li').classList.add('active');
        }
    }
    
    // 加载选中的Spine模型
    function loadSelectedSpineModel(fileGroup) {
        currentFileGroup = fileGroup;
        
        // 清理之前的资源
        cleanupResources();
        
        // 根据文件格式选择加载方法
        if (fileGroup.skel) {
            loadBinarySkeleton(fileGroup);
        } else {
            loadJsonSkeleton(fileGroup);
        }
    }
    
    // 处理上传的文件
    function handleFiles(fileList) {
        // 重置文件对象
        const files = {
            json: null,
            skel: null,
            atlas: null,
            textures: []
        };
        
        // 分类文件
        Array.from(fileList).forEach(file => {
            const extension = file.name.split('.').pop().toLowerCase();
            
            if (extension === 'json') {
                files.json = file;
            } else if (extension === 'skel') {
                files.skel = file;
            } else if (extension === 'atlas') {
                files.atlas = file;
            } else if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
                files.textures.push(file);
            }
        });
        
        // 检查必要文件
        const hasSkeletonFile = files.json || files.skel;
        if (!hasSkeletonFile || !files.atlas || files.textures.length === 0) {
            showSpineMessage('缺少必要的Spine文件，请上传.json/.skel、.atlas和图片文件', 'error');
            return;
        }
        
        // 创建文件组并加载
        const baseName = (files.json || files.skel).name.split('.')[0];
        const fileGroup = {
            baseName: baseName,
            json: files.json,
            skel: files.skel,
            atlas: files.atlas,
            textures: files.textures
        };
        
        // 清理之前的资源
        cleanupResources();
        
        // 加载Spine动画
        if (files.skel && formatSelect.value === 'skel') {
            loadBinarySkeleton(fileGroup);
        } else {
            loadJsonSkeleton(fileGroup);
        }
    }
    
    // 加载JSON格式的Spine动画
    function loadJsonSkeleton(fileGroup) {
        if (!isSpineAvailable) {
            showSpineMessage('Spine库未加载，无法预览动画', 'error');
            return;
        }
        
        showLoadingOverlay(canvasContainer, '加载Spine动画...');
        
        // 读取JSON文件
        const jsonReader = new FileReader();
        jsonReader.onload = (jsonEvent) => {
            const jsonData = jsonEvent.target.result;
            
            // 读取Atlas文件
            const atlasReader = new FileReader();
            atlasReader.onload = (atlasEvent) => {
                const atlasData = atlasEvent.target.result;
                
                // 读取纹理文件
                loadTextures(fileGroup.textures, (textures) => {
                    try {
                        // 初始化Spine应用
                        initSpineApp();
                        
                        // 创建纹理加载器
                        const textureLoader = {
                            loadTexture: (path, success) => {
                                const fileName = path.split('/').pop();
                                const texture = textures.find(t => t.name === fileName || t.name === fileName.toLowerCase());
                                if (texture) {
                                    const spineTexture = new spine.webgl.GLTexture(spineApp.context, texture.image);
                                    success(new spine.webgl.TextureRegion(spineTexture));
                                } else {
                                    console.warn(`未找到纹理: ${fileName}，尝试从文件系统加载`);
                                    
                                    // 尝试从文件系统加载
                                    const img = new Image();
                                    img.crossOrigin = "Anonymous";
                                    img.onload = () => {
                                        const spineTexture = new spine.webgl.GLTexture(spineApp.context, img);
                                        success(new spine.webgl.TextureRegion(spineTexture));
                                    };
                                    img.onerror = () => {
                                        console.error(`无法加载纹理: ${path}`);
                                    };
                                    
                                    // 尝试从当前目录或spine目录加载
                                    img.src = path;
                                }
                            }
                        };
                        
                        // 加载骨骼数据
                        const atlas = new spine.TextureAtlas(atlasData, textureLoader);
                        const atlasLoader = new spine.AtlasAttachmentLoader(atlas);
                        const skeletonJson = new spine.SkeletonJson(atlasLoader);
                        
                        // 设置缩放
                        skeletonJson.scale = 1.0;
                        
                        // 解析JSON数据
                        let parsedData;
                        try {
                            parsedData = JSON.parse(jsonData);
                        } catch (e) {
                            showSpineMessage(`JSON解析错误: ${e.message}`, 'error');
                            removeLoadingOverlay(canvasContainer);
                            return;
                        }
                        
                        const skeletonData = skeletonJson.readSkeletonData(parsedData);
                        
                        // 创建骨骼和动画状态
                        skeleton = new spine.Skeleton(skeletonData);
                        const animationStateData = new spine.AnimationStateData(skeletonData);
                        
                        // 设置默认混合时间
                        animationStateData.defaultMix = 0.2;
                        
                        animationState = new spine.AnimationState(animationStateData);
                        
                        // 更新UI
                        updateSpineUI(skeletonData);
                        
                        // 设置渲染
                        spineApp.loadSkeleton(skeleton, animationState);
                        spineApp.play();
                        
                        // 显示控制区域
                        controls.style.display = 'flex';
                        spineInfo.style.display = 'block';
                        
                        // 移除加载覆盖层
                        removeLoadingOverlay(canvasContainer);
                        
                        showSpineMessage('Spine动画加载成功', 'success');
                    } catch (error) {
                        removeLoadingOverlay(canvasContainer);
                        showSpineMessage(`加载Spine动画失败: ${error.message}`, 'error');
                        console.error(error);
                    }
                });
            };
            atlasReader.readAsText(fileGroup.atlas);
        };
        jsonReader.readAsText(fileGroup.json);
    }
    
    // 加载二进制skel格式的Spine动画
    function loadBinarySkeleton(fileGroup) {
        if (!isSpineAvailable) {
            showSpineMessage('Spine库未加载，无法预览动画', 'error');
            return;
        }
        
        showLoadingOverlay(canvasContainer, '加载Spine动画...');
        
        // 读取SKEL文件
        const skelReader = new FileReader();
        skelReader.onload = (skelEvent) => {
            const skelData = skelEvent.target.result;
            
            // 读取Atlas文件
            const atlasReader = new FileReader();
            atlasReader.onload = (atlasEvent) => {
                const atlasData = atlasEvent.target.result;
                
                // 读取纹理文件
                loadTextures(fileGroup.textures, (textures) => {
                    try {
                        // 初始化Spine应用
                        initSpineApp();
                        
                        // 创建纹理加载器
                        const textureLoader = {
                            loadTexture: (path, success) => {
                                const fileName = path.split('/').pop();
                                const texture = textures.find(t => t.name === fileName || t.name === fileName.toLowerCase());
                                if (texture) {
                                    const spineTexture = new spine.webgl.GLTexture(spineApp.context, texture.image);
                                    success(new spine.webgl.TextureRegion(spineTexture));
                                } else {
                                    console.warn(`未找到纹理: ${fileName}`);
                                }
                            }
                        };
                        
                        // 加载骨骼数据
                        const atlas = new spine.TextureAtlas(atlasData, textureLoader);
                        const atlasLoader = new spine.AtlasAttachmentLoader(atlas);
                        const skeletonBinary = new spine.SkeletonBinary(atlasLoader);
                        
                        // 设置缩放
                        skeletonBinary.scale = 1.0;
                        
                        // 解析二进制数据
                        const skeletonData = skeletonBinary.readSkeletonData(new Uint8Array(skelData));
                        
                        // 创建骨骼和动画状态
                        skeleton = new spine.Skeleton(skeletonData);
                        const animationStateData = new spine.AnimationStateData(skeletonData);
                        
                        // 设置默认混合时间
                        animationStateData.defaultMix = 0.2;
                        
                        animationState = new spine.AnimationState(animationStateData);
                        
                        // 更新UI
                        updateSpineUI(skeletonData);
                        
                        // 设置渲染
                        spineApp.loadSkeleton(skeleton, animationState);
                        spineApp.play();
                        
                        // 显示控制区域
                        controls.style.display = 'flex';
                        spineInfo.style.display = 'block';
                        
                        // 移除加载覆盖层
                        removeLoadingOverlay(canvasContainer);
                        
                        showSpineMessage('Spine动画加载成功', 'success');
                    } catch (error) {
                        removeLoadingOverlay(canvasContainer);
                        showSpineMessage(`加载Spine动画失败: ${error.message}`, 'error');
                        console.error(error);
                    }
                });
            };
            atlasReader.readAsText(fileGroup.atlas);
        };
        skelReader.readAsArrayBuffer(fileGroup.skel);
    }
    
    // 加载纹理
    function loadTextures(textureFiles, callback) {
        const texturePromises = textureFiles.map(textureFile => {
            return new Promise((resolve) => {
                const textureReader = new FileReader();
                textureReader.onload = (textureEvent) => {
                    const img = new Image();
                    img.onload = () => {
                        // 创建对象URL并保存以便后续清理
                        const objectUrl = textureEvent.target.result;
                        currentObjectUrls.push(objectUrl);
                        
                        resolve({
                            name: textureFile.name,
                            image: img
                        });
                    };
                    img.src = textureEvent.target.result;
                };
                textureReader.readAsDataURL(textureFile);
            });
        });
        
        Promise.all(texturePromises).then(textures => {
            callback(textures);
        });
    }
    
    // 初始化Spine应用
    function initSpineApp() {
        // 如果已存在，先清理
        if (spineApp) {
            spineApp.dispose();
        }
        
        // 创建新的Spine应用
        spineApp = new spine.SpineCanvas(canvas, {
            pathPrefix: '',
            app: {
                loadAssets: () => {},
                initialize: () => {},
                update: () => {},
                render: () => {}
            }
        });
        
        // 设置背景颜色
        const bgColor = bgColorPicker ? bgColorPicker.value : '#333333';
        spineApp.backgroundColor = { r: 0, g: 0, b: 0, a: 0 };
        
        // 创建调试渲染器
        if (debugCheckbox && debugCheckbox.checked) {
            debugRenderer = new spine.webgl.SkeletonDebugRenderer(spineApp.context);
            debugRenderer.drawRegionAttachments = true;
            debugRenderer.drawBoundingBoxes = true;
            debugRenderer.drawMeshHull = true;
            debugRenderer.drawMeshTriangles = true;
            debugRenderer.drawPaths = true;
            
            // 添加自定义渲染函数
            const originalRender = spineApp.render;
            spineApp.render = (skeleton) => {
                originalRender(skeleton);
                
                // 渲染调试信息
                if (debugRenderer && skeleton) {
                    debugRenderer.draw(spineApp.context, skeleton);
                }
            };
        }
        
        // 启用拖动和缩放
        enableDragAndZoom();
    }
    
    // 启用拖动和缩放功能
    function enableDragAndZoom() {
        if (!spineApp) return;
        
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;
        
        // 鼠标拖动
        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;
                
                spineApp.sceneRenderer.camera.position.x -= deltaX / spineApp.sceneRenderer.camera.zoom;
                spineApp.sceneRenderer.camera.position.y += deltaY / spineApp.sceneRenderer.camera.zoom;
                
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });
        
        window.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // 鼠标滚轮缩放
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = spineApp.sceneRenderer.camera.zoom * zoomFactor;
            
            // 限制缩放范围
            if (newZoom > 0.1 && newZoom < 10) {
                spineApp.sceneRenderer.camera.zoom = newZoom;
                scaleSlider.value = newZoom;
                scaleValue.textContent = `${newZoom.toFixed(1)}x`;
            }
        });
        
        // 触摸拖动
        let touchStartX = 0;
        let touchStartY = 0;
        let initialDistance = 0;
        
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                // 双指缩放
                initialDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            }
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 1 && isDragging) {
                const deltaX = e.touches[0].clientX - touchStartX;
                const deltaY = e.touches[0].clientY - touchStartY;
                
                spineApp.sceneRenderer.camera.position.x -= deltaX / spineApp.sceneRenderer.camera.zoom;
                spineApp.sceneRenderer.camera.position.y += deltaY / spineApp.sceneRenderer.camera.zoom;
                
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                // 计算新的距离
                const currentDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                
                // 计算缩放比例
                const zoomFactor = currentDistance / initialDistance;
                initialDistance = currentDistance;
                
                const newZoom = spineApp.sceneRenderer.camera.zoom * zoomFactor;
                
                // 限制缩放范围
                if (newZoom > 0.1 && newZoom < 10) {
                    spineApp.sceneRenderer.camera.zoom = newZoom;
                    scaleSlider.value = newZoom;
                    scaleValue.textContent = `${newZoom.toFixed(1)}x`;
                }
            }
        });
        
        canvas.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
    
    // 更新Spine UI
    function updateSpineUI(skeletonData) {
        // 清空选择框
        animationSelect.innerHTML = '';
        skinSelect.innerHTML = '';
        
        // 添加动画选项
        skeletonData.animations.forEach(animation => {
            const option = document.createElement('option');
            option.value = animation.name;
            option.textContent = animation.name;
            animationSelect.appendChild(option);
        });
        
        // 添加皮肤选项
        skeletonData.skins.forEach(skin => {
            const option = document.createElement('option');
            option.value = skin.name;
            option.textContent = skin.name;
            skinSelect.appendChild(option);
        });
        
        // 设置默认动画
        if (animationSelect.options.length > 0) {
            const defaultAnimation = animationSelect.options[0].value;
            animationState.setAnimation(0, defaultAnimation, loopButton.classList.contains('active'));
        }
        
        // 显示Spine信息
        const spineInfo = {
            name: currentFileGroup ? currentFileGroup.baseName : '未命名',
            format: currentFileGroup && currentFileGroup.skel ? 'Binary (skel)' : 'JSON',
            animations: skeletonData.animations.map(a => a.name),
            skins: skeletonData.skins.map(s => s.name),
            bones: skeletonData.bones.length,
            slots: skeletonData.slots.length,
            events: skeletonData.events ? skeletonData.events.length : 0,
            attachments: countAttachments(skeletonData)
        };
        
        spineInfoContent.textContent = JSON.stringify(spineInfo, null, 2);
        
        // 设置事件监听
        setupEventListeners();
    }
    
    // 计算附件数量
    function countAttachments(skeletonData) {
        let count = 0;
        skeletonData.skins.forEach(skin => {
            Object.keys(skin.attachments).forEach(slotIndex => {
                count += Object.keys(skin.attachments[slotIndex]).length;
            });
        });
        return count;
    }
    
    // 设置事件监听
    function setupEventListeners() {
        // 移除之前的事件监听器
        const newAnimationSelect = animationSelect.cloneNode(true);
        const newSkinSelect = skinSelect.cloneNode(true);
        const newPlayButton = playButton.cloneNode(true);
        const newPauseButton = pauseButton.cloneNode(true);
        const newLoopButton = loopButton.cloneNode(true);
        const newSpeedSlider = speedSlider.cloneNode(true);
        const newScaleSlider = scaleSlider.cloneNode(true);
        const newResetViewButton = resetViewButton.cloneNode(true);
        
        animationSelect.parentNode.replaceChild(newAnimationSelect, animationSelect);
        skinSelect.parentNode.replaceChild(newSkinSelect, skinSelect);
        playButton.parentNode.replaceChild(newPlayButton, playButton);
        pauseButton.parentNode.replaceChild(newPauseButton, pauseButton);
        loopButton.parentNode.replaceChild(newLoopButton, loopButton);
        speedSlider.parentNode.replaceChild(newSpeedSlider, speedSlider);
        scaleSlider.parentNode.replaceChild(newScaleSlider, scaleSlider);
        resetViewButton.parentNode.replaceChild(newResetViewButton, resetViewButton);
        
        // 更新引用
        animationSelect = newAnimationSelect;
        skinSelect = newSkinSelect;
        playButton = newPlayButton;
        pauseButton = newPauseButton;
        loopButton = newLoopButton;
        speedSlider = newSpeedSlider;
        scaleSlider = newScaleSlider;
        resetViewButton = newResetViewButton;
        
        // 添加新的事件监听器
        animationSelect.addEventListener('change', () => {
            const selectedAnimation = animationSelect.value;
            animationState.setAnimation(0, selectedAnimation, loopButton.classList.contains('active'));
        });
        
        skinSelect.addEventListener('change', () => {
            const selectedSkin = skinSelect.value;
            skeleton.setSkinByName(selectedSkin);
            skeleton.setSlotsToSetupPose();
        });
        
        playButton.addEventListener('click', () => {
            spineApp.play();
        });
        
        pauseButton.addEventListener('click', () => {
            spineApp.pause();
        });
        
        loopButton.addEventListener('click', () => {
            loopButton.classList.toggle('active');
            const isLooping = loopButton.classList.contains('active');
            const currentTrack = animationState.getCurrent(0);
            if (currentTrack) {
                currentTrack.loop = isLooping;
            }
        });
        
        speedSlider.addEventListener('input', () => {
            const speed = parseFloat(speedSlider.value);
            speedValue.textContent = `${speed.toFixed(1)}x`;
            animationState.timeScale = speed;
        });
        
        scaleSlider.addEventListener('input', () => {
            const scale = parseFloat(scaleSlider.value);
            scaleValue.textContent = `${scale.toFixed(1)}x`;
            spineApp.sceneRenderer.camera.zoom = scale;
        });
        
        resetViewButton.addEventListener('click', () => {
            speedSlider.value = 1;
            speedValue.textContent = '1.0x';
            animationState.timeScale = 1;
            
            scaleSlider.value = 1;
            scaleValue.textContent = '1.0x';
            spineApp.sceneRenderer.camera.zoom = 1;
            
            spineApp.sceneRenderer.camera.position.x = 0;
            spineApp.sceneRenderer.camera.position.y = 0;
        });
        
        // 调试复选框
        if (debugCheckbox) {
            debugCheckbox.addEventListener('change', () => {
                // 重新加载当前模型以应用调试设置
                if (currentFileGroup) {
                    loadSelectedSpineModel(currentFileGroup);
                }
            });
        }
        
        // 背景颜色选择器
        if (bgColorPicker) {
            bgColorPicker.addEventListener('input', () => {
                if (spineApp) {
                    const color = hexToRgb(bgColorPicker.value);
                    spineApp.backgroundColor = { r: color.r / 255, g: color.g / 255, b: color.b / 255, a: 1 };
                }
            });
        }
        
        // 导出按钮
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                exportSpineAnimation();
            });
        }
    }
    
    // 导出Spine动画
    function exportSpineAnimation() {
        if (!spineApp || !canvas) {
            showSpineMessage('没有可导出的动画', 'error');
            return;
        }
        
        try {
            // 创建临时画布
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const ctx = tempCanvas.getContext('2d');
            
            // 绘制当前画布内容
            ctx.drawImage(canvas, 0, 0);
            
            // 导出为PNG
            const dataUrl = tempCanvas.toDataURL('image/png');
            
            // 创建下载链接
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${currentFileGroup ? currentFileGroup.baseName : 'spine'}_export.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showSpineMessage('导出成功', 'success');
        } catch (error) {
            showSpineMessage(`导出失败: ${error.message}`, 'error');
        }
    }
    
    // 将十六进制颜色转换为RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    
    // 清理资源
    function cleanupResources() {
        // 释放对象URL
        currentObjectUrls.forEach(url => {
            try {
                URL.revokeObjectURL(url);
            } catch (e) {
                console.warn('清理对象URL失败:', e);
            }
        });
        currentObjectUrls = [];
        
        // 清理WebGL资源
        if (spineApp) {
            try {
                spineApp.dispose();
            } catch (e) {
                console.warn('清理Spine应用失败:', e);
            }
            spineApp = null;
        }
        
        // 重置变量
        skeleton = null;
        animationState = null;
        debugRenderer = null;
    }
    
    // 显示加载覆盖层
    function showLoadingOverlay(container, text) {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        
        const loader = document.createElement('div');
        loader.className = 'loader';
        overlay.appendChild(loader);
        
        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.textContent = text || '加载中...';
        overlay.appendChild(loadingText);
        
        container.appendChild(overlay);
    }
    
    // 移除加载覆盖层
    function removeLoadingOverlay(container) {
        const overlay = container.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    // 显示消息
    function showSpineMessage(text, type) {
        // 移除现有消息
        const existingMessage = document.querySelector('#spine-viewer .message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 创建新消息
        const message = document.createElement('div');
        message.className = `message ${type}-message`;
        message.textContent = text;
        
        // 插入到Spine容器中
        const spineContainer = document.querySelector('.spine-container');
        spineContainer.insertBefore(message, spineContainer.firstChild);
        
        // 3秒后自动移除
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
    
    // 在窗口调整大小时重新调整画布
    window.addEventListener('resize', () => {
        if (spineApp) {
            // 调整画布大小
            canvas.width = canvasContainer.clientWidth;
            canvas.height = canvasContainer.clientHeight;
            
            // 更新渲染器视口
            spineApp.resizeViewport(canvas.width, canvas.height);
        }
    });
    
    // 初始化时调整画布大小
    setTimeout(() => {
        canvas.width = canvasContainer.clientWidth;
        canvas.height = canvasContainer.clientHeight;
    }, 100);
    
    // 页面可见性变化时优化性能
    document.addEventListener('visibilitychange', () => {
        if (spineApp) {
            if (document.hidden) {
                spineApp.pause();
            } else {
                spineApp.play();
            }
        }
    });
    
    // 在组件卸载时清理资源
    window.addEventListener('beforeunload', cleanupResources);
}
