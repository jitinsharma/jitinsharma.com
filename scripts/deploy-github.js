const ghpages = require('gh-pages')

// replace with your repo url
ghpages.publish(
  'public',
  {
    branch: 'master',
    repo: 'git@github.com:jitinsharma/jitinsharma.github.io.git',
  },
  () => {
    console.log('Deploy Complete!')
  }
)