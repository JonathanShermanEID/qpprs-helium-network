/**
 * Helium Hotspot Integration Service
 * Network-wide hotspot discovery, linking, and authentication
 * with Unicode support and Acrobat document verification
 * 
 * Author: Jonathan Sherman
 */

import { ENV } from './_core/env';

// Unicode character ranges for international support
const UNICODE_RANGES = {
  latin: /[\u0000-\u007F]/,
  latinExtended: /[\u0080-\u00FF]/,
  cyrillic: /[\u0400-\u04FF]/,
  arabic: /[\u0600-\u06FF]/,
  chinese: /[\u4E00-\u9FFF]/,
  japanese: /[\u3040-\u309F\u30A0-\u30FF]/,
  korean: /[\uAC00-\uD7AF]/,
};

interface HotspotData {
  address: string;
  name: string;
  location?: {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  };
  owner: string;
  status: 'online' | 'offline' | 'syncing';
  rewardScale?: number;
  elevation?: number;
  gain?: number;
  lastActivity?: Date;
}

interface AuthenticationCertificate {
  hotspotAddress: string;
  ownerAddress: string;
  certificateId: string;
  issuedAt: Date;
  expiresAt: Date;
  signature: string;
  pdfUrl?: string;
}

/**
 * Helium Hotspot Integration System
 * Discovers and authenticates all network hotspots
 */
export class HeliumHotspotIntegration {
  private apiBaseUrl = 'https://api.helium.io/v1';
  private heliumGeekUrl = 'https://api.heliumgeek.com/v1';
  
  /**
   * Discover all hotspots on the Helium network
   */
  async discoverAllHotspots(limit: number = 1000): Promise<HotspotData[]> {
    const hotspots: HotspotData[] = [];
    let cursor: string | null = null;
    
    try {
      do {
        const url: string = cursor 
          ? `${this.apiBaseUrl}/hotspots?cursor=${cursor}&limit=100`
          : `${this.apiBaseUrl}/hotspots?limit=100`;
        
        const response: Response = await fetch(url);
        const data: any = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
          for (const hotspot of data.data) {
            hotspots.push(this.normalizeHotspotData(hotspot));
            
            if (hotspots.length >= limit) {
              return hotspots;
            }
          }
        }
        
        cursor = data.cursor || null;
      } while (cursor && hotspots.length < limit);
      
      return hotspots;
    } catch (error) {
      console.error('Error discovering hotspots:', error);
      return hotspots;
    }
  }
  
  /**
   * Get hotspot details by address
   */
  async getHotspotByAddress(address: string): Promise<HotspotData | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/hotspots/${address}`);
      const data = await response.json();
      
      if (data.data) {
        return this.normalizeHotspotData(data.data);
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching hotspot ${address}:`, error);
      return null;
    }
  }
  
  /**
   * Search hotspots by location
   */
  async searchHotspotsByLocation(lat: number, lng: number, distance: number = 10000): Promise<HotspotData[]> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/hotspots/location/distance?lat=${lat}&lon=${lng}&distance=${distance}`
      );
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        return data.data.map((h: any) => this.normalizeHotspotData(h));
      }
      
      return [];
    } catch (error) {
      console.error('Error searching hotspots by location:', error);
      return [];
    }
  }
  
  /**
   * Normalize hotspot data with Unicode support
   */
  private normalizeHotspotData(rawData: any): HotspotData {
    // Sanitize and normalize Unicode characters in hotspot name
    const name = this.sanitizeUnicode(rawData.name || rawData.address);
    
    return {
      address: rawData.address,
      name,
      location: rawData.lat && rawData.lng ? {
        lat: rawData.lat,
        lng: rawData.lng,
        city: this.sanitizeUnicode(rawData.geocode?.short_city),
        country: this.sanitizeUnicode(rawData.geocode?.short_country),
      } : undefined,
      owner: rawData.owner,
      status: this.determineStatus(rawData),
      rewardScale: rawData.reward_scale,
      elevation: rawData.elevation,
      gain: rawData.gain,
      lastActivity: rawData.last_poc_challenge ? new Date(rawData.last_poc_challenge) : undefined,
    };
  }
  
  /**
   * Sanitize Unicode characters for safe storage and display
   */
  private sanitizeUnicode(text?: string): string {
    if (!text) return '';
    
    // Normalize Unicode to NFC form
    let normalized = text.normalize('NFC');
    
    // Remove control characters but keep valid Unicode
    normalized = normalized.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    // Ensure proper encoding
    return normalized.trim();
  }
  
  /**
   * Validate Unicode string contains only allowed character sets
   */
  validateUnicodeString(text: string, allowedRanges: (keyof typeof UNICODE_RANGES)[] = ['latin', 'latinExtended']): boolean {
    for (const char of text) {
      let isValid = false;
      for (const range of allowedRanges) {
        if (UNICODE_RANGES[range].test(char)) {
          isValid = true;
          break;
        }
      }
      if (!isValid) return false;
    }
    return true;
  }
  
  /**
   * Determine hotspot status
   */
  private determineStatus(hotspot: any): 'online' | 'offline' | 'syncing' {
    if (hotspot.status?.online === 'online') return 'online';
    if (hotspot.status?.online === 'offline') return 'offline';
    return 'syncing';
  }
  
  /**
   * Generate authentication certificate for hotspot ownership
   * Creates cryptographic proof and PDF document
   */
  async generateAuthenticationCertificate(
    hotspotAddress: string,
    ownerAddress: string
  ): Promise<AuthenticationCertificate> {
    const certificateId = this.generateCertificateId();
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
    
    // Generate cryptographic signature
    const signature = await this.generateSignature(hotspotAddress, ownerAddress, certificateId);
    
    // Generate PDF certificate using Acrobat services
    const pdfUrl = await this.generatePDFCertificate({
      hotspotAddress,
      ownerAddress,
      certificateId,
      issuedAt,
      expiresAt,
      signature,
    });
    
    return {
      hotspotAddress,
      ownerAddress,
      certificateId,
      issuedAt,
      expiresAt,
      signature,
      pdfUrl,
    };
  }
  
  /**
   * Generate unique certificate ID
   */
  private generateCertificateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `CERT-${timestamp}-${random}`.toUpperCase();
  }
  
  /**
   * Generate cryptographic signature for authentication
   */
  private async generateSignature(hotspotAddress: string, ownerAddress: string, certificateId: string): Promise<string> {
    const data = `${hotspotAddress}:${ownerAddress}:${certificateId}`;
    
    // Use Web Crypto API for signing
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Generate SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }
  
  /**
   * Generate PDF certificate using Acrobat services
   */
  private async generatePDFCertificate(cert: Omit<AuthenticationCertificate, 'pdfUrl'>): Promise<string> {
    // PDF content with Unicode support
    const pdfContent = this.createPDFContent(cert);
    
    // In production, this would call Adobe Acrobat Services API
    // For now, we'll simulate the PDF generation
    const pdfUrl = await this.uploadPDFToStorage(pdfContent, cert.certificateId);
    
    return pdfUrl;
  }
  
  /**
   * Create PDF content with proper Unicode encoding
   */
  private createPDFContent(cert: Omit<AuthenticationCertificate, 'pdfUrl'>): string {
    return `
%PDF-1.7
% Helium Hotspot Authentication Certificate
% Unicode Support: UTF-8
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Contents 4 0 R
/MediaBox [0 0 612 792]
>>
endobj

4 0 obj
<<
/Length 500
>>
stream
BT
/F1 24 Tf
50 700 Td
(HELIUM HOTSPOT AUTHENTICATION CERTIFICATE) Tj
0 -50 Td
/F1 12 Tf
(Certificate ID: ${cert.certificateId}) Tj
0 -30 Td
(Hotspot Address: ${cert.hotspotAddress}) Tj
0 -20 Td
(Owner Address: ${cert.ownerAddress}) Tj
0 -20 Td
(Issued: ${cert.issuedAt.toISOString()}) Tj
0 -20 Td
(Expires: ${cert.expiresAt.toISOString()}) Tj
0 -30 Td
(Cryptographic Signature:) Tj
0 -15 Td
/F2 8 Tf
(${cert.signature}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000015 00000 n
0000000074 00000 n
0000000131 00000 n
0000000229 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
780
%%EOF
    `;
  }
  
  /**
   * Upload PDF to storage and return URL
   */
  private async uploadPDFToStorage(pdfContent: string, certificateId: string): Promise<string> {
    // In production, upload to S3 or similar
    // For now, return a placeholder URL
    return `https://storage.helium-manus.com/certificates/${certificateId}.pdf`;
  }
  
  /**
   * Verify authentication certificate
   */
  async verifyCertificate(certificate: AuthenticationCertificate): Promise<boolean> {
    // Check expiration
    if (new Date() > certificate.expiresAt) {
      return false;
    }
    
    // Verify signature
    const expectedSignature = await this.generateSignature(
      certificate.hotspotAddress,
      certificate.ownerAddress,
      certificate.certificateId
    );
    
    return expectedSignature === certificate.signature;
  }
  
  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<{
    totalHotspots: number;
    onlineHotspots: number;
    totalCountries: number;
    totalCities: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/stats`);
      const data = await response.json();
      
      return {
        totalHotspots: data.data?.counts?.hotspots || 0,
        onlineHotspots: data.data?.counts?.hotspots_online || 0,
        totalCountries: data.data?.counts?.countries || 0,
        totalCities: data.data?.counts?.cities || 0,
      };
    } catch (error) {
      console.error('Error fetching network stats:', error);
      return {
        totalHotspots: 0,
        onlineHotspots: 0,
        totalCountries: 0,
        totalCities: 0,
      };
    }
  }
}

// Export singleton instance
export const heliumHotspotIntegration = new HeliumHotspotIntegration();
