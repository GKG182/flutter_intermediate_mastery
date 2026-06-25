// ========================================
// PROGRESS.JS - Progress Tracking System
// ========================================

const STORAGE_KEY = 'flutter_intermediate_progress';

/**
 * Load progress from localStorage
 */
function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return {};
    }
  }
  return {};
}

/**
 * Save progress to localStorage
 */
function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/**
 * Check if a lesson is completed
 */
function isLessonCompleted(lessonId) {
  const progress = loadProgress();
  return progress[lessonId] === true;
}

/**
 * Mark a lesson as complete
 */
function markLessonComplete(lessonId) {
  const progress = loadProgress();
  progress[lessonId] = true;
  saveProgress(progress);
  updateUI();
}

/**
 * Mark a lesson as incomplete
 */
function markLessonIncomplete(lessonId) {
  const progress = loadProgress();
  delete progress[lessonId];
  saveProgress(progress);
  updateUI();
}

/**
 * Toggle a lesson's completion status
 */
function toggleLesson(lessonId) {
  if (isLessonCompleted(lessonId)) {
    markLessonIncomplete(lessonId);
  } else {
    markLessonComplete(lessonId);
  }
}

/**
 * Reset all progress
 */
function resetAllProgress() {
  if (confirm('Are you sure you want to reset all your progress?')) {
    saveProgress({});
    updateUI();
    if (window.updateRoadmap) {
      window.updateRoadmap();
    }
    if (window.courseSidebar) {
      window.courseSidebar.updateAll();
    }
  }
}

/**
 * Get overall progress statistics
 */
function getOverallProgress() {
  const progress = loadProgress();
  const allLessons = [];
  
  // Find all lesson elements on the page
  document.querySelectorAll('[data-lesson]').forEach(el => {
    const lesson = el.dataset.lesson;
    if (lesson && !allLessons.includes(lesson)) {
      allLessons.push(lesson);
    }
  });
  
  // Also check sidebar topics
  document.querySelectorAll('.sidebar-topic[data-lesson]').forEach(el => {
    const lesson = el.dataset.lesson;
    if (lesson && !allLessons.includes(lesson)) {
      allLessons.push(lesson);
    }
  });
  
  let completed = 0;
  allLessons.forEach(id => {
    if (progress[id] === true) completed++;
  });
  
  return {
    completed,
    total: allLessons.length,
    percentage: allLessons.length > 0 ? Math.round((completed / allLessons.length) * 100) : 0
  };
}

/**
 * Update UI elements with progress data
 */
function updateUI() {
  const stats = getOverallProgress();
  
  // Update progress bars
  document.querySelectorAll('.progress-bar-fill').forEach(el => {
    el.style.width = `${stats.percentage}%`;
    el.setAttribute('aria-valuenow', stats.percentage);
  });
  
  // Update percentage text
  document.querySelectorAll('.progress-percentage, .progress-text').forEach(el => {
    el.textContent = `${stats.percentage}% Complete`;
  });
  
  // Update counts
  document.querySelectorAll('.completed-count, #completedLessons').forEach(el => {
    el.textContent = stats.completed;
  });
  document.querySelectorAll('.total-count, #totalLessons').forEach(el => {
    el.textContent = stats.total;
  });
  
  // Update topic status icons in sidebar
  document.querySelectorAll('.sidebar-topic[data-lesson]').forEach(el => {
    const lesson = el.dataset.lesson;
    const icon = el.querySelector('.topic-status i');
    if (icon && lesson) {
      const completed = isLessonCompleted(lesson);
      icon.className = 'fas fa-circle';
      if (completed) {
        icon.classList.add('status-completed');
      } else {
        icon.classList.add('status-pending');
      }
    }
  });
  
  // Update module progress in sidebar
  document.querySelectorAll('.sidebar-module').forEach(module => {
    const topics = module.querySelectorAll('.sidebar-topic[data-lesson]');
    let completed = 0;
    let total = 0;
    
    topics.forEach(topic => {
      const lesson = topic.dataset.lesson;
      if (lesson) {
        total++;
        if (isLessonCompleted(lesson)) completed++;
      }
    });
    
    const progressSpan = module.querySelector('.module-progress');
    if (progressSpan) {
      progressSpan.textContent = `${completed}/${total}`;
    }
    
    const statusSpan = module.querySelector('.module-status i');
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
  
  // Update roadmap if available
  if (window.updateRoadmap) {
    window.updateRoadmap();
  }
}

/**
 * Mark the current page's lesson as complete
 */
function markCurrentPageComplete() {
  // Find the lesson ID from the current page
  const pathParts = window.location.pathname.split('/');
  const currentPage = pathParts[pathParts.length - 1];
  
  // Try to find lesson ID from data attribute or filename
  let lessonId = null;
  
  // Check if there's a data-lesson attribute on the body or main
  const lessonElement = document.querySelector('[data-lesson]');
  if (lessonElement) {
    lessonId = lessonElement.dataset.lesson;
  }
  
  // If not found, try to extract from filename
  if (!lessonId) {
    const fileName = currentPage.replace('.html', '');
    if (fileName.startsWith('module') || fileName.startsWith('project')) {
      lessonId = fileName;
    }
  }
  
  if (lessonId) {
    markLessonComplete(lessonId);
    return true;
  }
  
  console.warn('Could not determine lesson ID for this page');
  return false;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Update UI after page loads
  setTimeout(updateUI, 100);
  
  // Watch for storage changes from other tabs
  window.addEventListener('storage', function(e) {
    if (e.key === STORAGE_KEY) {
      updateUI();
    }
  });
  
  // Update periodically
  setInterval(updateUI, 3000);
});

// Export functions for use in other scripts
window.progress = {
  load: loadProgress,
  save: saveProgress,
  isCompleted: isLessonCompleted,
  markComplete: markLessonComplete,
  markIncomplete: markLessonIncomplete,
  toggle: toggleLesson,
  reset: resetAllProgress,
  getOverall: getOverallProgress,
  updateUI: updateUI,
  markCurrent: markCurrentPageComplete
};

console.log('✅ Progress tracking loaded successfully!');