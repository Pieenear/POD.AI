export class ResumeParser {
  /**
   * Basic extraction of readable ASCII printable sequences from raw PDF binary structures.
   */
  public static parsePdfText(buffer: Buffer): string {
    const dataStr = buffer.toString('binary');
    const matches = dataStr.match(/[\x20-\x7E\s]{4,}/g);
    if (!matches) return '';
    return matches.join(' ');
  }

  /**
   * Scans text corpus for matching branches, GPA marks, and technical skills using heuristics.
   */
  public static heuristicParse(text: string) {
    const skillsList = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust',
      'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
      'mongodb', 'postgresql', 'mysql', 'sql', 'redis', 'git', 'docker', 'kubernetes',
      'aws', 'gcp', 'azure', 'html', 'css', 'tailwind', 'sass', 'redux', 'graphql'
    ];

    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();

    // 1. Extract skills
    skillsList.forEach(skill => {
      // Escape special characters for regex
      const escSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      if (new RegExp(`\\b${escSkill}\\b`, 'i').test(lowerText)) {
        let skillName = skill.charAt(0).toUpperCase() + skill.slice(1);
        if (skill === 'c++') skillName = 'C++';
        if (skill === 'c#') skillName = 'C#';
        if (skill === 'sql') skillName = 'SQL';
        if (skill === 'html') skillName = 'HTML';
        if (skill === 'css') skillName = 'CSS';
        if (skill === 'aws') skillName = 'AWS';
        if (skill === 'gcp') skillName = 'GCP';
        foundSkills.push(skillName);
      }
    });

    // 2. Try to extract CGPA
    let gpa = '8.50';
    const gpaMatch = text.match(/(?:gpa|cgpa|grade|pointer)[:\s]+(\d(?:\.\d+)?)/i);
    if (gpaMatch && gpaMatch[1]) {
      gpa = Number(gpaMatch[1]).toFixed(2);
    } else {
      const decimalGpa = text.match(/\b([5-9]\.\d{1,2}|10\.00)\b/);
      if (decimalGpa && decimalGpa[1]) {
        gpa = Number(decimalGpa[1]).toFixed(2);
      }
    }

    // 3. Try to extract Branch
    let branch = 'Computer Science';
    if (lowerText.includes('information technology') || /\b(it)\b/i.test(lowerText)) {
      branch = 'Information Technology';
    } else if (lowerText.includes('electronics') || /\b(ece|entc)\b/i.test(lowerText)) {
      branch = 'Electronics & Communication';
    } else if (lowerText.includes('mechanical') || /\b(mech)\b/i.test(lowerText)) {
      branch = 'Mechanical Engineering';
    } else if (lowerText.includes('civil')) {
      branch = 'Civil Engineering';
    }

    // 4. Try to extract Degree
    let degree = 'Bachelor of Technology';
    if (lowerText.includes('bachelor') || lowerText.includes('b.tech') || lowerText.includes('btech')) {
      degree = 'Bachelor of Technology';
    } else if (lowerText.includes('master') || lowerText.includes('m.tech') || lowerText.includes('mtech')) {
      degree = 'Master of Technology';
    } else if (lowerText.includes('b.sc') || lowerText.includes('bsc')) {
      degree = 'Bachelor of Science';
    }

    // 5. Try to extract experiences
    const experienceMatch = text.match(/(?:developer|engineer|intern|analyst|coordinator)/i);
    const experienceHeadline = experienceMatch ? `${experienceMatch[0].charAt(0).toUpperCase() + experienceMatch[0].slice(1)} Intern` : 'Software Engineer Intern';

    return {
      skills: foundSkills.length > 0 ? foundSkills : ['React', 'Node.js', 'JavaScript'],
      cgpa: gpa,
      branch,
      degree,
      headline: `Aspiring ${experienceHeadline} | ${branch} Student`
    };
  }
}
