/**
 * Spine动画播放器功能
 */
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否在Spine动画播放器页面
    const spinePlayerSection = document.getElementById('spine-player');
    if (!spinePlayerSection) return;

    // 获取DOM元素
    const spineAnimationSelect = document.getElementById('spine-animation-select');
    const spinePlayerElement = document.getElementById('spine-player-element');
    
    let spinePlayer = null;

    // 添加示例动画选项
    const exampleOptions = [
        { name: "Spineboy (官方示例)", skeleton: "https://esotericsoftware.com/files/examples/4.2/spineboy/export/spineboy-pro.json", atlas: "https://esotericsoftware.com/files/examples/4.2/spineboy/export/spineboy-pma.atlas" },
        { name: "Raptor (本地)", skeleton: "spine/spineRes/raptor-pro.json", atlas: "spine/spineRes/raptor-pma.atlas" },
        { name: "Celestial Circus (本地)", skeleton: "spine/spineRes/celestial-circus-pro.json", atlas: "spine/spineRes/celestial-circus-pma.atlas" }
    ];

    // 清空并重新填充动画选择下拉框
    spineAnimationSelect.innerHTML = '';
    exampleOptions.forEach((option, index) => {
        const optionElement = document.createElement('option');
        optionElement.value = index;
        optionElement.textContent = option.name;
        spineAnimationSelect.appendChild(optionElement);
    });

    // 初始化Spine播放器 - 预设动画
    function initSpinePlayer(optionIndex) {
        // 清除现有的播放器
        if (spinePlayer) {
            try {
                spinePlayer.dispose();
            } catch (error) {
                console.error("清除播放器失败:", error);
            }
            spinePlayerElement.innerHTML = '';
        }

        const option = exampleOptions[optionIndex];
        
        try {
            // 使用更简单的方式创建Spine播放器
            spinePlayer = new spine.SpinePlayer(spinePlayerElement, {
                jsonUrl: option.skeleton.endsWith('.json') ? option.skeleton : null,
                skelUrl: option.skeleton.endsWith('.skel') ? option.skeleton : null,
                atlasUrl: option.atlas,
                backgroundColor: '#ffffff',
                premultipliedAlpha: true,
                showControls: true, // 使用内置控件
                viewport: {
                    debugRender: false,
                    padLeft: "10%",
                    padRight: "10%",
                    padTop: "10%",
                    padBottom: "10%"
                },
                defaultMix: 0.4
            });
        } catch (error) {
            console.error("创建Spine播放器失败:", error);
        }
    }

    // 事件监听器 - 选择预设动画
    spineAnimationSelect.addEventListener('change', function() {
        const selectedIndex = parseInt(this.value);
        initSpinePlayer(selectedIndex);
    });
    
    // 初始化默认动画
    initSpinePlayer(0);
});
