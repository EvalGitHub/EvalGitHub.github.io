# axios取消重复请求

整体思路根据请求方法，参数，地址生成一个请求标示，用对象进行存储，
每一次请求时，都在axios的请求拦截器中去查找判断是否存在相同的请求

如果存在， 则取消之前的请求；
如果不存在，则向对象中添加请求信息

每一次请求得到响应之后(无论成功失败)都要在请求响应拦截器中进行请求信息删除

```
const pendingRequest = new Map();

function generateReqKey(config) {
    const { method, url, params, data } = config;
    return [method, url, Qs.stringify(params), Qs.stringify(data)].join(
        "&"
    );
}

function addPendingRequest(config) {
    const requestKey = generateReqKey(config);
    config.cancelToken =
        config.cancelToken ||
        new axios.CancelToken((cancel) => {
            if (!pendingRequest.has(requestKey)) {
                pendingRequest.set(requestKey, cancel);
            }
        });
}

function removePendingRequest(config) {
    const requestKey = generateReqKey(config);
    if (pendingRequest.has(requestKey)) {
        <!-- const cancel = pendingRequest.get(requestKey);
        cancel(requestKey); -->
        pendingRequest.delete(requestKey);
    }
}

axios.interceptors.request.use(
    function (config) {
        // 检查是否存在重复请求，若存在则取消已发的请求
        removePendingRequest(config); 
        // 把当前请求添加到pendingRequest对象中
        addPendingRequest(config); 
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => {
        // 从pendingRequest对象中移除请求
        removePendingRequest(response.config); 
        return response;
    },
    (error) => {
        // 从pendingRequest对象中移除请求
        removePendingRequest(error.config || {}); 
        if (axios.isCancel(error)) {
            console.log("已取消的重复请求：" + error.message);
        } else {
            // 添加异常处理
        }
        return Promise.reject(error);
    }
);

async function sendRequest() {
    console.dir(pendingRequest);
    const response = await axios.get(
        "https://jsonplaceholder.typicode.com/todos/1"
        //   "https://localhost:3000/todos/1"
    );
    console.log(response.data);
}
```


[axios取消重复请求](https://mp.weixin.qq.com/s/cjm9BIdKrn0UFAkVtQQiCA)
