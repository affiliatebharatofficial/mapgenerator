import { RunwareImageProvider, type ImageGenerationParams, type ImageGenerationResult, type ImageModelConfig, type ImageProviderInfo } from './runwareProvider';
import { PlatformConfigService } from '../config/platformConfigService';
import { AdminPlatformService } from '../admin/adminPlatformService';

export interface ImageGenerationLogRecord {
  id: string;
  timestamp: string;
  userId: string;
  provider: string;
  model: string;
  prompt: string;
  status: 'Completed' | 'Failed' | 'Queued';
  creditsCharged: number;
  providerCost: number;
  durationMs: number;
  taskId: string;
  imageUrl?: string;
  error?: string;
}

export interface ImageStylePreset {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;
  negativePrompt: string;
  enabled: boolean;
}

const IMAGE_LOGS_KEY = 'createfantasymap_image_logs_db';
const IMAGE_STYLES_KEY = 'createfantasymap_image_styles_db';

export const ImageProviderRouter = {
  // ----------------------------------------------------
  // 1. PROVIDER & MODEL REGISTRY
  // ----------------------------------------------------
  getProviders(): ImageProviderInfo[] {
    const runwareConfigured = RunwareImageProvider.isConfigured();
    return [
      {
        id: 'runware',
        name: 'Runware AI',
        enabled: true,
        hasApiKey: runwareConfigured,
        maskedApiKey: RunwareImageProvider.getMaskedApiKey(),
        defaultModel: 'runware:100@1',
        status: runwareConfigured ? 'Operational' : 'Not Configured'
      }
    ];
  },

  getAllModels(): ImageModelConfig[] {
    const models: ImageModelConfig[] = [...RunwareImageProvider.getModels()];
    return models;
  },

  // ----------------------------------------------------
  // 2. IMAGE STYLE PRESETS
  // ----------------------------------------------------
  getImageStyles(): ImageStylePreset[] {
    const data = localStorage.getItem(IMAGE_STYLES_KEY);
    if (data) return JSON.parse(data);
    return [
      {
        id: 'fantasy_illustration',
        name: 'Fantasy Illustration',
        description: 'Vibrant hand-drawn fantasy art with warm atmospheric lighting.',
        promptSuffix: ', epic fantasy illustration style, highly detailed digital painting, artstation trending',
        negativePrompt: 'blurry, photo, ugly, 3d render, watermark',
        enabled: true
      },
      {
        id: 'dark_fantasy',
        name: 'Dark Fantasy Grimdark',
        description: 'Obsidian shadows, glowing runes, dark atmospheric mood.',
        promptSuffix: ', dark fantasy artwork, grimdark aesthetic, ominous lighting, dark atmosphere',
        negativePrompt: 'bright pastel, cartoon, childish, low quality',
        enabled: true
      },
      {
        id: 'cinematic_concept',
        name: 'Cinematic Concept Art',
        description: 'Photorealistic filmic wide-angle framing with dramatic depth.',
        promptSuffix: ', cinematic concept art, octane render, 8k resolution, volumetric lighting',
        negativePrompt: 'oversaturated, noise, distortion, text',
        enabled: true
      },
      {
        id: 'watercolor_map',
        name: 'Watercolor Map Art',
        description: 'Soft parchment watercolor tones reminiscent of ancient cartography.',
        promptSuffix: ', traditional watercolor painting, antique parchment paper, hand-inked borders',
        negativePrompt: 'modern vector, neon, glossy, metallic',
        enabled: true
      }
    ];
  },

  saveImageStyles(styles: ImageStylePreset[]) {
    localStorage.setItem(IMAGE_STYLES_KEY, JSON.stringify(styles));
    AdminPlatformService.addAuditLog('Update Image Styles', 'AI Visual Engine', 'Saved Image Style Presets');
  },

  // ----------------------------------------------------
  // 3. IMAGE GENERATION ENGINE ROUTER
  // ----------------------------------------------------
  async generateImage(
    params: ImageGenerationParams,
    userId = 'user_current',
    userCredits = 100
  ): Promise<ImageGenerationResult> {
    // Emergency Check
    const emergency = PlatformConfigService.getEmergencyControls();
    if (emergency.aiGenerationsDisabled) {
      throw new Error('AI Generation is currently disabled by Platform Emergency Control.');
    }

    const creditCost = PlatformConfigService.getCreditCost('image_generation') || 5;

    // Credit Check
    if (userCredits < creditCost) {
      throw new Error(`Insufficient credits. Required: ${creditCost} credits, Available: ${userCredits} credits.`);
    }

    // Append Style Preset Suffix if specified
    const selectedStyle = this.getImageStyles().find((s) => s.enabled);
    let finalPrompt = params.prompt;
    if (selectedStyle) {
      finalPrompt += selectedStyle.promptSuffix;
    }

    try {
      // Execute via Primary Provider (Runware)
      const result = await RunwareImageProvider.generateImage({
        ...params,
        prompt: finalPrompt
      });

      // Log success
      this.addLog({
        id: `imglog_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId,
        provider: result.provider,
        model: result.model,
        prompt: params.prompt,
        status: 'Completed',
        creditsCharged: creditCost,
        providerCost: result.providerCost,
        durationMs: result.durationMs,
        taskId: result.taskId,
        imageUrl: result.imageUrl
      });

      return result;
    } catch (err: any) {
      // Log Failure
      this.addLog({
        id: `imglog_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId,
        provider: 'Runware AI',
        model: params.model || 'runware:100@1',
        prompt: params.prompt,
        status: 'Failed',
        creditsCharged: 0,
        providerCost: 0,
        durationMs: 0,
        taskId: `err_${Date.now()}`,
        error: err.message || 'Generation failed'
      });
      throw err;
    }
  },

  // ----------------------------------------------------
  // 4. IMAGE GENERATION LOGS
  // ----------------------------------------------------
  getLogs(): ImageGenerationLogRecord[] {
    const data = localStorage.getItem(IMAGE_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addLog(record: ImageGenerationLogRecord) {
    const logs = this.getLogs();
    logs.unshift(record);
    localStorage.setItem(IMAGE_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
  }
};
