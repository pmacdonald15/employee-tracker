const inputCheck = require('../utils/inputCheck');

test('inputCheck() returns null when all properties exist', () => {
    const obj = {name: 'will'};

    expect(inputCheck(obj, 'name')).toBe(null);
});

test('inputCheck() returns an object when a property is missing', () => {
    const obj = {name: 'will', occupation: ''};

    expect(inputCheck(obj, 'name', 'occupation')).toEqual(
        expect.objectContaining({
        error: expect.stringContaining('No occupation specified')
        })
    );
});