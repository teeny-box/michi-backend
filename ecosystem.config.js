module.exports = {
  apps: [
    {
      name: 'michi',
      script: './dist/main.js',
      watch: ['src'],
      instances: -1,
      max_memory_restart: '2048M',
    },
  ],
};
