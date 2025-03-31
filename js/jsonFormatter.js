// JSON格式化工具
export function initJsonFormatter() {
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
