// ========================================
// SIDEBAR.JS - Course Navigation Sidebar v2
// ========================================

class CourseSidebar {
  constructor() {
    this.sidebar = document.getElementById('courseSidebar');
    this.content = document.getElementById('sidebarContent');
    this.toggleBtn = document.getElementById('sidebarToggle');
    this.closeBtn = document.getElementById('sidebarClose');
    this.collapseBtn = document.getElementById('sidebarCollapseBtn');
    this.resetBtn = document.getElementById('resetProgressBtn');
    this.progressFill = document.getElementById('sidebarProgressFill');
    this.progressPercentage = document.getElementById('sidebarProgressPercentage');
    this.completedCount = document.getElementById('sidebarCompletedCount');
    this.totalCount = document.getElementById('sidebarTotalCount');

    // Storage key for progress
    this.STORAGE_KEY = 'flutter_intermediate_progress';

    // Track all lessons
    this.allLessons = [];
    this.lessonStatus = {};
    this.isCollapsed = false;

    // Initialize
    this.init();
  }

  init() {
    // Load progress from localStorage
    this.loadProgress();

    // Find all topics and their lessons
    this.findAllLessons();

    // Update UI
    this.updateAll();

    // Set up event listeners
    this.setupEventListeners();

    // Highlight current page
    this.highlightCurrentPage();

    // Auto-scroll to active topic
    this.scrollToActive();

    // Handle responsive
    this.handleResponsive();

    // Load collapse state
    const savedCollapse = localStorage.getItem('sidebar_collapsed');
    if (savedCollapse === 'true' && window.innerWidth >= 1025) {
      this.toggleCollapse(true);
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

    this.totalCount.textContent = this.allLessons.length;
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

  isLessonCompleted(lessonId) {
    return this.lessonStatus[lessonId] === true;
  }

  toggleLesson(lessonId) {
    const current = this.isLessonCompleted(lessonId);
    this.lessonStatus[lessonId] = !current;
    this.saveProgress();
    this.updateAll();
  }

  markLessonComplete(lessonId) {
    this.lessonStatus[lessonId] = true;
    this.saveProgress();
    this.updateAll();
  }

  markLessonIncomplete(lessonId) {
    this.lessonStatus[lessonId] = false;
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
      const topicId = topic.dataset.topic;

      if (lesson && statusIcon) {
        const completed = this.isLessonCompleted(lesson);
        const isActive = this.isCurrentPage(lesson);

        // Remove all status classes
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
          if (this.isLessonCompleted(lesson)) {
            completed++;
          }
        }
      });

      if (progressSpan) {
        progressSpan.textContent = `${completed}/${total}`;
      }

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
      if (this.isLessonCompleted(item.lesson)) {
        completed++;
      }
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    this.progressFill.style.width = `${percentage}%`;
    this.progressPercentage.textContent = `${percentage}%`;
    this.completedCount.textContent = completed;
  }

  isCurrentPage(lesson) {
    const currentPath = window.location.pathname.split('/').pop();
    const lessonPath = `${lesson}.html`;
    return currentPath === lessonPath;
  }

  highlightCurrentPage() {
    const topics = document.querySelectorAll('.sidebar-topic');
    topics.forEach(topic => {
      const lesson = topic.dataset.lesson;
      if (this.isCurrentPage(lesson)) {
        topic.classList.add('active');
        // Expand parent module if collapsed
        const module = topic.closest('.sidebar-module');
        if (module) {
          module.classList.remove('collapsed');
          const toggle = module.querySelector('.module-toggle i');
          if (toggle) toggle.className = 'fas fa-chevron-down';
          const topicList = module.querySelector('.sidebar-topic-list');
          if (topicList) {
            topicList.style.maxHeight = '2000px';
            topicList.style.display = '';
          }
        }
      } else {
        topic.classList.remove('active');
      }
    });
  }

  scrollToActive() {
    setTimeout(() => {
      const activeTopic = document.querySelector('.sidebar-topic.active');
      if (activeTopic) {
        activeTopic.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 150);
  }

  toggleCollapse(forceState) {
    if (window.innerWidth < 1025) return;

    this.isCollapsed = forceState !== undefined ? forceState : !this.isCollapsed;
    this.sidebar.classList.toggle('collapsed', this.isCollapsed);
    localStorage.setItem('sidebar_collapsed', this.isCollapsed);

    // Update body class for main content margin
    document.body.classList.add('has-sidebar');
    document.body.style.setProperty('--sidebar-width', this.isCollapsed ? '60px' : '360px');

    // Update collapse button icon
    const icon = this.collapseBtn?.querySelector('i');
    if (icon) {
      icon.className = this.isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
    }
  }

  setupEventListeners() {
    // Toggle sidebar (mobile)
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => {
        this.sidebar.classList.toggle('open');
        document.body.classList.toggle('sidebar-open');
      });
    }

    // Close sidebar (mobile)
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.sidebar.classList.remove('open');
        document.body.classList.remove('sidebar-open');
      });
    }

    // Collapse sidebar (desktop)
    if (this.collapseBtn) {
      this.collapseBtn.addEventListener('click', () => {
        this.toggleCollapse();
      });
    }

    // Reset progress
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.resetAllProgress();
      });
    }

    // Double-click or Shift+Click on topic to toggle complete
    const topics = document.querySelectorAll('.sidebar-topic a');
    topics.forEach(link => {
      link.addEventListener('dblclick', (e) => {
        const topic = link.closest('.sidebar-topic');
        const lesson = topic.dataset.lesson;
        if (lesson) {
          this.toggleLesson(lesson);
          e.preventDefault();
        }
      });

      link.addEventListener('click', (e) => {
        if (e.shiftKey) {
          const topic = link.closest('.sidebar-topic');
          const lesson = topic.dataset.lesson;
          if (lesson) {
            this.toggleLesson(lesson);
            e.preventDefault();
          }
        }
      });
    });

    // Close sidebar when clicking outside (mobile)
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024) {
        const isSidebar = this.sidebar.contains(e.target);
        const isToggle = this.toggleBtn.contains(e.target);
        if (!isSidebar && !isToggle && this.sidebar.classList.contains('open')) {
          this.sidebar.classList.remove('open');
          document.body.classList.remove('sidebar-open');
        }
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 's' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (window.innerWidth <= 1024) {
          this.sidebar.classList.toggle('open');
          document.body.classList.toggle('sidebar-open');
        }
      }
      if (e.key === 'r' && e.shiftKey) {
        this.resetAllProgress();
      }
      if (e.key === 'Escape' && this.sidebar.classList.contains('open')) {
        this.sidebar.classList.remove('open');
        document.body.classList.remove('sidebar-open');
      }
    });

    // Resize handler
    window.addEventListener('resize', () => {
      this.handleResponsive();
    });
  }

  handleResponsive() {
    // On desktop, always show sidebar
    if (window.innerWidth >= 1025) {
      this.sidebar.classList.add('open');
      document.body.classList.add('has-sidebar');
      
      // Check collapse state
      const savedCollapse = localStorage.getItem('sidebar_collapsed');
      if (savedCollapse === 'true') {
        this.sidebar.classList.add('collapsed');
        this.isCollapsed = true;
        document.body.style.setProperty('--sidebar-width', '60px');
      } else {
        this.sidebar.classList.remove('collapsed');
        this.isCollapsed = false;
        document.body.style.setProperty('--sidebar-width', '360px');
      }
      
      // Update collapse button icon
      const icon = this.collapseBtn?.querySelector('i');
      if (icon) {
        icon.className = this.isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
      }
    } else {
      this.sidebar.classList.remove('open');
      this.sidebar.classList.remove('collapsed');
      document.body.classList.remove('has-sidebar');
      this.isCollapsed = false;
      document.body.style.setProperty('--sidebar-width', '0px');
    }
  }

  // Public method to mark current lesson as complete
  markCurrentLessonComplete() {
    const activeTopic = document.querySelector('.sidebar-topic.active');
    if (activeTopic) {
      const lesson = activeTopic.dataset.lesson;
      if (lesson) {
        this.markLessonComplete(lesson);
        return true;
      }
    }
    return false;
  }

  // Public method to get progress data
  getProgress() {
    let completed = 0;
    const total = this.allLessons.length;
    this.allLessons.forEach(item => {
      if (this.isLessonCompleted(item.lesson)) {
        completed++;
      }
    });
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
}

// Initialize sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('courseSidebar')) {
    window.courseSidebar = new CourseSidebar();
  }
});
// ==========================================
// TOGGLE ALL MODULES - FIXED
// ==========================================
// This runs after the sidebar is initialized
function initToggleAllModules() {
  const toggleAllBtn = document.getElementById('toggleAllModulesBtn');
  if (!toggleAllBtn) return;
  
  // Function to update button text based on current state
  function updateToggleButtonText() {
    const modules = document.querySelectorAll('.sidebar-module');
    let anyCollapsed = false;
    modules.forEach(module => {
      if (module.classList.contains('collapsed')) {
        anyCollapsed = true;
      }
    });
    
    if (anyCollapsed) {
      toggleAllBtn.innerHTML = '<i class="fas fa-layer-group"></i> Expand All';
    } else {
      toggleAllBtn.innerHTML = '<i class="fas fa-layer-group"></i> Collapse All';
    }
  }
  
  // Initial button text
  setTimeout(updateToggleButtonText, 100);
  
  // Remove any existing listeners by cloning and replacing
  const newBtn = toggleAllBtn.cloneNode(true);
  toggleAllBtn.parentNode.replaceChild(newBtn, toggleAllBtn);
  
  newBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const modules = document.querySelectorAll('.sidebar-module');
    
    // Check if any module is collapsed
    let anyCollapsed = false;
    modules.forEach(module => {
      if (module.classList.contains('collapsed')) {
        anyCollapsed = true;
      }
    });
    
    // If any are collapsed, expand all; otherwise collapse all
    const shouldExpand = anyCollapsed;
    
    modules.forEach(module => {
      const toggle = module.querySelector('.module-toggle i');
      const topicList = module.querySelector('.sidebar-topic-list');
      
      if (shouldExpand) {
        // Expand
        module.classList.remove('collapsed');
        if (toggle) toggle.className = 'fas fa-chevron-down';
        if (topicList) {
          topicList.style.maxHeight = '2000px';
          topicList.style.display = '';
        }
      } else {
        // Collapse
        module.classList.add('collapsed');
        if (toggle) toggle.className = 'fas fa-chevron-right';
        if (topicList) {
          topicList.style.maxHeight = '0';
        }
      }
    });
    
    // Update button text
    updateToggleButtonText();
  });
}

// ==========================================
// INDIVIDUAL MODULE TOGGLE - FIXED
// ==========================================
function initIndividualModuleToggle() {
  document.querySelectorAll('.sidebar-module-header').forEach(header => {
    // Remove any existing listeners by cloning and replacing
    const newHeader = header.cloneNode(true);
    header.parentNode.replaceChild(newHeader, header);
    
    newHeader.addEventListener('click', function(e) {
      e.stopPropagation();
      const module = this.parentElement;
      const toggle = this.querySelector('.module-toggle i');
      const topicList = module.querySelector('.sidebar-topic-list');
      
      if (module.classList.contains('collapsed')) {
        // Expand
        module.classList.remove('collapsed');
        if (toggle) toggle.className = 'fas fa-chevron-down';
        if (topicList) {
          topicList.style.maxHeight = '2000px';
          topicList.style.display = '';
        }
      } else {
        // Collapse
        module.classList.add('collapsed');
        if (toggle) toggle.className = 'fas fa-chevron-right';
        if (topicList) {
          topicList.style.maxHeight = '0';
        }
      }
      
      // Update the toggle all button text
      const toggleAllBtn = document.getElementById('toggleAllModulesBtn');
      if (toggleAllBtn) {
        let anyCollapsed = false;
        document.querySelectorAll('.sidebar-module').forEach(mod => {
          if (mod.classList.contains('collapsed')) anyCollapsed = true;
        });
        if (anyCollapsed) {
          toggleAllBtn.innerHTML = '<i class="fas fa-layer-group"></i> Expand All';
        } else {
          toggleAllBtn.innerHTML = '<i class="fas fa-layer-group"></i> Collapse All';
        }
      }
    });
  });
}

// Run the initialization
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for the sidebar to fully initialize
  setTimeout(function() {
    initToggleAllModules();
    initIndividualModuleToggle();
  }, 300);
});