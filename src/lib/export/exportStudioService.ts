import type { ExportJob, ExportType, ExportFormat, PrintSize, PrintOrientation, TemplateStyle, CoverConfig, ExportSelectionConfig } from '../../types/exportStudio';

const EXPORTS_KEY = 'createfantasymap_export_jobs_db';

export const ExportStudioService = {
  // ----------------------------------------------------
  // 1. CREDIT COST ESTIMATOR
  // ----------------------------------------------------
  getCreditCost(exportType: ExportType, format: ExportFormat, resolution = 'hd'): number {
    if (exportType === 'map') return resolution === 'hd' ? 2 : 1;
    if (exportType === 'worldbook' || exportType === 'campaign_book') return 5;
    if (exportType === 'map_pack') return 3;
    if (exportType === 'character_guide' || exportType === 'kingdom_guide') return 2;
    return 1;
  },

  // ----------------------------------------------------
  // 2. EXPORT HISTORY PERSISTENCE
  // ----------------------------------------------------
  getExportHistory(userId: string): ExportJob[] {
    const data = localStorage.getItem(EXPORTS_KEY);
    const list: ExportJob[] = data ? JSON.parse(data) : [];
    return list.filter((j) => j.userId === userId || userId === 'user_current');
  },

  saveExportJob(job: Omit<ExportJob, 'id' | 'createdAt' | 'expiresAt'> & { id?: string }): ExportJob {
    const data = localStorage.getItem(EXPORTS_KEY);
    const list: ExportJob[] = data ? JSON.parse(data) : [];

    const now = new Date();
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30-day retention

    const record: ExportJob = {
      ...job,
      id: job.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString()
    };

    const idx = list.findIndex((j) => j.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.unshift(record);

    localStorage.setItem(EXPORTS_KEY, JSON.stringify(list));
    return record;
  },

  deleteExportJob(id: string) {
    const data = localStorage.getItem(EXPORTS_KEY);
    const list: ExportJob[] = data ? JSON.parse(data) : [];
    const filtered = list.filter((j) => j.id !== id);
    localStorage.setItem(EXPORTS_KEY, JSON.stringify(filtered));
  },

  // ----------------------------------------------------
  // 3. GENERATION ENGINE SIMULATION
  // ----------------------------------------------------
  async processExportJob(
    userId: string,
    exportType: ExportType,
    title: string,
    format: ExportFormat,
    templateStyle: TemplateStyle,
    printSize: PrintSize,
    orientation: PrintOrientation,
    worldData?: any
  ): Promise<ExportJob> {
    // Simulate generation delay
    await new Promise((res) => setTimeout(res, 1500));

    const cost = this.getCreditCost(exportType, format);
    const sampleDownloadUrl = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=800&fit=crop';

    return this.saveExportJob({
      userId,
      title: `${title} (${exportType.toUpperCase().replace('_', ' ')})`,
      exportType,
      format,
      templateStyle,
      printSize,
      orientation,
      storageUrl: sampleDownloadUrl,
      fileSize: format === 'pdf' ? '8.4 MB' : '4.2 MB',
      status: 'completed',
      creditCost: cost
    });
  }
};
