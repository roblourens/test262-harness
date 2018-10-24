const cp = require('child_process');

const pcre = false;
const pcreFlag = pcre ? '--pcre2' : '';

const origRegExp = RegExp;
RegExp = function(value, flags) {
    // Validate
    if (flags && /[^gim]/.test(flags)) {
        throw new SyntaxError('invalid flag');
    }

    const opts = ['--json', value];
    if (pcreFlag) {
        opts.push(pcreFlag);
    }

    if (value.indexOf('\\n') >= 0 || value.indexOf('\\u000A') >= 0) {
        opts.push('--multiline');
    }

    const spawnResult = cp.spawnSync('rg', opts);
    if (spawnResult.status === 2) {
        throw new SyntaxError(spawnResult.stderr + ': ' + value);
    }

    function exec(testStr) {
        testStr = '' + testStr;
        let execResult;
        const execStr = `echo '${testStr}' | rg ${opts.map(o => `'${o}'`).join(' ')}`;
        try {
        	execResult = cp.execSync(execStr).toString();
        } catch (e) {
            // throw new Error(execStr);
        	return null;
        }

        this._submatchIdx = this._submatchIdx || 0;
        const submatch = execResult
        	.trim().split('\n')
        	.map(str => {
        		try {
        			return JSON.parse(str);
        		} catch (e) {
        			throw new Error('str: ' + str);
        		}
        	})
            .filter(result => result.type === 'match')
            [0].data.submatches[this._submatchIdx];

        this._submatchIdx++;
        this[0] = typeof submatch.match.text === 'string' ?
            submatch.match.text :
            new Buffer(submatch.match.bytes).toString();
        this.index = submatch.start;
        this.input = testStr;
        this.length = 1;

        return this;
    }

    return {
        global: flags && flags.indexOf('g') >= 0,
        test: (testStr) => {
            const execResult = exec(testStr);
            return !!execResult;
        },
        exec,
        toString: () => value
    }
}
