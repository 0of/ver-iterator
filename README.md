# ver-iterator
[![Build status](https://ci.appveyor.com/api/projects/status/5vx1i4h3ny39928a?svg=true)](https://ci.appveyor.com/project/0of/ver-iterator)
[![npm version](https://badge.fury.io/js/ver-iterator.svg)](https://badge.fury.io/js/ver-iterator)

A task wrapper for dependency version iterations

# Installation
```shell
npm install ver-iterator
```

# API Usage Guidelines
## construct iterator
```javascript
// each iteration will invoke the task
// {String} [name] package name
// {String} [version] current version
var eachTask = function ({name, version}) {
  // do something
}
// iterate all the released versions of grunt
var opts = {
  name: 'grunt',
  range: '*'
}
var iter = new VersionIterable(eachTask, opts);
```

## Iterate
```javascript
// rest spread
[...iter];

// for-of
for (let eachResult of iter) {
 // do something
}
```

# Constructor Options
 - **<u>name</u>**: { _String_ }

  published package name or git URL
  > if passing git URL as name option, when running ver-iterator will clone the repo automatically and list all the tags as released versions
  
 - **<u>range</u>**: { _String_ | _Function_ }
  
  iterating version ranges in semver(https://github.com/npm/node-semver) format. Besides passing customized version filter is allowed

 - **<u>dir</u>**: { _String_ }  

  package installing directory

# Properties
- **<u>name</u>**: { _String_ }

name of the package or git repo

- **<u>sourceName</u>**: { _String_ } {`"npm"` | `"git"`}

# License
  MIT License
