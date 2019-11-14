// 1.柯里化函数理解： 收集参数的方法，接收多个或一个参数，判断接收完参数后返回结果

function curry(fn) {
    let arg = []; //用于收集参数
    //做一个闭包https://segmentfault.com/a/1190000017824877
    return function() {
        //每执行一次收集一次参数,为什么用concat是因为有时候是多个参数(2,3)
        arg = arg.concat([...arguments]);
        //直到参数收集完成执行fn
        // 我们需要知道什么时候收集完了，条件就是curry参数fn的参数个数 fn.length
        //如果收集的参数个数大于等于fn的参数个数执行fn,如果没有递归执行
        if (arg.length >= fn.length) {
            return fn(...arg)
        }
        // 参数没有收集完我们需要继续收集，递归
        return arguments.callee
    }
}
