// 图片压缩工具
export function initImageCompressor() {
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
                
                // 获取压缩后的图像数据
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
