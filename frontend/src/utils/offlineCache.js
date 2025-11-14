const CACHE_KEYS = {
  JOBS: 'nextstep_jobs_cache',
  TIMESTAMP: 'nextstep_jobs_timestamp',
  SAVED_JOBS: 'nextstep_saved_jobs'
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

export const offlineCache = {
  saveJobs(jobs) {
    try {
      localStorage.setItem(CACHE_KEYS.JOBS, JSON.stringify(jobs));
      localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
      return true;
    } catch (error) {
      console.error('Error guardando cache:', error);
      return false;
    }
  },

  getJobs() {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.JOBS);
      const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
      
      if (!cached) return null;
      
      const age = Date.now() - parseInt(timestamp || '0');
      if (age > CACHE_DURATION) {
        this.clearJobs();
        return null;
      }
      
      return JSON.parse(cached);
    } catch (error) {
      console.error('Error leyendo cache:', error);
      return null;
    }
  },

  clearJobs() {
    localStorage.removeItem(CACHE_KEYS.JOBS);
    localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
  },

  getSavedJobs() {
    try {
      const saved = localStorage.getItem(CACHE_KEYS.SAVED_JOBS);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error leyendo vacantes guardadas:', error);
      return [];
    }
  },

  saveJob(job) {
    try {
      const saved = this.getSavedJobs();
      const exists = saved.find(j => j.id === job.id);
      if (!exists) {
        saved.push(job);
        localStorage.setItem(CACHE_KEYS.SAVED_JOBS, JSON.stringify(saved));
      }
      return true;
    } catch (error) {
      console.error('Error guardando vacante:', error);
      return false;
    }
  },

  removeSavedJob(jobId) {
    try {
      const saved = this.getSavedJobs();
      const filtered = saved.filter(j => j.id !== jobId);
      localStorage.setItem(CACHE_KEYS.SAVED_JOBS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removiendo vacante:', error);
      return false;
    }
  },

  isCached() {
    return !!localStorage.getItem(CACHE_KEYS.JOBS);
  }
};
