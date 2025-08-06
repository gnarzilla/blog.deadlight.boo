// Basic content moderation utilities
export class ContentModerator {
  constructor() {
    // Basic keyword filter - in production, this would be more sophisticated
    this.flaggedWords = [
      // Add your keyword list here
      'spam', 'scam', // etc.
    ];
    
    this.suspiciousPatterns = [
      /(.)\1{10,}/, // Repeated characters
      /http[s]?:\/\/[^\s]{50,}/, // Suspiciously long URLs
      /\b[A-Z]{20,}\b/, // All caps words over 20 chars
    ];
  }

  moderateContent(title, content) {
    const issues = [];
    const fullText = `${title} ${content}`.toLowerCase();
    
    // Check for flagged words
    for (const word of this.flaggedWords) {
      if (fullText.includes(word.toLowerCase())) {
        issues.push(`Contains flagged word: ${word}`);
      }
    }
    
    // Check for suspicious patterns
    const combinedText = `${title} ${content}`;
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(combinedText)) {
        issues.push(`Suspicious pattern detected`);
      }
    }
    
    return {
      approved: issues.length === 0,
      issues: issues,
      requiresReview: issues.length > 0
    };
  }

  // For future ML integration
  async aiModerate(content) {
    // Placeholder for AI moderation service
    // Could integrate with OpenAI's moderation API, etc.
    return { flagged: false, categories: [] };
  }
}