// ========================================
// SIDEBAR.JS - Course Navigation Sidebar v3
// ========================================

class CourseSidebar {
  constructor() {
    // Core Elements
    this.sidebar = document.getElementById('courseSidebar');
    if (!this.sidebar) return; // Guard clause if sidebar isn't on the page

    this.content = document.getElementById('sidebarContent');
    this.toggleBtn = document.getElementById('sidebarToggle');
    this.closeBtn = document.getElementById('sidebarClose');
    this.collapseBtn = document.getElementById('sidebarCollapseBtn');
    this.resetBtn = document.getElementById('resetProgressBtn');
    this.toggleAllModulesBtn = document.getElementById('toggleAllModulesBtn');

    // Progress Elements
    this.progressFill = document.getElementById('sidebarProgressFill');
    this.progressPercentage = document.getElementById('sidebarProgressPercentage');
    this.completedCount = document.getElementById('sidebarCompletedCount');
    this.totalCount = document.getElementById('sidebarTotalCount');

    // Storage Keys
    this.STORAGE_KEY = 'flutter_intermediate_progress';
    this.MODULE_STATE_KEY = 'sidebar_module_states';
    this.SIDEBAR_COLLAPSE_KEY = 'sidebar_collapsed';

    // State Trackers
    this.allLessons = [];
    this.lessonStatus = {};
    this.isCollapsed = false;
    this.moduleStatesBeforeCollapse = {};

    this.init();
  }

  init() {
    this.loadProgress();
    this.findAllLessons();
    this.updateAll();
    this.setupEventListeners();

    // Load initial sidebar layout and states perfectly on mount (Desktop vs Mobile)
    if (window.innerWidth >= 1025) {
      this.sidebar.classList.add('open');
      document.body.classList.add('has-sidebar');
      
      const savedCollapse = localStorage.getItem(this.SIDEBAR_COLLAPSE_KEY);
      if (savedCollapse === 'true') {
        this.sidebar.classList.add('collapsed');
        this.isCollapsed = true;
        document.body.style.setProperty('--sidebar-width', '60px');
      } else {
        this.sidebar.classList.remove('collapsed');
        this.isCollapsed = false;
        document.body.style.setProperty('--sidebar-width', '360px');
        this.restoreModuleStates();
      }
      
      const icon = this.collapseBtn?.querySelector('i');
      if (icon) icon.className = this.isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
    } else {
      this.restoreModuleStates();
    }

    // Highlight current page and auto-expand its parent module container
    this.highlightCurrentPage();

    // Run scrolling after layout engine paint settles
    if (document.readyState === 'complete') {
      this.scrollToActive();
    } else {
      window.addEventListener('load', () => this.scrollToActive());
    }
  }

  findAllLessons() {
    const topics = document.querySelectorAll('.sidebar-topic');
    this.allLessons = [];

    topics.forEach(topic => {
      const lesson = topic.dataset.lesson;
      const topicId = topic.dataset.topic;
      if (lesson) {
        this.allLessons.push({
          id: topicId,
          lesson: lesson,
          element: topic
        });
      }
    });

    if (this.totalCount) {
      this.totalCount.textContent = this.allLessons.length;
    }
  }

  loadProgress() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.lessonStatus = JSON.parse(saved);
      } catch (e) {
        this.lessonStatus = {};
      }
    } else {
      this.lessonStatus = {};
    }
  }

  saveProgress() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.lessonStatus));
  }

  saveModuleStates() {
    const modules = document.querySelectorAll('.sidebar-module');
    const states = {};
    modules.forEach((module, index) => {
      states[index] = module.classList.contains('collapsed');
    });
    localStorage.setItem(this.MODULE_STATE_KEY, JSON.stringify(states));
  }

  restoreModuleStates() {
    const saved = localStorage.getItem(this.MODULE_STATE_KEY);
    if (!saved) return;
    
    try {
      const states = JSON.parse(saved);
      const modules = document.querySelectorAll('.sidebar-module');
      modules.forEach((module, index) => {
        if (states[index] !== undefined) {
          this.setModuleCollapseState(module, states[index]);
        }
      });
      
      this.updateToggleAllButtonText();
    } catch (e) {
      console.warn('Could not restore module states:', e);
    }
  }

  saveModuleStatesBeforeCollapse() {
    const modules = document.querySelectorAll('.sidebar-module');
    modules.forEach((module, index) => {
      this.moduleStatesBeforeCollapse[index] = module.classList.contains('collapsed');
    });
  }

  restoreModuleStatesAfterExpand() {
    const modules = document.querySelectorAll('.sidebar-module');
    modules.forEach((module, index) => {
      const shouldBeCollapsed = this.moduleStatesBeforeCollapse[index] !== undefined 
        ? this.moduleStatesBeforeCollapse[index] 
        : false;
      this.setModuleCollapseState(module, shouldBeCollapsed);
    });
    
    this.updateToggleAllButtonText();
  }

  setModuleCollapseState(module, shouldCollapse) {
    const toggle = module.querySelector('.module-toggle i');
    const topicList = module.querySelector('.sidebar-topic-list');
    
    if (shouldCollapse) {
      module.classList.add('collapsed');
      if (toggle) toggle.className = 'fas fa-chevron-right';
      if (topicList) topicList.style.maxHeight = '0';
    } else {
      module.classList.remove('collapsed');
      if (toggle) toggle.className = 'fas fa-chevron-down';
      if (topicList) {
        topicList.style.maxHeight = '2000px';
        topicList.style.display = '';
      }
    }
  }

  updateToggleAllButtonText() {
    if (!this.toggleAllModulesBtn) return;
    
    const modules = document.querySelectorAll('.sidebar-module');
    let anyCollapsed = false;
    modules.forEach(module => {
      if (module.classList.contains('collapsed')) {
        anyCollapsed = true;
      }
    });
    
    if (anyCollapsed) {
      this.toggleAllModulesBtn.innerHTML = '<i class="fas fa-layer-group"></i> Expand All';
    } else {
      this.toggleAllModulesBtn.innerHTML = '<i class="fas fa-layer-group"></i> Collapse All';
    }
  }

  isLessonCompleted(lessonId) {
    return this.lessonStatus[lessonId] === true;
  }

  toggleLesson(lessonId) {
    this.lessonStatus[lessonId] = !this.isLessonCompleted(lessonId);
    this.saveProgress();
    this.updateAll();
  }

  markLessonComplete(lessonId) {
    this.lessonStatus[lessonId] = true;
    this.saveProgress();
    this.updateAll();
  }

  resetAllProgress() {
    if (confirm('Are you sure you want to reset all your progress?')) {
      this.lessonStatus = {};
      this.saveProgress();
      this.updateAll();
    }
  }

  updateAll() {
    this.updateModuleProgress();
    this.updateTopicStatus();
    this.updateOverallProgress();
  }

  updateTopicStatus() {
    const topics = document.querySelectorAll('.sidebar-topic');
    topics.forEach(topic => {
      const lesson = topic.dataset.lesson;
      const statusIcon = topic.querySelector('.topic-status i');

      if (lesson && statusIcon) {
        const completed = this.isLessonCompleted(lesson);
        const isActive = this.isCurrentPage(lesson);

        statusIcon.className = 'fas fa-circle';

        if (completed) {
          statusIcon.classList.add('status-completed');
        } else if (isActive) {
          statusIcon.classList.add('status-current');
        } else {
          statusIcon.classList.add('status-pending');
        }
      }
    });
  }

  updateModuleProgress() {
    const modules = document.querySelectorAll('.sidebar-module');
    modules.forEach(module => {
      const topics = module.querySelectorAll('.sidebar-topic');
      const progressSpan = module.querySelector('.module-progress');
      const statusSpan = module.querySelector('.module-status i');

      let completed = 0;
      let total = 0;

      topics.forEach(topic => {
        const lesson = topic.dataset.lesson;
        if (lesson) {
          total++;
          if (this.isLessonCompleted(lesson)) completed++;
        }
      });

      if (progressSpan) progressSpan.textContent = `${completed}/${total}`;

      if (statusSpan) {
        statusSpan.className = 'fas fa-circle';
        if (total > 0 && completed === total) {
          statusSpan.classList.add('status-completed');
        } else if (completed > 0) {
          statusSpan.classList.add('status-current');
        } else {
          statusSpan.classList.add('status-pending');
        }
      }
    });
  }

  updateOverallProgress() {
    let completed = 0;
    const total = this.allLessons.length;

    this.allLessons.forEach(item => {
      if (this.isLessonCompleted(item.lesson)) completed++;
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (this.progressFill) this.progressFill.style.width = `${percentage}%`;
    if (this.progressPercentage) this.progressPercentage.textContent = `${percentage}%`;
    if (this.completedCount) this.completedCount.textContent = completed;
  }

  // Replace the isCurrentPage method in sidebar.js with this:

  isCurrentPage(lesson) {
    // Get the current page path
    const currentPath = window.location.pathname.replace(/\/$/, '');
    // Get the lesson path from the sidebar link (relative path)
    const link = document.querySelector(`.sidebar-topic[data-lesson="${lesson}"] a`);
    if (!link) return false;
    
    const lessonPath = link.getAttribute('href');
    if (!lessonPath) return false;
    
    // Compare the full path (normalized)
    const currentFull = currentPath.split('/').filter(p => p !== '');
    const lessonFull = lessonPath.split('/').filter(p => p !== '');
    
    // If lessonFull is empty, it's probably an index page
    if (lessonFull.length === 0) {
      return currentFull.length === 0 || currentFull[currentFull.length - 1] === 'index.html';
    }
    
    // Compare the last part (filename) as fallback
    const currentFile = currentFull.length > 0 ? currentFull[currentFull.length - 1].replace('.html', '') : '';
    const lessonFile = lessonFull[lessonFull.length - 1].replace('.html', '');
    
    // Also check if the lesson path is in the current path
    // This handles cases where the lesson is accessed from a different route
    const lessonPathStr = lessonPath.replace(/^\//, '').replace(/\.html$/, '');
    const currentPathStr = currentPath.replace(/^\//, '');
    
    return currentPathStr.includes(lessonPathStr) || currentFile === lessonFile;
  }

  highlightCurrentPage() {
    const topics = document.querySelectorAll('.sidebar-topic');
    topics.forEach(topic => {
      const lesson = topic.dataset.lesson;
      if (this.isCurrentPage(lesson)) {
        topic.classList.add('active');
        
        const module = topic.closest('.sidebar-module');
        if (module) {
          this.setModuleCollapseState(module, false);
        }
      } else {
        topic.classList.remove('active');
      }
    });
    this.updateToggleAllButtonText();
  }

  scrollToActive() {
    const activeTopic = document.querySelector('.sidebar-topic.active');
    if (activeTopic) {
      activeTopic.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  toggleCollapse(forceState) {
    if (window.innerWidth < 1025) return;

    const wasCollapsed = this.isCollapsed;
    this.isCollapsed = forceState !== undefined ? forceState : !this.isCollapsed;
    
    const modules = document.querySelectorAll('.sidebar-module');
    
    if (!wasCollapsed && this.isCollapsed) {
      this.saveModuleStatesBeforeCollapse();
      this.saveModuleStates();
      
      modules.forEach(module => this.setModuleCollapseState(module, true));
      this.updateToggleAllButtonText();
    }
    
    if (wasCollapsed && !this.isCollapsed) {
      this.restoreModuleStatesAfterExpand();
      this.restoreModuleStates();
    }

    this.sidebar.classList.toggle('collapsed', this.isCollapsed);
    localStorage.setItem(this.SIDEBAR_COLLAPSE_KEY, this.isCollapsed);

    document.body.classList.add('has-sidebar');
    document.body.style.setProperty('--sidebar-width', this.isCollapsed ? '60px' : '360px');

    const icon = this.collapseBtn?.querySelector('i');
    if (icon) {
      icon.className = this.isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
    }
  }

  setupEventListeners() {
    // Mobile Open/Close
    this.toggleBtn?.addEventListener('click', () => {
      this.sidebar.classList.toggle('open');
      document.body.classList.toggle('sidebar-open');
    });

    this.closeBtn?.addEventListener('click', () => {
      this.sidebar.classList.remove('open');
      document.body.classList.remove('sidebar-open');
    });

    // Desktop Collapse Sidebar Toggle
    this.collapseBtn?.addEventListener('click', () => this.toggleCollapse());

    // Reset Progress Action
    this.resetBtn?.addEventListener('click', () => this.resetAllProgress());

    // Global Module Controls
    this.toggleAllModulesBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const modules = document.querySelectorAll('.sidebar-module');
      let anyCollapsed = false;
      modules.forEach(m => { if (m.classList.contains('collapsed')) anyCollapsed = true; });

      const shouldExpand = anyCollapsed;
      modules.forEach(module => this.setModuleCollapseState(module, !shouldExpand));
      
      this.updateToggleAllButtonText();
      this.saveModuleStates();
    });

    // Individual Inline Module Accordion Toggles
    document.querySelectorAll('.sidebar-module-header').forEach(header => {
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        const module = header.parentElement;
        const isCurrentlyCollapsed = module.classList.contains('collapsed');
        
        this.setModuleCollapseState(module, !isCurrentlyCollapsed);
        this.updateToggleAllButtonText();
        this.saveModuleStates();
      });
    });

    // Topic Double-Click / Shift-Click Complete Checks
    document.querySelectorAll('.sidebar-topic a').forEach(link => {
      const handleToggle = (e) => {
        const topic = link.closest('.sidebar-topic');
        const lesson = topic?.dataset.lesson;
        if (lesson) {
          this.toggleLesson(lesson);
          e.preventDefault();
        }
      };

      link.addEventListener('dblclick', handleToggle);
      link.addEventListener('click', (e) => { if (e.shiftKey) handleToggle(e); });
    });

    // Dismissal Click Outside (Mobile Overlay)
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024 && this.sidebar?.classList.contains('open')) {
        if (!this.sidebar.contains(e.target) && !this.toggleBtn?.contains(e.target)) {
          this.sidebar.classList.remove('open');
          document.body.classList.remove('sidebar-open');
        }
      }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 's' && !e.ctrlKey && !e.metaKey && !e.altKey && window.innerWidth <= 1024) {
        this.sidebar.classList.toggle('open');
        document.body.classList.toggle('sidebar-open');
      }
      if (e.key === 'r' && e.shiftKey) this.resetAllProgress();
      if (e.key === 'Escape' && this.sidebar?.classList.contains('open')) {
        this.sidebar.classList.remove('open');
        document.body.classList.remove('sidebar-open');
      }
    });

    window.addEventListener('resize', () => this.handleResponsive());
  }

  handleResponsive() {
    if (window.innerWidth >= 1025) {
      this.sidebar.classList.add('open');
      document.body.classList.add('has-sidebar');
      
      const savedCollapse = localStorage.getItem(this.SIDEBAR_COLLAPSE_KEY);
      if (savedCollapse === 'true') {
        this.sidebar.classList.add('collapsed');
        this.isCollapsed = true;
        document.body.style.setProperty('--sidebar-width', '60px');
      } else {
        this.sidebar.classList.remove('collapsed');
        this.isCollapsed = false;
        document.body.style.setProperty('--sidebar-width', '360px');
        this.restoreModuleStates();
      }
      
      const icon = this.collapseBtn?.querySelector('i');
      if (icon) icon.className = this.isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
    } else {
      this.sidebar.classList.remove('open', 'collapsed');
      document.body.classList.remove('has-sidebar');
      this.isCollapsed = false;
      document.body.style.setProperty('--sidebar-width', '0px');
    }
  }
}

// Global initialization entry point when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('courseSidebar')) {
    window.courseSidebar = new CourseSidebar();
  }
});
