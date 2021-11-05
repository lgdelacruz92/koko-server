const utils = require('../modules/utils');

test('clean string for postgress', () => {
    const stringExamples = ['O\'Brien', 'Tim'];
    const results = stringExamples.map(example => utils.cleanString(example));
    expect(results[0]).toMatch('O\'\'Brien');
    expect(results[1]).toMatch('Tim');
});