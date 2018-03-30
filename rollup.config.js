import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

export default [{
    input: 'src/ViewIndex.js',
    output: {
        file: 'release/view.js',
        format: 'iife',
        name: "view"
    },
    plugins: [babel()]
}, {
    input: 'src/ViewIndex.js',
    output: {
        file: 'release/mini.view.js',
        format: 'iife',
        name: "view"
    },
    plugins: [babel(), uglify()]
}, {
    input: 'src/ViewIndex.js',
    output: {
        file: 'release/es.view.js',
        format: 'es'
    }
}];
