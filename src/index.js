const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

const getFileContents = async fileName => {
    const file = await readFile(fileName);
    return file.toString().split('\n')
        .map(line => line.split(','));
}

const getColumnCompiler = (column, compilers) => {
    if (compilers[column]) {
        return compilers[column];
    }
    return Number.parseFloat;
}

const getColumnCompilers = (columns, header, compilers) => {
    if (header.length === 0) {
        return columns
            .map((_, i) => i)
            .reduce((columnCompilers, column) => {
                columnCompilers[i] = getColumnCompiler(column);
                return columnCompilers;
            }, {});
    }

    return header.reduce((columnCompilers, columnName, i) => {
        if (columns.length === 0 || columns.indexOf(columnName) >= 0) {
            columnCompilers[i] = getColumnCompiler(columnName, compilers);
        }
        return columnCompilers;
    }, {});
};

const compileRows = (rows, compilers) => {
    return rows.map((row, i) => {
        return row.reduce((filteredColumns, column, i) => {
            if (compilers[i]) {
                filteredColumns.push(compilers[i](column));
            }
            return filteredColumns;
        }, []);
    });
}

const mlcsv = async ({
    fileName = '',
    shuffle = false,
    featuresColumns = [],
    labelsColumns = [],
    testSplit = 0.5,
    compilers = {}
}) => {
    let [ header, ...body ] = await getFileContents(fileName);

    if (shuffle) {
        body = body.sort(() => (Math.random() - 0.5));
    }

    const featuresCompilers = getColumnCompilers(featuresColumns, header, compilers);
    let features = compileRows(body, featuresCompilers);
    let length = features.length;
    let testLength = 0;
    let testFeatures = [];

    const labelsCompilers = getColumnCompilers(labelsColumns, header, compilers);
    let labels = compileRows(body, labelsCompilers);
    let testLabels = [];

    if (testSplit) {
        testLength = Math.floor(length * testSplit);
        testFeatures = features.slice(0, testLength);
        testLabels = labels.slice(0, testLength);
        features = features.slice(testLength, length);
        labels = labels.slice(testLength, length);
        length -= testLength;
    }

    return {
        features,
        labels,
        length,
        testFeatures,
        testLabels,
        testLength
    };
};

module.exports = mlcsv;
