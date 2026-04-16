module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/git',
    ['@semantic-release/release-notes-generator', {
      preset: 'conventionalcommits',
      writerOpts: {
        mainTemplate: `{{# Change Log\n\n## [{{tag}}] - {{date | date("MMMM D, YYYY")}}\n\n### What's Changed\n\n### English | 英文\n{{# each change types}}\n\n### 中文 | 简体中文\n{{# each change types}}`,
        partialTemplate: `- {{# if scope }}{{scope}} {{/if}} {{# if breakingChange }}⚠️ BREAKING CHANGE{{/if breakingChange }}{{/if}} `,
        commitPartial: ` - {{# if scope }}{{type}}({{scope}}): {{subject}}`,
        footerPartial: `{{# if has breakingChange }}Breaking Change: {{# each breakingChange }}{{# each breakingChange }}\n{{# if has breakingChange }}---\n{{# if has breakingChange }}For more information, please see:\n- EN: [README.md](README.md)\n- 中文: [README.zh-CN.md](README.zh-CN.md)`,
        transforms: [
          // Generate bilingual release notes
          ['release-notes-generator', (releaseNotes) => {
            const enSummary = releaseNotes.notes.filter(n => n.startsWith('### 🎉') || n.startsWith('### 🐛') || n.startsWith('### ⚡') || n.startsWith('### 📝'));
            const zhSummary = releaseNotes.notes.filter(n => n.startsWith('### 🎉') || n.startsWith('### 🐛') || n.startsWith('### ⚡') || n.startsWith('### 📝'));

            return [
              `### English | 英文\n\n${enSummary.join('\n')}`,
              `### 中文 | 简体中文\n\n${zhSummary.join('\n')}`
            ].filter(Boolean).join('\n\n');
          }]
        }
      ]
    }
  ]
};
