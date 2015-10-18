# ver-iterator
A task wrapper for dependency version iterations

# API Usage Guidelines
## construct iterator
```javascript
// each iteration will invoke the task
var eachTask = function (ctx) {
  // do something
}
// iterate all the released versions of grunt
var opts = {
name: 'grunt',
versions: '*'
}
var iter = new VersionIterable(eachTask, opts);
```

## Iterate
```javascript
for (let eachResult of iter) {
 // do something
}
```

# License
  MIT License
