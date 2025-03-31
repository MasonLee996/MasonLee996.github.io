// 切换工具
export function switchTool(toolId) {
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

// 导航菜单功能
export function initNavigation() {
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
