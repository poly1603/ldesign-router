import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    'react',
    'react-dom',
    'react-router-dom',
    '@ldesign/router-core',
  ],
})

