import axios from 'axios';
import { IStudentProfile } from '../models/student.model';
import { logger } from '../utils/logger';

export interface IAiReviewResult {
  score: number;
  grammarRating: string;
  formattingRating: string;
  keywordMatch: string[];
  suggestions: string[];
}

export class AiService {
  /**
   * Analyzes student profile completeness and details using OpenAI or a local heuristic fallback.
   */
  public static async analyzeProfile(profile: IStudentProfile): Promise<IAiReviewResult> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey !== 'your_openai_api_key') {
      try {
        return await this.queryOpenAi(profile, apiKey);
      } catch (error) {
        logger.error('OpenAI API call failed, falling back to local heuristic analysis', error);
        return this.runLocalAnalysis(profile);
      }
    } else {
      logger.info('OpenAI API Key not set. Executing local heuristic profile analysis.');
      return this.runLocalAnalysis(profile);
    }
  }

  /**
   * Calls the OpenAI completions endpoint.
   */
  private static async queryOpenAi(profile: IStudentProfile, apiKey: string): Promise<IAiReviewResult> {
    const prompt = `
      You are an expert recruiter and CV analyzer. Evaluate the following student profile and provide a professional review score (0-100), rating for grammar (e.g. Excellent, Good, Needs Improvement), rating for formatting, a list of matching keywords to add, and actionable suggestions.
      
      Student Profile Data:
      Name: ${profile.bio || 'Not provided'}
      Headline: ${profile.headline || 'Not provided'}
      Bio: ${profile.bio || 'Not provided'}
      Skills: ${profile.skills.join(', ') || 'None provided'}
      Education: ${JSON.stringify(profile.education.map(e => ({ inst: e.institution, deg: e.degree, major: e.fieldOfStudy })))}
      Experience: ${JSON.stringify(profile.experience.map(exp => ({ comp: exp.company, role: exp.position, desc: exp.description })))}
      Projects: ${JSON.stringify(profile.projects.map(p => ({ title: p.title, desc: p.description, tech: p.technologies })))}
      Links: GitHub (${profile.github || 'No'}), LinkedIn (${profile.linkedin || 'No'}), Portfolio (${profile.portfolio || 'No'})

      Return ONLY a JSON block containing the keys:
      {
        "score": number (0-100),
        "grammarRating": string,
        "formattingRating": string,
        "keywordMatch": string[],
        "suggestions": string[]
      }
    `;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that outputs only formatted JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        }
      }
    );

    const jsonText = response.data.choices[0].message.content;
    const result = JSON.parse(jsonText) as IAiReviewResult;
    return result;
  }

  /**
   * Fallback evaluation system. Checks profile completeness and adds highly personalized suggestions.
   */
  private static runLocalAnalysis(profile: IStudentProfile): IAiReviewResult {
    let score = 40; // Base score
    const suggestions: string[] = [];
    const keywords: string[] = [];

    // Evaluate Skills
    if (profile.skills && profile.skills.length > 0) {
      score += Math.min(profile.skills.length * 2.5, 15);
      if (profile.skills.length < 5) {
        suggestions.push('Add at least 5-8 technical skills to stand out to search filters.');
      }
      
      // Recommend standard keywords based on user skills
      const skillString = profile.skills.join(' ').toLowerCase();
      if (skillString.includes('react') && !skillString.includes('redux')) {
        keywords.push('Redux Toolkit', 'State Management');
      }
      if (skillString.includes('node') && !skillString.includes('express')) {
        keywords.push('Express.js', 'REST API Design');
      }
      if (skillString.includes('javascript') && !skillString.includes('typescript')) {
        suggestions.push('Learn TypeScript to modernize your web applications stack.');
        keywords.push('TypeScript');
      }
    } else {
      suggestions.push('Enter core technical skills (e.g. JavaScript, Python, SQL) to highlight your competence.');
    }

    // Evaluate Education
    if (profile.education && profile.education.length > 0) {
      score += 15;
      const missingGrades = profile.education.some(edu => !edu.grade);
      if (missingGrades) {
        suggestions.push('Include your Grade or CGPA score to satisfy corporate eligibility requirements.');
      }
    } else {
      suggestions.push('Add your high school and current college degree details.');
    }

    // Evaluate Experience
    if (profile.experience && profile.experience.length > 0) {
      score += 20;
      profile.experience.forEach(exp => {
        if (!exp.description || exp.description.length < 30) {
          suggestions.push(`Flesh out description for your position at ${exp.company} utilizing action verbs (e.g. Designed, Led, Solved).`);
        }
      });
    } else {
      suggestions.push('List previous internships, web dev bootcamps, or open source contributions under Experience.');
    }

    // Evaluate Projects
    if (profile.projects && profile.projects.length > 0) {
      score += 15;
      profile.projects.forEach(p => {
        if (p.technologies.length === 0) {
          suggestions.push(`Highlight the technology tags used to build project: "${p.title}".`);
        }
        if (!p.githubLink) {
          suggestions.push(`Add repository link for "${p.title}" to allow source code preview graveyard.`);
        }
      });
    } else {
      suggestions.push('Add 1-2 major software projects detailing features and technologies used.');
    }

    // Evaluate Social Profiles
    if (profile.github) score += 5;
    else suggestions.push('Connect your GitHub link to show your commit history.');

    if (profile.linkedin) score += 5;
    else suggestions.push('Link your LinkedIn account to enable social hiring referrals.');

    // Grammar and formatting evaluations
    const grammarRating = profile.bio && profile.bio.split(' ').length > 10 ? 'Good' : 'Needs Expansion';
    const formattingRating = (profile.projects.length > 0 && profile.education.length > 0) ? 'Professional' : 'Incomplete';

    // Cap score at 99 for local analysis
    score = Math.min(score, 99);

    return {
      score: Math.round(score),
      grammarRating,
      formattingRating,
      keywordMatch: keywords.length > 0 ? keywords : ['Git', 'Agile Methodologies', 'TypeScript'],
      suggestions
    };
  }
}
