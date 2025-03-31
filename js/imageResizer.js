// 图片尺寸调整工具
export function initImageResizer() {
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
