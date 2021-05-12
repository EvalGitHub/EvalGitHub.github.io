# require的原理

```
const path = require('path');
const fs = require('fs');
const vm = require('vm');

function Require(modulePath) {
    let absPathname = path.resolve(__dirname, modulePath);

    const extNames = Object.keys(Module._extensions);
    let index = 0;
    const oldPath = absPathname;
    function findExt(absPathname) {
        if (index === extNames.length) {
            return new Error('文件不存在');
        }  
        try {
            fs.accessSync(absPathname);
            return absPathname;
        } catch(e) {
            const ext = extNames[index++];
            findExt(oldPath + ext);
        }
    }

    absPathname = findExt(absPathname);

    // 缓存中读取
    if (Module._cache[absPathname]) {
        return Module._cache[absPathname].exports;
    }
    const module = new Module(absPathname);
    Module._cache[absPathname] = module;
    tryModuleLoad(module);
    return module.exports;
}

function Module(id) {
    this.id = id;
    this.exports = {};
}

Module.wrapper = [
    "(function(exports, module, Require, __dirname, __filename){", "})"
];

Module._extensions = {
    '.js'(module) {
        const content = fs.readFileSync(module.id, 'utf8');
        const fnStr = Module.wrapper[0] + content + Module.wrapper[1];
        const fn = vm.runInThisContext(fnStr); // vm可以转译str， 返回可执行语句
        fn.call(module.exports, module.exports, module, Require, __filename, __dirname);
    }, 
    '.json'(module) {
        const json = fs.readFileSync(module.id, 'utf8');
        module.exports = JSON.parse(json);
    }
}

Module._cache = {}

function tryModuleLoad(module) {
    const extensions = path.extname(module.id);
    Module._extensions[extensions](module);
}
```

https://juejin.cn/post/6949385808755294245#heading-4