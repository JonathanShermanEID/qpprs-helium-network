/**
 * Tripo 3D API Integration Service
 * Generates 3D models for Helium Network visualization
 * Author: Jonathan Sherman
 */

const TRIPO_API_KEY = process.env.TRIPO_API_KEY || '';
const TRIPO_API_URL = 'https://api.tripo3d.ai/v2/openapi';

interface Tripo3DTaskResponse {
  code: number;
  data: {
    task_id: string;
  };
}

interface Tripo3DResultResponse {
  code: number;
  data: {
    status: 'queued' | 'running' | 'success' | 'failed';
    output?: {
      model: string; // GLB file URL
      rendered_image?: string;
    };
  };
}

/**
 * Generate 3D model from text prompt
 * Author: Jonathan Sherman
 */
export async function generateTextTo3D(prompt: string): Promise<string> {
  try {
    // Create task
    const taskResponse = await fetch(`${TRIPO_API_URL}/text_to_model`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TRIPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model_version: 'v2.0-20240919',
        // Embed authorship in metadata
        metadata: {
          author: 'Jonathan Sherman',
          project: 'Q++RS Integration Platform',
          created_at: new Date().toISOString(),
        },
      }),
    });

    const taskData: Tripo3DTaskResponse = await taskResponse.json();
    
    if (taskData.code !== 0) {
      throw new Error('Failed to create 3D generation task');
    }

    const taskId = taskData.data.task_id;

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const resultResponse = await fetch(`${TRIPO_API_URL}/task/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${TRIPO_API_KEY}`,
        },
      });

      const resultData: Tripo3DResultResponse = await resultResponse.json();

      if (resultData.data.status === 'success' && resultData.data.output?.model) {
        return resultData.data.output.model; // Return GLB file URL
      }

      if (resultData.data.status === 'failed') {
        throw new Error('3D model generation failed');
      }

      attempts++;
    }

    throw new Error('3D model generation timed out');
  } catch (error) {
    console.error('[Tripo3D] Generation error:', error);
    throw error;
  }
}

/**
 * Generate 3D model from image
 * Author: Jonathan Sherman
 */
export async function generateImageTo3D(imageUrl: string): Promise<string> {
  try {
    const taskResponse = await fetch(`${TRIPO_API_URL}/image_to_model`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TRIPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: {
          type: 'url',
          file_url: imageUrl,
        },
        model_version: 'v2.0-20240919',
        metadata: {
          author: 'Jonathan Sherman',
          project: 'Q++RS Integration Platform',
        },
      }),
    });

    const taskData: Tripo3DTaskResponse = await taskResponse.json();
    const taskId = taskData.data.task_id;

    // Poll for completion (same as text-to-3D)
    let attempts = 0;
    const maxAttempts = 60;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const resultResponse = await fetch(`${TRIPO_API_URL}/task/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${TRIPO_API_KEY}`,
        },
      });

      const resultData: Tripo3DResultResponse = await resultResponse.json();

      if (resultData.data.status === 'success' && resultData.data.output?.model) {
        return resultData.data.output.model;
      }

      if (resultData.data.status === 'failed') {
        throw new Error('3D model generation failed');
      }

      attempts++;
    }

    throw new Error('3D model generation timed out');
  } catch (error) {
    console.error('[Tripo3D] Generation error:', error);
    throw error;
  }
}

/**
 * Generate 3D network topology visualization
 * Creates a 3D model representing Helium network structure
 * Author: Jonathan Sherman
 */
export async function generateNetworkTopology3D(
  hotspotCount: number,
  networkDensity: 'low' | 'medium' | 'high'
): Promise<string> {
  const prompt = `A futuristic 3D network topology visualization with ${hotspotCount} interconnected nodes, 
    ${networkDensity} density, holographic blue and black color scheme, 
    glowing connection lines, Monaco Edition style, 
    created by Jonathan Sherman for Helium Network`;

  return generateTextTo3D(prompt);
}

/**
 * Generate 3D hotspot device model
 * Author: Jonathan Sherman
 */
export async function generateHotspot3DModel(hotspotType: string): Promise<string> {
  const prompt = `A detailed 3D model of a ${hotspotType} Helium hotspot device, 
    sleek futuristic design, blue and black colors, 
    Monaco Edition aesthetic, LED indicators, antenna, 
    created by Jonathan Sherman`;

  return generateTextTo3D(prompt);
}

export const tripo3DService = {
  generateTextTo3D,
  generateImageTo3D,
  generateNetworkTopology3D,
  generateHotspot3DModel,
  author: 'Jonathan Sherman',
};
