const { exec } = require("child_process");

const stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now']
const stopWordsSet = new Set(stopwords);

exports.removeStopWords = searchQuery => {
    const searchTokens = searchQuery.split(' ');
    return searchTokens.filter(token => !(token in stopWordsSet));
}

exports.os_execute = (command, stdoutCallback, res) => {
    console.log(command);
    exec(command, (error, stdout, stderr) => {
        console.log(stdout, stderr, error);
        if (error) {
            res.status(500).send(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            res.status(500).send(`stderr: ${stderr}`);
            return;
        }
        stdoutCallback(stdout);
    });
}

exports.resourceNotFound = value => {
    return (value !== undefined ? `${value} not found` : 'Resource not found');
}

exports.makeCountyLookup = counties => {
    // transform counties for faster lookup
    return counties.reduce(
        (prev, cur) => {
            prev[cur.fips] = { ...cur };
            return prev;
        }, {}
    )
}

exports.makeCountyDataMap = (data, countyLookup) => {
    // save max value
    let max_val = 0;

    // transform data to lookup by fips
    const countyDataReducer = (prev, cur) => {
        const countyFips = cur.state_fips + cur.county_fips;
        if (countyFips in countyLookup) {
            prev[countyFips] = { ...cur, county_name: countyLookup[countyFips].county_name, state_name: countyLookup[countyFips].state_name }
            if (parseFloat(cur.percent) > max_val) {
                max_val = parseFloat(cur.percent);
            }
        }
        return prev
    }

    const countyDataMap = data.reduce(countyDataReducer, {});
    return { countyDataMap, max_val };
}