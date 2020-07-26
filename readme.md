# ML CSV

## Description

A lightweight library that helps you to load and parse your CSV data in ML projects.

## How to install

```bash
$ npm install ml-csv --save
```

## Usage example

```
const mlcsv = require('ml-csv');

const { features, labels, testFeatures, testLabels } = await mlcsv({
    fileName: './data.csv',
    shuffle: true,
    featuresColumns: ['length', 'height', 'price'],
    labelsColumns: ['bought'],
    testSplit: 0.3,
    compilers: {
        bought: value => value === 'T',
    }
});
```

## Author

Matheus Freire Rabelo

## License

MIT
